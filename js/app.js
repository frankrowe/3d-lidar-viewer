var width  = window.innerWidth
  , height = window.innerHeight

var BOTTOM_PADDING = 0

var scene = new THREE.Scene()

var axis = new THREE.AxisHelper(100)
//scene.add(axis)

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000)
camera.up = new THREE.Vector3(0,0,1);
camera.position.x = 0
camera.position.y = -300
camera.position.z = 300

var renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)

function loadTerrain(file, callback) {
  var xhr = new XMLHttpRequest()
  xhr.responseType = 'arraybuffer'
  xhr.open('GET', file, true)
  xhr.onload = function(evt) {
    if (xhr.response) {
      callback(new Uint16Array(xhr.response))
    }
  }
  xhr.send(null)
}

loadTerrain('wicomico.bin', function(data){

  var geometryPlane = new THREE.PlaneGeometry(200, 200, 200, 200)
  geometryPlane.computeFaceNormals()
  geometryPlane.computeVertexNormals()
  var basemapGeometry = new THREE.PlaneGeometry(200, 200, 199, 199)
  basemapGeometry.computeFaceNormals()
  basemapGeometry.computeVertexNormals()
  var geometry = new THREE.Geometry()
  var f = 0
    , normal = new THREE.Vector3( 0, 1, 0 )
    , color = new THREE.Color( 0xffaa00 )
  for (var i = 0, l = geometryPlane.vertices.length; i < l; i++) {
    geometryPlane.vertices[i].z = data[i] / 65535 * 20 + BOTTOM_PADDING
    //geometry.vertices.push(geometryPlane.vertices[i]);
    if (geometryPlane.vertices[i].z > 0) {
      geometry.vertices.push(
        new THREE.Vector3(geometryPlane.vertices[i].x, geometryPlane.vertices[i].y, 0)
        , new THREE.Vector3(geometryPlane.vertices[i].x, geometryPlane.vertices[i].y+1, 0)
        , new THREE.Vector3(geometryPlane.vertices[i].x+1, geometryPlane.vertices[i].y+1, 0)
        , new THREE.Vector3(geometryPlane.vertices[i].x+1, geometryPlane.vertices[i].y, 0)
      )
      geometry.vertices.push(
        new THREE.Vector3(geometryPlane.vertices[i].x, geometryPlane.vertices[i].y, geometryPlane.vertices[i].z)
        , new THREE.Vector3(geometryPlane.vertices[i].x, geometryPlane.vertices[i].y+1, geometryPlane.vertices[i].z)
        , new THREE.Vector3(geometryPlane.vertices[i].x+1, geometryPlane.vertices[i].y+1, geometryPlane.vertices[i].z)
        , new THREE.Vector3(geometryPlane.vertices[i].x+1, geometryPlane.vertices[i].y, geometryPlane.vertices[i].z)
      )
      //cube faces
      geometry.faces.push(new THREE.Face4(f+0, f+1, f+2, f+3, normal, color, 0)) //bottom
      geometry.faces.push(new THREE.Face4(f+4, f+5, f+6, f+7, normal, color, 0)) //top
      geometry.faces.push(new THREE.Face4(f+1, f+5, f+4, f+0, normal, color, 0)) //left
      geometry.faces.push(new THREE.Face4(f+2, f+6, f+5, f+1, normal, color, 0)) //back
      geometry.faces.push(new THREE.Face4(f+3, f+7, f+6, f+2, normal, color, 0)) //right
      geometry.faces.push(new THREE.Face4(f+0, f+4, f+7, f+3, normal, color, 0)) //front
      f += 8
    }
  }
/*

   5.+------+6
  .' |    .'|
4+---+--+'7 |
 |   |  |   |
 | 1,+--+---+2
 |.'    | .'
0+------+'3

*/

  var materialRed = new THREE.MeshPhongMaterial({
    color: 0xff0000
    , wireframe: true
  })

  var materialBlue = new THREE.MeshPhongMaterial({
    color: 0x0000ff
    , wireframe: true
  })

  var materialBlack = new THREE.MeshPhongMaterial({
    color: 0x000000
    , wireframe: true
  })

  var materialGray = new THREE.MeshPhongMaterial({
    color: 0xcccccc
    , wireframe: true
  })

  var terrain_material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('wicomicorainbow.png')
  })

  var basemap_material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('basemap.png')
  })

  var terrain = new THREE.Mesh(geometryPlane, materialRed)
  terrain.castShadow = true
  terrain.receiveShadow = true
  //scene.add(terrain)

  var linemap = new THREE.Mesh(geometry, materialBlue)
  linemap.castShadow = false
  linemap.receiveShadow = false
  scene.add(linemap)

  var basemap = new THREE.Mesh(basemapGeometry, basemap_material)
  basemap.castShadow = true
  basemap.receiveShadow = true
  //scene.add(basemap)

  var cubeGeom = new THREE.CubeGeometry(200, 200, 100, 1, 1, 1)
  cubeGeom.computeFaceNormals()
  cubeGeom.computeVertexNormals()
  for (var i = 0, l = cubeGeom.vertices.length; i < l; i++) {
    cubeGeom.vertices[i].z += 50
  }
  var cube = new THREE.Mesh(cubeGeom, materialBlack)
  cube.castShadow = false
  cube.receiveShadow = false
  scene.add(cube)

  var tickSize = 5
    , tickNumber = 2
    , tickX = -100
    , tickY = -100
    , tickHeight = 100
  var yAxisGeom = new THREE.Geometry()
  yAxisGeom.vertices.push(new THREE.Vector3(tickX, tickY, 0))
  yAxisGeom.vertices.push(new THREE.Vector3(tickX, tickY, 100))
  for (var i = 0; i < tickHeight/tickNumber; i++) {
    yAxisGeom.vertices.push(new THREE.Vector3(tickX, tickY, tickNumber*i))
    yAxisGeom.vertices.push(new THREE.Vector3(tickX + tickSize, tickY, tickNumber*i))
    yAxisGeom.vertices.push(new THREE.Vector3(tickX, tickY, tickNumber*i))
    yAxisGeom.vertices.push(new THREE.Vector3(tickX, tickY + tickSize, tickNumber*i))
  }
  yAxisGeom.computeBoundingBox()
  yAxisGeom.computeBoundingSphere()
  var yAxis = new THREE.Line(
    yAxisGeom
    , new THREE.LineBasicMaterial({color: 0x333333, opacity: 1 })
    , THREE.LinePieces
  )
  yAxis.castShadow = false
  yAxis.receiveShadow = false
  scene.add(yAxis)

  var controls = new THREE.TrackballControls(camera)

  document.getElementById('viewer').appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0x111111))

  var light = new THREE.DirectionalLight(0xffffff, 1)
  light.shadowCameraVisible = true
  light.position.set(0,300,400)
  scene.add(light)

  render()

  function render() {
    controls.update()
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    //console.log(camera.position.toArray())
  }
})

