package com.github.cosm1c.skel.ui

import java.time.ZonedDateTime

import akka.actor.{ActorRef, ActorRefFactory}
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.model.{IllegalUriException, Uri}
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, MergeHub, Sink, Source}
import akka.stream.{KillSwitches, Materializer, UniqueKillSwitch}
import akka.{Done, NotUsed}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.job.JobManagerActor.SubscribeJobsStream
import com.github.cosm1c.skel.streams.Streams
import com.github.cosm1c.skel.ui.ClientConnectionActor.{AttachSubStream, CancelSubStream, ErrorSubStream}
import io.circe.parser.parse
import io.circe.syntax._
import io.circe.{Json, ParsingFailure}

import scala.concurrent.Future

object ClientStreams {

    final case class ChartPoint(x: BigDecimal, y: BigDecimal /*, r: BigDecimal*/)

    final case class ChartDateTimePoint(x: ZonedDateTime, y: BigDecimal /*, r: BigDecimal*/)

}

class ClientStreams(jobsManagerActor: ActorRef, globalMetaSource: Source[Json, NotUsed])(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) extends JsonProtocol {

    private val clientConnectionActor = actorRefFactory.actorOf(ClientConnectionActor.props(this))

    private val clientJsonDeltaStream = new JsonDeltaStream()

    val clientDeltaSink: Sink[Json, NotUsed] = clientJsonDeltaStream.deltaSink

    val ((clientSink: Sink[Json, NotUsed], clientKillSwitch: UniqueKillSwitch), clientSources: Source[Json, NotUsed]) =
        MergeHub.source[Json](perProducerBufferSize = 16)
            .merge(clientJsonDeltaStream.deltaSource)
            .viaMat(KillSwitches.single)(Keep.both)
            .toMat(BroadcastHub.sink(bufferSize = 2))(Keep.both)
            .run()

    val in: Sink[Message, Future[Done]] =
        Sink.foreach {
            case TextMessage.Strict(text) => receiveClientMessage(text)

            case TextMessage.Streamed(textStream) =>
                textStream.runFold("")(_ ++ _)
                    .map(receiveClientMessage)(materializer.executionContext)

            case BinaryMessage.Streamed(dataStream) =>
                sendAlert("Terminating client due to unexpected streamed binary " +
                    "message")
                dataStream.runWith(Sink.cancelled)
                clientKillSwitch.abort(new RuntimeException("Unexpected binary stream received"))

            case BinaryMessage.Strict(_) =>
                sendAlert("Terminating client due to unexpected strict binary messsage")
                clientKillSwitch.abort(new RuntimeException("Unexpected binary message received"))
        }

    private def sendAlert(message: String): Unit = {
        Source.single(Json.obj("errorMessage" -> Json.fromString(message))).runWith(clientSink)
        log.warning(message)
    }

    private def receiveClientMessage(text: String): Unit =
        parse(text) match {
            case Right(json) if json.isObject =>
                /*
                 * StreamID -> null => cancel
                 * StreamID -> string => subscribe(uri)
                 */
                json.asObject.get.toList.foreach {
                    case (streamId, jsonArg) if jsonArg.isNull =>
                        clientConnectionActor ! CancelSubStream(streamId)

                    case (streamId, jsonArg) if jsonArg.isString =>
                        try {
                            subscribeStream(streamId, Uri(jsonArg.asString.get))
                        } catch {
                            case IllegalUriException(info) =>
                                clientConnectionActor ! ErrorSubStream(streamId, s"""InvalidStreamUri streamId="$streamId" ${info.toString}"""")
                        }

                    case (streamId, jsonArg) =>
                        clientConnectionActor ! ErrorSubStream(streamId, s"""InvalidMessage streamId="$streamId" value="${jsonArg.toString}"""")
                }

            case Right(json) => sendAlert(s"""MalformedStreamMessage message="${json.toString}"""")

            case Left(ParsingFailure(errorMessage, _)) => sendAlert(s"""StreamParsingFailure errorMessage="$errorMessage"""")
        }

    private def subscribeStream(streamId: String, streamUri: Uri): Unit = {
        val query = streamUri.query()
        streamUri.path.toString() match {

            case "meta" =>
                globalMetaSource
                    .map(json => Json.obj(streamId -> json))
                    .runWith(clientJsonDeltaStream.deltaSink)

            case "jobs" =>
                jobsManagerActor ! SubscribeJobsStream(
                    Flow[Json]
                        .map(json => Json.obj(streamId -> json))
                        .to(clientJsonDeltaStream.deltaSink))

            case "solar" =>
                val (start, end) = parseStartAndEndDate(query)
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.solar(
                        start,
                        end,
                        query.get("ticks")
                            .map(Integer.parseInt)
                            .getOrElse(100)
                    ).map(_.asJson)
                )

            case "solarSlow" =>
                val (start, end) = parseStartAndEndDate(query)
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.solarSlow(
                        start,
                        end,
                        query.get("ticks")
                            .map(Integer.parseInt)
                            .getOrElse(100)
                    ).map(_.asJson)
                )

            case "count" =>
                val start = query.getOrElse("start", "0").toInt
                val end = query.getOrElse("end", "10").toInt
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.count(start, end)
                        .map(_.asJson)
                )

            case "countSlow" =>
                val start = query.getOrElse("start", "0").toInt
                val end = query.getOrElse("end", "10").toInt
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.countSlow(start, end)
                        .map(_.asJson)
                )

            case "sine" =>
                val start = query.getOrElse("start", "0").toDouble
                val end = query.getOrElse("end", "32").toDouble
                val step = query.getOrElse("step", "0.25").toDouble
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.sine(start, end, step)
                        .map(_.asJson)
                )

            case "sineSlow" =>
                val start = query.getOrElse("start", "0").toDouble
                val end = query.getOrElse("end", "32").toDouble
                val step = query.getOrElse("step", "0.25").toDouble
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.sineSlow(start, end, step)
                        .map(_.asJson)
                )

            case "error" =>
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.error
                )

            case _ => clientConnectionActor ! ErrorSubStream(streamId, s"""NotFound streamUri="$streamUri"""")
        }
    }

    private def parseStartAndEndDate(query: Uri.Query): (ZonedDateTime, ZonedDateTime) = {
        val now = ZonedDateTime.now()
        (
            query
                .get("startDate")
                .map(ZonedDateTime.parse)
                .getOrElse {
                    now.minusHours(12L)
                },
            query
                .get("endDate")
                .map(ZonedDateTime.parse)
                .getOrElse {
                    now.plusHours(12L)
                }
        )
    }

}
