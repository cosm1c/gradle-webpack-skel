package com.github.cosm1c.skel.ui

import java.util.concurrent.TimeUnit

import akka.NotUsed
import akka.actor.ActorRefFactory
import akka.event.LoggingAdapter
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.stream.Materializer
import akka.stream.scaladsl.{Flow, Keep, Source}
import com.github.cosm1c.skel.{JsonProtocol, Main}
import io.circe._

import scala.concurrent.duration._

object UiWebSocketFlow {

    final val emptyJson = Json.obj()

    final val emptyJsonTuple = (emptyJson, emptyJson)

}

class UiWebSocketFlow()(implicit materializer: Materializer, actorRefFactory: ActorRefFactory, log: LoggingAdapter) extends JsonProtocol {

    final val globalStorePubSub = new StorePubSub(this)

    final def clientWebSocketFlow: Flow[Message, Message, Any] = {

        val clientStreams = new ClientStreams()

        val out: Source[TextMessage.Strict, NotUsed] =
            globalStorePubSub.storeSource
                // Throttle store to avoid overloading frontend - increase duration for potentially lower bandwidth
                .throttle(1,
                FiniteDuration(Main.appConfig.getDuration("app.uiWebSocketStream.throttleOnePer").toNanos, TimeUnit.NANOSECONDS))
                .merge(clientStreams.clientSources)
                .map(circePrinter.pretty)
                .map(TextMessage.Strict)

        Flow.fromSinkAndSourceCoupledMat(clientStreams.in, out)(Keep.both)
    }

}
