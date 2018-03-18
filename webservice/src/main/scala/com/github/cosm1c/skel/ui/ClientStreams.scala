package com.github.cosm1c.skel.ui

import java.net.URI

import akka.actor.ActorRefFactory
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.stream.scaladsl.{BroadcastHub, Keep, MergeHub, Sink, Source}
import akka.stream.{KillSwitches, Materializer, UniqueKillSwitch}
import akka.{Done, NotUsed}
import com.github.cosm1c.skel.streams.Streams
import com.github.cosm1c.skel.ui.ClientConnectionActor.{AttachSubStream, CancelSubStream, ErrorSubStream}
import io.circe.parser.parse
import io.circe.{Json, ParsingFailure}

import scala.concurrent.Future

class ClientStreams()(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) {

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
                sendGlobalErrorMessage("Terminating client due to unexpected streamed binary messsage")
                dataStream.runWith(Sink.cancelled)
                clientKillSwitch.abort(new RuntimeException("Unexpected binary stream received"))

            case BinaryMessage.Strict(_) =>
                sendGlobalErrorMessage("Terminating client due to unexpected strict binary messsage")
                clientKillSwitch.abort(new RuntimeException("Unexpected binary message received"))
        }

    def sendGlobalErrorMessage(errorMessage: String): Unit = {
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
                        subscribeStream(streamId, URI.create(jsonArg.asString.get))

                    case (streamId, jsonArg) =>
                        clientConnectionActor ! ErrorSubStream(streamId, s"""InvalidMessage streamId="$streamId" value="${jsonArg.toString}"""")
                }

            case Right(json) => sendGlobalErrorMessage(s"""MalformedStreamMessage message="${json.toString}"""")

            case Left(ParsingFailure(errorMessage, _)) => sendGlobalErrorMessage(s"""StreamParsingFailure errorMessage="$errorMessage"""")
        }

    // TODO: parseURI query params
    private def subscribeStream(streamId: String, streamUri: URI): Unit =
        streamUri.getPath match {
            case "sine" =>
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.sine(1, 100, 0.1)
                        .map(Json.fromBigDecimal)
                )

            case "count" =>
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.count(1, 100)
                        .map(Json.fromInt)
                )

            case "sineSlow" =>
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.sineSlow(1, 100, 0.1)
                        .map(Json.fromBigDecimal)
                )

            case "countSlow" =>
                clientConnectionActor ! AttachSubStream(
                    streamId,
                    Streams.countSlow(1, 100)
                        .map(Json.fromInt)
                )

            case _ => clientConnectionActor ! ErrorSubStream(streamId, s"""NotFound streamUri="$streamUri"""")
        }

}
