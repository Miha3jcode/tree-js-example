import './App.scss';

import React from 'react';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

import useStaticRefCurrentGetter from 'hooks/useStaticRefCurrentGetter';
import List from 'components/List/List';
import Button from 'components/Button/Button';
import Input from 'components/Input/Input';
import Select from 'components/Select/Select';

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
  [shapes.CUBE]: (scale) =>
    new THREE.BoxGeometry(scale, scale, scale),

  [shapes.SPHERE]: (scale) =>
    new THREE.SphereGeometry( scale / 2, scale * 128, scale * 128 ),

  [shapes.CYLINDER]: (scale) =>
    new THREE.CylinderGeometry( scale / 4, scale / 4, scale, scale * 128),
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
  
  const [scale, setScale] = useState(1);
  const [shape, setShape] = useState(shapes.CUBE);
  const [items, setItems] = useState([]);

  useEffect(
    () => handleInitTreeEffect(getContainer(), getCamera(), getScene()),
    [],
  );

  const onCreateButtonClickHandler = useCallback(
    (event) => handleCreateButtonClick(event, shape, scale, getScene(), getDefaultMaterial(), updateItems),
    [shape, scale],
  );

  const onScaleInputChangeHandler = useCallback(
    (event) => setScale(event.target.value),
    [],
  );

  const onShapeSelectChangeHandler = useCallback(
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
      <form className={'app__form'} action="#">
        <Select className={'app__field'} name="shape" value={shape} onChange={onShapeSelectChangeHandler}>
          {
            options.map(option => {
              return  (
                <option value={option.value} key={option.value}>{option.label}</option>
              );
            })
          }
        </Select>
        <Input className={'app__field'} type="text" name={'scale'} value={scale} onChange={onScaleInputChangeHandler}/>
        <Button className={'app__field'} onClick={onCreateButtonClickHandler}>create</Button>
      </form>
      <List className={'app__list'} items={items}  onDeleteButtonClick={onDeleteButtonClickHandler}/>
      <div className="app__tree-container" ref={containerRef}/>
    </div>
  );
}

function handleInitTreeEffect(container, camera, scene) {
  if (container.children.length) return;

  initTree(container, camera, scene);
}

function handleCreateButtonClick(event, shape, scale, scene, material, updateItems) {
  event.preventDefault();
  createNewObject(shape, scale, scene, material, updateItems)
}

function handleOnShapeSelect(event, setShape) {
  setShape(event.target.value);
}

function handleDeleteObject(id, scene, updateItems) {
  const object = scene.getObjectById(id);

  scene.remove(object);

  updateItems();
}

function createNewObject(shape, scale, scene, material, updateItems) {

  const createGeometry = geometryCreators[shape];

  if (!createGeometry) return;

  const object = new THREE.Mesh(
    createGeometry(0.1),
    material,
  );

  object.scale.set(scale, scale, scale);

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
  object.position.z = getRandomInRange(-0.5, 0.5);
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default App;
