package com.github.cosm1c.skel.ui

import java.time.ZonedDateTime

import akka.actor.ActorRefFactory
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.Uri
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.stream.scaladsl.{BroadcastHub, Keep, MergeHub, Sink, Source}
import akka.stream.{KillSwitches, Materializer, UniqueKillSwitch}
import akka.{Done, NotUsed}
import com.github.cosm1c.skel.JsonProtocol
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


class ClientStreams()(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) extends JsonProtocol {

    private val clientConnectionActor = actorRefFactory.actorOf(ClientConnectionActor.props(this))

    val ((clientSink: Sink[Json, NotUsed], clientKillSwitch: UniqueKillSwitch), clientSources: Source[Json, NotUsed]) =
        MergeHub.source[Json](perProducerBufferSize = 16)
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
                sendGlobalErrorMessage("Terminating client due to unexpected streamed binary " +
                    "messsage")
                dataStream.runWith(Sink.cancelled)
                clientKillSwitch.abort(new RuntimeException("Unexpected binary stream received"))

            case BinaryMessage.Strict(_) =>
                sendGlobalErrorMessage("Terminating client due to unexpected strict binary messsage")
                clientKillSwitch.abort(new RuntimeException("Unexpected binary message received"))
        }

    private def sendGlobalErrorMessage(errorMessage: String): Unit = {
        Source.single(Json.obj("errorMessage" -> Json.fromString(errorMessage))).runWith(clientSink)
        log.warning(errorMessage)
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
                        subscribeStream(streamId, Uri(jsonArg.asString.get))

                    case (streamId, jsonArg) =>
                        clientConnectionActor ! ErrorSubStream(streamId, s"""InvalidMessage streamId="$streamId" value="${jsonArg.toString}"""")
                }

            case Right(json) => sendGlobalErrorMessage(s"""MalformedStreamMessage message="${json.toString}"""")

            case Left(ParsingFailure(errorMessage, _)) => sendGlobalErrorMessage(s"""StreamParsingFailure errorMessage="$errorMessage"""")
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

    private def subscribeStream(streamId: String, streamUri: Uri): Unit = {
        val query = streamUri.query()
        streamUri.path.toString() match {
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

}
