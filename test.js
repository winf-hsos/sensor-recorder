var sensorRecorder = require('./index.js');

var r = sensorRecorder.createSensorRecorder();

setTimeout(() => {
    var now = Date.now();
    console.log(r.getStatsForTimeInterval("s2", now - 10000, now));
    r.clear();
    console.dir(r.getAllValues());
}, 10000)

addInMs("s1", r, 1.0, 10);
addInMs("s1", r, 2.0, 3000);
addInMs("s1", r, 1.5, 7500);

addInMs("s2", r, 1.0, 460);
addInMs("s2", r, 2.0, 8000);

var start = Date.now();

function addInMs(sensorId, recorder, value, ms) {
    setTimeout(() => {
        recorder.add(sensorId, value);
        console.log("Added >" + value + "< for sensor >" + sensorId + "< at time >" + (Date.now() - start) / 1000);
    }, ms)
}