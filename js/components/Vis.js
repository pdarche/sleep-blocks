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
var Grid = require('../utils/Grid');
var Night = require('../utils/Night');

var WIDTH           = window.innerWidth
var HEIGHT          = window.innerHeight
var VIEW_ANGLE      = 50
var NEAR            = .1
var FAR             = 100000
var NUM_NIGHTS      = 25
var GRID_SIZE       = 1800
var DISPLAY_SIZE    = GRID_SIZE - (1/5 * GRID_SIZE)
var MINS_PER_BLOCK  = 5
var PX_PER_MIN      = DISPLAY_SIZE / (HOURS * 60);
var BLOCK_WIDTH     = 10
var HOURS           = 12
var START_TIME      = 22
var NIGHT_SPACING   = 50
var X_OFFSET        = -740
var Z_OFFSET        = -740
var TICK_COUNT      = HOURS
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
    this.offsetDateTicks();
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
        this.offsetDateTicks();
      default:
        return
    }
  },

  buildScene: function() {
    this.init();
    this.addControls();
    this.addAxes();
    this.addSleepObjs();
    //this.bindEvents();
    var grid = new Grid(0, GRID_SIZE);
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)
    var gridLines = grid.gridLines(scale, HOURS, X_OFFSET);
    this.scene.add(gridLines)
  },

  animate: function() {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderScene();
    if (this.props.controlsEnabled){
      window.controls.update();
    }
  },

  handleViewChange: function() {
    var vec;
    switch (this.props.activeView) {
      case 'overview':
        vec = {x: -1200, y: 1200, z: -1200}
        break;
      case 'overhead':
        vec = {x: -25, y: 2000, z: 0}
        break;
      case 'front':
        vec = {x: 0, y: 800, z: -1700}
        break;
      default:
        vec = {x: -1200, y: 1200, z: -1200}
        break;
    }
    this.setupTween(vec)
  },

  /*
   * Offset the blocks by number of days
   *
  */

  offsetBlocks: function() {
    var self = this
    var offsetIx = Math.ceil(this.props.dateOffset)
    var startDate = this.props.dateRange[offsetIx]
    var endDate = this.props.dateRange[offsetIx + 60]

    this.nightAr.forEach(function(night, ix) {
      night.offset(self.props.dateOffset, startDate, endDate)
    })
  },

  /*
   * Offset X axis ticks by number of days
   *
  */

  offsetDateTicks: function() {
    // Offset the date axis ticks
    var self = this
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
    var absPos = 8000 - 740
    var newPos = absPos - this.props.dateOffset * 2 * NIGHT_SPACING
    this.dateAxisLabels.position.z = newPos
  },

  setupTween: function(targetPos) {
    var currPos = this.camera.position;
    var tween = new TWEEN.Tween(currPos).to(targetPos, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  resetBlockOpacity: function() {
    this.nightAr.forEach(function(night, ix){
      night.setOpacity(1)
    });
  },

  increaseBlockOpacity: function(){
    this.nightAr.forEach(function(night, ix){
      night.setOpacity(.05)
    });
  },

  highlightNight: function(){
    var index = this.props.nightIx;
    this.resetBlockOpacity();
    this.nightAr.forEach(function(night, ix){
      if (index !== ix) {
        night.setOpacity(.05)
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

  init: function() {
    // Set up scene
    this.container = document.createElement('div');
    $('#vis').prepend(this.container);
    this.scene = new THREE.Scene();

    this.addCamera()
    this.addLights()
    this.addRenderer()
    this.addProjector();

    // Append the renderer to the container
    this.container.appendChild(this.renderer.domElement);

    // Set the size of the area that the chart is displayed on
    PX_PER_MIN = DISPLAY_SIZE / (HOURS * 60);
    TICK_COUNT = HOURS;
  },

  bindEvents: function() {
    window.addEventListener('resize', this.onWindowResize, false);
  },

  onWindowResize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  addLights: function() {
    // Set up lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);

    var spotLight = new THREE.SpotLight();
    spotLight.position.set(10, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight)

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  },

  addCamera: function() {
    this.camera = new THREE.PerspectiveCamera(
        VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR);
    this.camera.position.set(-1200, 1200, -1200);
    this.camera.lookAt(this.scene.position)
  },

  addRenderer: function() {
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.renderer.setClearColor(0x000000, 0);
    //this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(WIDTH, HEIGHT);
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

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan  = true;
    controls.noRotate = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
  },


  addYAxisTicks: function() {
    var time = new THREE.Geometry();
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)

    // Add the start and end points
    time.vertices.push(new THREE.Vector3(X_OFFSET, 0, Z_OFFSET));
    time.vertices.push(new THREE.Vector3(DISPLAY_SIZE + X_OFFSET, 0, Z_OFFSET));

    for (var t = 0; t < TICK_COUNT; t++) {
      var xPos = scale(t * 3600) + X_OFFSET // Note: this is tighlty coupled to there only being ticks for hours
      time.vertices.push(new THREE.Vector3(xPos, 0, Z_OFFSET));
      time.vertices.push(new THREE.Vector3(xPos, 0, Z_OFFSET - 15));
    }

    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var tLine = new THREE.LineSegments(time, material);
    this.scene.add(tLine);
  },

  addYAxisTickLabels: function() {
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    canvas.height = DISPLAY_SIZE * 2
    canvas.width = 150
    context.font = "48px Arial";

    var hrs = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    for (var t = 0; t < TICK_COUNT; t++) {
      var xPos = (DISPLAY_SIZE / TICK_COUNT * t * PX_PER_MIN);
      // var currTime = this.fiveMinIncr[t];
      var time = hrs[t];
      if (time != 10) {
        context.fillText(time + ':00', 30, canvas.height - xPos + 10);
      }
    }
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    material.transparent = false //true
    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width/2, canvas.height/2),
      material
    )
    mesh.position.set(
      X_OFFSET + DISPLAY_SIZE/2,
      0,
      Z_OFFSET - canvas.width/2
    )
    mesh.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
    this.scene.add(mesh);
  },

  addXAxisTicks: function() {
    var xAxis = new Axis(
        this.props.dateRange,
        X_OFFSET,
        this.dateScale,
        NIGHT_SPACING,
        NUM_NIGHTS
    );

    this.dateAxis = xAxis._threeObj.geometry;
    this.scene.add(xAxis._threeObj);

    this.dateAxisLabels = xAxis.labels;
    this.scene.add(xAxis.labels);
  },

  addAxes : function() {
    this.addXAxisTicks()
    this.addYAxisTicks()
    this.addYAxisTickLabels()
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

  rotation: 0,

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

