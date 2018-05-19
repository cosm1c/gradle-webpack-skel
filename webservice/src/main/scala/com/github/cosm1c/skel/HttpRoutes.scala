package com.github.cosm1c.skel

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import ch.megard.akka.http.cors.scaladsl.CorsDirectives
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import com.github.cosm1c.skel.health.HealthRestService
import com.github.cosm1c.skel.job.JobRestService
import com.github.cosm1c.skel.swagger.SwaggerDocService
import com.github.cosm1c.skel.ui.UiRoutes

class HttpRoutes(uiRoutes: UiRoutes,
                 jobRestService: JobRestService,
                 swaggerDocService: SwaggerDocService,
                 healthRestService: HealthRestService) {

    final val route: Route =
        handleRejections(CorsDirectives.corsRejectionHandler) {
            cors() {
                decodeRequest {
                    encodeResponse {
                        uiRoutes.route ~
                            jobRestService.route ~
                            healthRestService.route ~
                            swaggerDocService.routes
                    }
                }
            }
        }

}
