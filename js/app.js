var width  = window.innerWidth,
    height = window.innerHeight;

var scene = new THREE.Scene();

var axes = new THREE.AxisHelper(200);
scene.add(axes);

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.y = -200;
camera.position.z = 100;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function loadTerrain(file, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.open('GET', file, true);
  xhr.onload = function(evt) {
    if (xhr.response) {
      callback(new Uint16Array(xhr.response));
    }
  };  
  xhr.send(null);
}

loadTerrain('allegany.bin', function(data){

  var geometry = new THREE.PlaneGeometry(400, 200, 399, 199);

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  for (var i = 0, l = geometry.vertices.length; i < l; i++) {
    if(data[i] === 0) console.log(data[i]);
    geometry.vertices[i].z = data[i] / 65535 * 20;
  }
  var t = new THREE.Vector3( -101, 100, 500 );
  //geometry.vertices.push(t);

  var material = new THREE.MeshPhongMaterial({
    color: 0xdddddd, 
    wireframe: true
  });

  var terrain_material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('alleganytexture.png')
  });

  var plane = new THREE.Mesh(geometry, terrain_material);
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);

  var controls = new THREE.TrackballControls(camera);

  document.getElementById('viewer').appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x111111));

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.shadowCameraVisible = true;
  light.position.set(0,300,400);
  scene.add(light);

  render();

  function render() {
      controls.update();
      requestAnimationFrame(render);
      renderer.render(scene, camera);
  }
});

var controls = new THREE.TrackballControls(camera); 

document.getElementById('viewer').appendChild(renderer.domElement);

render();

function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

