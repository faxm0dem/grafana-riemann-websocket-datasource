# TODO

* Re-use WS connections and 
  - keep track of the ws
    the reference Id of the we must be the query itself
    the problem with this is that multiple queries, in same or different
    panels might share the same websocket.
  - when query changes, close and reopen the ws
  - when any other param changes, update the ws.onmessage() only
* Reap WS connections when leaving dash
* Send Alert that any of the limits are reached
  See https://developers.grafana.com/ui/latest/index.html?path=/docs/overlays-alert--basic
* Add configurable fields to datasource or query so they appear in grafana naturally
* Automatic maxseries calculation maybe from Max Data Points calculated from screen size

# Done

* Limit rate
* Limit # of series
* Configure Limit # of points (CircularDataFrame capacity)
* Configure group by (currently fixed to service)

