'use strict';

/*
* Main application class
*
*/

var Vis = require('./Vis');
var Controls = require('./Controls');
var Stats = require('./Stats');
var Slider = require('./Slider');
var d3 = require('d3');
var _ = require('lodash');
var moment = require('moment');

var START_TIME = 22;

var BlocksApp = React.createClass({
  getInitialState: function(){
    var dateRange = Array.from(moment.range(
      moment("05-22-2011"),
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
      controlsEnabled: true,
      dateOffset: 0,
      numNights: 387
    }
  },

  // Fetch the sleep data
  componentDidMount: function() {
    var self = this;
    $.getJSON('/js/data/sleep.json', function(res) {
      // TODO: move this to utils or something
      var baseline = START_TIME * 3600 // 10 pm in seconds
      var nights = res.sleepData.map(function(night, ix) {
        night.dateObj = moment(night.startDate);
        night.id = ix;
        var bt = night.bedTime
        var bts = bt.hour * 3600 + bt.minute * 60 + bt.second
        var tbt = bts >= baseline
          ? bts - baseline
          : bts + (2 * 3600)
        night.translatedBedTime = tbt
        return night
      });

      self.setState({
        ready: true,
        nights: nights,
        activeNights: nights.slice(0, 12),
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
    //switch (view) {
    //  case 'front':
    //    return 'night'
    //    break;
    //  case 'overview':
    //    return 'range'
    //    break;
    //  case 'front':
    //    return 'night'
    //    break;
    //}

    return view === 'front'
      ? 'night'
      : this.state.statsState
  },

  handleNightHover: function(targetNight, date) {
    var activeNight = _.find(this.state.nights, function(night) {
      return night.dateObj.isSame(date)
    })
    var activeNightIx = _.findIndex(this.state.nights, function(night) {
      return night.dateObj.isSame(date)
    })
    this.setState({
      activeNight: activeNight, // this.state.activeNights[targetNight],
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

  handleSliderHover: function() {
    this.setState({
      controlsEnabled: !this.state.controlsEnabled,
      eventType: null
    });
  },

  handleSliderMovement: function(value) {
    var offsetIx = Math.ceil(value)
    var startDate = this.state.dateRange[offsetIx]
    var endDate = this.state.dateRange[offsetIx + 12]
    var activeNights = this.state.nights.filter(function(night) {
      return (
        night.dateObj.isSameOrAfter(startDate) &&
        night.dateObj.isSameOrBefore(endDate)
      );
    })

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
          controlsEnabled={this.state.controlsEnabled}
          handleActiveNightUpdate={this.handleActiveNightUpdate}
          handleViewChange={this.handleViewChange}
          numNights={this.state.numNights}/>
        <Stats
          night={this.state.activeNight}
          nights={this.state.nights}
          activeNights={this.state.activeNights}
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
          handleSliderHover={this.handleSliderHover}
          handleSliderMovement={this.handleSliderMovement}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

