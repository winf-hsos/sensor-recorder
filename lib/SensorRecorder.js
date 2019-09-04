var query = require('array-query');

class SensorRecorder {

  constructor() {
    // Array for all values
    this.values = [];

    // A running ID for all values 
    // Init ID to 1
    this.id = 1;
  }

  reset() {
    this.values = [];
    this.id = 1;
  }

  getValueWithId(sensorId, id) {
    var valueBefore = query.select(this.values).where("sensor_id").equals(sensorId).and("id").equals(id).end();

    if (valueBefore.length > 0)
      return valueBefore[0];
    else return null;
  }

  getLatestValue(sensorId) {
    var sensorValues = query.select(this.values).where("sensor_id").equals(sensorId).sort("time").desc().end();

    var latest = null;

    if (sensorValues.length > 0) {
      latest = sensorValues[sensorValues.length - 1];
    }

    return latest;
  }

  getStatsForTimeInterval(sensorId, start, end) {

    var response = {};
    var valuesInInterval = query.select(this.values).where("sensor_id").equals(sensorId).and("time").gte(start).and("time").lte(end).end();
    var count = valuesInInterval.length;

    // If there are no values within the interval
    if (count <= 0) {
      var latestValue = this.getLatestValue(sensorId);

      if (latestValue != null) {
        response.avg = latestValue.value;
        response.count = 0;
        return response;
      }
      return null;
    }

    query().sort("time").desc().on(valuesInInterval);

    var weightedSum = 0;
    var timeDiff;

    // Get first and last item
    var firstValueInInterval = valuesInInterval[0];
    var lastValueInInterval = valuesInInterval[count - 1];

    // Get the item right before the interval (if exists)
    var itemBefore = this.getValueWithId(sensorId, firstValueInInterval.id - 1);

    // If an item before exists
    if (itemBefore != null) {
      lastValue = itemBefore.value;

    } else {
      // If no previous value exists, the start time is corrected to the time of the first value
      start = firstValueInInterval.time;
    }

    // Handle last item
    timeDiff = end - lastValueInInterval.time;
    weightedSum += lastValueInInterval.value * timeDiff;

    var range = end - start;
    var lastTimeStamp = start;
    var lastValue = firstValueInInterval.value;

    var maxValue = -Number.MAX_VALUE;
    var minValue = Number.MAX_VALUE;

    valuesInInterval.forEach(function (item) {

      timeDiff = item.time - lastTimeStamp;
      weightedSum += lastValue * timeDiff;
      lastTimeStamp = item.time;
      lastValue = item.value;
      maxValue = item.value > maxValue ? item.value : maxValue;
      minValue = item.value < minValue ? item.value : minValue;
    });

    response.sensor_id = sensorId;
    response.avg = weightedSum / range;
    response.max = maxValue;
    response.min = minValue;
    response.start = start;
    response.end = end;
    response.count = count;
    response.values = valuesInInterval;

    return response;
  }

  getAllValues(sensorId = null) {
    if (sensorId == null) {
      return this.values;
    }
    else {
      return query.select(this.values).where("sensor_id").equals(sensorId).sort("time").asc().end();
    }
  }

  add(sensorId, value) {
    var time = Date.now();

    var valWithTime = {
      "sensor_id": sensorId,
      "id": this.id++,
      "time": time,
      "value": value
    };
    this.values.push(valWithTime);
  }

  clear() {
    // Iterate through all different sensors
    var sensors_ids = this.getUniqueSensors()

    var sensorValues;
    var allValues = [];

    for (var i = 0; i < sensors_ids.length; i++) {
      sensorValues = this.getAllValues(sensors_ids[i]);
      sensorValues = sensorValues.slice(-1);
      sensorValues.forEach((v) => { allValues.push(v); })
    }

    this.values = allValues;

    // Get the max id from all remaining values
    this.id = Math.max(...this.values.map(o => {
      return o.id;
    }), 0) + 1;
  }

  getUniqueSensors() {
    const sensors_ids = [...new Set(this.values.map(value => value.sensor_id))]
    return sensors_ids;
  }

  getValuesCount(sensorId = null) {
    if (sensorId == null) {
      return this.values.length;
    }
    else {
      return this.getAllValues(sensorId).length;
    }
  }

}
exports.SensorRecorder = SensorRecorder;
