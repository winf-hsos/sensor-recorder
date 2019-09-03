var sensorRecorder = require('./index.js');

var r = sensorRecorder.createSensorRecorder("Test Sensor");

setTimeout(() => {
    var now = Date.now();
    console.log(r.getAvgValueForTimeInterval(now - 10000, now));
}, 7000)

addInMs(r, 1.0, 100);
addInMs(r, 1.0, 460);
addInMs(r, 1.01, 4000);
addInMs(r, -10.3, 450);

var start = Date.now();

function addInMs(recorder, value, ms) {
    setTimeout(() => { 
        recorder.add(value);
        console.log("Added >" + value + "< at time >" + (Date.now() - start) / 1000);
    }, ms)
}