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

  /*
  * Computes the stats for bed and wake times
  *
  */

  timeMapping: {
    'bedtime': 'bedTime',
    'risetime': 'riseTime'
  },

  timeToSeconds: function(time){
    return time.second + (60 * time.minute) + (3600 * time.hour);
  },

  computeTimeStats: function(nights, time){
    var self = this;
    var timeKey = this.timeMapping[time];
    var timeValues = _.map(nights, function(n){ return self.timeToSeconds(n[timeKey]); });
    console.log('THE TIME VALUES ARE', timeValues);
    var nightsWithTs = _.map(nights, function(n){
      n[timeKey + 'Ts'] = self.timeToSeconds(n[timeKey]);
      return n
    });
    var timeMin = _.min(timeValues);
    var timeMax = _.max(timeValues);
    var min = _.find(nights, [timeKey+'Ts', timeMin]);
    var max = _.find(nights, [timeKey+'Ts', timeMax]);
    var mean = _.sum(timeValues) / timeValues.length;

    return {
      min: {value: min[timeKey], date: min.startDate},
      max: {value: max[timeKey], date: max.startDate},
      mean: mean
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