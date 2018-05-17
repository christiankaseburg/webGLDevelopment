import * as THREE from 'three';
var EffectComposer = require('three-effectcomposer')(THREE);
var Godrays = /** @class */ (function () {
    function Godrays(scene, camera, renderer, lightMesh, occlusionMesh) {
        this.DEFAULT_LAYER = 0;
        this.OCCLUSION_LAYER = 1;
        this.VolumetricLightShader = {
            uniforms: {
                tDiffuse: { value: null },
                lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
                exposure: { value: 0.18 },
                decay: { value: 0.95 },
                density: { value: 0.9 },
                weight: { value: 0.8 },
                samples: { value: 100 }
            },
            vertexShader: require('../shaders/godrays/volumetricLight.vert'),
            fragmentShader: require('../shaders/godrays/volumetricLight.frag')
        };
        this.AdditiveBlendingShader = {
            uniforms: {
                tDiffuse: { value: null },
                tAdd: { value: null }
            },
            vertexShader: require('../shaders/godrays/additiveBlending.vert'),
            fragmentShader: require('../shaders/godrays/additiveBlending.frag')
        };
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.lightMesh = lightMesh;
        this.occlusionMesh = occlusionMesh;
        this.createPasses();
    }
    Godrays.prototype.createPasses = function () {
        // Light Mesh Used to create the effect
        this.lightMesh.layers.set(this.OCCLUSION_LAYER);
        this.scene.add(this.lightMesh);
        // the all black mesh that is used to create the occlusion 
        this.occlusionMesh.layers.set(this.OCCLUSION_LAYER);
        this.scene.add(this.occlusionMesh);
        // create the occlusion render target and composer, while rending 1/2 of the screen for better performance.
        this.occlusionRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth * 0.5, window.innerHeight * 0.5);
        this.occlusionComposer = new EffectComposer(this.renderer, this.occlusionRenderTarget);
        // add a scene render pass
        this.occlusionComposer.addPass(new EffectComposer.RenderPass(this.scene, this.camera));
        // add the volumeteric shader pass that will automatically be applied
        // to texture created by the scene render 
        this.pass = new EffectComposer.ShaderPass(this.VolumetricLightShader);
        this.uniforms = this.pass.uniforms;
        // since only one shader is used the front and back buffers do not need to be swapped
        // after the shader does its work.
        this.pass.needsSwap = false;
        this.occlusionComposer.addPass(this.pass);
        // a second composer and render pass for the lit scene
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new EffectComposer.RenderPass(this.scene, this.camera));
        // an additive blending pass that takes as a uniform
        // the resulting texture from the volumetric light shader 
        this.pass = new EffectComposer.ShaderPass(this.AdditiveBlendingShader);
        this.pass.uniforms.tAdd.value = this.occlusionRenderTarget.texture;
        this.composer.addPass(this.pass);
        this.pass.renderToScreen = true;
    };
    return Godrays;
}());
export { Godrays };
