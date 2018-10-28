package com.github.cosm1c.skel.ui

import akka.NotUsed
import akka.actor.{ActorRef, ActorRefFactory}
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.stream.Materializer
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, MergeHub, Sink, Source}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.ui.ClientWebSocketFlow.keepAliveWebSocketFrame
import io.circe._

import scala.concurrent.duration._

object ClientWebSocketFlow {

    final val emptyJson = Json.obj()

    final val emptyJsonTuple = (emptyJson, emptyJson)

    private final val keepAliveWebSocketFrame = () => TextMessage.Strict("{}")

}

class ClientWebSocketFlow(jobsManagerActor: ActorRef, globalMetaStream: JsonDeltaStream)(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) extends JsonProtocol {

    val (globalBroadcastSink: Sink[Json, NotUsed], globalBroadcastSource: Source[Json, NotUsed]) =
        MergeHub.source[Json](perProducerBufferSize = 1)
            .toMat(BroadcastHub.sink(bufferSize = 2))(Keep.both)
            .run()

    def clientWebSocketFlow: Flow[Message, Message, Any] = {

        val clientStreams = new ClientStreams(jobsManagerActor, globalMetaStream.source)

        val out: Source[TextMessage.Strict, NotUsed] =
            globalBroadcastSource
                .merge(clientStreams.clientSources)
                .map(circePrinter.pretty)
                .map(TextMessage.Strict)
                .keepAlive(53.seconds, keepAliveWebSocketFrame)

        Flow.fromSinkAndSourceCoupledMat(clientStreams.in, out)(Keep.both)
    }

}
