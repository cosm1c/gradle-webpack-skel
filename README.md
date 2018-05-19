# Gradle Webpack Skeleton

Simple starter for a backend and frontend application with updates sent over WebSocket.

## TODO
 * Fix ChartJS label issue: Uncaught TypeError: Cannot read property 'skip' of undefined -- https://github.com/chartjs/Chart.js/issues/3753 https://github.com/jtblin/angular-chart.js/issues/644
 * Static Code Analysis
 * Running Dummy Jobs
 * CandleStick Chart
 * RequestMetrics: activeRequests using BidiFlow, request duration using custom directive 
 * Use static html for initial render with no-JS, dynamically imported React
 * Use react-loadable
 * checkbox to enable reconnect - off by default
 * restart streams on WebSocket reconnect

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
