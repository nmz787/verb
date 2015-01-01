var angleX = 20;
var angleY = 20;
var x = 0;
var y = 0;
var viewers = [];

// Set to true so lines don't use the depth buffer
Viewer.lineOverlay = false;

// A viewer is a WebGL canvas that lets the user view a mesh. The user can
// tumble it around by dragging the mouse.
function Viewer(ele, width, height, depth, async) {

  viewers.push(this);

  // Get a new WebGL canvas
  var gl = GL.create();
  this.gl = gl;

  // make the mesh
  this.mesh = ele.toGlType(this.gl);

  // Set up the viewport
  gl.canvas.width = width;
  gl.canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.matrixMode( gl.PROJECTION );
  gl.loadIdentity();
  gl.perspective(45, width / height, 0.1, 100);
  gl.matrixMode( gl.MODELVIEW );

  // Set up WebGL state
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.93, 0.93, 0.93, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.polygonOffset(1, 1);

  // Black shader for wireframe
  this.blackShader = new GL.Shader('\
    void main() {\
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
      gl_PointSize = 5.0;\
    }\
  ', '\
    void main() {\
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);\
    }\
  ');

  // Shader with diffuse and specular lighting
  this.lightingShader = new GL.Shader('\
    varying vec3 color;\
    varying vec3 normal;\
    varying vec3 light;\
    void main() {\
      const vec3 lightDir = vec3(-0.56, -0.56, -0.56);\
      light = (gl_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;\
      color = gl_Color.rgb;\
      normal = gl_NormalMatrix * gl_Normal;\
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
      gl_PointSize = 5.0;\
    }\
  ', '\
    varying vec3 color;\
    varying vec3 normal;\
    varying vec3 light;\
    void main() {\
      vec3 n = normalize(normal);\
      float diffuse = max(0.0, dot(light, n));\
      float specular = pow(max(0.0, -reflect(light, n).z), 32.0) * sqrt(diffuse);\
      gl_FragColor = vec4(mix(color * (0.6 + 0.4 * diffuse), vec3(1.0), specular), 1.0);\
    }\
  ');

  var that = this;

  gl.onmousemove = function(e) {
    
    if (e.dragging) {
      if (e.ctrlKey) {
        x+=e.deltaX/100;
        y+=e.deltaY/100;
        //x=e.layerX;
        //y=e.layerY;
      } else{
          console.log(angleY);
        if (angleY>2*Math.pi){

          console.log('maxed Y');
          angleY=0;
        }
        if (angleX>2*Math.pi) {
          console.log('maxed X');
          angleX=0;
        }
        angleY += e.deltaX * 2;
        angleX += e.deltaY * 2;
        angleX = Math.max(-90, Math.min(90, angleX));
      }
      viewers.map(function(viewer) {
        viewer.gl.ondraw();
      });
    }
  };


  gl.onmousewheel = function(e) {
    //console.log(e.CLICK);
    //console.log(e);

      
      depth += e.wheelDeltaY/120;

      viewers.map(function(viewer) {
        viewer.gl.ondraw();
      });

  };
  
  gl.ondraw = function() {

    gl.makeCurrent();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.rotate(0, 1, 0, 0);
    gl.rotate(0, 0, 1, 0);
    gl.translate(x, y, depth);
    gl.rotate(angleX, 1, 0, 0);
    gl.rotate(angleY, 0, 1, 0);

    if (that.mesh instanceof GL.Mesh){

      if (!Viewer.lineOverlay) gl.enable(gl.POLYGON_OFFSET_FILL);

      that.lightingShader.draw( that.mesh, gl.TRIANGLES );

      if (!Viewer.lineOverlay) gl.disable(gl.POLYGON_OFFSET_FILL);

      if (Viewer.lineOverlay) gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      that.blackShader.draw( that.mesh, gl.LINES);
      gl.disable(gl.BLEND);
      if (Viewer.lineOverlay) gl.enable(gl.DEPTH_TEST);

    } else {

      that.blackShader.draw(that.mesh, gl.LINE_STRIP);

    }

  };

  gl.ondraw();

}

var nextID = 0;

function addViewer(viewer) {
  var ele = document.getElementById(nextID++);
  ele.insertBefore(viewer.gl.canvas, ele.firstChild);
}