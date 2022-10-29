
<script setup>
import { Object3D, MathUtils, Clock, Fog, Color, PointLight, MeshBasicMaterial, ImageUtils, BackSide, SphereGeometry, TextureLoader, Mesh, Vector3} from 'three';
import {Camera, EffectComposer, Renderer, RenderPass, AmbientLight, Scene, UnrealBloomPass, } from 'troisjs';

import { ref, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import axios from "axios";
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { useTimer } from 'vue-timer-hook';
import * as dfd from "danfojs/dist/danfojs-base"

import Header from '/src/components/Header.vue'
import SpaceshipSystem from '/src/components/SpaceshipSystem.vue'
import Stars from '/src/components/Stars.vue'
import Body from '/src/components/Body.vue'
import * as Utils from '/src/assets/js/utils.js'
import * as SpaceshipModel from '/src/assets/js/spaceship.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



</script>
<script>

const stateStore = useStateStore()
const time = new Date();
time.setSeconds(time.getSeconds() + 1);
const timer = useTimer(time, false);
var scaleVector = new Vector3();

export default {
    props: {
        systemBodies: {
            type: Array,
            required: true,
        },
        systemName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
    },
    components: {
        Camera,
        Renderer,
        RenderPass,
        AmbientLight,
        Scene,
        Body,
        SpaceshipSystem,
    },
    data() {
        return {
            startingDistance: 400,
            farthestBodyDistance: 0,
            spaceshipInfo: {},
            lastRenderTime: 0
        }
    },
    computed: {
        systemBodiesNoSatellites() {
            const systemBodiesNoSatellites = []
            this.systemBodies.forEach((item, index) => {
                if (item['parent'] == 0 || item['parent'] == null) {
                    const newItem = Utils.deepCopy(item)
                    newItem["orbitRadius"] *=  299792 * Utils.systemScale / 10
                    newItem["radius"] *= Utils.systemScale

                    const factorAngle = (newItem["radius"] * newItem["orbitRadius"]) % Math.PI
                    newItem["orbitPosition"] = {}
                    newItem["orbitPosition"].x = newItem["orbitRadius"] * Math.cos(factorAngle)
                    newItem["orbitPosition"].y = 0
                    newItem["orbitPosition"].z = newItem["orbitRadius"] * Math.sin(factorAngle)
                    systemBodiesNoSatellites.push(newItem)
                    if (newItem["orbitRadius"] > this.farthestBodyDistance) {
                        this.farthestBodyDistance = newItem["orbitRadius"]
                    }
                }
            })
            return systemBodiesNoSatellites
        }
    },
    methods: { 
        updateShip(data) {
            if (data['timestamp'] > this.spaceshipInfo[data['user']]['lastUpdate']) {
                this.spaceshipInfo[data['user']]['speed'] = data["speed"]
                this.spaceshipInfo[data['user']]['position'] = data["position"]
                this.spaceshipInfo[data['user']]['direction'] = data["direction"]
            }
        },
        updateNameSprites() {
            const cameraPosition = this.$refs.camera.camera.position
            for (const [user, data] of Object.entries(this.spaceshipInfo)) {
                var scaleFactor = 4;
                var sprite = data.object.children.at(-1);
                const proportion = scaleVector.subVectors(data.object.position, cameraPosition).length()
                var scale

                if (proportion > 0.2) {
                    scale = proportion / scaleFactor;
                }
                else {
                    scale = 0
                }
                sprite.scale.set(scale, scale, 1);
            }
        },
        onSpaceshipsInfo(data) {
            // data['position'] = {x: 0, y: 0, z: this.startingDistance - 10}
            if (data['user'] in this.spaceshipInfo) {
                this.updateShip(data)
            }
            else {
                SpaceshipModel.loadSpaceship(data).then((result) => {
                    console.log("result loadSpaceship")
                    console.log(result["spaceship"])
                    const scene = this.$refs.scene;
                    scene.add( result["spaceship"]);
                    this.spaceshipInfo[data['user']] = {
                        user: data["user"],
                        object: result["spaceship"],
                        speed: data["speed"],
                        position: data["position"],
                        target: data["target"],
                        direction: data["direction"],
                        lastUpdate: data["timestamp"],
                    }
                })
            }
        },
    },
    mounted() {
        const renderer = this.$refs.renderer;
        stateStore.setRenderer(renderer)
        const scene = this.$refs.scene;
        stateStore.setScene(scene)
        const camera = this.$refs.camera;
        stateStore.setCamera(camera)

        const light = new PointLight( "#ffffff", 0.5 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        const spaceMaterial = new MeshBasicMaterial({
            map: new TextureLoader().load("/images/bodies/Space.jpg"),
            side: BackSide
        })

        var skyGeometry = new SphereGeometry(this.farthestBodyDistance * 1.5, 64 );
        var skybox = new Mesh( skyGeometry, spaceMaterial );
        scene.add(skybox)

        const loader = new GLTFLoader();


        renderer.onBeforeRender(() => {
            this.updateNameSprites()
            const timeSinceLastRender = performance.now() - this.lastRenderTime
            this.lastRenderTime = performance.now()
            for (const [user, data] of Object.entries(this.spaceshipInfo)) {
                // console.log(data['target'])
                // console.log(data['direction'])
                const camera = this.$refs.camera;
                // data.object.lookAt(new Vector3(data['target'].x, data['target'].y, data['target'].z))
                data.object.lookAt(data['target'])
                // console.log(data.object)
                // data.object.position.z -= data['direction'].z * data['speed'] / 100 * timeSinceLastRender
                data.object.position.x += data['direction'].x * data['speed'] / 100 * timeSinceLastRender
                data.object.position.y += data['direction'].y * data['speed'] / 100 * timeSinceLastRender
                data.object.position.z += data['direction'].z * data['speed'] / 100 * timeSinceLastRender
            }
        })


        // loader.load( '/images/tie_fighter.glb', ( gltf ) => {
        //     console.log( "gltf");
        //     console.log( gltf);
        //     var ship = gltf.scene
        //     console.log( "ship");
        //     scene.add( gltf.scene );
        //     console.log( ship);
        //     ship.position.set(1100, -20.5, -10);

        // },  ( xhr ) => {

        //     console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        // }, ( error ) => {

        //     console.error( error );

        // } );

        console.log(this.$refs.scene.scene)
        // console.log(this.farthestBodyDistance)
        // this.$refs.scene.scene.children.forEach((item, index) => {
        //     if (item.material != null) {
        //         if (item.material.map != null) {
        //             console.log(item.material.map)
        //             renderer.renderer.initTexture(item.material.map)
        //         }
        //     }

        // })


    },
};
</script>

<template>
    <Renderer ref="renderer" resize=true shadow>
        <div ref="spaceScene">
            <Camera ref="camera" :near="0.01" :far="farthestBodyDistance * 1.5" :position="{ x: 0, y: 0 , z: startingDistance }"/>
            <Scene ref="scene">
                <!-- <AmbientLight :intensity="1"/> -->
                <AmbientLight :intensity="0.01"/>
                <Body v-for="item, index in systemBodiesNoSatellites"
                            :data="item"/>
            </Scene>
            <SpaceshipSystem :systemBodies="systemBodiesNoSatellites" :systemName="systemName" :userName="userName" @exitSystem="$emit('exitSystem')" @onSpaceshipsInfo="onSpaceshipsInfo" :maximumSpeed="30" :minimumSpeed="-30" :acceleration="0.5" :fogFar="farthestBodyDistance * 2"/>
        </div>
    </Renderer>
</template>
        