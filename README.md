# Grafana Riemann streaming datasource

[![CircleCI](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master.svg?style=svg)](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master)

This Grafana plugin implements a streaming [Riemann](https://riemann.io/) datasource

## What is Riemann streaming datasource plugin

This datasource connects to a riemann server's websocket and subscribes to a stream.

![Animation showing timeseries being streamed to Grafana](img/grafana-riemann-streams.gif)

## Getting started

0. Have a riemann instance ready with websockets enabled
```clojure
(ws-server)
```

1. Install dependencies
```BASH
yarn install
```
2. Build plugin in development mode or run in watch mode
```BASH
yarn dev
```
or
```BASH
yarn watch
```
3. Build plugin in production mode
```BASH
yarn build
```

## Learn more
- [Riemann](https://riemann.io)
- [Grafana developer guide](https://github.com/grafana/grafana/blob/master/contribute/developer-guide.md)
- [Build a streaming data source plugin](https://grafana.com/docs/grafana/latest/developers/plugins/build-a-streaming-data-source-plugin/)
- [Javascript websockets](https://javascript.info/websocket)
- [Grafana dataframe documentation](https://grafana.com/docs/grafana/latest/developers/plugins/data-frames/)
- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

## Resources that helped me

- [Stackoverflow dynamically assign props to object in ts](https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript)
