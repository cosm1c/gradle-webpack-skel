# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

## BACKLOG
 * Switch to SASS and import just what is used from Bootstrap (see: https://getbootstrap.com/docs/4.0/getting-started/theming/) 
 * upgrade to rxjs@6 and @types/redux-observable@6 once redux-observable supports it, see: https://github.com/redux-observable/redux-observable/issues/491
 * import styles from code not with Webpack config entry points?
 * Use react-loadable - see comments in frontend/app/main.tsx (currently breaks dev-server but works in PRD)
 * Combine Webpack configs for easier maintenance (use webpack mode?)
 * OHLC Chart - with webservice providing OHLC data for any stream
 * RequestMetrics: totalRequests and activeRequests using BidiFlow, http response details and duration using custom directive 
 * Initial render occurs in initial static html with no-JS, dynamically imported remainder (faster first render)
 * checkbox to enable reconnect - off by default
 * restart streams on WebSocket reconnect
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
