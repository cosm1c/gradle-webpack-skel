package com.github.cosm1c.skel.streams

import java.time.{Instant, ZonedDateTime}
import java.util.GregorianCalendar

import akka.NotUsed
import akka.stream.ThrottleMode
import akka.stream.scaladsl.Source
import com.github.cosm1c.skel.ui.ClientStreams.ChartPoint
import net.e175.klaus.solarpositioning.{AzimuthZenithAngle, SPA}

import scala.concurrent.duration._

object Streams {

    private val startTime: ZonedDateTime = ZonedDateTime.now()

    def count(start: Int, end: Int): Source[ChartPoint, NotUsed] =
        Source(start to end)
            .map(i => ChartPoint(startTime.plusDays(i), BigDecimal.apply(i)))

    def countSlow(start: Int, end: Int): Source[ChartPoint, NotUsed] =
        count(start, end)
            .throttle(1, 1.second, 1, ThrottleMode.shaping)

    def sine(start: Double, end: Double, step: Double): Source[ChartPoint, NotUsed] =
        Source(start to(end, step))
            .map(i => ChartPoint(startTime.plusSeconds((i * 1000).toInt), BigDecimal.apply(Math.sin(i))))

    def sineSlow(start: Double, end: Double, step: Double): Source[ChartPoint, NotUsed] =
        sine(start, end, step)
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)

    val error: Source[Nothing, NotUsed] =
        Source.failed(new RuntimeException("Example client stream error"))

    def timeSource(start: ZonedDateTime, end: ZonedDateTime, ticks: Int): Source[ZonedDateTime, NotUsed] = {
        val endSecond = end.toEpochSecond
        val startSecond = start.toEpochSecond
        val step = Math.abs(endSecond - startSecond) / ticks
        Source(Math.min(startSecond, endSecond) to(Math.max(startSecond, endSecond), step))
            .map(second => ZonedDateTime.ofInstant(Instant.ofEpochSecond(second), start.getZone))
    }

    def solar(startDate: ZonedDateTime, endDate: ZonedDateTime, ticks: Int): Source[Seq[ChartPoint], NotUsed] =
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
                    ChartPoint(date, BigDecimal.apply(azimuthZenithAngle.getAzimuth)),
                    ChartPoint(date, BigDecimal.apply(azimuthZenithAngle.getZenithAngle))
                )
            })


    def solarSlow(startDate: ZonedDateTime, endDate: ZonedDateTime, ticks: Int): Source[Seq[ChartPoint], NotUsed] =
        solar(startDate, endDate, ticks)
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)

}
