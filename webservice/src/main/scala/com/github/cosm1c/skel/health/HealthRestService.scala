package com.github.cosm1c.skel.health

import akka.actor.ActorRef
import akka.http.scaladsl.server.{Directives, Route}
import akka.pattern.ask
import akka.util.Timeout
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.health.HealthActor.{FetchHealth, HealthInfo}
import io.swagger.annotations.{Api, ApiOperation}
import javax.ws.rs.Path

@Api(produces = "application/json", tags = Array("health"))
@Path("health")
class HealthRestService(healthActor: ActorRef, implicit val timeout: Timeout) extends Directives with JsonProtocol {

    val route: Route =
        pathPrefix("health") {
            health
        }

    @ApiOperation(value = "Fetch Health", notes = "Current health", httpMethod = "GET", response = classOf[HealthInfo])
    @Path("/")
    def health: Route =
        get {
            pathEndOrSingleSlash {
                onSuccess((healthActor ? FetchHealth).mapTo[HealthInfo]) { healthInfo =>
                    complete(healthInfo)
                }
            }
        }

}
