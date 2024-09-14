var canvas;
var gl;

var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var birdSpeed = 0.004;

// Svæðið er frá -maxX til maxX 
var maxX = 1.2;

var gunPos;

var birdHeightTop = 0.9;
var birdHeightBottom = 0.8;
var birdStartLeft = -1.0;
var birdStartRight = -0.9;

var bulletSize = 0.05;
var bulletSpeed = 0.01;
var bullets = [];

var vertices;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //dX = Math.random()*0.1-0.05;
    //dY = Math.random()*0.1-0.05;
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

   vertices = [
        //Byssa
        vec2( -0.1, -0.86 ),
        vec2( -0.0, -0.75 ),
        vec2(  0.1, -0.86 ),
        //Fugl
        vec2(birdStartLeft, birdHeightBottom), 
        vec2(birdStartLeft, birdHeightTop), 
        vec2(birdStartRight, birdHeightTop), 
        vec2(birdStartRight, birdHeightBottom),
        //Byssukúla
        
       
    
   ];

   var bufferId = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
   gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices), gl.DYNAMIC_DRAW);

   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );

    

    //locBox = gl.getUniformLocation(program, "boxPos");
    
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
            var bulletVertices = [
                
            ];
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );

   

    render();
}


function render() {
    
    //Teiknar bakrunninn
    gl.clear( gl.COLOR_BUFFER_BIT);
   
    //Teikna byssu
  
    gl.drawArrays( gl.TRIANGLES, 0, 3 );


    //Teikna fugl
   
    
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
    

    //Búa til byssukúlur
    gl.drawArrays(gl.TRIANGLE_FAN,7,4)


    window.requestAnimFrame(render);
}
