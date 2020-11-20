# Grafana Riemann streaming datasource

[![CircleCI](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master.svg?style=svg)](https://circleci.com/gh/faxm0dem/grafana-riemann-websocket-datasource/tree/master)

This Grafana plugin implements a streaming [Riemann](https://riemann.io/) datasource.

## Purpose

This datasource connects to a riemann server using websockets and subscribes to a stream.

![Animation showing timeseries being streamed to Grafana](https://github.com/faxm0dem/grafana-riemann-websocket-datasource/blob/master/img/grafana-riemann-streams.gif)

## Installation

Use the releases link on github and download the `.zip`.
Then just `unzip` it to your Grafana plugins folder.

## Configuring your Riemann backend

For instructions on how to install a riemann server, refer to its [web site](https://riemann.io).

### For the impatient

Here's a minimal riemann configuration file if you want to test the grafana plugin:

```
; this will let you check riemann startup and websocket connections
(logging/init {:file "/var/log/riemann/riemann.log"})
; this will enable internal riemann instrumentation events at 1s interval, so you don't need to generate events yourself
(instrumentation {:interval 1 :enabled? true})
; this will enable the insecure ws server on localhost:5556
(ws-server {:host "127.0.0.1" :port 5556})
; this is to actually index events
(let [index (index)] (streams index))
```

### Details

The only requirement for the plugin to work is to have a riemann instance ready with websockets enabled. This means you need a line in the form of:

```clojure
(ws-server {:host "0.0.0.0" :port 5556})
```

As Riemann doesn't support secure websockets yet, we strongly advise you to tunnel it through your favourite web proxy. In any case, if Grafana is serving pages through `https`, you'll have no choice but to do so due to browser security enforcements. The way to go is traditionally to let riemann bind to localhost unsecured, and have the proxy listen to the server's public interface.

```clojure
(ws-server {:host "127.0.0.1" :port 5556})
```

For your convenience, here's a working configuration for HAProxy 1.5.18 (make sure you replace your public IP address):

```
#
defaults
  mode http
  log global
  option httplog
  option  http-server-close
  option  dontlognull
  option  redispatch
  option  contstats
  retries 3
  backlog 10000
  timeout client          25s
  timeout connect          5s
  timeout server          25s
  timeout tunnel        3600s
  timeout http-keep-alive  1s
  timeout http-request    15s
  timeout queue           30s
  timeout tarpit          60s
  default-server inter 3s rise 2 fall 3
  option forwardfor

frontend ft_riemann
  bind <PUBLIC_IP_ADDRESS>:5556 name http ssl crt /etc/riemann/ssl.pem
  maxconn 10000
  default_backend bk_riemann

backend bk_riemann
  balance roundrobin
  server websrv1 localhost:5556 maxconn 10000 weight 10 cookie websrv1 check
```

You'll also need an index, or else the datasource will never see any events.


## Datasource Configuration

### Base URL

Base URL to the riemann server.

#### Examples

```
wss://my-haproxy-frontend:5556
```

```
ws://my-insecure-riemann:5556
```

## Query Configuration

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

It will cause your browser to ignore events that don't match the *first* `MaxSeries` series. It doesn't mean it won't process them: once you subscribed to
a riemann event stream, your browser will get hit by all events matching the query. But only the ones whose first `MaxSeries` `GroupBy` clause matches the series identifier
will get drawn on screen. The others will be ignored.

### MaxDataPoints

This parameter limits the number of data points per series that are kept in memory. So if you chose `MaxSeries=10` and `MaxDataPoints=1000` the Grafana panel in your browser will
display at most `10000` points. Older points will be removed in favour of younger events in a FIFO fashion.

### MaxFreq

This parameter limits the number of data points added to your *series* every second. If you choose `MaxFreq=1` and two riemann events are consumed in less than a second, the plugin will ignore the second event. It will still process the websocket event, but will forget about it immediately. Again, this is per *series* so if you have `MaxSeries=10,MaxFreq=10` you'll get at most 100 points per second to be drawn on screen.

### StringFields

[Riemann events can contain many different attributes](https://riemann.io/concepts.html) along with `host`, `service`, `state` and `description`. This parameter
lets you decide which will be made available to panels as Grafana fields.

### NumericFields

Riemann events usually contain the `metric` field which stores the time series' value. But they also contail the `ttl` field which stores the event's expiration time.
This parameter lets you provide a coma-separated list to specify which fields should be fetched and made available as numeric fields in Grafana. This defaults to `metric`.


## Caveats

### Websocket connections

The datasource works by opening one websocket per query. It reuses those sockets when dashboards are reloaded, or queries modified. It does so by tracking the queries by their `QueryText`. This has the following consequences:

1. When creating two panels with the same query, or one panel with two identical queries, things might go wrong
2. When modifying a query's parameters (but not the text), you have to save the panel and reload it in order for changes to be taken into account (clicking Grafana's refresh button won't suffice)

Also, the developer's haven't found a way (yet) to properly close the connections when leaving the dashboard. This means your websockets will remain open until you close the browser tab (or switch Grafana organization).

So please follow these guidelines:

1. Never use the same query more than once in the same dashboard. If you want to get two different representations of the same data, use Grafana's ["reuse queries" functionality](https://github.com/grafana/grafana/pull/16660) instead
2. If you modify a query's parameters (*e.g.* `MaxFreq`) save, then reload the tab
3. If you don't need your realtime dashboard, close the tab for your riemann server's sake

### Mixed datasources

Grafana offers the ability to add data from multiple datasources to a panel through the use of the `--Mixed--` datasource. Unfortunately this functionality doesn't work yet with streaming datasources.
If you would like to use this functionality, please help us [increase this bug's visibility by adding a thumbs up](https://github.com/grafana/grafana/issues/28981)

## Learn more
- [Riemann](https://riemann.io)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana

