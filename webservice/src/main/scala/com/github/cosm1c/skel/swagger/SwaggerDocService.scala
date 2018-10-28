package com.github.cosm1c.skel.swagger

import com.github.cosm1c.skel.health.HealthRestService
import com.github.cosm1c.skel.job.JobRestService
import com.github.swagger.akka._
import com.github.swagger.akka.model.Info

class SwaggerDocService(version: String,
                        override val basePath: String) extends SwaggerHttpService {

    override val apiClasses: Set[Class[_]] = Set(
        classOf[JobRestService],
        classOf[HealthRestService]
    )

    override val info = Info(
        title = "gradle-webpack-skel",
        version = version,
        description = "Gradle Webpack Skeleton"
        //contact: Option[Contact] = None,
    )

    override val unwantedDefinitions: Seq[String] = Seq("Function1", "Function1RequestContextFutureRouteResult")

    //override val host = "localhost:12345"
    //override val externalDocs = Some(new ExternalDocs("Core Docs", "http://acme.com/docs"))
    //override val securitySchemeDefinitions = Map("basicAuth" -> new BasicAuthDefinition())
}
