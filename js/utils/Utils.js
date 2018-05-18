'use strict';

var moment = require('moment');
var _ = require('lodash');

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

  createDatescale: function(nights, nightSpacing) {
    var startDate = nights[0].dateObj;
    var endDate = nights[nights.length - 1].dateObj;
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

  rollingWindow: function(values, dateRange, window_size) {
    var means = [];
    for (var i = 0; i < values.length - window_size; i++) {
      var vals = values.slice(i, i+window_size).filter(function(v) { if (v) return v });
      var mean = _.mean(vals) || 0;
      means.push({date: dateRange[i], value: mean});
    }
    return means
  },

  splitWindows: function(rolling_window) {
    var vals = []
    //while window_ix < rolling_window.length {
    for (var i = 0; i < rolling_window.length; i++) {
      if (rolling_window[i].value !== 0) {
        vals.push(i)
      }
    }

    var windows = {0: []}
    var wix = 0
    for (var j = 0; j < vals.length; j++) {
      if (j == 0 || (vals[j] - vals[j-1] == 1)) {
        windows[wix].push(rolling_window[vals[j]])
      } else {
        wix++
        windows[wix] = [rolling_window[vals[j]]]
      }
    }

    return _.values(windows)
  },

  mapToDateRange: function(nights, dateRange) {
    var nightIx = 0;
    var dateIx = 0;
    var mapping = []
    while (nightIx < nights.length) {
        var night, date;
        var n = nights[nightIx];
        var d = dateRange[dateIx];
        if (d.isBefore(n.dateObj)) {
          date = d
          //night = {totalZ: 0, timeInLight: 0, timeInDeep: 0, timeInRem: 0, timeInWake: 0}
          night = {totalZ: null, timeInLight: null, timeInDeep: null, timeInRem: null, timeInWake: null}
          dateIx += 1
        } else if (d.isSame(n.dateObj)) {
          date = d
          night = n
          dateIx += 1
          nightIx += 1
        }
        mapping.push({night: night, date: date})
    }
    return mapping
  },

  computeWindows: function(nights, dateRange, window_size) {
    var self = this;
    var bedtimes = _.map(nights, function(n){
        var time = n.night.bedTime || {hour: 0, minute: 0, second: 0 }
        return self.timeToSeconds(time, 72000); });

    var risetimes = _.map(nights, function(n){
        var time = n.night.riseTime || {hour: 0, minute: 0, second: 0 }
        return self.timeToSeconds(time, 72000); });

    var sleep = nights.map(function(n){ return n.night.totalZ })
    var light = nights.map(function(n){ return n.night.timeInLight })
    var deep  = nights.map(function(n){ return n.night.timeInDeep })
    var rem   = nights.map(function(n){ return n.night.timeInRem  })
    var wake  = nights.map(function(n){ return n.night.timeInWake })

    return {
      bedtime : this.rollingWindow(bedtimes, dateRange, window_size),
      risetime: this.rollingWindow(risetimes, dateRange, window_size),
      sleep   : this.rollingWindow(sleep, dateRange, window_size),
      light   : this.rollingWindow(light, dateRange, window_size),
      deep    : this.rollingWindow(deep, dateRange, window_size),
      rem     : this.rollingWindow(rem, dateRange, window_size),
      wake    : this.rollingWindow(wake, dateRange, window_size),
    }
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
      sleep: this.formatTime(avgSleep),
      light: this.formatTime(avgLight),
      deep: this.formatTime(avgDeep),
      rem:  this.formatTime(avgRem),
      wake: this.formatTime(avgWake)
    }
  },

  formatTime: function(mins) {
    var hours = Math.floor(mins/60);
    var mins = Math.floor(mins % 60);

    if (hours == 0) {
      return mins + " mins"
    } else if (hours == 1) {
      return hours + " hr " + mins + " mins"
    } else {
      return hours + " hrs " + mins + " mins"
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
    time = moment(time, 'HH:mm:ss').format('h:mm a')
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
  },

  // Refactor: a function should do just one thing
  processData: function(nights, baseline) {
      return nights.map(function(night, ix) {
        var date = moment({
            year: night.startDate.year,
            month: night.startDate.month - 1,
            day: night.startDate.day
        })
        night.dateObj = date;
        night.id = ix;
        var bt = night.bedTime
        var bts = bt.hour * 3600 + bt.minute * 60 + bt.second
        var tbt = bts >= baseline
          ? bts - baseline
          : bts + (2 * 3600)
        night.translatedBedTime = tbt
        return night
      });
  }
}

module.exports = Utils;

