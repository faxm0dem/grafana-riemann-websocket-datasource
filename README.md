# Grafana Riemann streaming datasource

[![CircleCI](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master.svg?style=svg)](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master)

This Grafana plugin implements a streaming [Riemann](https://riemann.io/) datasource.

## Purpose

This datasource connects to a riemann server using websockets and subscribes to a stream.

![Animation showing timeseries being streamed to Grafana](img/grafana-riemann-streams.gif)

## Getting started

For instructions on how to install a riemann server, refer to its [web site](https://riemann.io).
For building this plugin, there currently is a bug in the toolchain that prevents the correct execution. You need to run `rm -rf node_modules/@grafana/data/node_modules` in order for it to work. See the [github issue](https://github.com/grafana/grafana/issues/28395#issuecomment-714715586) for more information on that subject.

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

## Configuration

### Query Text

This is the query text that will define the websocket subscription.
The riemann query language doesn't have proper documentation yet, but there are lots of examples on its [website](https://riemann.io)
and on the [test suite](https://www.geeksforgeeks.org/data-types-in-typescript/).

#### Examples

```
tagged "collectd" and plugin = "load"
tagged "riemann"
metric and state = "ok"
metric = 42
```

### GroupBy

Riemann will potentially send you a truckload of unrelated events, unless your query is specific enough.
If you don't want those to end up in the same Grafana series, you have to decide which riemann fields or attributes uniquely identify
your Grafana series. This is where `GroupBy` comes it. It will assign a unique name to each series based on the event's attributes.
For instance if you use `GroupBy=host` all events sharing the same `host` riemann attribute will end up in the same Grafana series. So you'll get
as many series as you have hosts. If you use `GroupBy=host,service` you'll get `numHosts * numSeries` series.

How many series you'll get is however constrained by the parameter `MaxSeries`.

### Max*

To prevent your browser to die on you, the developers of the riemann Grafana plugin kindly implemented the `MaxSeries`, `MaxDataPoints` and `MaxFreq` parameters.

### MaxSeries

It will cause your browser to ignore events that don't match the first `MaxSeries` series. It doesn't mean it won't process them: once you subscribed to
a riemann event stream, your browser will get hit by all events matching the query. But only the ones whose `GroupBy` clause matches the series identifier
will get drawn on screen. The others will be ignored.

### MaxDataPoints

This parameter limits the number of data points per series that are kept in memory. So if you chose `MaxSeries=10` and `MaxDataPoints=1000` the Grafana panel in your browser will
display at most `10000` points. Older points will be removed in favour of younger events in a FIFO fashion.

### MaxFreq

This parameter limits the number of data points added to your *series* every second. If you choose `MaxFreq=1` and two riemann events are consumed in less than a second, the plugin will ignore the second event. It will still process the websocket event, but will forget about it immediately. Again, this is per *series* so if you have `MaxSeries=10,MaxFreq=10` you'll get at most 100 points per second to be drawn on screen.

### StringFields

[Riemann events can contain many different attributes](https://riemann.io/concepts.html) along with `host`, `service`, `state` and `description`. This parameter
lets you decide which will be injected as Grafana fields.

### NumericFields

Riemann events usually contain the `metric` field which stores the time series' value. But they also contail the `ttl` field which stores the event's expiration time.
This parameter lets you provide a coma-separated list to specify which fields should be fetched and injected as numeric fields in Grafana. This defaults to `metric`.

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
