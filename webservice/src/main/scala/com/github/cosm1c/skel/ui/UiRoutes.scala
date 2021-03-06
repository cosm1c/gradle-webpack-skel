package com.github.cosm1c.skel.ui

import akka.event.LoggingAdapter
import akka.http.scaladsl.model.headers.CacheDirectives.`max-age`
import akka.http.scaladsl.model.headers.`Cache-Control`
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse}
import akka.http.scaladsl.server._
import akka.stream.QueueOfferResult.{Dropped, Enqueued, QueueClosed, _}
import akka.stream.scaladsl.{Keep, Source, SourceQueueWithComplete}
import akka.stream.{Materializer, OverflowStrategy}
import io.circe.Json

import scala.concurrent.ExecutionContext
import scala.util.Success

class UiRoutes(globalMetaStream: JsonDeltaStream, clientWebSocketFlow: ClientWebSocketFlow, wsUrl: String)(implicit executor: ExecutionContext, materializer: Materializer, log: LoggingAdapter) extends Directives {

    private val wsUrlResponse = HttpResponse(entity = HttpEntity(ContentTypes.`application/json`, s"""{"default":"$wsUrl"}"""))

    private val webSocketCountSourceQueue: SourceQueueWithComplete[Int] =
        Source
            .queue[Int](0, OverflowStrategy.backpressure)
            .scan(0)(_ + _)
            .map(count => Json.obj("webSocketCount" -> Json.fromInt(count)))
            .toMat(globalMetaStream.sink)(Keep.left)
            .run()

    val route: Route =
        pathEndOrSingleSlash {
            respondWithHeaders(`Cache-Control`(`max-age`(0))) {
                getFromResource("ui/index.html")
            }
        } ~
            path("ws") {
                onSuccess(webSocketCountSourceQueue.offer(1)) {
                    case Enqueued =>
                        handleWebSocketMessages(
                            clientWebSocketFlow.clientWebSocketFlow
                                .watchTermination()((_, done) =>
                                    done.onComplete {
                                        case Success(_) => webSocketCountSourceQueue.offer(-1)

                                        case scala.util.Failure(ex) =>
                                            log.error(ex, "WebSocket failure")
                                            webSocketCountSourceQueue.offer(-1)
                                    }))

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
            } ~
            get {
                path("wsUrls") {
                    complete(wsUrlResponse)
                }
            } ~
            respondWithHeaders(`Cache-Control`(`max-age`(86400))) {
                // TODO: frontend detects changed server version on WebSocket connect and prompts for a page refresh
                getFromResourceDirectory("ui")
            }

}
