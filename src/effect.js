import Env from './env'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import vertexShader from './shaders/wind/vertex.glsl'
import fragmentShader from './shaders/wind/fragment.glsl'

import gsap from 'gsap'

export default class Effect {

  constructor() {
    this.env = new Env()
    this.scene = this.env.scene
    this.camera = this.env.camera
    this.renderer = this.env.renderer
    this.clock = new THREE.Clock()
    this.pane = this.env.pane
    this._setLights()
    this._loadModel()
  }

  _setPane() {
    const duration = this.action.getClip().duration
    const params = {
      progress: 0,
      autoplay: false
    }
    const folder = this.pane.addFolder({
      title: '相机动画'
    })
    folder.addInput(params, 'autoplay').on('change', e => {
      if(e.value) {
        //this.action.time = 0
        this.action.paused = false
        this.action.play()
      } else {
        //this.action.time = 0
        this.action.paused = true
      }
    })
    folder.addInput(params, 'progress', {
      min: 0,
      max: 0.99,
      step: 0.0001
    }).on('change', e => {
      this.action.paused = true
      // this.action.time = THREE.MathUtils.lerp(this.action.time, duration * e.value, 0.05)
      
      gsap.to(this.action, {
        time: duration * e.value,
        duration: 0.1
      })
    })
  }

  _setRenderer() {
    this.env.customRender = true
    const renderScene = new RenderPass(this.scene, this.camera)
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85)
    bloomPass.threshold = 0.3
    bloomPass.strength = 0.3
    bloomPass.radius = 1

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderScene)
		this.composer.addPass(bloomPass)
  
  }

  _setLights() {

    const ambientLight = new THREE.AmbientLight(0xeeeeff, 0.5)
    this.scene.add(ambientLight)

    const light1 = new THREE.PointLight(0xffffff, 5, 20, 5)
    light1.position.set(0, 10, 0)
    this.scene.add(light1)

    const light2 = new THREE.PointLight(0x9ba1fe, 5, 20, 5)
    light2.position.set(0, 5, 5)
    this.scene.add(light2)
  }

  _createAction(clip, camera, model) {
    this.env.camera = camera
    this.env.camera.fov = 60
    this.env.camera.aspect = window.innerWidth / window.innerHeight
    this.env.camera.updateProjectionMatrix()
    this.mixer = new THREE.AnimationMixer(model)
    this.action = this.mixer.clipAction(clip)
    this.action.play()
    this.action.paused = true
  }

  _loadModel() {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('draco/')
    loader.setDRACOLoader(dracoLoader)
    loader.load('models/airplane.glb', glb => {

      this._createAction(glb.animations[0], glb.cameras[0], glb.scene)

      glb.scene.traverse(child => {
        if(child.name === 'blade') {
          this.blade = child
        }

        if(child.name === 'wind') {
          this.m1 = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uTime: {
                value: 0
              },
              uColor: {
                value: child.children[0].material.color
              }
            }
          })
          this.m2 = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              uTime: {
                value: 0
              },
              uColor: {
                value: child.children[1].material.color
              }
            }
          })
          child.children[0].material = this.m1
          child.children[1].material = this.m2
        }
        
      })
      this.scene.add(glb.scene)
      this._setPane()
      //this._setRenderer()
    })
  }


  update() {  
    const dt = this.clock.getDelta()
   //if(this.composer) this.composer.render(dt)
    if(this.blade) {
      this.blade.rotation.z += 0.3
      this.m1.uniforms.uTime.value = this.env.time
      this.m2.uniforms.uTime.value = this.env.time
    }
    if(this.mixer) {
			this.mixer.update(dt)
    }
  }

}