GUI = {
  states: ["light", "deep", "rem", "wake"],

  buildGUI : function(){
    var state = ["light", "deep", "rem", "wake"];

    for (var h = 0; h < state.length; h++){
      $('#days').append('<div class="state" id="' + state[h] + '"><p>' + state[h] + '</p></div>')
    }

    for (var i = 0; i < 30; i++){
      var startDate = sleep.sleepData[i].startDate
      var date = startDate.month + '/' + startDate.day + '/' + startDate.year
      $('#days').append('<div class="day"><p>' + date + '</p></div>');
    }

    $('.day').css('height', (window.innerHeight/34) - 1);

  },

  bindEvents  : function() {
    controls.addEventListener('change', Scene.render);
    // document.addEventListener('mousemove', GUI.onDocumentMouseMove, false);
    window.addEventListener('resize', GUI.onWindowResize, false);

    $('.day').hover(function(ev){
      var index = $(this).index();

      Scene.nightAr.forEach(function(night, ix){
        night.children.forEach(function(block){
          block.material.opacity = 1;
        });
      });

      Scene.nightAr.forEach(function(night, ix){
        if (index !== ix + 6){
          night.children.forEach(function(block){
            block.material.opacity = .02;
          });
        }
      });
    });

    $('.state').click(function(ev){
      var state = $(this).attr('id');
      GUI.states.forEach(function(taretState){
        Scene[taretState].forEach(function(block){
          block.material.opacity = 1
        });
      });

      GUI.states.forEach(function(taretState){
        if (state !== taretState){
          Scene[taretState].forEach(function(block){
            block.material.opacity = .02
          });
        }
      });
    });

    $('#bedtime').click(function(ev){
      Scene.nightAr.forEach(function(night, ix){
        night.children.forEach(function(block){
          block.material.opacity = 1;
        });
      });

      Scene.nightAr.forEach(function(night){
        night.children.forEach(function(block, ix){
          if (ix !== 0) {
            block.material.opacity = .01;
          }
        });
      });
    });

    $('#risetime').click(function(ev){
      Scene.nightAr.forEach(function(night, ix){
        night.children.forEach(function(block){
          block.material.opacity = 1;
        });
      });

      Scene.nightAr.forEach(function(night){
        night.children.forEach(function(block, ix){
          if (ix !== night.children.length - 1) {
            block.material.opacity = .01;
          }
        });
      });
    });

  },

  onDocumentMouseMove : function(event) {
    event.preventDefault();

    Scene.mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    Scene.mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    Scene.mouse3D = Scene.projector.unprojectVector(Scene.mouse2D.clone(), Scene.camera);

    var intersects = Scene.raycaster.intersectObjects(Scene.scene.children, true);
    if (intersects.length > 0) {

      ROLLOVERED = intersects[0].object;
      // ROLLOVERED.material.opacity = .1;
      // if (ROLLOVERED) ROLLOVERED.color.setHex(0xff0000);
      // console.log("rollovered", ROLLOVERED);
    }
  },

  onWindowResize  : function() {
    Scene.camera.aspect = window.innerWidth / window.innerHeight;
    Scene.camera.updateProjectionMatrix();

    $('.day').css('height', (window.innerHeight/34) - 1 )

    Scene.renderer.setSize( window.innerWidth, window.innerHeight );

  }

}
