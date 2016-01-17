'use strict';

var Vis = require('./Vis');
var Controls = require('./Controls');
var Stats = require('./Stats');

/*
* Main application class
*
*/

var BlocksApp = React.createClass({
  getInitialState: function(){
    return {
      nights: [],
      activeNights: [],
      activeNight: sleep.sleepData[0]
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
        activeNight: active[0]
      });
    })
  },

  handleNightHover: function(targetNight){
    this.setState({
      activeNight: this.state.activeNights[targetNight]
    });
  },

  // Render the visualization view
  render: function(){
    console.log('the active night is', this.state.activeNights);

    return (
      <div>
        <Controls nights={this.state.activeNights} handleNightHover={this.handleNightHover}/>
        <Vis nights={this.state.nights} night={this.state.activeNight}/>
        <Stats night={this.state.activeNight}/>
      </div>
    );
  }
});

module.exports = BlocksApp;

