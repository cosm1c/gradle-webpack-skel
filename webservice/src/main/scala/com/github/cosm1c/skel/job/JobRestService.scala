package com.github.cosm1c.skel.job

import akka.actor.ActorRef
import akka.http.scaladsl.model.StatusCodes.{NotFound, OK}
import akka.http.scaladsl.server._
import akka.pattern.ask
import akka.util.Timeout
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.job.JobManagerActor._
import com.github.cosm1c.skel.util.ReplyStatus.{Reply, ReplyFailure, ReplySuccess}
import io.swagger.annotations._
import javax.ws.rs.Path

@Api(produces = "application/json", tags = Array("jobs"))
@Path("job")
class JobRestService(jobManagerActor: ActorRef, implicit val timeout: Timeout) extends Directives with JsonProtocol {

    val route: Route =
        pathPrefix("job") {
            listRunningJobs ~
                getJobInfo ~
                createDemoJob ~
                killJob
        }

    @ApiOperation(value = "List jobs", notes = "List all jobs currently running", httpMethod = "GET", response = classOf[JobInfo], responseContainer = "List")
    @Path("/")
    def listRunningJobs: Route =
        get {
            pathEndOrSingleSlash {
                onSuccess((jobManagerActor ? ListRunningJobs).mapTo[Iterable[JobInfo]]) { jobInfoIterable =>
                    complete(jobInfoIterable)
                }
            }
        }

    @ApiOperation(value = "Create demo job", notes = "Creates demo job which counts up to total", httpMethod = "POST", response = classOf[JobInfo])
    @ApiImplicitParams(Array(
        new ApiImplicitParam(name = "description", value = "Description of Job", required = true, dataTypeClass = classOf[String], paramType = "query"),
        new ApiImplicitParam(name = "total", value = "Total items to process", required = true, dataTypeClass = classOf[Int], paramType = "query")
    ))
    @Path("/")
    def createDemoJob: Route =
        post {
            pathEndOrSingleSlash {
                parameters(('description, 'total.as[Int])) { (description, total) =>
                    onSuccess((jobManagerActor ? CreateDemoJob(description, total)).mapTo[JobInfo]) { jobInfo =>
                        complete(jobInfo)
                    }
                }
            }
        }

    @ApiOperation(value = "Fetch JobInfo", notes = "Fetch current state of job", httpMethod = "GET", response = classOf[JobInfo])
    @ApiImplicitParams(Array(
        new ApiImplicitParam(name = "jobId", value = "Job ID", required = true, dataTypeClass = classOf[Long], paramType = "path")
    ))
    @ApiResponses(Array(
        new ApiResponse(code = 200, message = "Job exists"),
        new ApiResponse(code = 404, message = "Job does not exist")
    ))
    @Path("{jobId}")
    def getJobInfo: Route =
        get {
            path(LongNumber) { jobId =>
                onSuccess((jobManagerActor ? GetJobInfo(jobId)).mapTo[Option[JobInfo]]) {

                    case Some(jobInfo) => complete(jobInfo)

                    case None => complete(NotFound)
                }
            }
        }

    @ApiOperation(value = "Kill job", notes = "Kill a running job", httpMethod = "DELETE")
    @ApiImplicitParams(Array(
        new ApiImplicitParam(name = "jobId", value = "Job ID", required = true, dataTypeClass = classOf[Long], paramType = "path")
    ))
    @ApiResponses(Array(
        new ApiResponse(code = 200, message = "Job sent kill message"),
        new ApiResponse(code = 404, message = "No such job exists")
    ))
    @Path("{jobId}")
    def killJob: Route =
        delete {
            path(LongNumber) { jobId =>
                onSuccess((jobManagerActor ? KillJob(jobId)).mapTo[Reply]) {

                    case ReplySuccess => complete(OK)

                    case ReplyFailure => complete(NotFound)
                }
            }
        }

}
