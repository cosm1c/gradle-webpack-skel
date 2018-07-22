package com.github.cosm1c.skel

import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

import com.github.cosm1c.skel.health.HealthRestService.HealthInfo
import com.github.cosm1c.skel.job.JobManagerActor.JobInfo
import com.github.cosm1c.skel.ui.ClientStreams.{ChartDateTimePoint, ChartPoint}
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import io.circe.Json.fromJsonObject
import io.circe._
import io.circe.generic.semiauto._
import io.circe.java8.time.TimeInstances

trait JsonProtocol extends FailFastCirceSupport with TimeInstances {

    implicit final val circePrinter: Printer = Printer.noSpaces //.copy(dropNullValues = true)


    implicit val ZonedDateTimeFormat: Encoder[ZonedDateTime] =
        (value: ZonedDateTime) => Encoder.encodeString.apply(DateTimeFormatter.ISO_INSTANT.format(value))


    implicit final val healthInfoEncoder: Encoder[HealthInfo] = deriveEncoder

    implicit final val chartDateTimePointEncoder: Encoder[ChartDateTimePoint] = deriveEncoder

    implicit final val chartPointEncoder: Encoder[ChartPoint] = deriveEncoder


    implicit final val jobInfoDecoder: Decoder[JobInfo] = deriveDecoder[JobInfo]

    implicit final val jobInfoEncoder: Encoder[JobInfo] =
        deriveEncoder[JobInfo]
            // This could be recursive
            .mapJsonObject(_.filter(!_._2.isNull))

}
