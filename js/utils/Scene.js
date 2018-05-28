'use strict'

/*
* Three.js 3D Scene
*
*/

var TWEEN = require('tween.js');

var Utils = require('./Utils');
var Axis = require('./Axis');
var YAxis = require('./YAxis');
var Grid = require('./Grid');
var Night = require('./Night');

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


function Scene(timeScale, dateScale, dateRange, nights, numNights) {
  this.dateScale = dateScale
  this.timeScale = timeScale
  this.dateRange = dateRange;
  this.nights = nights;
  this.numNights = numNights;
  this.nightAr = [];
  this.container = document.createElement('div');
  this.scene = new THREE.Scene();

  $('#vis').prepend(this.container);
}

Scene.prototype.build = function() {
  this.addCamera();
  this.addLights();
  this.addRenderer();
  this.addProjector();
  this.addXAxis();
  this.addYAxis();
  this.addGrid();
  this.addSleepObjs();
}

Scene.prototype.addLights = function() {
  var ambientLight = new THREE.AmbientLight(0x606060);
  this.scene.add(ambientLight);

  this.directionalLight = new THREE.DirectionalLight(0xffffff);
  this.directionalLight.position.x = 0;
  this.directionalLight.position.y = 10;
  this.directionalLight.position.z = -10;
  this.scene.add(this.directionalLight);
}

Scene.prototype.addCamera = function() {
   var aspect = window.innerWidth / window.innerHeight;
   var d = 800;
   this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, NEAR, FAR);
   this.camera.position.set(-d, d, -d);
   this.camera.lookAt( this.scene.position );
}

Scene.prototype.addRenderer = function() {
  this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  this.renderer.setClearColor(0x000000, 0);
  //this.renderer.setClearColor(0xffffff, 1);
  this.renderer.setSize(WIDTH, HEIGHT);
  this.container.appendChild(this.renderer.domElement);
}

Scene.prototype.addProjector = function() {
  this.projector = new THREE.Projector();

  this.plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshBasicMaterial()
  );
  this.plane.rotation.x = - Math.PI / 2;
  this.plane.visible = false;
  this.scene.add(this.plane);

  this.mouse2D = new THREE.Vector3(0, 0, 0);
}

Scene.prototype.addYAxis = function() {
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

Scene.prototype.addXAxis = function() {
  var xAxis = new Axis(
    this.dateRange,
    X_OFFSET,
    GRID_SIZE,
    this.dateScale,
    NIGHT_SPACING,
    this.numNights
  );

  this.dateAxis = xAxis._threeObj.geometry;
  this.scene.add(xAxis._threeObj);
}

Scene.prototype.addGrid = function() {
  var grid = new Grid(0, GRID_SIZE);
  var scale = Utils.scale(HOURS, DISPLAY_SIZE)
  var gridLines = grid.gridLines(scale, HOURS, X_OFFSET);
  this.scene.add(gridLines)
}

Scene.prototype.addSleepObjs = function() {
  var nights = new THREE.Object3D();
  var scale = Utils.scale(HOURS, DISPLAY_SIZE)

  for (var j = 0; j < this.nights.length - 1; j++) {
    var night = new Night(
      this.nights[j],
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
}

Scene.prototype.render = function() {
  if (this.isShiftDown) {
    this.theta -= this.mouse2D.x * 6;
  }
  this.camera.lookAt(this.scene.position);
  this.renderer.render(this.scene, this.camera);
}

// Events
Scene.prototype.tweenCamera = function(targetPos) {
  // replace w/ Scene.camera
  var currPos = this.camera.position;
  var tween = new TWEEN.Tween(currPos).to(targetPos, 500);
  tween.easing(TWEEN.Easing.Cubic.InOut)
  tween.start();
}

Scene.prototype.tweenAxis = function(targetRot) {
  var currRot = this.yAxis.labels.rotation;
  // var currPos = this.yAxis.labels.position.y;
  var tween = new TWEEN.Tween(currRot).to(targetRot, 500);
  // var tweenPos = new TWEEN.Tween(currPos).to(-10, 500);
  tween.easing(TWEEN.Easing.Cubic.InOut)
  // tweenPos.easing(TWEEN.Easing.Cubic.InOut)
  tween.start();
}

Scene.prototype.onWindowResize = function() {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(window.innerWidth, window.innerHeight);
}

Scene.prototype.bindEvents = function() {
  window.addEventListener('resize', this.onWindowResize, false);
  this.renderer.domElement.addEventListener('mousewheel', this.mouseWheel.bind(this), false);
  this.renderer.domElement.addEventListener('DOMMouseScroll', this.mouseWheel.bind(this), false); // firefox
}

Scene.prototype.mouseWheel = function(event) {
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
}

module.exports = Scene;
