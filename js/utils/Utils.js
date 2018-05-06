'use strict';

var _ = require('lodash');
var moment = require('moment');

  /*
  * Utilities for the application
  *
  */

var Utils = {

  /*
  * Computes the stats for a given sleep state
  *
  */

  stateMapping: {
    light: 'timeInLight',
    deep: 'timeInDeep',
    rem: 'timeInRem',
    wake: 'timeInWake',
  },

  /*
   * Creates a scale function
   *
  */

  scale: function(hours, displaySize){
    return d3.scale.linear()
      .domain([0, hours * 3600])
      .range([0, displaySize])
  },

  /*
   * Creates the date range between the first
   * and last night of sleep
   * TODO: remove.  this is getting passed is as props
  */

  createDateRange: function(nights) {
    var dateRange = moment.range(
      nights[0].dateObj,
      nights[nights.length - 1].dateObj
    )
    return Array.from(dateRange.by('days'))
  },

  /*
   * Create the datescale to use for mapping
   * to date positions
  */

  createDatescale: function(nights, nightSpacing, numNights) {
    var startDate = moment(nights[0].startDate)
    var endDate = moment(nights[nights.length - 1].startDate)
    var diff = endDate.diff(startDate, 'days')
    var width = nightSpacing * diff
    return d3.time.scale()
      .domain([startDate, endDate])
      .range([0, width])
  },

  /*
   * Create the timescale to use for mapping
   * to time positions
  */

  createTimescale: function(nights, startTime, hours, displaySize) {
    return d3.scale.linear()
      .domain([0, hours * 3600])
      .range([0, displaySize])
  },

  computeStateStats: function(nights, state){
    var stateKey = this.stateMapping[state];
    var stateValues = _.map(nights, function(night){ return night[stateKey]});
    var stateMin = _.min(stateValues);
    var stateMax = _.max(stateValues)
    var min = _.find(nights, [stateKey, stateMin]);
    var max = _.find(nights, [stateKey, stateMax]);
    var mean = _.sum(stateValues) / stateValues.length;

    return {
      min: {value: min[stateKey], date: min.startDate},
      max: {value: max[stateKey], date: max.startDate},
      mean: mean
    }
  },

  computeRangeStats: function(nights) {
    var avgSleep = _.mean(nights.map(function(n){ return n.totalZ}))
    var avgLight = _.mean(nights.map(function(n){ return n.timeInLight}))
    var avgDeep = _.mean(nights.map(function(n){ return n.timeInDeep}))
    var avgRem = _.mean(nights.map(function(n){ return n.timeInRem}))
    var avgWake = _.mean(nights.map(function(n){ return n.timeInWake}))
    var bedtime = nights.length
      ? this.computeTimeStats(nights, 'bedtime')
      : {mean: null}
    var risetime = nights.length
      ? this.computeTimeStats(nights, 'risetime')
      : {mean: null}

    return {
      bedtime: bedtime,
      risetime: risetime,
      sleep: _.round(avgSleep),
      light: _.round(avgLight),
      deep: _.round(avgDeep),
      rem:  _.round(avgRem),
      wake: _.round(avgWake)
    }
  },

  /*
  * Computes the stats for bed and wake times
  *
  */

  timeMapping: {
    'bedtime': 'bedTime',
    'risetime': 'riseTime'
  },

  timeOffset: 7200,

  timeToSeconds: function(time, offset){
    var seconds = time.second + (60 * time.minute) + (3600 * time.hour);
    if (offset) {
      seconds -= offset;
    }
    if (seconds < 0){
      seconds += 86400
    }
    return seconds
  },

  secondsToHms: function(d) {
    var sec_num = parseInt(d, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  },

  computeTimeStats: function(nights, time){
    var self = this;
    var timeKey = this.timeMapping[time];
    // find the largetst value before 10 pm
    var ltnine = _.filter(nights, function(n){ return n[timeKey].hour < 22})
        ltnine = _.map(ltnine, function(n){ return n[timeKey].hour})
    var maxHour = _.max(ltnine) + 1
    var offset = maxHour * 3600
    // remove that time + 1 hour of that time from each value
    var timeValues = _.map(nights, function(n){ return self.timeToSeconds(n[timeKey], offset); });
    var nightsWithTs = _.map(nights, function(n){
      n[timeKey + 'Ts'] = self.timeToSeconds(n[timeKey], offset);
      return n
    });
    // compute the min, max, and mean
    var timeMin = _.min(timeValues);
    var timeMax = _.max(timeValues);
    var min = _.find(nightsWithTs, [timeKey+'Ts', timeMin]);
    var max = _.find(nightsWithTs, [timeKey+'Ts', timeMax]);
    var mean = _.mean(timeValues) + offset;

    if (mean > 86400){
      mean -= 86400
    }

    return {
      min: {value: min[timeKey], date: min.startDate},
      max: {value: max[timeKey], date: max.startDate},
      mean: this.secondsToHms(mean)
    }
  },

  /*
  * Title Cases a string
  *
  */

  toTitleCase: function(str) {
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}

module.exports = Utils;

