package com.github.cosm1c.skel.ui

import java.util.concurrent.TimeUnit

import akka.NotUsed
import akka.stream.Materializer
import akka.stream.scaladsl.{MergeHub, Sink, Source}
import com.github.cosm1c.skel.Main
import com.github.cosm1c.skel.ui.ClientWebSocketFlow.{emptyJson, emptyJsonTuple}
import io.circe.Json
import io.circe.Json.fromJsonObject
import org.reactivestreams.Processor
import reactor.core.publisher.ReplayProcessor

import scala.concurrent.duration.FiniteDuration

class JsonDeltaStream()(implicit materializer: Materializer) {

    private val replayProcessor: Processor[(Json, Json), (Json, Json)] =
        ReplayProcessor.cacheLast[(Json, Json)]

    val sink: Sink[Json, NotUsed] =
        MergeHub.source[Json](perProducerBufferSize = 1)
            .scan(emptyJsonTuple)(applyJsonDelta)
            .conflate(conflateJsonPair)
            .to(Sink.fromSubscriber(replayProcessor))
            .run()

    val source: Source[Json, NotUsed] =
        Source.fromPublisher(replayProcessor)
            .conflate(conflateJsonPair)
            .prefixAndTail(1)
            .flatMapConcat { case (head, tail) =>
                Source.single(
                    head.headOption
                        .map(_._1)
                        .getOrElse(emptyJson)
                ).concat(tail.map(_._2))
            }
            .filter(_.asObject.forall(_.nonEmpty))
            // Throttle to avoid overloading frontend and by using conflation - could be on a per substream basis
            .throttle(1, FiniteDuration(Main.appConfig.getDuration("app.clientDeltaStream.throttleOnePer").toNanos, TimeUnit.NANOSECONDS))

    def conflateJsonKeepNulls(state: Json, delta: Json): Json =
        state.deepMerge(delta)

    def conflateJsonDropNulls(state: Json, delta: Json): Json =
        (state.asObject, delta.asObject) match {
            case (Some(lhs), Some(rhs)) =>
                fromJsonObject(
                    lhs.toList.foldLeft(rhs) {
                        case (acc, (key, value)) =>
                            rhs(key).fold(acc.add(key, value)) { r =>
                                if (r.isNull) acc.remove(key)
                                else acc.add(key, conflateJsonDropNulls(value, r))
                            }
                    }
                )
            case _ => delta
        }

    def applyJsonDelta(state: (Json, Json), delta: Json): (Json, Json) =
        (conflateJsonDropNulls(state._1, delta), delta)

    def conflateJsonPair(state: (Json, Json), delta: (Json, Json)): (Json, Json) =
        (conflateJsonDropNulls(state._1, delta._2), conflateJsonKeepNulls(state._2, delta._2))

}
