# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

## BACKLOG
 * RequestMetrics: totalRequests and activeRequests using BidiFlow, http response details and duration using custom directive 
 * OHLC Chart - with webservice providing OHLC data for any stream
 * binary Avro encoding of chart points over WebSocket

## Release Command
Self executing Jar will be at `webservice/build/libs/webservice-<version>-all.jar`
```
cd frontend && npm install
./gradlew clean build
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
cd frontend
npm install
npm install -g vue-cli
vue ui
```
