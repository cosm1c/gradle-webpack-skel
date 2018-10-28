package com.github.cosm1c.skel.health

import java.time.Instant

import akka.NotUsed
import akka.actor.{Actor, ActorLogging, Props}
import akka.stream.Materializer
import akka.stream.scaladsl.{Sink, Source}
import com.github.cosm1c.skel.Main.{appConfig, startStopwatch}
import com.github.cosm1c.skel.health.HealthActor.{ComponentHealth, FetchHealth, HealthInfo}
import io.circe.Json

object HealthActor {

    def props(metaSink: Sink[Json, NotUsed])(implicit materializer: Materializer): Props =
        Props(new HealthActor(metaSink))

    final case class ComponentHealth(name: String, isHealthy: Boolean, modifiedInstant: Instant)

    final case object FetchHealth

    final case class HealthInfo(buildVersion: String,
                                buildDate: String,
                                gitVersion: String,
                                gitDate: String,
                                uptime: String,
                                isHealthy: Boolean,
                                modifiedInstant: Instant,
                                components: Map[String, ComponentHealth])

    private val initialHealthInfo =
        HealthInfo(
            appConfig.getString("build.version"),
            appConfig.getString("build.date"),
            appConfig.getString("git.version"),
            appConfig.getString("git.date"),
            startStopwatch.toString,
            isHealthy = false,
            Instant.now,
            Map.empty
        )
}

class HealthActor(metaSink: Sink[Json, NotUsed])(implicit materializer: Materializer) extends Actor with ActorLogging {

    override def receive: Receive = health(HealthActor.initialHealthInfo)

    private def health(state: HealthInfo): Receive = {

        case componentHealth@ComponentHealth(name, isHealthy, modifiedInstant) =>

            val components = state.components
            val isHealthChanged = components.get(name).forall(_.isHealthy == isHealthy)

            val updatedComponentMap = state.components + (name -> componentHealth)

            if (!isHealthChanged) {
                context become health(state.copy(
                    modifiedInstant = modifiedInstant,
                    components = updatedComponentMap))

            } else {
                log.info("""component="{}" isHealthy={}""", name, isHealthy)

                val isHealthyNow = updatedComponentMap.values.forall(_.isHealthy)

                Source.single(Json.obj(
                    "isHealthy" -> Json.fromBoolean(isHealthyNow)
                )).runWith(metaSink)

                context become health(state.copy(
                    isHealthy = isHealthyNow,
                    components = updatedComponentMap,
                    modifiedInstant = modifiedInstant))
            }

        case FetchHealth => sender() ! state.copy(uptime = startStopwatch.toString)

    }

}
