'use strict';

var Vis = require('./Vis')

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

  },

  // Render the visualization view
  render: function(){
    return (
      <div>
        <Vis/>
      </div>
    );
  }
});

module.exports = BlocksApp;