Events = {
  updateControls  : function(){
    controls.addEventListener('change', render);
  },

  updateSceneSize : function(){
    window.addEventListener('resize', onWindowResize, false);
  },

  highlightObject : function(){
    document.addEventListener('mousemove', onDocumentMouseMove, false);
  }

  showSleepTimes  : function(){
    // !!!!!!!!!!! this should show sleeptime objects and hide night objects

    $('.time').mouseover(function(){
      var domElement = $(this)
      $.each(scene.children[8].children, function(x){
        var timeGeom = new THREE.Geometry();
        if( domElement.attr('id') === 'bedtime' ){
          var bt = scale(bedtime[x])
          // timeGeom.vertices.push( new THREE.Vector3( bt - 750, 0, ( 15 * x ) -750 ) );
          // timeGeom.vertices.push( new THREE.Vector3( bt - 750, 0, ( 0 * x ) -750 ) );
        } else {
          // timeGeom.vertices.push( new THREE.Vector3( - size/2, 0, -15 * x ) );
          // timeGeom.vertices.push( new THREE.Vector3(   size/2, 0, 0 * x ) );
        }

        var timeMat = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.6, visible : true } );

        var timeLine = new THREE.Line( timeGeom, timeMat );
        timeLine.type = THREE.LinePieces;
        scene.add( timeLine );


        $.each(scene.children[8].children[x].children, function(y){
          scene.children[8].children[x].children[y].material.opacity = .05
        })
      })
    }).mouseout(function(){
      $.each(scene.children[8].children, function(x){
        $.each(scene.children[8].children[x].children, function(y){
          scene.children[8].children[x].children[y].material.opacity = 1
        })
      })
    })

  },

  showRiseTimes : function() {

  },

  showSleepState  : function() {
    // !!!!!!!!!!! this should show target state object and hid non-target-state objects
    $('.state').mouseover(function(){
      var currState = $(this).attr('id').toUpperCase(),
        targetHeight = sleepStates[currState].height

      $.each(scene.children[8].children, function(a){
        $.each(scene.children[8].children[a].children, function(b){
          if ( scene.children[8].children[a].children[b].geometry.height !== targetHeight ){
            scene.children[8].children[a].children[b].material.opacity = .1
          }
        })
      })
      // console.log(targetHeight)
    }).mouseout(function(){
      $.each(scene.children[8].children, function(a){
        $.each(scene.children[8].children[a].children, function(b){
          scene.children[8].children[a].children[b].material.opacity = 1
        })
      })
    })

  },

  highlightNight  : function() {
    // !!!!!!!!!!! this should reference a night object
    $('.day').mouseover(function(){
      var index = $(this).index() - 4

      $.each(scene.children[8].children, function(j){
        if ( j !== index ){
            $.each(scene.children[8].children[j].children, function(i){
            scene.children[8].children[j].children[i].material.opacity = .1
            // console.log("opacifying")
          })
        }
      })
    }).mouseout(function(){
      $.each(scene.children[8].children, function(k){
        $.each(scene.children[8].children[k].children, function(l){
          scene.children[8].children[k].children[l].material.opacity = 1
          // console.log("unopacifying")
        })
      })
    })

  }

}