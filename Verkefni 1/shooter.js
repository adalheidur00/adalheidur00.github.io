var canvas;
var gl;
var vPosition;


var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?



window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

   var gunVertices = [
        vec2( -0.1, -0.86 ),
        vec2( -0.0, -0.75 ),
        vec2(  0.1, -0.86 )
   ];

   var gunBufferId = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, gunBufferId );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(gunVertices), gl.DYNAMIC_DRAW );

   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );
   

    
    var birdVertices = [
        vec2(-0.1, -0.1),
        vec2(-0.1,  0.1),
        vec2( 0.1,  0.1),
        vec2( 0.1, -0.1)
    ];

    var birdBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, birdBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(birdVertices), gl.DYNAMIC_DRAW );

    
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
                gunVertices[i][0] += xmove;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, gunBufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(gunVertices));
        }
    } );

    render();
}


function render() {
    
    //Teiknar bakrunninn
    gl.clear( gl.COLOR_BUFFER_BIT);
   
    //Teikna byssu
    
    gl.drawArrays( gl.TRIANGLES, 0, 3 );


    //Teikna fugl
    
    gl.drawArrays(gl. TRIANGLE_FAN, 0, 4);
    

    window.requestAnimFrame(render);
}
