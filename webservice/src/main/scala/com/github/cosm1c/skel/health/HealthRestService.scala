package com.github.cosm1c.skel.health

import akka.http.scaladsl.server.{Directives, Route}
import com.github.cosm1c.skel.JsonProtocol
import com.github.cosm1c.skel.Main.{appConfig, startStopwatch}
import com.github.cosm1c.skel.health.HealthRestService.HealthInfo
import io.swagger.annotations.{Api, ApiOperation}
import javax.ws.rs.Path

object HealthRestService {

    case class HealthInfo(buildVersion: String,
                          buildDate: String,
                          gitVersion: String,
                          gitDate: String,
                          uptime: String)

}

@Api(produces = "application/json", tags = Array("health"))
@Path("health")
class HealthRestService extends Directives with JsonProtocol {

    private val baseHealthInfo =
        HealthInfo(
            appConfig.getString("build.version"),
            appConfig.getString("build.date"),
            appConfig.getString("git.version"),
            appConfig.getString("git.date"),
            startStopwatch.toString
        )

    val route: Route =
        pathPrefix("health") {
            health
        }

    @ApiOperation(value = "Fetch Health", notes = "Current health", httpMethod = "GET", response = classOf[HealthInfo])
    @Path("/")
    def health: Route =
        get {
            pathEndOrSingleSlash {
                complete(baseHealthInfo.copy(uptime = startStopwatch.toString))
            }
        }

}
