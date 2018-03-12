package com.github.cosm1c.skel

import java.util.logging.{Level, LogManager}

import com.google.common.base.Stopwatch
import com.typesafe.config.{Config, ConfigFactory}
import com.typesafe.scalalogging.LazyLogging
import org.slf4j.bridge.SLF4JBridgeHandler

object Main extends LazyLogging {

    val startStopwatch: Stopwatch = Stopwatch.createStarted()
    val appConfig: Config = ConfigFactory.load()
        .withFallback(ConfigFactory.load("build.properties"))

    // Redirect all logging calls to SLF4J
    LogManager.getLogManager.reset()
    SLF4JBridgeHandler.install()
    java.util.logging.Logger.getLogger("global").setLevel(Level.FINEST)

    def main(args: Array[String]): Unit = {
        Thread.currentThread().setUncaughtExceptionHandler((_: Thread, e: Throwable) => {
            logger.error("UncaughtException on main thread", e)
        })

        // TODO: log startup banner

        akka.Main.main(Array(classOf[AppSupervisorActor].getName))
    }

}
