import {
  Vector2,
  ShaderMaterial,
  DoubleSide,
  NoBlending,
  PlaneGeometry,
  Mesh,
} from "three";

import Experience from "./Experience.js";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import fragmentShader from "./shaders/screenEffect/fragment.glsl";
import vertexShader from "./shaders/screenEffect/vertex.glsl";
import {
  ARCADE_SCREEN_WIDTH,
  ARCADE_SCREEN_HEIGHT,
  ARCADE_CSS_OBJECT_SCALE,
  ARCADE_CSS_OBJECT_POSITION,
  ARCADE_CSS_OBJECT_ROTATION_X,
  ARCADE_CSS_OBJECT_ROTATION_Y,
  CRT_UNIFORMS,
  ARCADE_IFRAME_SRC,
  ARCADE_IFRAME_PADDING,
} from "./constants.js";

export default class ArcadeScreen {
  constructor() {
    this.experience = new Experience();
    this.webglElement = this.experience.webglElement;
    this.renderer = this.experience.renderer.instance;
    this.cssArcadeMachineScene = this.experience.cssArcadeMachineScene;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.mouse = this.experience.mouse;
    this.screenSize = new Vector2(ARCADE_SCREEN_WIDTH, ARCADE_SCREEN_HEIGHT);
    this.model = {};
    this.arcadeMachineMaterial = this.experience.world.baked.model.material2;
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.audioManager = this.experience.world.audioManager;
    this.setModel();
    this.setArcadeScreen();
  }

  setModel = () => {
    // Arcade machine model removed
  };

  setArcadeScreen = () => {
    // Arcade screen removed
  };

  handleKeyDownParent = (event) => {
    this.iframeWindow.postMessage(
      { type: "keyDownParent", key: event.key },
      "*"
    );
  };

  handleKeyUpParent = (event) => {
    this.iframeWindow.postMessage({ type: "keyUpParent", key: event.key }, "*");
  };

  onMouseMove = () => {
    if (
      this.objectRaycasted &&
      this.objectRaycasted.object &&
      this.objectRaycasted.object.name == "arcadeMachine"
    ) {
      this.experience.navigation.orbitControls.enableDamping = false;
      this.experience.navigation.orbitControls.enabled = false;
      this.webglElement.style.pointerEvents = "none";
    } else {
      this.experience.navigation.orbitControls.enableDamping = true;
      this.experience.navigation.orbitControls.enabled = true;
      this.webglElement.style.pointerEvents = "auto";
    }
  };

  activateControls = () => {
    window.addEventListener("keydown", this.handleKeyDownParent);
    window.addEventListener("keyup", this.handleKeyUpParent);
    window.addEventListener("pointermove", this.onMouseMove);
    window.addEventListener("message", this.receiveMessage, false);
    this.onMouseMove();
  };
  deactivateControls = () => {
    window.removeEventListener("keydown", this.handleKeyDownParent);
    window.removeEventListener("keyup", this.handleKeyUpParent);
    window.removeEventListener("pointermove", this.onMouseMove);
    window.removeEventListener("message", this.receiveMessage, false);
  };
  receiveMessage = (event) => {
    if (event.data == "hit") {
      this.audioManager.playSingleAudio("hit", 1);
    } else if (event.data == "tetris") {
      this.audioManager.playSingleAudio("tetris", 1);
    } else if (event.data == "die") {
      this.audioManager.playSingleAudio("die", 1);
    } else if (event.data == "select1") {
      this.audioManager.playSingleAudio("select1", 1);
    } else if (event.data == "select2") {
      this.audioManager.playSingleAudio("select2", 1);
    }
  };
}
