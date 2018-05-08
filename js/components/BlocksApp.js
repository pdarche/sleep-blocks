'use strict';

/*
* Main application class
*
*/

var Vis = require('./Vis');
var Controls = require('./Controls');
var Stats = require('./Stats');
var Slider = require('./Slider');
var Utils = require('../utils/Utils');
var _ = require('lodash');
var moment = require('moment');

var START_TIME = 22;

var BlocksApp = React.createClass({
  getInitialState: function(){
    var dateRange = Array.from(moment.range(
      moment("04-22-2011"),
      moment("11-22-2012")
    ).by('days'));

    return {
      ready: false,
      dateRange: dateRange,
      startDate: dateRange[0],
      endDate: dateRange[12],
      offsetIx: 0,
      visibleNights: 12,
      nights: [],
      activeView: 'overview',
      activeNights: [],
      activeNight: null,
      activeNightIx: null,
      activeState: null,
      activeTime: null,
      eventType: null,
      statsState: 'range',
      dateOffset: 0,
      numNights: 387
    }
  },

  // Fetch the sleep data
  componentDidMount: function() {
    var self = this;
    window.moment = moment;
    $.getJSON('/js/data/sleep.json', function(res) {
      var baseline = START_TIME * 3600 // 10 pm in seconds
      var nights = Utils.processData(res.sleepData, baseline)

      self.setState({
        ready: true,
        nights: nights,
        activeNights: nights.slice(0, self.state.visibleNights),
        activeNight: null,
        activeState: null,
        activeTime: null
      });
    })
  },

  handleViewChange: function(targetView) {
   var self = this;
   this.setState({
     activeView: targetView,
     eventType: 'view',
     activeNight: this.state.activeNights[0],
     statsState: self.switchViewStats(targetView)
   });
  },

  switchViewStats: function(view) {
    switch (view) {
      case 'overhead':
        return 'range'
        break;
      case 'front':
        return 'night'
        break;
      case 'overview':
        return 'range'
        break;
      default:
        return 'range'
    }
  },

  handleNightHover: function(targetNight, date) {
    var activeNight = _.find(this.state.nights, function(night) {
      return night.dateObj.isSame(date)
    })
    var activeNightIx = _.findIndex(this.state.nights, function(night) {
      return night.dateObj.isSame(date)
    })
    this.setState({
      activeNight: activeNight,
      activeNightIx: activeNightIx,
      eventType: 'night',
      statsState: 'night'
    });
  },

  handleStateHover: function(targetState) {
    this.setState({
      eventType: 'state',
      statsState: 'state',
      activeState: targetState
    });
  },

  handleTimeHover: function(targetTime) {
    this.setState({
      eventType: 'time',
      statsState: 'time',
      activeTime: targetTime
    });
  },

  handleSliderMovement: function(value) {
    var offsetIx = Math.floor(value)
    var startDate = this.state.dateRange[offsetIx]
    var endDate = this.state.dateRange[offsetIx + 12]
    var activeNights = this.state.nights.filter(function(night) {
      return (
        night.dateObj.isSameOrAfter(startDate) &&
        night.dateObj.isSameOrBefore(endDate)
      );
    });

    this.setState({
      eventType: 'dateOffset',
      dateOffset: value,
      offsetIx: offsetIx,
      startDate: startDate,
      endDate: endDate,
      activeNight: activeNights[0],
      activeNights: activeNights
    });
  },

  handleActiveNightUpdate: function(ix) {
    var activeNight = this.state.nights[ix]
    this.setState({activeNight: activeNight});
  },

  // Render the visualization view
  render: function() {
    return (
      <div>
        <h1 id="title">Sleep Blocks</h1>
        <Controls
          nights={this.state.activeNights}
          handleNightHover={this.handleNightHover}
          handleStateHover={this.handleStateHover}
          handleTimeHover={this.handleTimeHover}
          handleViewChange={this.handleViewChange}/>
        <Vis
          ready={this.state.ready}
          nights={this.state.nights}
          activeNights={this.state.activeNights}
          night={this.state.activeNight}
          nightIx={this.state.activeNightIx}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          state={this.state.activeState}
          time={this.state.activeTime}
          dateOffset={this.state.dateOffset}
          eventType={this.state.eventType}
          activeView={this.state.activeView}
          dateRange={this.state.dateRange}
          handleActiveNightUpdate={this.handleActiveNightUpdate}
          handleViewChange={this.handleViewChange}
          numNights={this.state.numNights}/>
        <Stats
          night={this.state.activeNight}
          nights={this.state.nights}
          activeNights={this.state.activeNights}
          dateRange={this.state.dateRange}
          offsetIx={this.state.offsetIx}
          state={this.state.activeState}
          time={this.state.activeTime}
          statsState={this.state.statsState}/>
        <Slider
          nights={this.state.nights}
          activeNights={this.state.activeNights}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          dateRange={this.state.dateRange}
          numNights={this.state.numNights}
          handleNightHover={this.handleNightHover}
          handleSliderMovement={this.handleSliderMovement}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

