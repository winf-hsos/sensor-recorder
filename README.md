# An aggregator for sensor data
This node library can collect sensor data and return the (correct) average sensor value for any given timespan.

# Usage

```js
var sensorRecorder = require('./index.js');

var r = sensorRecorder.createSensorRecorder("Test Sensor");

setTimeout(() => {
    r.add(4.0);
    console.log(r.getLatestValue());
    var now = Date.now();
    
}, 4000);

setTimeout(() => {
    var now = Date.now();
    console.log(r.getAvgValueForTimeInterval(now - 10000, now));
}, 7000)

r.add(1.0);
```