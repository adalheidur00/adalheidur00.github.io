

var gl;
var points;

var mouseX;           // Old value of x-coordinate 
var mouseY; 
var movement = false;

var color = vec4( 1.0, 0.0, 0.0, 1.0 );
var locColor;




var NumPoints = 5000;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation( program, "rcolor" );
    gl.uniform4fv( locColor, flatten(color) );

    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            for(i=0; i<points.length; i++) {
                points[i][0] += xmove;
            }

            var ymove = 2*(e.offsetY - mouseY)/canvas.height;
            for(j=0; j<points.length; j++){
                points[j][1] -= ymove;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

            render();
        }
    });

    window.addEventListener("keydown", function(e){
        if(e.keyCode == 32){
            var col = vec4(Math.random(), Math.random(), Math.random(), 1.0);
            gl.uniform4fv(locColor, flatten(col));

            render();
        }
    } );


    canvas.addEventListener("wheel", function(e){
        e.preventDefault();
        
        var scale = (e.deltaY > 0) ? 0.9 : 1.1;

        for(var i = 0; i < points.length; i++){
            points[i][0] *= scale;
            points[i][1] *= scale;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        render();
    })


    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    gl.drawArrays( gl.POINTS, 0, points.length );
}
