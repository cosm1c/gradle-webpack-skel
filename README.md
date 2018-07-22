# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

## BACKLOG
 * enable bable minification in .babelrc once Babelv7 is released, see: https://github.com/babel/minify/issues/850
 * resurrect charts
 * globalAlert buffers events in ringbuffer
 * endpoint to send global alert
 * RequestMetrics: totalRequests and activeRequests using BidiFlow, http response details and duration using custom directive 
 * Initial render occurs in initial static html with no-JS, dynamically imported remainder (faster first render)
 * checkbox to enable reconnect - off by default
 * OHLC Chart - with webservice providing OHLC data for any stream
 * binary Avro encoding of chart points over WebSocket
 * dynamic import sass stylesheets to reduce initial render

## Release Command
Self executing Jar will be at `webservice/build/libs/webservice-<version>-all.jar`
```
npm install && ./gradlew clean build
```

## Frontend Development Environment

NOTE: you may need to override npmCommand and npmPath in your $USER_HOME/gradle.properties

### WebService
Start in a dedicated terminal:
```
./gradlew :webservice:runWebService
```

### Frontend
Start in a dedicated terminal and access at [http://localhost:9090/](http://localhost:9090/):
```
npm install
./gradlew :frontend:runDevServer
```
