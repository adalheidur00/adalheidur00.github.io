var canvas;
var gl;

var NumVertices  = 24;

var points = [];
var lines = [];

var vBuffer;
var vPosition;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -3.0;
var eyesep = 0.2;

var proLoc;
var mvLoc;


var gridSize = 10;
var stepSize = 1.0 / gridSize;

var currentState = [];
var nextState = [];

var cellSize = 0.08;



// Upphafstilla grindina 
for (let x = 0; x < gridSize; x++) {
    currentState[x] = [];
    nextState[x] = [];
    for (let y = 0; y < gridSize; y++) {
        currentState[x][y] = [];
        nextState[x][y] = [];
        for (let z = 0; z < gridSize; z++) {
            currentState[x][y][z] = Math.random() > 0.6 ? 1 : 0;  // 60% líkur á lifandi hólfi
            nextState[x][y][z] = 0;
        }
    }
}



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "wireColor" );
    
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 35.0, 1.0, 0.5, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

   
    
    

    // Event listener for mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 0.1;
         } else {
             zDist -= 0.1;
         }
     }  );  

    render();
}
// Telja lifandi nágrannahólf
function countNeighbors(x, y, z) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue;  
                let nx = x + i, ny = y + j, nz = z + k;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && nz >= 0 && nz < gridSize) {
                    count += currentState[nx][ny][nz];
                }
            }
        }
    }
    return count;
}

// Uppfæra grindina 
function updateGrid() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                let aliveNeighbors = countNeighbors(x, y, z);
                if (currentState[x][y][z] === 1) {
                    nextState[x][y][z] = (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
                } else {
                    nextState[x][y][z] = (aliveNeighbors === 3) ? 1 : 0;
                }
            }
        }
    }
    
    var temp = currentState;
    currentState = nextState;
    nextState = temp;
}
// Fall til að búa til tening
function createCubeVertices(center) {
    var halfSize = cellSize / 2.0;

    var vertices = [
        vec3(center[0] - halfSize, center[1] - halfSize, center[2] + halfSize), 
        vec3(center[0] + halfSize, center[1] - halfSize, center[2] + halfSize), 
        vec3(center[0] + halfSize, center[1] + halfSize, center[2] + halfSize), 
        vec3(center[0] - halfSize, center[1] + halfSize, center[2] + halfSize), 
        vec3(center[0] - halfSize, center[1] - halfSize, center[2] - halfSize),
        vec3(center[0] + halfSize, center[1] - halfSize, center[2] - halfSize), 
        vec3(center[0] + halfSize, center[1] + halfSize, center[2] - halfSize), 
        vec3(center[0] - halfSize, center[1] + halfSize, center[2] - halfSize), 
    ];

    var indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        3, 2, 6, 3, 6, 7,
        0, 1, 5, 0, 5, 4,
        1, 2, 6, 1, 6, 5,
        0, 3, 7, 0, 7, 4
    ];


    points = [];
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
    }

    return points;
}

// Hjálpar fall fyrir render fallið
function renderAliveCells() {
    var aliveVertices = [];

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                if (currentState[x][y][z] === 1) {
                    let wx = (x / gridSize) - 0.5;
                    let wy = (y / gridSize) - 0.5;
                    let wz = (z / gridSize) - 0.5;
                    
                    aliveVertices.push(...createCubeVertices([wx, wy, wz]));
                }
            }
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(aliveVertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, aliveVertices.length);  


}


function render() {

    setTimeout(() => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt(vec3(0.0 - eyesep / 2.0, 0.0, zDist), vec3(0.0, 0.0, zDist + 5.0), vec3(0.0, 1.0, 0.0));
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );

    modelViewMatrix = mv;

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.uniform4fv(colorLoc, vec4(1.0, 0.0, 0.0, 1.0)); 
    gl.drawArrays(gl.LINES, 0, lines.length); 

    
    renderAliveCells();
    updateGrid(); 

    requestAnimFrame(render);
    },250);
}
