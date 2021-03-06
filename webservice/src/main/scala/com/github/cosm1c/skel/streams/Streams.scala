package com.github.cosm1c.skel.streams

import java.time.{Instant, ZonedDateTime}
import java.util.GregorianCalendar

import akka.NotUsed
import akka.stream.ThrottleMode
import akka.stream.scaladsl.Source
import com.github.cosm1c.skel.ui.ClientStreams.{ChartDateTimePoint, ChartPoint}
import net.e175.klaus.solarpositioning.{AzimuthZenithAngle, SPA}

import scala.collection.immutable.Range
import scala.concurrent.duration._

object Streams {

    def count(start: Double, end: Double, step: Double): Source[Seq[ChartPoint], NotUsed] =
        Source(Range.BigDecimal.inclusive(start, end, step))
            .map(i => Seq(ChartPoint(i, i)))

    def countSlow(start: Double, end: Double, step: Double): Source[Seq[ChartPoint], NotUsed] =
        count(start, end, step)
            .throttle(1, 1.second, 1, ThrottleMode.shaping)

    def sine(start: Double, end: Double, step: Double): Source[Seq[ChartPoint], NotUsed] =
        Source(Range.BigDecimal.inclusive(start, end, step))
            .map(i => Seq(ChartPoint(i, BigDecimal.apply(Math.sin(i.doubleValue)))))

    def sineSlow(start: Double, end: Double, step: Double): Source[Seq[ChartPoint], NotUsed] =
        sine(start, end, step)
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)

    val error: Source[Nothing, NotUsed] =
        Source.failed(new RuntimeException("Example client stream error"))

    def timeSource(start: ZonedDateTime, end: ZonedDateTime, ticks: Int): Source[ZonedDateTime, NotUsed] = {
        val endSecond = end.toEpochSecond
        val startSecond = start.toEpochSecond
        val step = Math.abs(endSecond - startSecond) / ticks
        Source(Range.BigDecimal.inclusive(Math.min(startSecond, endSecond), Math.max(startSecond, endSecond), step))
            .map(second => ZonedDateTime.ofInstant(Instant.ofEpochSecond(second.longValue()), start.getZone))
    }

    def solar(startDate: ZonedDateTime, endDate: ZonedDateTime, ticks: Int): Source[Seq[ChartDateTimePoint], NotUsed] =
        timeSource(startDate, endDate, ticks)
            .map(date => {
                // Latitude and longitude is London, UK
                val azimuthZenithAngle: AzimuthZenithAngle = SPA.calculateSolarPosition(
                    GregorianCalendar.from(date),
                    51.5074f, // latitude
                    0.1278f, // longitude
                    35f, // elevation
                    70f // deltaT
                    // pressure
                    // temperature
                )

                Seq(
                    ChartDateTimePoint(date, BigDecimal.apply(azimuthZenithAngle.getAzimuth)),
                    ChartDateTimePoint(date, BigDecimal.apply(azimuthZenithAngle.getZenithAngle))
                )
            })


    def solarSlow(startDate: ZonedDateTime, endDate: ZonedDateTime, ticks: Int): Source[Seq[ChartDateTimePoint], NotUsed] =
        solar(startDate, endDate, ticks)
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)

}
