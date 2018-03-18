package com.github.cosm1c.skel.ui

import akka.NotUsed
import akka.actor.ActorRefFactory
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.stream.scaladsl.{Flow, Keep, Source}
import akka.stream.{Materializer, ThrottleMode}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.ui.UiWebSocketFlow._
import io.circe._

import scala.concurrent.duration._

object UiWebSocketFlow {

    final val emptyJson = Json.obj()

    final val emptyJsonTuple = (emptyJson, emptyJson)

    private final val keepAliveWebSocketFrame = () => TextMessage.Strict("{}")

}

class UiWebSocketFlow()(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) extends JsonProtocol {

    final val globalStorePubSub = new StorePubSub(this)

    final def clientWebSocketFlow: Flow[Message, Message, Any] = {

        val clientStreams = new ClientStreams()

        val out: Source[TextMessage.Strict, NotUsed] =
            globalStorePubSub.storeSource
                // Throttle store to avoid overloading frontend - increase duration for potentially lower bandwidth
                .throttle(1, 100.millis, 1, ThrottleMode.Shaping)
                .merge(clientStreams.clientSources)
                .map(circePrinter.pretty)
                .map(TextMessage.Strict)
                .keepAlive(55.seconds, keepAliveWebSocketFrame)

        Flow.fromSinkAndSourceCoupledMat(clientStreams.in, out)(Keep.both)
    }

}
