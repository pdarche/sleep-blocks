'use strict';

/*
* Main 3D sleep visualization
*
*/

var TWEEN = require('tween.js');
var Moment = require('moment');
var MomentRange = require('moment-range');
var moment = MomentRange.extendMoment(Moment);

var Utils = require('../utils/Utils');
var Axis = require('../utils/Axis');
var YAxis = require('../utils/YAxis');
var Grid = require('../utils/Grid');
var Night = require('../utils/Night');
var Scene = require('../utils/Scene');

var NUM_NIGHTS      = 25
var GRID_SIZE       = 1800
var DISPLAY_SIZE    = GRID_SIZE - (1/5 * GRID_SIZE)
var HOURS           = 12
var START_TIME      = 22
var NIGHT_SPACING   = 60


var Vis = React.createClass({
  getInitialState: function() {
    return {
      built: false
    }
  },

  componentDidUpdate: function() {
    if (this.props.ready && !this.state.built) {
      this.buildVis();
      this.setState({built: true});
    }

    switch (this.props.eventType) {
      case 'night':
        this.highlightNight();
        break;
      case 'state':
        this.highlightState();
        break;
      case 'time':
        this.highlightTime();
        break;
      case 'view':
        this.handleViewChange();
        break;
      case 'dateOffset':
        this.offsetBlocks();
      default:
        return
    }
  },

  buildVis: function() {
    this.dateScale = Utils.createDatescale(
        this.props.nights, NIGHT_SPACING);

    this.timeScale = Utils.createTimescale(
        this.props.nights, START_TIME, HOURS, DISPLAY_SIZE);

    this.Scene = new Scene(
      this.timeScale,
      this.dateScale,
      this.props.dateRange,
      this.props.nights,
      NUM_NIGHTS
    );
    this.Scene.build();
    this.animate();

    this.offsetBlocks();
    this.Scene.bindEvents();
  },

  animate: function() {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.Scene.render();
    this.Scene.camera.updateProjectionMatrix();
  },

  handleViewChange: function() {
    var vec;
    var rot = {x: -Math.PI / 2, y: 0, z: -Math.PI / 2}
    this.Scene.yAxis.labels.position.setY(0)
    switch (this.props.activeView) {
      case 'overview':
        this.resetBlockOpacity();
        vec = {x: -1200, y: 1200, z: -1200}
        break;
      case 'overhead':
        this.resetBlockOpacity();
        vec = {x: -25, y: 2000, z: 0}
        break;
      case 'front':
        this.highlightFirst();
        this.Scene.yAxis.labels.position.setY(-50)
        rot = {x: -Math.PI, y: 0, z: -Math.PI / 2}
        vec = {x: 0, y: 0, z: -1700}
        break;
      default:
        vec = {x: -1200, y: 1200, z: -1200}
        break;
    }
    this.Scene.tweenCamera(vec)
    this.Scene.tweenAxis(rot)
  },

  offsetBlocks: function() {
    var self = this;
    this.Scene.nightAr.forEach(function(night, ix) {
      night.offset(
        self.props.dateOffset,
        self.props.startDate,
        self.props.endDate
      );
    });

    if (this.props.activeView === 'front') {
      this.highlightFirst()
    }
  },

  handleDoubleClick: function() {
    this.props.handleViewChange('overview')
  },

  resetBlockOpacity: function() {
    this.Scene.nightAr.forEach(function(night, ix){
      night.setOpacity(1)
    });
  },

  increaseBlockOpacity: function(){
    this.Scene.nightAr.forEach(function(night, ix){
      night.setOpacity(.01)
    });
  },

  highlightNight: function(){
    var index = this.props.nightIx;
    this.resetBlockOpacity();
    this.Scene.nightAr.forEach(function(night, ix){
      if (index !== ix) {
        night.setOpacity(.01)
      }
    });
  },

  highlightState: function() {
    var targetState = this.props.state.toUpperCase();
    this.Scene.nightAr.forEach(function(night) {
      night.highlightState(targetState)
    });
  },

  highlightTime: function() {
    var time = this.props.time;
    this.resetBlockOpacity();
    this.Scene.nightAr.forEach(function(night){
      night.highlightTime(time)
    });
  },

  highlightFirst: function() {
    var updated = false;
    this.Scene.nightAr.forEach(function(night, ix) {
      if (night._threeObj.visible && !updated) {
        night.setOpacity(1)
        updated = true
      } else {
        night.setOpacity(.01)
      }
    });
  },

  render: function() {
    return (
      <div>
        <div id="vis" onDoubleClick={this.handleDoubleClick}></div>
      </div>
    );
  }
});

module.exports = Vis;

