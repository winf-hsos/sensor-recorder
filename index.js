var { SensorRecorder } = require("./lib/SensorRecorder");

/* Creates a new sensor recorder */
exports.createSensorRecorder = function(sensorName) {
    return new SensorRecorder(sensorName);
}