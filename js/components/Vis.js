'use strict';

/*
* Main 3D sleep visualization
*
*/

var TWEEN = require('tween.js');
//var THREE = require('three');
// var OrbitControls = require('three-orbit-controls')(THREE);

var Vis = React.createClass({
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  VIEW_ANGLE: 50,
  NEAR: .1,
  FAR: 100000,
  nightAr: [],
  numNights: 300,
  gridSize: 1800,
  minsPerBlock: 5,
  blockWidth: 7,
  hours: 12,
  startTime: 22,
  nightSpacing: 100,
  sleepStates: {
    "UNDEFINED": { "height" : 0, "color" : 0x236167, arr : [] },
    "LIGHT": { "height" : 100, "color" : 0x28774F, arr : [] },
    "DEEP": { "height" : 40, "color" : 0x373276, arr : [] },
    "REM": { "height" : 70, "color" : 0xA2A838, arr : [] },
    "WAKE": { "height" : 120, "color" : 0x9F5B46, arr : [] }
  },

  getInitialState: function() {
    return {
      numNights: 300,
      gridSize: 1800
    }
  },

  componentDidMount: function() {
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
        this.moveCamera('time');
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

  offsetBlocks: function(){
    var self = this;

    this.nightAr.forEach(function(night, ix){
      var absPos = (ix - 1 * self.nightSpacing);
      var newPos = (absPos - (self.props.dateOffset * (self.nightSpacing))) + self.nightSpacing
      night.position.z = newPos;

      if (ix <= self.props.dateOffset - 1 ||
          ix - self.props.dateOffset > 15) {
        night.visible = false;
      } else {
        night.visible = true;
      }
    });

    var verts = this.dateAxis.vertices.slice(2, this.dateAxis.vertices.length);
    verts.forEach(function(vert, ix){
      if (vert.x == -720){
        var absPos = (ix * (self.nightSpacing/2));
      } else {
        var absPos = ((ix - 1) * (self.nightSpacing/2));
      }
      var newPos = ((absPos - (self.props.dateOffset * self.nightSpacing)) - 720)
      vert.z = newPos;
    });
    this.dateAxis.verticesNeedUpdate = true;

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

  setupTween: function(targetPos) {
    var tween = new TWEEN.Tween(this.camera.position)
                        .to(targetPos, 500);
    tween.easing(TWEEN.Easing.Cubic.InOut)
    tween.start();
  },

  resetBlockOpacity: function(){
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
    var index = this.props.night.id;

    this.resetBlockOpacity();
    this.nightAr.forEach(function(night, ix){
      if (index !== ix){
        night.children.forEach(function(block){
          block.material.opacity = .05;
        });
      }
    });
  },

  highlightState: function(){
    var targetState = this.props.state.toUpperCase();

    this.increaseBlockOpacity();
    this.sleepStates[targetState].arr.forEach(function(block){
      block.material.opacity = 1;
    });
  },

  highlightTime: function(){
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
    this.addGrid();
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

  onWindowResize  : function() {
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
    // window.orbitControls = new OrbitControls(this.camera);
    // window.controls = new THREE.OrbitControls(this.camera);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan  = true;
    controls.noRotate = true;
    //controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];

  },

  addGrid : function (){
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
    // time.geometry.dynamic = true
    // Add the start and end points
    time.vertices.push(new THREE.Vector3(this.displaySize, 0, -800));
    time.vertices.push(new THREE.Vector3(-this.displaySize , 0, -800));

    for (var t = 0; t < this.tickCount/2; t++){
      // Create the xPosition
      var xPos = (((this.displaySize/(this.tickCount/2)) * t * this.pxPerMin) - this.displaySize);
      // add the tick verticies
      time.vertices.push(new THREE.Vector3(xPos, 0, -800));
      time.vertices.push(new THREE.Vector3(xPos, 0, -815));

      // if (t % 28 === 0) {
      //   var currTime = this.fiveMinIncr[t];
      //   var text = new THREE.TextGeometry(currTime, {size: 6, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal"});
      //   var meshMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
      //   var textMesh = new THREE.Mesh(text, meshMaterial);

      //   textMesh.position.x = xPos
      //   textMesh.position.z = -850
      //   textMesh.rotation.x = - Math.PI / 2;
      //   textMesh.rotation.z = - Math.PI / 2;

      //   this.scene.add(textMesh);
      // }
    }

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

    for (var d = 0; d < this.numNights; d++){
      var yPos = (d * this.nightSpacing) - this.displaySize;

      days.vertices.push(new THREE.Vector3(-this.displaySize, 0, yPos));
      days.vertices.push(new THREE.Vector3(-755, 0, yPos));
    }

    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var dLine = new THREE.LineSegments(days, material);
    this.dateAxis = days;
    this.scene.add(dLine);

    // for ( var e = 1; e < this.numNights; e++ ){
    //   var date = sleep.sleepData[e].startDate.month + '/' + sleep.sleepData[e].startDate.day + '/' + sleep.sleepData[e].startDate.year

    //   var text = new THREE.TextGeometry( String(date), { size: 15, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
    //   var meshMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa });
    //   var textMesh = new THREE.Mesh(text,meshMaterial);
    //   textMesh.position.x = -780
    //   textMesh.position.z = (810/15 * e) - 810
    //   textMesh.rotation.x = - Math.PI / 2;
    //   textMesh.rotation.z = - Math.PI ;

    //   this.scene.add(textMesh);
    // }

  },

  addAxes : function() {
    this.addRefTimes();
    this.addRefDates();

  },

  addSleepObjs: function(){
    // Create the nights
    var nights = new THREE.Object3D();
    var scale = this.scale();

    // interate through the number of nights
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
        // position the sleep block
        var rect = new THREE.Mesh(geometry, material);
        rect.position.x = ((i * blockWidth) + bedTime) - this.displaySize; // rect width and position is a function of time
        rect.position.y = 0;
        rect.position.z = (j * this.nightSpacing) - this.displaySize;
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
    // window.orbitControls.update()
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

