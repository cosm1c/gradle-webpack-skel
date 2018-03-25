package com.github.cosm1c.skel.streams

import java.time.ZonedDateTime

import akka.NotUsed
import akka.stream.ThrottleMode
import akka.stream.scaladsl.Source
import com.github.cosm1c.skel.ui.ClientStreams.ChartPoint

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
        Source.failed(new RuntimeException("Error Source"))

}
