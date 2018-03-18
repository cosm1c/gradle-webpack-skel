package com.github.cosm1c.skel

import com.github.cosm1c.skel.health.HealthRestService.HealthInfo
import com.github.cosm1c.skel.job.JobManagerActor.JobInfo
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import io.circe.Json.fromJsonObject
import io.circe.generic.semiauto._
import io.circe.java8.time.TimeInstances
import io.circe.{Decoder, _}

trait JsonProtocol extends FailFastCirceSupport with TimeInstances {

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


    implicit final val circePrinter: Printer = Printer.noSpaces //.copy(dropNullValues = true)


    implicit final val healthInfoEncoder: Encoder[HealthInfo] = deriveEncoder


    implicit final val jobInfoDecoder: Decoder[JobInfo] = deriveDecoder[JobInfo]

    implicit final val jobInfoEncoder: Encoder[JobInfo] =
        deriveEncoder[JobInfo]
            // This could be recursive
            .mapJsonObject(_.filter(!_._2.isNull))

}
