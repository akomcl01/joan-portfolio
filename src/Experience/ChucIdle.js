import * as THREE from "three";
import Experience from "./Experience.js";
import gsap from "gsap"; // Import GSAP for animation

export default class ChucIdle {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time; // Get time for animation updates
    this.debug = this.experience.debug; // Optional: for debugging

    // Target position for walking
    this.targetPosition = new THREE.Vector3(-2.5, 0, -4.6); // Adjust Y based on your floor level
    this.isWalking = false;

    this.setModel();
    this.setAnimations();
  }

  setModel() {
    this.model = {};
    this.model.group = this.resources.items.chucIdle.scene;

    // Initial position - adjust if needed
    this.model.group.position.set(0, 0, 0);
    this.model.group.scale.set(1.5, 1.5, 1.5);

    this.scene.add(this.model.group);

    this.model.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  setAnimations() {
    this.mixer = new THREE.AnimationMixer(this.model.group);
    this.animations = {};

    // Assuming animations are part of the loaded GLTF
    const idleClip = THREE.AnimationClip.findByName(this.resources.items.chucIdle.animations, 'Idle'); // Replace 'Idle' with your actual idle animation name
    const walkClip = THREE.AnimationClip.findByName(this.resources.items.chucIdle.animations, 'Walking'); // Replace 'Walking' with your actual walk animation name

    if (idleClip) {
        this.animations.idle = this.mixer.clipAction(idleClip);
        this.animations.idle.play(); // Start with idle animation
    } else {
        console.warn("Idle animation not found!");
    }

    if (walkClip) {
        this.animations.walk = this.mixer.clipAction(walkClip);
    } else {
        console.warn("Walking animation not found!");
    }
  }

  walkToWhiteboard(onCompleteCallback) {
    if (this.isWalking || !this.animations.walk) return; // Prevent starting walk if already walking or no walk animation

    this.isWalking = true;

    // Stop idle, start walking
    if (this.animations.idle) {
        this.animations.idle.fadeOut(0.5);
    }
    this.animations.walk.reset().fadeIn(0.5).play();

    // Calculate direction and rotation
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.model.group.position).normalize();
    const angle = Math.atan2(direction.x, direction.z);
    const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

    // Rotate smoothly towards the target
    gsap.to(this.model.group.quaternion, {
        _w: targetQuaternion.w,
        _x: targetQuaternion.x,
        _y: targetQuaternion.y,
        _z: targetQuaternion.z,
        duration: 0.5, // Rotation duration
        onComplete: () => {
            // Move towards the target after rotation
            gsap.to(this.model.group.position, {
                x: this.targetPosition.x,
                y: this.targetPosition.y,
                z: this.targetPosition.z,
                duration: 3, // Walking duration - adjust as needed
                ease: "none", // Linear movement while walking
                onComplete: () => {
                    // Stop walking, start idle
                    this.animations.walk.fadeOut(0.5);
                    if (this.animations.idle) {
                        this.animations.idle.reset().fadeIn(0.5).play();
                    }
                    this.isWalking = false;
                    // Execute the callback (flyToPosition)
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                }
            });
        }
    });


  }

  update() {
    // Update the animation mixer
    if (this.mixer) {
      this.mixer.update(this.time.delta * 0.001); // Convert ms to seconds
    }
  }

  destroy() {
    // Stop all animations and clean up mixer
    if (this.mixer) {
        this.mixer.stopAllAction();
    }
    this.scene.remove(this.model.group);
    // Dispose of geometries and materials if necessary
    // You might need to traverse and dispose materials/geometries explicitly
    // if they are not automatically handled by Three.js garbage collection.
  }
}