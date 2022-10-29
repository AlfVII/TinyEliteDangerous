
<script setup>
import { ref, defineProps, onMounted } from 'vue'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {Camera, EffectComposer, Renderer, RenderPass, AmbientLight, Scene, UnrealBloomPass, PhongMaterial, LambertMaterial, Sphere} from 'troisjs';
// import {LambertMaterial, BasicMaterial, PhongMaterial, Sphere, AmbientLight } from 'troisjs'
import { Color, TextureLoader, MeshPhongMaterial, Mesh, Texture, SpriteMaterial, Sprite, Vector3, BufferGeometry, Path, LineBasicMaterial, Line} from 'three'
import { useStateStore } from '/src/stores/state'
import axios from "axios";
import * as Utils from '/src/assets/js/utils.js'
</script>

<script>
const sphereRef = ref(null);
const materialRef = ref(null);
const stateStore = useStateStore()
var scaleVector = new Vector3();

export default {

    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            renderer: null,
            scene: null,
            camera: null,
            texture: null,
            orbitLine: null,
        }
    },
    methods: {
        setColor(color) {
            const material = this.$refs[this.getMaterialRef];
            const colorRGB = Utils.hexToRgb(color)

            // material.material.color.r = colorRGB.r / 255
            // material.material.color.g = colorRGB.g / 255
            // material.material.color.b = colorRGB.b / 255

            material.material.emissive.r = colorRGB.r / 255
            material.material.emissive.g = colorRGB.g / 255
            material.material.emissive.b = colorRGB.b / 255

        },
        tryStart() {
            if (this.renderer != null && this.scene != null && this.camera != null)  {
                this.renderer.onBeforeRender(() => {
                    const body = this.$refs[this.getBodyRef].mesh;
                    body.rotation.y += 0.001;

                    if (this.data["parent"] == 0) {
                        var scaleFactor = 8;
                        var sprite = body.children[0];
                        const proportion = scaleVector.subVectors(body.position, this.camera.camera.position).length()
                        var scale

                        if (proportion > 0.2) {
                            scale = proportion / scaleFactor;
                        }
                        else {
                            scale = 0
                        }
                        sprite.scale.set(scale, scale, 1);
                    }
                });


                const material = this.$refs[this.getMaterialRef];

                if (Utils.customBodies.includes(this.data["name"])) {
                    this.texture = new TextureLoader().load("/images/bodies/" + this.data["name"] + ".jpg" );
                }
                else {
                    this.texture = new TextureLoader().load("/images/bodies/" + this.data["subType"] + ".jpg" );
                }

                this.renderer.renderer.initTexture(this.texture);
                material.material.map = this.texture;
                material.material.needsUpdate = true;

                const body = this.$refs[this.getBodyRef].mesh;
                if (this.data["parent"] == 0) {

                    var canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    var ctx = canvas.getContext("2d");
                    ctx.font = "44pt Arial";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.fillText(this.data["name"], 256, 44);
                    var tex = new Texture(canvas);
                    tex.needsUpdate = true;
                    var spriteMat = new SpriteMaterial({
                      map: tex
                    });
                    var sprite = new Sprite(spriteMat);
                    body.add(sprite);

                    console.log("Drawing line at: " + this.getOrbit)
                    let g = new BufferGeometry().setFromPoints(
                        new Path().absarc(0, 0, Math.round(this.getOrbit) , 0, Math.PI * 2).getSpacedPoints(512)
                    );
                    let m = new LineBasicMaterial({color: "aqua", linewidth: 10000});
                    let l = new Line(g, m);
                    l.rotation.x = Math.PI / 2;
                    console.log("this.orbitLine")
                    this.scene.add(l);
                    this.orbitLine = l
                    console.log(this.orbitLine)
                }

                const factorAngle = (this.data["radius"] * this.data["orbitRadius"]) % Math.PI
                body.position.x = this.getOrbit * Math.cos(factorAngle)
                body.position.y = 0
                body.position.z = this.getOrbit * Math.sin(factorAngle)


                this.renderer.renderer.initTexture(this.texture)

            }
        }
    },
    computed: {
        getRadius() {
            return this.data['radius']
        },
        isStar() {
            return this.data['type'] == "Star"
        },
        getBodyRef() {
            return this.data['name']
        },
        getMaterialRef() {
            return this.data['name'] + "Material"
        },
        getOrbit() {
            return this.data["orbitRadius"]
        },
    },
    mounted() {

        if (this.data["subType"] in Utils.starColors) {
            this.setColor(Utils.starColors[this.data["subType"]])
        }

        stateStore.$onAction((action) => {
            if (action.name == "setRenderer") {
                this.renderer = action.args[0]
                this.tryStart()
            }
            if (action.name == "setScene") {
                this.scene = action.args[0]
                this.tryStart()
            }
            if (action.name == "setCamera") {
                this.camera = action.args[0]
                this.tryStart()
            }
        })

    }
}

</script>

<template>
    <!-- <AmbientLight /> -->
    <Sphere :ref="getBodyRef" :radius="getRadius" :widthSegments="64" :heightSegments="64">
        <PhongMaterial v-if="isStar" :ref="getMaterialRef"/>
        <LambertMaterial v-else :ref="getMaterialRef"/>
    </Sphere>
    <EffectComposer v-if="isStar">
        <RenderPass v-if="isStar"/>
        <UnrealBloomPass v-if="isStar" :strength="0.5" />
    </EffectComposer>
</template>
    