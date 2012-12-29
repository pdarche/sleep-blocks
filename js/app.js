
	var container

	var camera, 
		scene, 
		renderer

	var projector, 
		plane

	var mouse2D, 
		mouse3D, 
		raycaster, 
		theta = 60,
		isShiftDown = false, 
		isCtrlDown = false,
		target = new THREE.Vector3( 200, 200, 0 );
	
	var ROLLOVERED

	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight

	var VIEW_ANGLE = 50,
		ASPECT     = WIDTH / HEIGHT,
		NEAR       = 0.1,
		FAR        = 100000

	var bedtimes = [],
		fiveMinIncrements = []

	var sleepStates = {
		"UNDEFINED" : { "height" : 0, "color" : 0xffffff },
		"LIGHT" 	: { "height" : 100, "color" : 0x32cd32 },
		"DEEP"		: { "height" : 40, "color" : 0x006400 },
		"REM"		: { "height" : 70, "color" : 0xd3d3d3 },
		"WAKE"		: { "height" : 120, "color" : 0xb22020 }
	}

	init();
	addControls()
	animate();
	makeBedtimes()


function init() {

	var size = 1800, 
		step = 6

	container = document.createElement( 'div' );
	$('#content').prepend( container );

	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	camera.position.set( -1400, 1000, -900 )

	scene = new THREE.Scene();

	/*********** Grid ***********/

	var geometry = new THREE.Geometry();

	for ( var i = - size/2 ; i <= size/2 ; i += step ) {
		geometry.vertices.push( new THREE.Vector3( - size/2, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(   size/2, 0, i ) );			
	}

		for ( var j = - (size/2) ; j <= size/2; j += step) {
		
		geometry.vertices.push( new THREE.Vector3( j, 0, - ( size/2) ) );
		geometry.vertices.push( new THREE.Vector3( j, 0, size/2 ) );	

	}

	var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, visible : true } );

	var line = new THREE.Line( geometry, material );
	line.type = THREE.LinePieces;
	scene.add( line );


	/*********** Mouse Geometry ***********/

	projector = new THREE.Projector();

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshBasicMaterial());
	plane.rotation.x = - Math.PI / 2;
	plane.visible = false;
	scene.add( plane );

	mouse2D = new THREE.Vector3( 0, 0, 0 );


	/*********** Lights ***********/

	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	var directionalLight = new THREE.DirectionalLight( 0x808080 );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild(renderer.domElement);

	
	/*********** Events ***********/

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	mouse3D = projector.unprojectVector( mouse2D.clone(), camera );

	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length > 0 ) {

		// if ( ROLLOVERED ) ROLLOVERED.color.setHex( 0xff0000 );

		ROLLOVERED = intersects[ 0 ].object ;
		ROLLOVERED.material.opacity = 0;

		console.log( "rollovered", ROLLOVERED )

	}
}

function onDocumentKeyDown( event ) {

	switch( event.keyCode ) {

		case 16: isShiftDown = true; break;
		case 17: isCtrlDown = true; break;

	}

}

function animate() {

	requestAnimationFrame( animate );

	render();
	controls.update()

}

function addControls(){

	window.controls = new THREE.TrackballControls( camera )

	controls.rotateSpeed = 1.0
	controls.zoomSpeed   = 1.2
	controls.panSpeed    = 0.8

	controls.noZoom = false
	controls.noPan  = false
	controls.staticMoving = true
	controls.dynamicDampingFactor = 0.3
	controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D

	controls.addEventListener( 'change', render )
}

function render() {

	if ( isShiftDown ) {

		theta -= mouse2D.x * 6;

	}

	// camera.position.x = 1000 * Math.sin( theta * Math.PI / 360 );
	// camera.position.y = 1400 * Math.cos( theta * Math.PI / 360 );
	// camera.position.z = 1400 * Math.cos( theta * Math.PI / 360 );

	camera.lookAt( scene.position )

	raycaster = projector.pickingRay( mouse2D.clone(), camera )

	renderer.render( scene, camera );

}

var nights = new THREE.Object3D(),
	nightAr = []


function createRects(){

		for ( var j = 0; j < 30; j ++ ){ 

			var bedt = scale(bedtimes[j])
				// console.log(bedt)

			var night = new THREE.Object3D()

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
				night.add( rect )
								
			}

			nights.add( night )
			nightAr.push( night )
		}

		scene.add( nights );
}


function makeBedtimes(){
	for ( var j = 0; j < 30; j++ ){

		var bt = sleep.sleepData[j].bedTime,
			btHr = Number(bt.hour) * 60 * 60,
			btMin = Number(bt.minute) * 60

			btInSeconds = btHr + btMin + Number(bt.second);

			if ( btHr < 75600 ) {
			
				btInSeconds = btHr + btMin + Number(btInSeconds) + 7200;

			}

			bedtimes.push(btInSeconds)
	}

}

function drawAxes(){
	
	//times	
	var time = new THREE.Geometry()

	time.vertices.push( new THREE.Vector3( 	750, 0, -800 ) );
	time.vertices.push( new THREE.Vector3(  -750 , 0, -800 ) );	

	for ( var t = 0; t < 100; t++ ){

		time.vertices.push( new THREE.Vector3( 	750/100 * t, 0, -800  ) );
		time.vertices.push( new THREE.Vector3(  750/100 * t, 0, -815 ) );		

		time.vertices.push( new THREE.Vector3( 	-750/100 * (t + 1), 0, -800  ) );
		time.vertices.push( new THREE.Vector3(  -750/100 * (t + 1), 0, -815 ) );

 		var currTime = fiveMinIncrements[t]

		var meshMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
		var text = new THREE.TextGeometry( currTime, { size: 6, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
		var textMesh = new THREE.Mesh(text,meshMaterial);
		textMesh.position.x = ( 750/50 * t ) - 750
		textMesh.position.z = -850
		textMesh.rotation.x = - Math.PI / 2;
		textMesh.rotation.z = - Math.PI / 2;

		scene.add(textMesh);

	}

	var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: .4, visible : true } );

	var tLine = new THREE.Line( time, material );
	tLine.type = THREE.LinePieces;
	scene.add( tLine );

	
	//dates
	days = new THREE.Geometry()

	days.vertices.push( new THREE.Vector3( -750, 0, -750) )
	days.vertices.push( new THREE.Vector3( -750, 0, 750) )

	for ( var d = 0; d < 15; d++ ){
		time.vertices.push( new THREE.Vector3( 	-750, 0, -800/15 * d ) );
		time.vertices.push( new THREE.Vector3(  -765, 0, -800/15 * d ) );		

		time.vertices.push( new THREE.Vector3( 	-750, 0, 800/15 * d + 1 ) );
		time.vertices.push( new THREE.Vector3(  -765, 0, 800/15 * d + 1) );

	}

	for ( var e = 1; e < 30; e++ ){

		var date = sleep.sleepData[e].startDate.month + '/' + sleep.sleepData[e].startDate.day + '/' + sleep.sleepData[e].startDate.year
		
		var meshMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
		var text = new THREE.TextGeometry( String(date), { size: 15, height: 0, curveSegments: 10, font: "helvetiker", weight: "normal", style: "normal" });
		var textMesh = new THREE.Mesh(text,meshMaterial);
		textMesh.position.x = -780
		textMesh.position.z = ( 810/15 * e ) - 810
		textMesh.rotation.x = - Math.PI / 2;
		textMesh.rotation.z = - Math.PI ;

		scene.add(textMesh);
		
	} 

	var dLine = new THREE.Line( days, material );
	dLine.type = THREE.LinePieces;
	scene.add( dLine );


}


/************** Helpers **************/

var scale = d3.scale.linear()
			.domain([0, d3.max(bedtimes)])
			.range([0, 900])

// !! this is the wrong way to do this !!
function makeDatetimes(){
	var hrs = [ 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1 ]
	
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
			fiveMinIncrements.push(time)
			
		}
	}

}


 for (var p = 0; p < bedtimes.length; p++){
 	// console.log(sleep.sleepData[p].bedTime)
 }

 	makeDatetimes()
	drawAxes()
	createRects()

	console.log( "scene", scene )

