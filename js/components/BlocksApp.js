'use strict';

var Vis = require('./Vis');
var Controls = require('./Controls');

/*
* Main application class
*
*/

var BlocksApp = React.createClass({
  getInitialState: function(){
    return {
      nights: [],
      activeNights: []
    }
  },

  // Fetch the sleep data
  componentDidMount: function(){
    var self = this;
    $.getJSON('js/data/sleep.json', function(res){
      var active = res.sleepData.slice(0,14);

      self.setState({
        nights: res.sleepData,
        activeNights: active
      });
    })
  },

  // Render the visualization view
  render: function(){
    return (
      <div>
        <Controls nights={this.state.activeNights}/>
        <Vis nights={this.state.nights}/>
      </div>
    );
  }
});

module.exports = BlocksApp;