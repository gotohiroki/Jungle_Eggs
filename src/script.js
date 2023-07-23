import * as THREE from 'three'
import gsap from 'gsap';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App('#webgl');
  app.init();
  app.render();
}, false);

class App {
  constructor(canvas) {
    this.wrapper = document.querySelector(canvas);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.time = { type: 'float', value: 1.0 };
    this.resolution = { type: 'vec2', value: new THREE.Vector2() };

    this.objectGroup = new THREE.Group();
    this.objRadius = this.width * 0.2;
    this.objSize = {
      width: 40,
      height: 250
    };

    this.rendererParam = {
      clearColor: 0x44eecc,
      width: this.width,
      height: this.height
    };

    this.cameraDistance = this.objRadius * 3.0;
    this.cameraParam = {
      fov : 45,
      aspect : this.width / this.height,
      near : 0.1,
      far : 2000,
      x: 0.0,
      y: 100.0,
      z: this.cameraDistance,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };

    this.materialParam = {
      color: 0x00eedd
    };

    this.clock = new THREE.Clock();
  };

  _setScene() {
    this.scene = new THREE.Scene();
  };

  _setRender() {
    this.renderer = new THREE.WebGLRenderer({antialias : true});
    this.renderer.setSize(this.rendererParam.width, this.rendererParam.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color(this.rendererParam.clearColor));
    this.wrapper.appendChild(this.renderer.domElement);
  };

  _createFog() {
    this.scene.fog = new THREE.FogExp2(this.rendererParam.clearColor, 0.001);
  };

  _setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.cameraParam.fov,
      this.cameraParam.aspect,
      this.cameraParam.near,
      this.cameraParam.far
    );

    this.camera.position.set(
      this.cameraParam.x,
      this.cameraParam.y,
      this.cameraParam.z,
    );

    this.camera.lookAt(this.cameraParam.lookAt);
  };

  _unifom() {
    time = {type: 'float', value: 1.0};
    resolution = {type: "vec2",value: new THREE.Vector2()};
  }

  _createObject(radius) {
    this.geometry = new THREE.SphereGeometry(radius, 100, 100);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: 'float', value: 1.0 },
        // time: { this._unifom(this.time)},
        resolution: { type: 'vec2', value: new THREE.Vector2(radius, radius) },
      },
      vertexShader,
      fragmentShader
    });
    this.material.slide = THREE.DoubleSide;
    return new THREE.Mesh(this.geometry, this.material);
  };

  _createObjects(radius, count) {
    for(let i = 0; i < count; i++) {
      const degree = 2 * Math.PI * i / count; // 度
      const mesh = this._createObject(this.objSize.width);
      const x = radius * Math.cos(degree);
      const y = radius * Math.sin(degree);

      mesh.position.x = x;
      mesh.position.y = 0;
      mesh.position.z = y;
      mesh.rotation.y = Math.PI / 2 - (Math.atan2(y, x));
      mesh.scale.y = 1.1;

      this.objectGroup.add(mesh);
    };
    return this.objectGroup;
  };

  _setFloor() {
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(3000, 3000, 32, 32),
      new THREE.MeshBasicMaterial({
          color: 0xcc22ff,
          transparent: true,
          opacity: 1.0
      }),
    );
    this.floor.position.y = -this.objSize.height / 2;
    this.floor.rotation.x = -Math.PI / 2;
    return this.floor;
  }


  init() {
    this._setScene();
    this._setRender();
    this._createFog();
    this._setCamera();

    this.scene.add(this._createObjects(this.objRadius, 8));
    this.scene.add(this._createObjects(this.objRadius * 2.0, 16));
    this.scene.add(this._createObjects(this.objRadius * 3.0, 24));
    this.scene.add(this._setFloor());

    this.startAnimation();
    window.addEventListener("resize", this.onResize.bind(this));
  };

  render(t) {
    this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    this.time.value = time;

    const len = this.objectGroup.children.length;
    for(let i = 0; i < len; i++) {
      const object = this.objectGroup.children[i];
      if(object.type !== "Mesh") {
        continue;
      }
    };

    this.camera.position.x = this.cameraDistance * Math.sin(time * 0.3);
    this.camera.position.z = this.cameraDistance * Math.cos(time * 0.3);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  };

  tween(mesh, delay) {
    const position1 = {
        y: mesh.position.y,
        scaleY: mesh.scale.y
    };
    gsap.to(position1, {
      y: 140,
      scaleY: 1.4,
      duration: 0.4,
      delay: delay,
      ease: "power2.inOut",
      onUpdate: () => {
        mesh.position.y = position1.y;
        mesh.scale.y = position1.scaleY;
      },
      onComplete: () => {
        const position2 = {
          y: mesh.position.y,
          scaleY: mesh.scale.y
        };
        gsap.to(position2, {
          y: 0,
          scaleY: 1.1,
          duration: 0.7,
          ease: "bounce.out",
          onUpdate: () => {
            mesh.position.y = position2.y;
            mesh.scale.y = position2.scaleY;
          },
          onComplete: () => {
            this.tween(mesh, delay); // ループ処理のため、再帰的に gsapTween 関数を呼び出します
          },
        });
      },
    });
  }

  startAnimation() {
    for (let i = 0, len = this.objectGroup.children.length; i < len; i++) {
      const mesh = this.objectGroup.children[i];
      this.tween(mesh, i * .08);
    }
  }

  onResize() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

}
