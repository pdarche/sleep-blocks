Scene = {
  numNights: 14,
  gridSize: 1800,
  minsPerBlock: 5,
  blockWidth: 7,
  hours: 12,
  startTime: 22,
  nightAr: [],

  buildScene: function() {
    Scene.init();
    Scene.addGrid();
    Scene.addProjector();
    Scene.addControls();
    Scene.makeDatetimes();
    Scene.addAxes();
    Scene.makeBedtimes();
    Scene.addSleepObjs();
  },

  init : function() {
    //scene
    Scene.WIDTH = window.innerWidth
    Scene.HEIGHT = window.innerHeight
    Scene.container = document.createElement('div');
    $('#content').prepend(Scene.container);

    Scene.scene = new THREE.Scene();

    // camera
    Scene.VIEW_ANGLE = 50,
    Scene.ASPECT  = Scene.WIDTH / Scene.HEIGHT,
    Scene.NEAR = 0.1,
    Scene.FAR = 100000

    Scene.camera = new THREE.PerspectiveCamera(
      Scene.VIEW_ANGLE,
      Scene.ASPECT,
      Scene.NEAR,
      Scene.FAR
    );
    Scene.camera.position.set(-1400, 1000, -900);

    // lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    Scene.scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    Scene.scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0x808080 );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    Scene.scene.add( directionalLight );

    // renderer
    Scene.renderer = new THREE.CanvasRenderer();
    Scene.renderer.setSize(Scene.WIDTH, Scene.HEIGHT);

    Scene.container.appendChild(Scene.renderer.domElement);

    // state objects
    Scene.light = [];
    Scene.deep = [];
    Scene.rem = [];
    Scene.wake = [];
    Scene.und = [];

    // Set the size of the area that the chart is displayed on
    Scene.displaySize = (Scene.gridSize - (1/5 * Scene.gridSize))/2;
    Scene.pxPerMin = 2 * Scene.displaySize / (Scene.hours*60);
    Scene.tickCount = (Scene.hours*60)/Scene.minsPerBlock;

  },

  addProjector : function(){
    Scene.projector = new THREE.Projector();

    Scene.plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial());
    Scene.plane.rotation.x = - Math.PI / 2;
    Scene.plane.visible = false;
    Scene.scene.add(Scene.plane);

    Scene.mouse2D = new THREE.Vector3(0, 0, 0);

  },

  addControls : function(){
    window.controls = new THREE.TrackballControls( Scene.camera );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan  = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];

  },

  // REFACTOR: this doesn't scale with changes to grid size
  addGrid : function (){
    var gridGeom = new THREE.Geometry();
    var step = 6;

    for (var i = -Scene.gridSize/2; i <= Scene.gridSize/2; i += step) {
      gridGeom.vertices.push(new THREE.Vector3(-Scene.gridSize/2, 0, i));
      gridGeom.vertices.push(new THREE.Vector3(Scene.gridSize/2, 0, i));
    }

    for (var j = -(Scene.gridSize/2); j <= Scene.gridSize/2; j += step) {
      gridGeom.vertices.push(new THREE.Vector3( j, 0, -(Scene.gridSize/2)));
      gridGeom.vertices.push(new THREE.Vector3( j, 0, Scene.gridSize/2));
    }

    var gridMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.2,
      visible : true
    });

    var gridLines = new THREE.Line(gridGeom, gridMat);
    gridLines.type = THREE.LinePieces;

    Scene.scene.add(gridLines);

  },

  addAxes : function() {
    Scene.addRefTimes();
    Scene.addRefDates();

  },

  addSleepObjs: function(){
    var sleepStates = {
      "UNDEFINED": { "height" : 0, "color" : 0xffffff, arr : Scene.und },
      "LIGHT": { "height" : 100, "color" : 0x32cd32, arr : Scene.light },
      "DEEP": { "height" : 40, "color" : 0x006400, arr : Scene.deep },
      "REM": { "height" : 70, "color" : 0xd3d3d3, arr : Scene.rem },
      "WAKE": { "height" : 120, "color" : 0xb22020, arr : Scene.wake }
    }

    var nights = new THREE.Object3D();

    // Map seconds to pixels
    var scale = d3.scale.linear()
      .domain([0, Scene.hours * 60 * 60])
      .range([0, Scene.displaySize])

    // interate through the number of nights
    for (var j = 0; j < Scene.numNights; j++){
      var bedTime = scale(Scene.bedtimes[j]);
      var night = new THREE.Object3D();

      // for each block in the that night
      for (var i = 0; i < sleep.sleepData[j].sleepGraph.length; i++){
        // create the material for the sleep block
        var blockWidth = Scene.minsPerBlock * Scene.pxPerMin
        var blockDatum = sleep.sleepData[j].sleepGraph[i];
        var geometry = new THREE.CubeGeometry((.8 * blockWidth), sleepStates[blockDatum].height, 7);
        var material = new THREE.MeshBasicMaterial({
          color: sleepStates[blockDatum].color,
          wireframe: false
        });
        // position the sleep block
        var rect = new THREE.Mesh(geometry, material);
        rect.position.x = ((i * blockWidth) + bedTime) - this.displaySize; // rect width and position is a function of time
        rect.position.y = 0;
        rect.position.z = (j * 100) - this.displaySize;
        rect.translateY(sleepStates[blockDatum].height/2);
        rect.matrixAutoUpdate = false;
        rect.updateMatrix();

        // add to night object
        if (blockDatum !== "UNDEFINED") {
          night.add(rect);
        }

        // push to appropriate state array
        sleepStates[blockDatum].arr.push(rect);
      }

      nights.add(night);
      Scene.nightAr.push(night);
    }

    Scene.scene.add(nights);

  },

  addRefTimes : function() {
    var time = new THREE.Geometry();

    // Add the start and end points
    time.vertices.push(new THREE.Vector3(Scene.displaySize, 0, -800));
    time.vertices.push(new THREE.Vector3(-Scene.displaySize , 0, -800));

    for (var t = 0; t < Scene.tickCount; t++){
      // Create the xPosition
      var xPos = ((Scene.displaySize/Scene.tickCount) * t * Scene.pxPerMin) - Scene.displaySize;
      // add the tick verticies
      time.vertices.push(new THREE.Vector3(xPos, 0, -800));
      time.vertices.push(new THREE.Vector3(xPos, 0, -815));

      // if (t % 28 === 0) {
      //   var currTime = Scene.fiveMinIncr[t];
      //   var text = new THREE.TextGeometry(currTime, {size: 6, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal"});
      //   var meshMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
      //   var textMesh = new THREE.Mesh(text, meshMaterial);

      //   textMesh.position.x = xPos
      //   textMesh.position.z = -850
      //   textMesh.rotation.x = - Math.PI / 2;
      //   textMesh.rotation.z = - Math.PI / 2;

      //   Scene.scene.add(textMesh);
      // }
    }

    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: .4,
      visible : true
    });

    var tLine = new THREE.Line(time, material);
    tLine.type = THREE.LinePieces;
    Scene.scene.add(tLine);

  },

  addRefDates : function() {
    days = new THREE.Geometry();

    days.vertices.push( new THREE.Vector3(-Scene.displaySize, 0, -Scene.displaySize));
    days.vertices.push( new THREE.Vector3(-Scene.displaySize, 0, Scene.displaySize));

    for (var d = 0; d < 15; d++){
      days.vertices.push(new THREE.Vector3(-Scene.displaySize, 0, -800/15 * d));
      days.vertices.push(new THREE.Vector3(-765, 0, -800/15 * d));

      days.vertices.push(new THREE.Vector3(-Scene.displaySize, 0, 800/15 * d + 1));
      days.vertices.push(new THREE.Vector3(-765, 0, 800/15 * d + 1));
    }

    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: .4,
      visible : true
    });

    var dLine = new THREE.Line( days, material );
    dLine.type = THREE.LinePieces;
    Scene.scene.add(dLine);

    // for ( var e = 1; e < Scene.numNights; e++ ){
    //   var date = sleep.sleepData[e].startDate.month + '/' + sleep.sleepData[e].startDate.day + '/' + sleep.sleepData[e].startDate.year

    //   var text = new THREE.TextGeometry( String(date), { size: 15, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
    //   var meshMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa });
    //   var textMesh = new THREE.Mesh(text,meshMaterial);
    //   textMesh.position.x = -780
    //   textMesh.position.z = (810/15 * e) - 810
    //   textMesh.rotation.x = - Math.PI / 2;
    //   textMesh.rotation.z = - Math.PI ;

    //   Scene.scene.add(textMesh);
    // }

  },

  // WARNING: this is not connected to start time
  makeDatetimes : function(){
    var hrs = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1];
    Scene.fiveMinIncr = []
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
        Scene.fiveMinIncr.push(time)
      }
    }

  },

  makeBedtimes  : function() {
    Scene.bedtimes = [];

    for (var j = 0; j < Scene.numNights; j++) {
      // convert the bedtime to seconds
      var bt = sleep.sleepData[j].bedTime;
      var btHr = Number(bt.hour) * 60 * 60;
      var btMin = Number(bt.minute) * 60;

      // Offset the seconds so that 10pm is 0
      btInSeconds = btHr + btMin + Number(bt.second) - (Scene.startTime * 60 * 60);

      // if the bedtime is after midnight add two hours
      if (btHr < 75600) {
        btInSeconds = (btHr + btMin + Number(btInSeconds) + (Scene.startTime * 60 * 60) + 7200);
      }
      Scene.bedtimes.push(btInSeconds);
    }

  },

  animate : function() {
    requestAnimationFrame(Scene.animate);

    Scene.render();
    controls.update();

  },

  render : function() {
    if (Scene.isShiftDown) {
      Scene.theta -= Scene.mouse2D.x * 6;
    }

    // camera.position.x = 1000 * Math.sin( theta * Math.PI / 360 );
    // camera.position.y = 1400 * Math.cos( theta * Math.PI / 360 );
    // camera.position.z = 1400 * Math.cos( theta * Math.PI / 360 );

    Scene.camera.lookAt(Scene.scene.position);
    Scene.raycaster = Scene.projector.pickingRay(Scene.mouse2D.clone(), Scene.camera)
    Scene.renderer.render(Scene.scene, Scene.camera);

  }

}