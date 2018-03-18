package com.github.cosm1c.skel.ui

import akka.event.LoggingAdapter
import akka.http.scaladsl.server._
import akka.stream.QueueOfferResult.{Dropped, Enqueued, QueueClosed, _}
import akka.stream.scaladsl.{Keep, Source, SourceQueueWithComplete}
import akka.stream.{Materializer, OverflowStrategy}
import io.circe.Json

import scala.concurrent.ExecutionContext

class UiRoutes(uiWebSocketFlow: UiWebSocketFlow)(implicit executor: ExecutionContext, materializer: Materializer, log: LoggingAdapter) extends Directives {

    private val clientCountSourceQueue: SourceQueueWithComplete[Int] =
        Source
            .queue[Int](0, OverflowStrategy.backpressure)
            .scan(0)(_ + _)
            .map(count => Json.obj("clientCount" -> Json.fromInt(count)))
            .toMat(uiWebSocketFlow.globalStorePubSub.storeSink)(Keep.left)
            .run()

    final val route: Route =
        pathEndOrSingleSlash {
            getFromResource("ui/index.html")
        } ~ path("ws") {
            onSuccess(clientCountSourceQueue.offer(1)) {
                case Enqueued =>
                    handleWebSocketMessages(
                        uiWebSocketFlow.clientWebSocketFlow
                            .watchTermination()((_, done) => done.foreach(_ => clientCountSourceQueue.offer(-1))))

                case Failure(cause) =>
                    log.error(cause, "Failed to enqueue websocket message - Failure")
                    failWith(cause)

                case QueueClosed =>
                    log.error("Failed to enqueue websocket message - QueueClosed")
                    failWith(new RuntimeException("Failed to enqueue websocket message - QueueClosed"))

                case Dropped =>
                    log.error("Packet dropped instead of enqueued - Dropped")
                    failWith(new RuntimeException("Packet dropped instead of enqueued - Dropped"))
            }
        } ~ getFromResourceDirectory("ui")

}
