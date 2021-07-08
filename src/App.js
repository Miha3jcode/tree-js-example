import './App.css';

import React from 'react';
import OrbitControls from 'three-orbitcontrols';
import * as THREE from 'three';

import useStaticRefCurrentGetter from 'hooks/useStaticRefCurrentGetter';
import List from 'components/List/List';

import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';

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
};

function App() {
  const containerRef = useRef();

  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const defaultMaterialRef = useRef(null)

  const getContainer = useStaticRefCurrentGetter(
    containerRef,
    () => null,
  );

  const getCamera = useStaticRefCurrentGetter(
    cameraRef, 
    () => initCamera(getContainer()),
  );
  
  const getScene = useStaticRefCurrentGetter(
    sceneRef,
    () => initScene(),
  );

  const getRenderer = useStaticRefCurrentGetter(
    rendererRef,
    () => initRenderer(getContainer(), getCamera(), getScene()),
  );

  const getDefaultMaterial = useStaticRefCurrentGetter(
    defaultMaterialRef,
    () => initDefaultMaterial(),
  );
  
  const [size, setSize] = useState(0.1);
  const [shape, setShape] = useState(shapes.CUBE);
  const [items, setItems] = useState([]);

  useEffect(
    () => initTree(getContainer(), getCamera(), getScene()),
    [],
  );

  const onCreateButtonClickHandler = useCallback(
    () => createNewObject(shape, size, getScene(), getDefaultMaterial(), updateItems),
    [shape, size],
  );

  const onSizeInputChangeHandler = useCallback(
    (event) => setSize(event.target.value),
    [],
  );

  const onShapeSelectChange = useCallback(
    (event) => handleOnShapeSelect(event, setShape),
    [setShape],
  );

  const onDeleteButtonClickHandler = useCallback(
    (event, id) => handleDeleteObject(id, getScene(), updateItems),
    [],
  );

  function updateItems() {
    const scene = getScene();

    const items = scene.children
      .filter(child => child instanceof  THREE.Mesh)
      .map(object => ({
        id: object.id,
        text: object.uuid,
      }));

    setItems(items);
  }

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
      <List className={'app__list'} items={items}  onDeleteButtonClick={onDeleteButtonClickHandler}/>
      <div className="app__tree-container" ref={containerRef}/>
    </div>
  );
}

function handleOnShapeSelect(event, setShape) {
  setShape(event.target.value);
}

function handleDeleteObject(id, scene, updateItems) {
  const object = scene.getObjectById(id);

  scene.remove(object);

  updateItems();
}

function createNewObject(shape, size, scene, material, updateItems) {

  const createGeometry = geometryCreators[shape];

  if (!createGeometry) return;

  const object = new THREE.Mesh(
    createGeometry(size),
    material,
  );

  setRandomPosition(object);

  scene.add(object);

  updateItems();
}

function initDefaultMaterial() {
  const materialOptions = {
    color: new THREE.Color('#ffb759'),
    flatShading: false,
  };

  return new THREE.MeshPhysicalMaterial(materialOptions);
}

function initCamera(container) {
  const dimensions = getContainerDimensions(container);

  const camera = new THREE.PerspectiveCamera( 70, dimensions.aspect, 0.01, 10 );
  camera.position.z = 1;

  return camera;
}

function initScene() {
  const scene = new THREE.Scene();
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

  return scene;
}

function initRenderer(container, camera, scene) {
  const dimensions = getContainerDimensions(container);

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize( dimensions.width, dimensions.height );
  renderer.setAnimationLoop( getAnimation(camera, scene, renderer) );

  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
}

function initTree(container, camera, scene) {
  initRenderer(container, camera, scene);
}

function getAnimation(camera, scene, renderer) {
  return function animation() {
    renderer.render( scene, camera );
  }
}

function getContainerDimensions(container) {
  return {
    width: container.offsetWidth,
    height: container.offsetHeight,
    aspect: container.offsetWidth / container.offsetHeight,
  };
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
