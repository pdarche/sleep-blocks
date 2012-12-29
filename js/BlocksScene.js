Scene = {

	numNights 	: 30,

	buildScene	: function() {

		Scene.init()
		Scene.addGrid()
		Scene.addProjector()
		Scene.addControls()
		Scene.makeDatetimes()
		Scene.addAxes()
		Scene.makeBedtimes()
		Scene.addSleepObjs()

	},

	init 	: function() {

		//scene
		Scene.WIDTH = window.innerWidth,
		Scene.HEIGHT = window.innerHeight,
		Scene.container = document.createElement( 'div' )

		$('#content').prepend( Scene.container );

		Scene.scene = new THREE.Scene();


		//camera
		Scene.VIEW_ANGLE = 50,
		Scene.ASPECT = Scene.WIDTH / Scene.HEIGHT,
		Scene.NEAR = 0.1,
		Scene.FAR = 100000

		Scene.camera = new THREE.PerspectiveCamera( Scene.VIEW_ANGLE, Scene.ASPECT, Scene.NEAR, Scene.FAR );
		Scene.camera.position.set( -1400, 1000, -900 );


		//lights
		var ambientLight = new THREE.AmbientLight( 0x606060 );
		Scene.scene.add( ambientLight );

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

		Scene.renderer = new THREE.CanvasRenderer();
		Scene.renderer.setSize( window.innerWidth, window.innerHeight );

		Scene.container.appendChild( Scene.renderer.domElement );

		//state objects
		Scene.light = [], Scene.deep = [], Scene.rem = [], Scene.wake = [], Scene.und = []; 

	},

	addGrid		: function (){

		var gridGeom = new THREE.Geometry(),
			size = 1800, 
			step = 6

		for ( var i = - size/2 ; i <= size/2 ; i += step ) {
			gridGeom.vertices.push( new THREE.Vector3( - size/2, 0, i ) );
			gridGeom.vertices.push( new THREE.Vector3(   size/2, 0, i ) );			
		}

		for ( var j = - (size/2) ; j <= size/2; j += step) {
			
			gridGeom.vertices.push( new THREE.Vector3( j, 0, - ( size/2) ) );
			gridGeom.vertices.push( new THREE.Vector3( j, 0, size/2 ) );	

		}

		var gridMat = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, visible : true } );
		var gridLines = new THREE.Line( gridGeom, gridMat );
		gridLines.type = THREE.LinePieces;
		
		Scene.scene.add( gridLines );

	},

	addProjector	: function(){

		Scene.projector = new THREE.Projector();

		Scene.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshBasicMaterial());
		Scene.plane.rotation.x = - Math.PI / 2;
		Scene.plane.visible = false;
		Scene.scene.add( Scene.plane );

		Scene.mouse2D = new THREE.Vector3( 0, 0, 0 );

	},

	addControls	: function(){

		window.controls = new THREE.TrackballControls( Scene.camera )

		controls.rotateSpeed = 1.0
		controls.zoomSpeed   = 1.2
		controls.panSpeed    = 0.8

		controls.noZoom = false
		controls.noPan  = false
		controls.staticMoving = true
		controls.dynamicDampingFactor = 0.3
		controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D

	},

	addAxes		: function() {

		Scene.addRefTimes()
		Scene.addRefDates()

	},

	addSleepObjs: function(){

		var sleepStates = {

			"UNDEFINED" : { "height" : 0, "color" : 0xffffff, arr : Scene.und },
			"LIGHT" 	: { "height" : 100, "color" : 0x32cd32, arr : Scene.light },
			"DEEP"		: { "height" : 40, "color" : 0x006400, arr : Scene.deep },
			"REM"		: { "height" : 70, "color" : 0xd3d3d3, arr : Scene.rem },
			"WAKE"		: { "height" : 120, "color" : 0xb22020, arr : Scene.wake }

		}

		var nights = new THREE.Object3D()
		
		Scene.nightAr = []

		var scale = d3.scale.linear()
			.domain( [0, d3.max( Scene.bedtimes )] )
			.range( [0, 900] )

		for ( var j = 0; j < Scene.numNights; j ++ ){ // upper bound should be variable tied to bedtimes / number of night objects being created

			var bedt = scale( Scene.bedtimes[j] ),
				night = new THREE.Object3D()

			for ( var i = 0; i < sleep.sleepData[j].sleepGraph.length; i++ ){

				var datum = sleep.sleepData[j].sleepGraph[i],
					geometry = new THREE.CubeGeometry( 6, sleepStates[datum].height, 14 );
				
				var color = sleepStates[datum].color

				var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );

				var rect = new THREE.Mesh( geometry, material );
				rect.position.x = ((i * 7) + bedt ) - 750
				rect.position.y = 0 
				rect.position.z = ( j * 50 ) - 750
				rect.matrixAutoUpdate = false;
				rect.translateY( sleepStates[datum].height/2 )
				rect.updateMatrix();
				//add to night object
				night.add( rect )
				//push to appropriate state array
				sleepStates[datum].arr.push( rect )
								
			}

			nights.add( night )
			Scene.nightAr.push( night )
		}

		Scene.scene.add( nights );

	},

	addRefTimes : function() { 

		var time = new THREE.Geometry()

		time.vertices.push( new THREE.Vector3( 	750, 0, -800 ) );
		time.vertices.push( new THREE.Vector3(  -750 , 0, -800 ) );	

		for ( var t = 0; t < 100; t++ ){

			time.vertices.push( new THREE.Vector3( 	750/100 * t, 0, -800  ) );
			time.vertices.push( new THREE.Vector3(  750/100 * t, 0, -815 ) );		

			time.vertices.push( new THREE.Vector3( 	-750/100 * (t + 1), 0, -800  ) );
			time.vertices.push( new THREE.Vector3(  -750/100 * (t + 1), 0, -815 ) );

	 		var currTime = Scene.fiveMinIncr[t]

			var meshMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
			var text = new THREE.TextGeometry( currTime, { size: 6, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
			var textMesh = new THREE.Mesh(text,meshMaterial);
			textMesh.position.x = ( 750/50 * t ) - 750
			textMesh.position.z = -850
			textMesh.rotation.x = - Math.PI / 2;
			textMesh.rotation.z = - Math.PI / 2;

			Scene.scene.add(textMesh);

		}

		var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: .4, visible : true } );

		var tLine = new THREE.Line( time, material );
		tLine.type = THREE.LinePieces;
		Scene.scene.add( tLine );

	},
	
	addRefDates	: function() {

		days = new THREE.Geometry()

		days.vertices.push( new THREE.Vector3( -750, 0, -750) )
		days.vertices.push( new THREE.Vector3( -750, 0, 750) )

		for ( var d = 0; d < 15; d++ ){
			days.vertices.push( new THREE.Vector3( 	-750, 0, -800/15 * d ) );
			days.vertices.push( new THREE.Vector3(  -765, 0, -800/15 * d ) );		

			days.vertices.push( new THREE.Vector3( 	-750, 0, 800/15 * d + 1 ) );
			days.vertices.push( new THREE.Vector3(  -765, 0, 800/15 * d + 1) );

		} 

		var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: .4, visible : true } );

		var dLine = new THREE.Line( days, material );
		dLine.type = THREE.LinePieces;
		Scene.scene.add( dLine );

		for ( var e = 1; e < Scene.numNights; e++ ){

			var date = sleep.sleepData[e].startDate.month + '/' + sleep.sleepData[e].startDate.day + '/' + sleep.sleepData[e].startDate.year
			
			var meshMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
			var text = new THREE.TextGeometry( String(date), { size: 15, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
			var textMesh = new THREE.Mesh(text,meshMaterial);
			textMesh.position.x = -780
			textMesh.position.z = ( 810/15 * e ) - 810
			textMesh.rotation.x = - Math.PI / 2;
			textMesh.rotation.z = - Math.PI ;

			Scene.scene.add(textMesh);
			
		}
	},

	makeDatetimes	: function(){
		
		var hrs = [ 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1 ]
		
		Scene.fiveMinIncr = []
		
		for ( var i = 0; i < hrs.length; i++ ) {
			for ( var j = 0; j < 12; j++ ) {

				var mins 
				if  ( j == 0 ) {
					mins = "00"
				} 
				else if ( j == 1 ) {
					mins = "05"
				} 
				else {
					mins = 5 * j
				}

				var time = String( hrs[i] + ':' + mins )
				Scene.fiveMinIncr.push(time)
				
			}
		}
	
	},

	makeBedtimes	: function() {

		Scene.bedtimes = []

		for ( var j = 0; j < Scene.numNights; j++ ){  //Scene upper bound should be made into a variable 

			var bt = sleep.sleepData[j].bedTime,
				btHr = Number(bt.hour) * 60 * 60,
				btMin = Number(bt.minute) * 60

				btInSeconds = btHr + btMin + Number(bt.second);

				if ( btHr < 75600 ) {
				
					btInSeconds = btHr + btMin + Number(btInSeconds) + 7200;

				}

				Scene.bedtimes.push(btInSeconds)
		}

	},

	animate 		: function() {

		requestAnimationFrame( Scene.animate );

		Scene.render();
		controls.update()

	},

	render 			: function() {

		if ( Scene.isShiftDown ) {

			Scene.theta -= Scene.mouse2D.x * 6;

		}

		// camera.position.x = 1000 * Math.sin( theta * Math.PI / 360 );
		// camera.position.y = 1400 * Math.cos( theta * Math.PI / 360 );
		// camera.position.z = 1400 * Math.cos( theta * Math.PI / 360 );

		Scene.camera.lookAt( Scene.scene.position )

		Scene.raycaster = Scene.projector.pickingRay( Scene.mouse2D.clone(), Scene.camera )

		Scene.renderer.render( Scene.scene, Scene.camera );

	}

}