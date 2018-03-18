package com.github.cosm1c.skel.streams

import akka.NotUsed
import akka.stream.ThrottleMode
import akka.stream.scaladsl.Source

import scala.concurrent.duration._

object Streams {

    def countSlow(start: Int, end: Int): Source[Int, NotUsed] =
        Source(start to end)
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)

    def count(start: Int, end: Int): Source[Int, NotUsed] =
        Source(start to end)

    def sineSlow(start: Double, end: Double, step: Double): Source[BigDecimal, NotUsed] =
        Source(start to(end, step))
            .throttle(1, 100.milliseconds, 1, ThrottleMode.shaping)
            .map(Math.sin)

    def sine(start: Double, end: Double, step: Double): Source[BigDecimal, NotUsed] =
        Source(start to(end, step))
            .map(Math.sin)

}
