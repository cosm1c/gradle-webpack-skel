package com.github.cosm1c.skel.ui

import akka.NotUsed
import akka.stream.Materializer
import akka.stream.scaladsl.{MergeHub, Sink, Source}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.ui.UiWebSocketFlow.{emptyJson, emptyJsonTuple}
import io.circe.Json
import org.reactivestreams.Processor
import reactor.core.publisher.ReplayProcessor

class StorePubSub(jsonProtocol: JsonProtocol)(implicit materializer: Materializer) {

    private val replayProcessor: Processor[(Json, Json), (Json, Json)] =
        ReplayProcessor.cacheLast[(Json, Json)]

    final val storeSink: Sink[Json, NotUsed] =
        MergeHub.source[Json](perProducerBufferSize = 1)
            .scan(emptyJsonTuple)(jsonProtocol.applyJsonDelta)
            .conflate(jsonProtocol.conflateJsonPair)
            .to(Sink.fromSubscriber(replayProcessor))
            .run()

    final val storeSource: Source[Json, NotUsed] =
        Source.fromPublisher(replayProcessor)
            .conflate(jsonProtocol.conflateJsonPair)
            .prefixAndTail(1)
            .flatMapConcat { case (head, tail) =>
                Source.single(
                    head.headOption
                        .map(_._1)
                        .getOrElse(emptyJson)
                ).concat(tail.map(_._2))
            }
            .map(json => Json.fromFields(Seq("store" -> json)))

}
