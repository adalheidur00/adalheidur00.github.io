var canvas;
var gl;

var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?


var birdSpeed = 0.004; // Hraði fugls

/* Svæðið er frá -maxX til maxX og -maxY til maxY */
var maxX = 1.2;
var maxY = 1.0;

/* Breytur fyrir fyrir fugl */
var birdHeightTop = 0.9;
var birdHeightBottom = 0.8;
var birdStartLeft = -1.0;
var birdStartRight = -0.9;


var bullets = []; // fylki sem heldur utan um skot
var maxBullets = 3; // hámarksfjöldiskota
var bulletSpeed = 0.02; // hraði byssukúlunar


var vertices;


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

   vertices = [

        // Byssa
        vec2( -0.1, -0.86 ),
        vec2( -0.0, -0.75 ),
        vec2(  0.1, -0.86 ),

        // Fugl
        vec2(birdStartLeft, birdHeightBottom), 
        vec2(birdStartLeft, birdHeightTop), 
        vec2(birdStartRight, birdHeightTop), 
        vec2(birdStartRight, birdHeightBottom),
   ];

   var bufferId = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
   gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices), gl.DYNAMIC_DRAW);

   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );
    
    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            for(i=0; i<3; i++) {
                vertices[i][0] += xmove;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
        }
    } );

    
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 32:	// bil
            shoot();
            break;
        }
    } );

    render();
}

/* fall til að skjóta byssuskotum */

function shoot(){

    // staðsetning byssunar
    var gunX = (vertices[0][0] + vertices[2][0]) / 2; // miðjan á byssuni
    var gunY = vertices[1][1]; // hæð byssunar á y-ásnum
    
    if(bullets.length < maxBullets){
        bullets.push([
            vec2(gunX - 0.01, gunY), 
            vec2(gunX - 0.01, gunY + 0.05),
            vec2(gunX + 0.01, gunY + 0.05),
            vec2(gunX + 0.01, gunY)
    ]);
    }
}


function render() {
    
    // Teiknar bakrunninn
    gl.clear( gl.COLOR_BUFFER_BIT);
   
    // Teikna byssu
    gl.drawArrays( gl.TRIANGLES, 0, 3 );


    // Teikna fugla
    for (var i=3; i<7; i++) {
       vertices[i][0] += birdSpeed;
    }

    if (vertices[3][0] > maxX) {  
        vertices[3] = vec2(birdStartLeft, birdHeightBottom);
        vertices[4] = vec2(birdStartLeft, birdHeightTop);
        vertices[5] = vec2(birdStartRight, birdHeightTop);
        vertices[6] = vec2(birdStartRight, birdHeightBottom);
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.drawArrays(gl. TRIANGLE_FAN, 3, 4);
    

    // Búa til byssukúlur
    for(var i = 0; i < bullets.length; i++) {
        for(var j = 0; j < 4;j++){
            bullets[i][j][1] += bulletSpeed;
        }
        
        if(bullets[i][1][1] > maxY){
            bullets.splice(i,1);
            i--;
        } else {
            
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bullets[i]));
            gl.drawArrays(gl.TRIANGLE_FAN,0,4)
        }

    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    
    console.log(bullets); 

    window.requestAnimFrame(render);
}
