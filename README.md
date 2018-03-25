# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

NOTE: Webpack 4 not yet supported due to missing updates for some plugins.

## Release Command
Self executing Jar will be at `webservice/build/libs/webservice-<version>-all.jar`
```
npm install && ./gradlew clean build
```

## Frontend Development Environment

### WebService
Start in a dedicated terminal:
```
./gradlew :webservice:runWebService
```

### Frontend
Start in a dedicated terminal and access at [http://localhost:9090/](http://localhost:9090/):
```
./gradlew :frontend:runDevServer
```
