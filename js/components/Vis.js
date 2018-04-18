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
    //this.addGrid();
    this.addControls();
    this.addAxes();
    this.addSleepObjs();
    //this.bindEvents();
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
      // Update the night's position
      var absPos = self.dateScale(night.dateObj)
      var newPos = absPos - (self.props.dateOffset * 2 * NIGHT_SPACING)
      night.position.z = newPos;

      // Update the night's visibility
      if (moment(night.dateObj).isBefore(startDate) ||
          moment(night.dateObj).isAfter(endDate)) {
        night.visible = false;
      } else {
        night.visible = true;
      }
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

  /*
   *
   *
  */

  setupTween: function(targetPos) {
    var currPos = this.camera.position;
    var tween = new TWEEN.Tween(currPos).to(targetPos, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  /*
   *
   *
  */
  resetBlockOpacity: function() {
    this.nightAr.forEach(function(night, ix){
      night.children.forEach(function(block){
        block.material.opacity = 1;
      });
    });
  },

  /*
   *
   *
  */

  increaseBlockOpacity: function(){
    this.nightAr.forEach(function(night, ix){
      night.children.forEach(function(block){
        block.material.opacity = .05;
      });
    });
  },

  highlightNight: function(){
    var index = this.props.nightIx;
    this.resetBlockOpacity();
    this.nightAr.forEach(function(night, ix){
      if (index !== ix) {
        night.children.forEach(function(block){
          block.material.opacity = .05;
        });
      }
    });
  },

  highlightState: function() {
    var targetState = this.props.state.toUpperCase();
    this.increaseBlockOpacity();
    SLEEP_STATES[targetState].arr.forEach(function(block){
      block.material.opacity = 1;
    });
  },

  highlightTime: function() {
    var targetIndex = 0;
    var timeType = this.props.time;
    this.resetBlockOpacity();
    this.nightAr.forEach(function(night){
      if (timeType == 'risetime') {
        targetIndex = night.children.length - 1;
      }
      night.children.forEach(function(block, ix) {
        if (ix !== targetIndex) {
          block.material.opacity = .01;
        }
      });
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
    this.tickCount = HOURS;
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


  // TODO: remove this. Won't be needed with gridlines
  addGrid : function() {
    var gridGeom = new THREE.Geometry();
    var step = 6;

    for (var i = -GRID_SIZE/2; i <= GRID_SIZE/2; i += step) {
      gridGeom.vertices.push(new THREE.Vector3(-GRID_SIZE/2, 0, i));
      gridGeom.vertices.push(new THREE.Vector3(GRID_SIZE/2, 0, i));
    }

    for (var j = -(GRID_SIZE/2); j <= GRID_SIZE/2; j += step) {
      gridGeom.vertices.push(new THREE.Vector3(j, 0, -(GRID_SIZE/2)));
      gridGeom.vertices.push(new THREE.Vector3(j, 0, GRID_SIZE/2));
    }

    var gridMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.2,
      visible : true
    });
    var gridLines = new THREE.LineSegments(gridGeom, gridMat);
    this.scene.add(gridLines);
  },

  addYAxisTicks: function() {
    var time = new THREE.Geometry();
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)

    // Add the start and end points
    time.vertices.push(new THREE.Vector3(X_OFFSET, 0, Z_OFFSET));
    time.vertices.push(new THREE.Vector3(DISPLAY_SIZE + X_OFFSET, 0, Z_OFFSET));

    for (var t = 0; t < this.tickCount; t++) {
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
    for (var t = 0; t < this.tickCount; t++) {
      var xPos = (DISPLAY_SIZE / this.tickCount * t * PX_PER_MIN);
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
    var self = this
    var days = new THREE.Geometry();
    days.vertices.push(new THREE.Vector3(0, 0, 0));
    days.vertices.push(new THREE.Vector3(0, 0, 1600));

    //this.props.dateRange.forEach(function(date, ix) {
    for (var i = 0; i < 20; i++) {
      var date = this.props.dateRange[i];
      var zPos = self.dateScale(date);
      days.vertices.push(new THREE.Vector3(0, 0, zPos));
      days.vertices.push(new THREE.Vector3(-10, 0, zPos));
    }

    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var xTicks = new THREE.LineSegments(days, material);
    this.dateAxis = days;
    xTicks.applyMatrix(new THREE.Matrix4().makeTranslation(X_OFFSET, 0, -740 ));
    this.scene.add(xTicks);
  },

  addXAxisTickLabels: function() {
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    canvas.height = (this.props.numNights + 3) * NIGHT_SPACING * 4
    canvas.width = 150
    context.font = "24px Arial";

    for (var d = 0; d < this.props.dateRange.length; d++){
      var date = this.props.dateRange[d].format('MM/DD/YYYY')
      var yPos = (d * NIGHT_SPACING);
      context.fillText(date, 10, canvas.height - (yPos * 2) - 30);
    }
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    // material.transparent = false

    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width, canvas.height),
      material
    );

    mesh.position.set(0, 0, 0)
    mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-X_OFFSET + (canvas.width/2) + 10, -canvas.height - 1040, 0));
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.PI;

    this.scene.add(mesh);
    this.dateAxisLabels = mesh
  },

  addAxes : function() {
    this.addXAxisTicks()
    this.addXAxisTickLabels()
    this.addYAxisTicks()
    this.addYAxisTickLabels()
  },

  addSleepObjs: function() {
    // Create the nights
    var nights = new THREE.Object3D();
    var scale = Utils.scale(HOURS, DISPLAY_SIZE)

    for (var j = 0; j < this.props.numNights; j++){
      var bedTime = scale(sleep.sleepData[j].translatedBedTime);
      var night = new THREE.Object3D();

      for (var i = 0; i < sleep.sleepData[j].sleepGraph.length; i++){
        // create the material for the sleep block
        var blockWidth = MINS_PER_BLOCK * PX_PER_MIN
        var blockDatum = sleep.sleepData[j].sleepGraph[i];
        var geometry = new THREE.BoxGeometry(
            (.8 * blockWidth),
            SLEEP_STATES[blockDatum].height,
            BLOCK_WIDTH
        );
        var material = new THREE.MeshBasicMaterial({
          color: SLEEP_STATES[blockDatum].color,
          wireframe: false,
          transparent: true
        });

        // Position the sleep block
        var rect = new THREE.Mesh(geometry, material);
        rect.position.x = ((i * blockWidth) + bedTime) + X_OFFSET;
        rect.position.y = 0;
        rect.position.z = this.dateScale(sleep.sleepData[j].dateObj) + (2 * NIGHT_SPACING) + Z_OFFSET;
        rect.translateY(SLEEP_STATES[blockDatum].height/2);
        rect.updateMatrix();

        // add to night object
        if (blockDatum !== "UNDEFINED") {
          night.add(rect);
        }

        // push to appropriate state array
        SLEEP_STATES[blockDatum].arr.push(rect);
      }
      night.dateObj = sleep.sleepData[j].dateObj;
      nights.add(night);
      this.nightAr.push(night);
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

