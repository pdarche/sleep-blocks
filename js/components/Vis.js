'use strict';

/*
* Main 3D sleep visualization
*
*/

var TWEEN = require('tween.js');
var Moment = require('moment');
var MomentRange = require('moment-range'); 
//var THREE = require('three');
// var OrbitControls = require('three-orbit-controls')(THREE);
var moment = MomentRange.extendMoment(Moment);

var Vis = React.createClass({
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  VIEW_ANGLE: 50,
  NEAR: .1,
  FAR: 100000,
  nightAr: [],
  numNights: 387,
  gridSize: 1800,
  minsPerBlock: 5,
  blockWidth: 7,
  hours: 12,
  startTime: 22,
  nightSpacing: 50,
  sleepStates: {
    "UNDEFINED": { "height" : 0, "color" : 0x236167, arr : [] },
    "LIGHT": { "height" : 100, "color" : 0x28774F, arr : [] },
    "DEEP": { "height" : 40, "color" : 0x373276, arr : [] },
    "REM": { "height" : 70, "color" : 0xA2A838, arr : [] },
    "WAKE": { "height" : 120, "color" : 0x9F5B46, arr : [] }
  },

  getInitialState: function() {
    return {
      numNights: 387,
      gridSize: 1800
    }
  },

  componentDidMount: function() { 
    this.createDateRange();
    this.createTimescale();
    this.buildScene();
    this.animate();
    this.offsetBlocks();
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
      default:
        return
    }
  },

  handleViewChange: function() {
    var vec;
    switch (this.props.activeView) {
      case 'overview':
        vec = {x: -1400, y: 1000, z: -900}
        break;
      case 'overhead':
        vec = {x: -25, y: 2000, z: 0}
        break;
      case 'front':
        vec = {x: 0, y: 800, z: -1700}
        break;
      default:
        vec = {x: -1400, y: 1000, z: -900}
        break;
    }
    this.setupTween(vec)
  },

  createDateRange: function() {
    var dateRange = moment.range(
        sleep.sleepData[0].dateObj, 
        sleep.sleepData[this.numNights].dateObj
    ) 
    this.dateRange = Array.from(dateRange.by('days'))
  },

  createTimescale: function() {
    var startDate = moment(sleep.sleepData[0].startDate)
    var endDate = moment(sleep.sleepData[this.numNights].startDate)
    var diff = endDate.diff(startDate, 'days')
    var width = this.nightSpacing * diff 
    this.timeScale = d3.time.scale()
      .domain([startDate, endDate])
      .range([0, width])
  },

  offsetBlocks: function() {
    var self = this
    var offsetIx = Math.ceil(this.props.dateOffset)
    var startDate = this.props.dateRange[offsetIx] 
    var endDate = this.props.dateRange[offsetIx + 60]

    this.nightAr.forEach(function(night, ix) {
      // Update the night's position
      var absPos = self.timeScale(night.dateObj) 
      var newPos = absPos - (self.props.dateOffset * 2 * self.nightSpacing) 
      night.position.z = newPos;
      // Update the night's visibility
      if (moment(night.dateObj).isBefore(startDate) || 
          moment(night.dateObj).isAfter(endDate)) {
        night.visible = false; 
      } else {
        night.visible = true;
      } 
    })
    this.offsetDateTicks()
  },

  offsetDateTicks: function() {
    // Offset the date axis ticks
    var self = this
    var verts = this.dateAxis.vertices.slice(2, this.dateAxis.vertices.length);
    verts.forEach(function(vert, ix) {
      var absPos = vert.x == -720 ?
        ix * self.nightSpacing :
        (ix - 1) * self.nightSpacing
      var newPos = (absPos - (self.props.dateOffset * 2 * self.nightSpacing)) - 720
      vert.z = newPos;
    });
    this.dateAxis.verticesNeedUpdate = true;
  },

  setupTween: function(targetPos) {
    var tween = new TWEEN.Tween(this.camera.position)
                        .to(targetPos, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  resetBlockOpacity: function() {
    this.nightAr.forEach(function(night, ix){
      night.children.forEach(function(block){
        block.material.opacity = 1;
      });
    });
  },

  increaseBlockOpacity: function(){
    this.nightAr.forEach(function(night, ix){
      night.children.forEach(function(block){
        block.material.opacity = .05;
      });
    });
  },

  highlightNight: function(){
    //var index = this.props.night.id;
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
    this.sleepStates[targetState].arr.forEach(function(block){
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

      night.children.forEach(function(block, ix){
        if (ix !== targetIndex) {
          block.material.opacity = .01;
        }
      });
    });
  },

  buildScene: function(){
    this.init();
   // this.addGrid();
    this.addProjector();
    this.addControls();
    this.makeDatetimes();
    this.addAxes();
    this.makeBedtimes();
    this.addSleepObjs();
    this.bindEvents();
  },

  init: function(){
    // Set up scene
    this.container = document.createElement('div');
    $('#vis').prepend(this.container);
    this.scene = new THREE.Scene();

    // Set up camera
    this.camera = new THREE.PerspectiveCamera(
      this.VIEW_ANGLE,
      this.WIDTH / this.HEIGHT,
      this.NEAR,
      this.FAR
    );
    this.camera.position.set(-1400, 1000, -900);
    window.camera = this.camera
    
    // Set up lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);

    var spotLight = new THREE.SpotLight();
    spotLight.position.set(10, 80, 30);
    spotLight.castShadow = true;

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0x808080);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.castShadow = true;
    directionalLight.position.normalize();
    this.scene.add(directionalLight);

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    // this.renderer = new THREE.CanvasRenderer();
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    // Append the renderer to the container
    this.container.appendChild(this.renderer.domElement);

    // Set the size of the area that the chart is displayed on
    this.displaySize = (this.state.gridSize - (1/5 * this.state.gridSize))/2;
    this.pxPerMin = (2 * this.displaySize / (this.hours*60));
    this.tickCount = (this.hours*60)/this.minsPerBlock;
  },

  bindEvents: function(){
    window.addEventListener('resize', this.onWindowResize, false);
  },

  onWindowResize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  addProjector : function(){
    this.projector = new THREE.Projector();

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial());
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

  addGrid : function () {
    var gridGeom = new THREE.Geometry();
    var step = 6;

    for (var i = -this.state.gridSize/2; i <= this.state.gridSize/2; i += step) {
      gridGeom.vertices.push(new THREE.Vector3(-this.state.gridSize/2, 0, i));
      gridGeom.vertices.push(new THREE.Vector3(this.state.gridSize/2, 0, i));
    }

    for (var j = -(this.state.gridSize/2); j <= this.state.gridSize/2; j += step) {
      gridGeom.vertices.push(new THREE.Vector3(j, 0, -(this.state.gridSize/2)));
      gridGeom.vertices.push(new THREE.Vector3(j, 0, this.state.gridSize/2));
    }

    var gridMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.2,
      visible : true
    });
    var gridLines = new THREE.LineSegments(gridGeom, gridMat);
    // gridLines.type = THREE.LinePieces;
    this.scene.add(gridLines);
  },

  addRefTimes : function() {
    var time = new THREE.Geometry();
    // Add the start and end points
    time.vertices.push(new THREE.Vector3(this.displaySize, 0, -800));
    time.vertices.push(new THREE.Vector3(-this.displaySize , 0, -800));

    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    canvas.height = this.gridSize 
    context.font = "24px Arial";
    context.fillStyle = "rgba(0,0,0,1)";

    for (var t = 0; t < this.tickCount; t++) {
      // Create xPosition
      var xPos = (this.displaySize / this.tickCount * t * this.pxPerMin) - this.displaySize;
      // Add tick verticies
      time.vertices.push(new THREE.Vector3(xPos, 0, -800));
      time.vertices.push(new THREE.Vector3(xPos, 0, -815));
      // Add date text 
      if (t % 12 === 0) {
        var currTime = this.fiveMinIncr[t];
        console.log('currtime', currTime)
        console.log('xpos', xPos)
        context.fillText(currTime, 0, -xPos + 825);
      }
    }
    // Add canvas to texture 
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
    material.transparent = true
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width, canvas.height), material)
    mesh.position.x = 0
    mesh.position.z = -740
    mesh.rotation.x = - Math.PI / 2;
    mesh.rotation.z = - Math.PI / 2;
    this.scene.add(mesh);
    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var tLine = new THREE.LineSegments(time, material);
    this.scene.add(tLine);
  },

  addRefDates : function() {
    var days = new THREE.Geometry();

    days.vertices.push(new THREE.Vector3(-this.displaySize, 0, -800));
    days.vertices.push(new THREE.Vector3(-this.displaySize, 0, 800));

    for (var d = 0; d < this.props.dateRange.length - 1; d++){
      var yPos = (d * this.nightSpacing) - this.displaySize;
      days.vertices.push(new THREE.Vector3(-this.displaySize, 0, yPos));
      days.vertices.push(new THREE.Vector3(-745, 0, yPos));

      var date = this.props.dateRange[d].format('MM/DD/YYYY')  
      var yPos = (d * this.nightSpacing) - this.displaySize;
      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')
      context.font = "24px Arial";
      context.fillStyle = "rgba(0,0,0,1)";
      context.fillText(date, 0, 32);

      var texture = new THREE.Texture(canvas) 
      texture.needsUpdate = true;

      var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
      material.transparent = true

      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width, canvas.height), material)
      mesh.position.x = -900
      mesh.position.z = (d + 1) * (2 * this.nightSpacing) - 872
      mesh.rotation.x = - Math.PI / 2;
      mesh.rotation.z = - Math.PI;
      //this.scene.add(mesh);
    }

    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var dLine = new THREE.LineSegments(days, material);
    this.dateAxis = days;
    this.scene.add(dLine);
  },

  addAxes : function() {
    this.addRefTimes();
    this.addRefDates();
  },

  addSleepObjs: function() {
    // Create the nights
    var nights = new THREE.Object3D();
    var scale = this.scale();

    for (var j = 0; j < this.numNights; j++){
      var bedTime = scale(this.bedtimes[j]);
      var night = new THREE.Object3D();
      // for each block in the that night
      for (var i = 0; i < sleep.sleepData[j].sleepGraph.length; i++){
        // create the material for the sleep block
        var blockWidth = this.minsPerBlock * this.pxPerMin
        var blockDatum = sleep.sleepData[j].sleepGraph[i];
        var geometry = new THREE.BoxGeometry((.8 * blockWidth), this.sleepStates[blockDatum].height, 7);
        var material = new THREE.MeshBasicMaterial({
          color: this.sleepStates[blockDatum].color,
          wireframe: false,
          transparent: true
        });
        // Position the sleep block
        var rect = new THREE.Mesh(geometry, material);
        rect.position.x = ((i * blockWidth) + bedTime) - this.displaySize; // rect width and position is a function of time
        rect.position.y = 0;
        //rect.position.z = (j * this.nightSpacing) - this.displaySize;
        rect.position.z = this.timeScale(sleep.sleepData[j].dateObj) - 700;
        rect.translateY(this.sleepStates[blockDatum].height/2);
        // rect.matrixAutoUpdate = false;
        rect.updateMatrix();
        // add to night object
        if (blockDatum !== "UNDEFINED") {
          night.add(rect);
        }
        // push to appropriate state array
        this.sleepStates[blockDatum].arr.push(rect);
      }
      night.dateObj = sleep.sleepData[j].dateObj
      nights.add(night);
      this.nightAr.push(night);
    }
    this.scene.add(nights);
  },

  scale: function(){
    return d3.scale.linear()
      .domain([0, this.hours * 60 * 60])
      .range([0, this.displaySize])
  },

  // WARNING: this is not connected to start time
  makeDatetimes : function(){
    var hrs = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1];
    this.fiveMinIncr = []
    for (var i = 0; i < hrs.length; i++) {
      for (var j = 0; j < 12; j++) {
        var mins
        if  (j == 0) {
          mins = "00"
        } else if (j == 1) {
          mins = "05"
        } else {
          mins = 5 * j
        }
        var time = String( hrs[i] + ':' + mins )
        this.fiveMinIncr.push(time)
      }
    }

  },

  makeBedtimes  : function() {
    this.bedtimes = [];
    for (var j = 0; j < this.numNights; j++) {
      // convert the bedtime to seconds
      var bt = sleep.sleepData[j].bedTime;
      var btHr = Number(bt.hour) * 60 * 60;
      var btMin = Number(bt.minute) * 60;
      // Offset the seconds so that 10pm is 0
      var btInSeconds = btHr + btMin + Number(bt.second) - (this.startTime * 60 * 60);
      // if the bedtime is after midnight add two hours
      if (btHr < 75600) {
        btInSeconds = (btHr + btMin + Number(btInSeconds) + (this.startTime * 60 * 60) + 7200);
      }
      this.bedtimes.push(btInSeconds);
    }
  },

  animate : function() {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderScene();
    if (this.props.controlsEnabled){
      window.controls.update();
    }
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

