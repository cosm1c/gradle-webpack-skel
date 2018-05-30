# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

## BACKLOG
 * upgrade to rxjs@6 and @types/redux-observable@6 once redux-observable supports it, see: https://github.com/redux-observable/redux-observable/issues/491
 * import sass stylesheets to reduce initial render
 * Use react-loadable - see comments in frontend/app/index.tsx (currently breaks dev-server but works in PRD)
 * RequestMetrics: totalRequests and activeRequests using BidiFlow, http response details and duration using custom directive 
 * Initial render occurs in initial static html with no-JS, dynamically imported remainder (faster first render)
 * checkbox to enable reconnect - off by default
 * restart streams on WebSocket reconnect
 * OHLC Chart - with webservice providing OHLC data for any stream
 * binary Avro encoding of chart points over WebSocket

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
