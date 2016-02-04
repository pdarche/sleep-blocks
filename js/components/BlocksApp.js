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

var BlocksApp = React.createClass({
  offsetMapping: d3.scale.linear()
      .domain([0, 860])
      .range([0, 299]),

  getInitialState: function(){
    return {
      nights: sleep.sleepData,
      activeNights: [],
      activeNight: null,
      activeState: null,
      activeTime: null,
      eventType: null,
      controlsEnabled: true,
      dateOffset: 0
    }
  },

  // Fetch the sleep data
  componentDidMount: function(){
    var self = this;
    $.getJSON('js/data/sleep.json', function(res){
      var nights = res.sleepData.map(function(night, ix){
        night.id = ix;
        return night
      });
      var active = nights.slice(0,14);

      self.setState({
        nights: nights,
        activeNights: active,
        activeNight: null,
        activeState: null,
        activeTime: null
      });
    })
  },

  handleNightHover: function(targetNight){
    this.setState({
      activeNight: this.state.activeNights[targetNight],
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

  handleSliderMovement: function(value){
    var dateOffset = this.offsetMapping(value);

    this.setState({
      eventType: 'dateOffset',
      dateOffset: dateOffset
    });
  },

  // Render the visualization view
  render: function(){
    return (
      <div>
        <Controls
          nights={this.state.activeNights}
          handleNightHover={this.handleNightHover}
          handleStateHover={this.handleStateHover}
          handleTimeHover={this.handleTimeHover}/>
        <Vis
          nights={this.state.activeNights}
          night={this.state.activeNight}
          state={this.state.activeState}
          time={this.state.activeTime}
          dateOffset={this.state.dateOffset}
          eventType={this.state.eventType}
          controlsEnabled={this.state.controlsEnabled}/>
        <Stats
          night={this.state.activeNight}
          nights={this.state.activeNights}
          state={this.state.activeState}
          time={this.state.activeTime}
          statsType={this.state.eventType}/>
        <Slider
          nights={this.state.nights}
          activeNights={this.state.activeNights}
          handleSliderHover={this.handleSliderHover}
          handleSliderMovement={this.handleSliderMovement}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

