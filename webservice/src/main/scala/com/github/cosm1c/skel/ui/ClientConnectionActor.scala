package com.github.cosm1c.skel.ui

import akka.NotUsed
import akka.actor.{Actor, Props}
import akka.stream.scaladsl.{Keep, Source}
import akka.stream.{KillSwitches, Materializer, UniqueKillSwitch}
import com.github.cosm1c.skel.ui.ClientConnectionActor._
import io.circe.Json

object ClientConnectionActor {

    def props(clientStreams: ClientStreams)(implicit materializer: Materializer): Props =
        Props(new ClientConnectionActor(clientStreams))

    final case class AttachSubStream(streamId: String, source: Source[Json, NotUsed], isJsonDeltaStream: Boolean = false)

    final case class CancelSubStream(streamId: String)

    final case class ErrorSubStream(streamId: String, errorMessage: String)

    private final val streamCtlId: String = "_stream"

    private class StreamCancelledException extends RuntimeException("Stream Cancelled")

}

// TODO: Convert to TypedActor when production ready
class ClientConnectionActor(clientStreams: ClientStreams)(implicit materializer: Materializer) extends Actor {

    private var clientStreamKillSwitches = Map.empty[String, UniqueKillSwitch]

    override def receive: Receive = {
        case AttachSubStream(streamId, source, isJsonDeltaStream) =>
            val subStreamKillSwitch: UniqueKillSwitch =
                source
                    .viaMat(KillSwitches.single)(Keep.right)
                    .map(json => Json.obj(streamId -> json))
                    .concat(Source.lazily(() => Source.single(closeSubStreamJson(streamId))))
                    .recover {
                        case _: StreamCancelledException => closeSubStreamJson(streamId)
                        case throwable: Throwable => errorSubStreamJson(streamId, throwable.getMessage)
                    }
                    .toMat(if (isJsonDeltaStream) clientStreams.clientDeltaSink else clientStreams.clientSink)(Keep.left)
                    .run()

            clientStreamKillSwitches += streamId -> subStreamKillSwitch

        case CancelSubStream(streamId) =>
            clientStreamKillSwitches.get(streamId).foreach(_.abort(new StreamCancelledException))

        case ErrorSubStream(streamId, errorMessage) =>
            clientStreamKillSwitches.get(streamId) match {
                case Some(streamKillSwitch) =>
                    streamKillSwitch.abort(new RuntimeException(s"Stream error: $errorMessage"))

                case None =>
                    Source.single(Json.obj(streamCtlId -> Json.obj(streamId -> Json.fromString(errorMessage))))
                        .runWith(clientStreams.clientDeltaSink)
            }
    }

    private def closeSubStreamJson(streamId: String): Json =
        Json.obj(streamCtlId -> Json.obj(streamId -> Json.Null))

    private def errorSubStreamJson(streamId: String, errorMessage: String): Json =
        Json.obj(streamCtlId -> Json.obj(streamId -> Json.fromString(errorMessage)))

}
