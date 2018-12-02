var query = require('array-query');

class SensorRecorder {

  constructor(sensorName) {
    // Array for all values
    this.values = [];

    // Init ID to 1
    this.id = 1;

    this.sensorName = sensorName;

  }

  reset() {
    this.values = [];
    this.id = 1;
  }

  getValueBefore(id) {
    var valueBefore = query.select(this.values).where("id").equals(id).end();
    if (valueBefore.length > 0)
      return valueBefore[0];
    else return null;
  }

  getLatestValue() {
    query().sort("time").desc().on(this.values);

    var latest = null;

    if (this.values.length > 0) {
      latest = this.values[this.values.length - 1];
      latest.sensor = this.sensorName;
    }
    
    return latest;
  }

  getAvgValueForTimeInterval(start, end) {

    var response = {};
    var valuesInInterval = query.select(this.values).where("time").gte(start).and("time").lte(end).end();
    var count = valuesInInterval.length;

    // If there are no values within the interval
    if (count <= 0) {
      var latestValue = this.getLatestValue();

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
    var itemBefore = this.getValueBefore(firstValueInInterval.id - 1);

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

    valuesInInterval.forEach(function(item) {

      timeDiff = item.time - lastTimeStamp;
      weightedSum += lastValue * timeDiff;
      lastTimeStamp = item.time;
      lastValue = item.value;

    });

    response.sensor = this.sensorName;
    response.avg = weightedSum / range;
    response.start = start;
    response.end = end;
    response.count = count;


    return response;
  }


  add(value) {
    var time = Date.now();

    var valWithTime = {
      "id": this.id++,
      "time": time,
      "value": value
    };
    this.values.push(valWithTime);
  }

  clear() {

    // Remove everything but the last value
    this.values = this.values.slice(-1);
    this.id = 2;
  }

}
exports.SensorRecorder = SensorRecorder;
