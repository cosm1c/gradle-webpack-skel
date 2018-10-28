package com.github.cosm1c.skel.job

import java.time.{Instant, LocalDateTime}

import akka.actor.{Actor, ActorLogging, ActorRef, Props}
import akka.stream._
import akka.stream.scaladsl.{Keep, MergeHub, Sink, Source}
import akka.{Done, NotUsed}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.health.HealthActor.ComponentHealth
import com.github.cosm1c.skel.job.JobManagerActor._
import com.github.cosm1c.skel.ui.JsonDeltaStream
import com.github.cosm1c.skel.util.ReplyStatus
import com.github.cosm1c.skel.util.ReplyStatus.{ReplyFailure, ReplySuccess}
import io.circe.Json

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success}

object JobManagerActor {

    def props(healthActor: ActorRef,
              agent: String)(implicit materializer: Materializer): Props =
        Props(new JobManagerActor(healthActor, agent))

    final case class JobInfo(jobId: Long,
                             curr: Option[Int] = None,
                             total: Option[Int] = None,
                             startDateTime: Option[LocalDateTime] = None,
                             endDateTime: Option[LocalDateTime] = None,
                             error: Option[String] = None,
                             description: Option[String] = None,
                             agent: Option[String] = None)

    final case object ListRunningJobs

    final case class GetJobInfo(jobId: Long)

    final case class KillJob(jobId: Long)

    final case class SubscribeJobsStream(sub: Sink[Json, NotUsed])

    final case class CreateDemoJob(description: String,
                                   total: Int)


    private final case class JobCompleted(jobId: Long,
                                          endDateTime: LocalDateTime,
                                          error: Option[String] = None)


    private class JobKilledException extends Exception("Job Killed")

    private case object JobInfoStreamStart

    private case object JobInfoStreamAck

    private case object JobInfoStreamEnd

    private val someZero = Some(0)

}

// TODO: Use TypedActor when its production ready
class JobManagerActor(healthActor: ActorRef, agent: String)(implicit materializer: Materializer) extends Actor with JsonProtocol with ActorLogging {

    // Initially healthy
    healthActor ! ComponentHealth(getClass.getSimpleName, isHealthy = true, Instant.now)

    private val jobsStream = new JsonDeltaStream()

    private var jobCounter: Long = 0L
    private var jobInfos = Map.empty[Long, JobInfo]
    private var jobKillSwitches = Map.empty[Long, UniqueKillSwitch]

    private def attachJobSource[M](jobId: String, jobInfoSource: Source[JobInfo, M]): M =
        jobInfoSource
            .map(jobInfo => Json.obj(jobId -> jobInfoEncoder(jobInfo)))
            .concat(Source.single(Json.obj(jobId -> Json.Null))) // remove from state
            .recover { case _ => Json.obj(jobId -> Json.Null) }
            .toMat(jobsStream.sink)(Keep.left)
            .run()

    private val jobInfoStreamMergeHubSource: Sink[JobInfo, NotUsed] =
        MergeHub.source[JobInfo](perProducerBufferSize = 1)
            .toMat(Sink.actorRefWithAck(self, JobInfoStreamStart, JobInfoStreamAck, JobInfoStreamEnd, throwable => log.error(throwable, "JobInfo Stream failed")))(Keep.left)
            .run()

    override def receive: Receive = {

        case jobInfo: JobInfo =>
            jobInfos += jobInfo.jobId -> jobInfo
            sender ! JobInfoStreamAck

        case JobInfoStreamStart => sender ! JobInfoStreamAck

        case SubscribeJobsStream(sub) => jobsStream.source.runWith(sub)

        case ListRunningJobs => sender() ! jobInfos.values

        case GetJobInfo(jobId) => sender() ! jobInfos.get(jobId)

        case KillJob(jobId) =>
            val reply: ReplyStatus.Reply = jobKillSwitches.get(jobId) match {
                case Some(killSwitch) =>
                    log.info("[{}] Killing job", jobId)
                    killSwitch.abort(new JobKilledException)
                    ReplySuccess

                case None => ReplyFailure
            }
            sender() ! reply

        case CreateDemoJob(description, total) =>
            val jobId = nextJobId
            val zeroJobInfo = JobInfo(jobId, someZero, Some(total), Some(LocalDateTime.now()), description = Some(description), agent = Some(agent))

            // memory could be saved by not enclosing on fields
            val wrappedJobStream: Source[JobInfo, (UniqueKillSwitch, Future[Done])] =
                createDemoJobStream(jobId, zeroJobInfo, total)
                    .alsoTo(jobInfoStreamMergeHubSource)
                    .viaMat(KillSwitches.single)(Keep.right)
                    .alsoToMat(Sink.ignore)(Keep.both)
                    .mapMaterializedValue(m => {
                        log.info("[{}] Started", jobId)
                        m
                    })
                    .recover {
                        case throwable: Throwable =>
                            JobInfo(jobId, endDateTime = Some(LocalDateTime.now()), error = Some(throwable.getMessage))
                    }
                    .concat(Source.lazily(() => {
                        Source.single(
                            JobInfo(jobId, endDateTime = Some(LocalDateTime.now())))
                    }))

            val (killSwitch, eventualDone) = attachJobSource(jobId.toString, wrappedJobStream)

            eventualDone.onComplete {
                case Success(_) =>
                    log.info("[{}] complete", jobId)
                    self ! JobCompleted(jobId, LocalDateTime.now)

                case Failure(ex) =>
                    ex match {
                        case e: JobKilledException => log.warning("[{}] {}", jobId, e.getMessage)
                        case e => log.error(e, "[{}] error: {}", jobId, e.getMessage)
                    }
                    self ! JobCompleted(jobId, LocalDateTime.now, error = Some(ex.getMessage))
            }(context.dispatcher)

            jobInfos += jobId -> zeroJobInfo
            jobKillSwitches += jobId -> killSwitch
            sender() ! zeroJobInfo

        case JobCompleted(jobId, _, _) =>
            // Example only - could persist job result
            jobInfos -= jobId
            jobKillSwitches -= jobId
    }

    private def createDemoJobStream(jobId: Long, zeroJobInfo: JobInfo, total: Int): Source[JobInfo, NotUsed] =
        if (total < 0)
            Source.failed(new IllegalArgumentException("Total < 0"))
        else
            Source.single(zeroJobInfo)
                .concat(
                    Source(1 to total)
                        .throttle(1, 10.milliseconds, 1, ThrottleMode.shaping)
                        .map(count => JobInfo(jobId, Some(count)))
                )

    private def nextJobId = {
        jobCounter += 1
        jobCounter
    }

}
