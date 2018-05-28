'use strict';

/*
* Control view
*
*/

var moment = require('moment');

var Controls = React.createClass({
  handleViewChange: function(ev) {
    this.props.handleViewChange(ev.target.id);
  },

  handleDateHover: function(ev){
    this.props.handleNightHover(ev.target.id);
  },

  handleStateHover: function(ev){
    this.props.handleStateHover(ev.target.id);
  },

  handleTimeHover: function(ev){
    this.props.handleTimeHover(ev.target.id);
  },

  render: function() {
    return (
      <div id="controls">
        <h4>Perspective</h4>
        <div className="views">
          <div className="view overhead" id="overhead" onClick={this.handleViewChange}>Top</div>
          <div className="view front" id="front" onClick={this.handleViewChange}>Front</div>
          <div className="view overview" id="overview" onClick={this.handleViewChange}>Overview</div>
        </div>

        <h4>Bed/Rise Times</h4>
        <div className="times">
          <div className="time bedtime" id="bedtime" onClick={this.handleTimeHover}>Bedtime</div>
          <div className="time risetime" id="risetime" onClick={this.handleTimeHover}>Risetime</div>
        </div>

        <h4>Sleep State</h4>
        <div className="sleep-states">
          <div className="state light" id="light" onClick={this.handleStateHover}>Light</div>
          <div className="state deep" id="deep" onClick={this.handleStateHover}>Deep</div>
          <div className="state rem" id="rem" onClick={this.handleStateHover}>REM</div>
          <div className="state wake" id="wake" onClick={this.handleStateHover}>Wake</div>
        </div>
      </div>
    );
  }
});

module.exports = Controls;

