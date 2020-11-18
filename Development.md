# Grafana Riemann streaming datasource

[![CircleCI](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master.svg?style=svg)](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master)

## Building the plugin

For building this plugin, there currently is a bug in the toolchain that prevents the correct execution. You need to run `rm -rf node_modules/@grafana/data/node_modules` in order for it to work. See the [github issue](https://github.com/grafana/grafana/issues/28395#issuecomment-714715586) for more information on that subject.

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
- [Grafana developer guide](https://github.com/grafana/grafana/blob/master/contribute/developer-guide.md)
- [Build a streaming data source plugin](https://grafana.com/docs/grafana/latest/developers/plugins/build-a-streaming-data-source-plugin/)
- [Javascript websockets](https://javascript.info/websocket)
- [Grafana dataframe documentation](https://grafana.com/docs/grafana/latest/developers/plugins/data-frames/)
- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

## Resources that helped me

- [Stackoverflow dynamically assign props to object in ts](https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript)
