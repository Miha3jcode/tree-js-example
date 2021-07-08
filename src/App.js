import './App.css';

import React from 'react';
import OrbitControls from 'three-orbitcontrols';
import * as THREE from 'three';

import List from 'components/List/List';

import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';

let camera, scene, renderer;
let objects = [];

const materialOptions = {
  color: new THREE.Color('#ffb759'),
  flatShading: false,
};

const material = new THREE.MeshPhysicalMaterial(materialOptions);

const shapes = {
  CUBE: 'CUBE',
  SPHERE: 'SPHERE',
  CYLINDER: 'CYLINDER',
};

const options = [
  { value: shapes.CUBE, label: 'Cube'},
  { value: shapes.SPHERE, label: 'Sphere'},
  { value: shapes.CYLINDER, label: 'Cylinder'},
];

const geometryCreators = {
  [shapes.CUBE]:  (size) => new THREE.BoxGeometry(size, size, size),
  [shapes.SPHERE]: (size) => new THREE.SphereGeometry( size / 2, size * 128, size * 128 ),
  [shapes.CYLINDER]: (size) =>  new THREE.CylinderGeometry( size / 4, size / 4, size, size * 128),
}

function App() {

  const containerRef = useRef();

  const [size, setSize] = useState(0.1);
  const [shape, setShape] = useState(shapes.CUBE);
  const [objects, setObjects] = useState([]);

  useEffect(
    () => initTree(containerRef.current),
    [],
  );

  const onCreateButtonClickHandler = useCallback(
    () => createNewObject(shape, size, setObjects),
    [shape, size],
  );

  const onSizeInputChangeHandler = useCallback(
    (event) => setSize(event.target.value),
    [],
  );

  const onShapeSelectChange = useCallback(
    (event) => setShape(event.target.value),
    [setShape],
  );

  const onDeleteButtonClickHandler = useCallback(
    (event, id) => handleDeleteObject(event, id, setObjects),
    [],
  );

  return (
    <div className="app">
      {/*<form action="#">*/}
        <input type="text" name={'size'} value={size} onChange={onSizeInputChangeHandler}/>
        <select name="shape" value={shape} onChange={onShapeSelectChange}>
          {
            options.map(option => {
              return  (
                <option value={option.value} key={option.value}>{option.label}</option>
              );
            })
          }
        </select>
        <button onClick={onCreateButtonClickHandler}>create</button>
      {/*</form>*/}
      <List className={'app__list'}   onDeleteButtonClick={onDeleteButtonClickHandler}/>
      <div className="app__tree-container" ref={containerRef}/>
    </div>
  );
}

function handleOnShapeSelect(event, setShape) {
  setShape(event.target.value);
}

function handleDeleteObject(event, id, setObjects) {
  console.log('uuid', id)
  setObjects(prevState => ([
    ...prevState.filter(object => object.id !== id),
  ]));

  const object = objects.find(o => o.uuid === id);

  scene.remove(object);
}

function createNewObject(shape, size, setObjects) {

  const createGeometry = geometryCreators[shape];
  console.log('createGeometry', createGeometry)
  if (!createGeometry) return;

  const object = new THREE.Mesh(
    createGeometry(size),
    material,
  );

  setRandomPosition(object);

  objects.push(object);
  scene.add(object);

  setObjects(prevState => ([
    ...prevState,
    {
      id: object.uuid,
      text: object.uuid,
    },
  ]));
}

function initTree(container) {
  const
    width = container.offsetWidth,
    height = container.offsetHeight,
    aspect = width / height;

  camera = new THREE.PerspectiveCamera( 70, aspect, 0.01, 10 );
  camera.position.z = 1;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');

  const baseLight = new THREE.AmbientLight( '#fefff0' );
  const hemisphereLight = new THREE.HemisphereLight( '#fffcab', '#ffaeab', 1 );
  const mainPointLight = new THREE.PointLight( '#fffed6', 1, 5 );

  mainPointLight.position.set( 1, 1, 1 );
  baseLight.intensity = 0.1;
  hemisphereLight.intensity = 0.2;

  scene.add( baseLight );
  scene.add( hemisphereLight );
  scene.add( mainPointLight );

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize( width, height );
  renderer.setAnimationLoop( animation );

  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
}

function animation(time) {
  objects.forEach(o => {
    // o.rotation.x = time / 2000;
    // o.rotation.y = time / 1000;
  })

  renderer.render( scene, camera );
}

function setRandomPosition(object) {
  object.position.x = getRandomInRange(-0.5, 0.5);
  object.position.y = getRandomInRange(-0.5, 0.5);
  object.position.z = getRandomInRange(-0.2, 0.2);
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default App;
