'use strict';

/*
* Main 3D sleep visualization
*
*/

var TWEEN = require('tween.js');
var Moment = require('moment');
var MomentRange = require('moment-range');
var moment = MomentRange.extendMoment(Moment);
var _ = require('underscore');
var Utils = require('../utils/Utils');
var Axis = require('../utils/Axis');
var YAxis = require('../utils/YAxis');
var Grid = require('../utils/Grid');
var Night = require('../utils/Night');

var WIDTH           = window.innerWidth
var HEIGHT          = window.innerHeight
var VIEW_ANGLE      = 50
var NEAR            = 1
var FAR             = 10000
var NUM_NIGHTS      = 25
var GRID_SIZE       = 1800
var DISPLAY_SIZE    = GRID_SIZE - (1/5 * GRID_SIZE)
var MINS_PER_BLOCK  = 5
var PX_PER_MIN      = DISPLAY_SIZE / (HOURS * 60);
var BLOCK_WIDTH     = 10
var HOURS           = 12
var START_TIME      = 22
var NIGHT_SPACING   = 60
var X_OFFSET        = -740
var Z_OFFSET        = -740
var TICK_COUNT      = HOURS
var ZOOM            = .02
var SLEEP_STATES    = {
  "UNDEFINED": { "height" : 0, "color" : 0x236167, arr : [] },
  "LIGHT": { "height" : 100, "color" : 0x28774F, arr : [] },
  "DEEP": { "height" : 40, "color" : 0x373276, arr : [] },
  "REM": { "height" : 70, "color" : 0xA2A838, arr : [] },
  "WAKE": { "height" : 120, "color" : 0x9F5B46, arr : [] }
}


var Vis = React.createClass({
  nightAr: [],

  componentDidMount: function() {
    this.dateScale = Utils.createDatescale(
        sleep.sleepData, NIGHT_SPACING, this.props.numNights);

    this.timeScale = Utils.createTimescale(
        sleep.sleepData, START_TIME, HOURS, DISPLAY_SIZE)

    this.buildScene();
    this.animate();
    this.offsetBlocks();
    //this.offsetDateTicks();
    this.bindEvents();
  },

  componentDidUpdate: function() {
    controls.enabled = this.props.controlsEnabled;
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
        //this.offsetDateTicks();
      default:
        return
    }
  },

  buildScene: function() {
    this.init();
    this.addCamera()
    this.addLights()
    this.addRenderer()
    this.addProjector();
    this.addControls();
    this.addXAxis();
    this.addYAxis();
    this.addGrid();
    this.addSleepObjs();
  },

  animate: function() {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderScene();
    if (this.props.controlsEnabled){
      window.controls.update();
      this.camera.updateProjectionMatrix()
    }
  },

  handleViewChange: function() {
    var vec;
    var rot = {x: -Math.PI / 2, y: 0, z: -Math.PI / 2}
    this.yAxis.labels.position.setY(0)
    switch (this.props.activeView) {
      case 'overview':
        vec = {x: -1200, y: 1200, z: -1200}
        break;
      case 'overhead':
        vec = {x: -25, y: 2000, z: 0}
        break;
      case 'front':
        this.highlightFirst();
        this.yAxis.labels.position.setY(-50)
        rot = {x: -Math.PI, y: 0, z: -Math.PI / 2}
        vec = {x: 0, y: 0, z: -1700}
        break;
      default:
        vec = {x: -1200, y: 1200, z: -1200}
        break;
    }
    this.tweenCamera(vec)
    this.tweenAxis(rot)
  },

  offsetBlocks: function() {
    var self = this
    var offsetIx = Math.ceil(this.props.dateOffset)
    var startDate = this.props.dateRange[offsetIx]
    var endDate = this.props.dateRange[offsetIx + 12]

    this.nightAr.forEach(function(night, ix) {
      night.offset(self.props.dateOffset, startDate, endDate)
    });

    if (this.props.activeView === 'front') {
      this.highlightFirst()
    }
  },

  offsetDateTicks: function() {
    // Offset the date axis ticks
    var self = this;
    var verts = this.dateAxis.vertices.slice(2, this.dateAxis.vertices.length);
    verts.forEach(function(vert, ix) {
      var absPos = vert.x == 0
        ? ix * NIGHT_SPACING
        : (ix - 1) * NIGHT_SPACING
      var offset = self.props.dateOffset * 2 * NIGHT_SPACING
      var newPos = absPos - offset
      vert.z = newPos;
    });
    this.dateAxis.verticesNeedUpdate = true;

    // Offset the axis tick labels
    //var absPos = 8000 - 740
    //var newPos = absPos - this.props.dateOffset * 2 * NIGHT_SPACING
    //this.dateAxisLabels.position.z = newPos
  },

  init: function() {
    // Set up scene
    this.container = document.createElement('div');
    $('#vis').prepend(this.container);
    this.scene = new THREE.Scene();
  },

  bindEvents: function() {
    window.addEventListener('resize', this.onWindowResize, false);
    this.renderer.domElement.addEventListener('mousewheel', this.mouseWheel, false);
    this.renderer.domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false); // firefox
  },

  onWindowResize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  } ,

  mouseWheel: function(event) {
    event.preventDefault();
    event.stopPropagation();

    var delta = 0;

    if (event.wheelDelta) { // WebKit / Opera / Explorer 9
      delta = event.wheelDelta / 40;
    } else if (event.detail) { // Firefox
      delta = - event.detail / 3;
    }

    var width = this.camera.right / ZOOM;
    var height = this.camera.top / ZOOM;

    ZOOM -= delta * 0.001;

    this.camera.left = -ZOOM*width;
    this.camera.right = ZOOM*width;
    this.camera.top = ZOOM*height;
    this.camera.bottom = -ZOOM*height;

    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  },

  tweenCamera: function(targetPos) {
    var currPos = this.camera.position;
    var tween = new TWEEN.Tween(currPos).to(targetPos, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  tweenAxis: function(targetRot) {
    var currRot = this.yAxis.labels.rotation;
    // var currPos = this.yAxis.labels.position.y;
    var tween = new TWEEN.Tween(currRot).to(targetRot, 500);
    // var tweenPos = new TWEEN.Tween(currPos).to(-10, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    // tweenPos.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  resetBlockOpacity: function() {
    this.nightAr.forEach(function(night, ix){
      night.setOpacity(1)
    });
  },

  increaseBlockOpacity: function(){
    this.nightAr.forEach(function(night, ix){
      night.setOpacity(.01)
    });
  },

  highlightNight: function(){
    var index = this.props.nightIx;
    this.resetBlockOpacity();
    this.nightAr.forEach(function(night, ix){
      if (index !== ix) {
        night.setOpacity(.01)
      }
    });
  },

  highlightState: function() {
    var targetState = this.props.state.toUpperCase();
    this.nightAr.forEach(function(night) {
      night.highlightState(targetState)
    });
  },

  highlightTime: function() {
    var time = this.props.time;
    this.resetBlockOpacity();
    this.nightAr.forEach(function(night){
      night.highlightTime(time)
    });
  },

  highlightFirst: function() {
    var updated = false;
    this.nightAr.forEach(function(night) {
      if (night._threeObj.visible && !updated) {
        night.setOpacity(1)
        updated = true
      } else {
        night.setOpacity(.01)
      }
    });
  },

  addGrid: function() {
    var grid = new Grid(0, GRID_SIZE);
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)
    var gridLines = grid.gridLines(scale, HOURS, X_OFFSET);
    this.scene.add(gridLines)
  },

  addLights: function() {
    var ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff);
    this.directionalLight.position.x = 0;
    this.directionalLight.position.y = 10;
    this.directionalLight.position.z = -10;
    this.scene.add(this.directionalLight);
  },

  addCamera: function() {
    var aspect = window.innerWidth / window.innerHeight;
    var d = 800;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, NEAR, FAR);
    this.camera.position.set(-d, d, -d);
    this.camera.lookAt( this.scene.position );
  },

  addRenderer: function() {
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.renderer.setClearColor(0x000000, 0);
    //this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(WIDTH, HEIGHT);
    this.container.appendChild(this.renderer.domElement);
  },

  addProjector: function() {
    this.projector = new THREE.Projector();

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshBasicMaterial()
    );
    this.plane.rotation.x = - Math.PI / 2;
    this.plane.visible = false;
    this.scene.add(this.plane);

    this.mouse2D = new THREE.Vector3(0, 0, 0);
  },

  addControls : function(){
    window.controls = new THREE.TrackballControls(this.camera);

    //controls.rotateSpeed = 1.0;
    //controls.panSpeed = 0.8;
    //controls.ZOOMSpeed = 1.2;

    controls.noZoom= true;
    controls.noPan  = true;
    controls.noRotate = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
  },

  addYAxis: function() {
    var scale = Utils.scale(HOURS, DISPLAY_SIZE);
    var yAxis = new YAxis(
      DISPLAY_SIZE,
      X_OFFSET,
      Z_OFFSET,
      TICK_COUNT,
      PX_PER_MIN,
      scale
    );

    this.yAxis = yAxis;
    this.scene.add(yAxis._threeObj);
    this.scene.add(yAxis.labels);
  },

  addXAxis: function() {
    var xAxis = new Axis(
      this.props.dateRange,
      X_OFFSET,
      GRID_SIZE,
      this.dateScale,
      NIGHT_SPACING,
      this.props.numNights
    );

    this.dateAxis = xAxis._threeObj.geometry;
    this.scene.add(xAxis._threeObj);

    //this.dateAxisLabels = xAxis.labels;
    //this.scene.add(xAxis.labels);
  },

  addSleepObjs: function() {
    var nights = new THREE.Object3D();
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)

    for (var j = 0; j < this.props.numNights; j++){
      var night = new Night(
        sleep.sleepData[j],
        BLOCK_WIDTH,
        NIGHT_SPACING,
        X_OFFSET,
        Z_OFFSET,
        scale,
        this.dateScale
      );
      this.nightAr.push(night);
      nights.add(night._threeObj);
    }
    this.scene.add(nights);
  },

  renderScene: function() {
    if (this.isShiftDown) {
      this.theta -= this.mouse2D.x * 6;
    }
    this.camera.lookAt(this.scene.position);
    // this.raycaster = this.projector.pickingRay(this.mouse2D.clone(), this.camera);
    this.renderer.render(this.scene, this.camera);
  },

  render: function() {
    return (
      <div>
        <div id="vis" onDoubleClick={this.resetBlockOpacity}></div>
      </div>
    );
  }
});

module.exports = Vis;

