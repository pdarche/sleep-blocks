'use strict';

/*
* Main application class
*
*/

var Vis = require('./Vis');
var Controls = require('./Controls');
var Stats = require('./Stats');

var BlocksApp = React.createClass({
  getInitialState: function(){
    return {
      nights: [],
      activeNights: [],
      activeNight: null,
      activeState: null,
      activeTime: null,
      eventType: null
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
          nights={this.state.nights}
          night={this.state.activeNight}
          state={this.state.activeState}
          time={this.state.activeTime}
          eventType={this.state.eventType}/>
        <Stats
          night={this.state.activeNight}
          statsType={this.state.eventType}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

