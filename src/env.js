

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import Effect from './effect'

class Env {
  
  static instance

  constructor() {
    if(Env.instance) {
      return Env.instance
    }
    Env.instance = this
    this.init()
  }

  init() {
    this.customRender = false
    this._setTime()
    this._createScene()
    this._createEvent()
    this._createControls()
    this._createPane()
    this._setEffect()
    this.render()
  }

  _setEffect() {
    this.effect = new Effect()
  }

  _createPane() {
    this.pane = new Pane()
    this.pane.containerElem_.style.width = '320px'
  }

  _setTime() {
    this.clock = new THREE.Clock()
    this.time = this.clock.getElapsedTime()
  }


  update() {
    if(this.effect && this.effect.update) {
      this.effect.update()
    }
    if(this.controls) {
      this.controls.update()
    }
  } 

  render() {
    this.time = this.clock.getElapsedTime()
    this.update()
    if(!this.customRender) {
      this.renderer.render(this.scene, this.camera)
    }
    requestAnimationFrame(this.render.bind(this))
  }

  _onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  _createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minAzimuthAngle = - Math.PI / 8
		this.controls.maxAzimuthAngle = Math.PI / 2
    this.controls.minPolarAngle = -Math.PI / 2
		this.controls.maxPolarAngle = Math.PI / 2

    this.controls.minZoom = 0
		this.controls.maxZoom = 1

    this.controls.minDistance = 0
		this.controls.maxDistance = 20
  }

  _createEvent() {
    window.addEventListener('resize', this._onResize.bind(this))
  }

  _createScene() {
    this.renderer =  new THREE.WebGLRenderer({
      antialias: false
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.physicallyCorrectLights = false
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(10, 5, 8)
    document.querySelector('#app').appendChild(this.renderer.domElement)
  }

}


export default Env