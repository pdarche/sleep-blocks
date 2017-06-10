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


var BlocksApp = React.createClass({
  getInitialState: function(){
    return {
      nights: sleep.sleepData,
      activeView: 'overview',
      activeNights: sleep.sleepData,
      activeNight: null,
      activeNightIx: null,
      activeState: null,
      activeTime: null,
      eventType: null,
      controlsEnabled: true,
      dateOffset: 0
    }
  },

  componentWillMount: function() {
    // TODO: move this into a function
    sleep.sleepData = sleep.sleepData.map(function(night){
      night.dateObj = moment(night.startDate) 
      return night
    }) 
    this.createDateRange()
  },

  // Fetch the sleep data
  componentDidMount: function() {
    // TODO: fetch this instead of loading the file
    var self = this;
    //$.getJSON('js/data/sleep.json', function(res){
    //  var nights = res.sleepData.map(function(night, ix){
    //    night.id = ix;
    //    return night
    //  });
    //  var active = nights.slice(0,14);

    //  self.setState({
    //    nights: nights,
    //    activeNights: active,
    //    activeNight: null,
    //    activeState: null,
    //    activeTime: null
    //  });
    //})
  },

  createDateRange: function() {
    var dateRange = moment.range(
        sleep.sleepData[0].dateObj, 
        sleep.sleepData[this.state.nights.length - 1].dateObj
    ) 
    // TODO: see if this can be set to state? 
    this.dateRange = Array.from(dateRange.by('days'))
  },

  handleViewChange: function(targetView) {
   this.setState({
     activeView: targetView,
     eventType: 'view'
   });
  },

  handleNightHover: function(targetNight, date) {
    var activeNight = _.find(sleep.sleepData, function(night) {
      return night.dateObj.isSame(date)
    }) 
    var activeNightIx = _.findIndex(sleep.sleepData, function(night) {
      return night.dateObj.isSame(date)
    }) 
    this.setState({
      activeNight: activeNight, // this.state.activeNights[targetNight],
      activeNightIx: activeNightIx,
      eventType: 'night'
    });
  },

  handleStateHover: function(targetState) {
    this.setState({
      eventType: 'state',
      activeState: targetState
    });
  },

  handleTimeHover: function(targetTime) {
    this.setState({
      eventType: 'time',
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
    this.setState({
      eventType: 'dateOffset',
      dateOffset: value
    });
  },

  // Render the visualization view
  render: function() {
    return (
      <div>
        <Controls
          nights={this.state.activeNights}
          handleNightHover={this.handleNightHover}
          handleStateHover={this.handleStateHover}
          handleTimeHover={this.handleTimeHover}
          handleViewChange={this.handleViewChange}/>
        <Vis
          nights={this.state.activeNights}
          night={this.state.activeNight}
          nightIx={this.state.activeNightIx}
          state={this.state.activeState}
          time={this.state.activeTime}
          dateOffset={this.state.dateOffset}
          eventType={this.state.eventType}
          activeView={this.state.activeView}
          dateRange={this.dateRange}
          controlsEnabled={this.state.controlsEnabled}/>
        <Slider
          nights={this.state.nights}
          activeNights={this.state.activeNights}
          dateRange={this.dateRange}
          handleNightHover={this.handleNightHover}
          handleSliderHover={this.handleSliderHover}
          handleSliderMovement={this.handleSliderMovement}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

// <Stats
//   night={this.state.activeNight}
//   nights={this.state.activeNights}
//   state={this.state.activeState}
//   time={this.state.activeTime}
//   statsType={this.state.eventType}/>
