package com.github.cosm1c.skel

import java.net.InetAddress
import java.time.Clock

import akka.actor.{Actor, ActorLogging, ActorSystem}
import akka.http.scaladsl.Http
import akka.http.scaladsl.Http.ServerBinding
import akka.stream.ActorMaterializer
import com.github.cosm1c.skel.health.HealthRestService
import com.github.cosm1c.skel.job.{JobManagerActor, JobRestService}
import com.github.cosm1c.skel.swagger.SwaggerDocService
import com.github.cosm1c.skel.ui.{UiRoutes, UiWebSocketFlow}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

// TODO: switch to TypedActor when production ready
class AppSupervisorActor extends Actor with ActorLogging {

    private implicit final val actorSystem: ActorSystem = context.system
    private implicit final val materializer: ActorMaterializer = ActorMaterializer()
    private implicit final val clock: Clock = Clock.systemUTC()

    private val httpPort = Main.appConfig.getInt("app.httpPort")
    private val wsUrl = s"ws://${InetAddress.getLocalHost.getCanonicalHostName}:$httpPort/ws"

    private val uiStreams = new UiWebSocketFlow()(materializer, context, log)
    private val uiRoutes = new UiRoutes(uiStreams, wsUrl)(context.dispatcher, materializer, log)
    private val jobManagerActor = context.actorOf(JobManagerActor.props(uiStreams), "JobManagerActor")
    private val jobRestService = new JobRestService(jobManagerActor)
    private val swaggerDocService = new SwaggerDocService(Main.appConfig.getString("build.version"), "/")
    private val healthRestService = new HealthRestService
    private val route = new HttpRoutes(uiRoutes, jobRestService, swaggerDocService, healthRestService).route

    private var bindingFuture: Future[ServerBinding] = _

    override def preStart(): Unit = {
        bindingFuture = Http().bindAndHandle(route, "0.0.0.0", httpPort)
        bindingFuture.onComplete(serverBinding => log.info("Server online - {}", serverBinding))
    }

    override def postStop(): Unit = {
        bindingFuture
            .flatMap { serverBinding =>
                log.info("Server offline - {}", serverBinding)
                serverBinding.unbind()
            }
        ()
    }

    override def receive: Receive = {
        case msg => log.warning("Received unexpected message: {}", msg)
    }

}
