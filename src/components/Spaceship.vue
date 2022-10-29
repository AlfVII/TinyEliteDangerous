
<script setup>
import { Object3D, MathUtils, Clock, Fog, Color } from 'three';

import { ref, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { useTimer } from 'vue-timer-hook';
import * as dfd from "danfojs/dist/danfojs-base"

import Header from '/src/components/Header.vue'
import SpaceshipPanel from '/src/components/SpaceshipPanel.vue'
import * as Utils from '/src/assets/js/utils.js'


</script>
<script>

const stateStore = useStateStore()
const time = new Date();
time.setSeconds(time.getSeconds() + 1);
const timer = useTimer(time, false);

export default {
    props: {
        maximumSpeed: {
            type: Number,
            required: false,
            default: 1
        },
        minimumSpeed: {
            type: Number,
            required: false,
            default: 0
        },
        acceleration: {
            type: Number,
            required: false,
            default: 0.005
        },
        fogFar: {
            type: Number,
            required: false,
            default: 75
        },
    },
    data() {
        return {
            spaceshipStatus: "drifting",
            speed: 0,
            fogNear: 10,
            distanceToEarth: 0,
            currentRotationVector: {x: 0, y: 0},
            setRotationVectorJoystick: false,
            closestDistanceToStar: 1,
            renderer: null,
            scene: null,
            camera: null,
        }
    },
    computed: {
    },
    methods: {
        handleKeyDown(event) {
            if (event.key == "s") {
                if (this.spaceshipStatus != "decelerating")
                    stateStore.setSpaceshipStatus("decelerating")
                this.spaceshipStatus = "decelerating"
            }
            if (event.key == "w") {
                if (this.spaceshipStatus != "accelerating"){
                    stateStore.setSpaceshipStatus("accelerating")
                }
                this.spaceshipStatus = "accelerating"
            }

        },
        handleKeyUp(event) {
            if (event.key == "s") {
                if (this.spaceshipStatus != "drifting")
                    stateStore.setSpaceshipStatus("drifting")
                this.spaceshipStatus = "drifting"
            }
            if (event.key == "w") {
                if (this.spaceshipStatus != "drifting")
                    stateStore.setSpaceshipStatus("drifting")
                this.spaceshipStatus = "drifting"
            }
        },
        onClosestDistance(distance) {
            this.closestDistanceToStar = distance
        },
        gravityFactor() {
            const factor = Math.min(1, this.closestDistanceToStar / 4)
            // console.log("gravityFactor")
            // console.log(this.closestDistanceToStar)
            // console.log(factor)
            return factor
        },
        tryStart() {
            if (this.renderer != null && this.scene != null && this.camera != null)  {
                console.log("We can start")
                const renderer = this.renderer;
                const scene = this.scene.scene;
                const camera = this.camera;
                const controls = new FlyControls( camera.camera, renderer.renderer.domElement );

                const color = 0x000000;  // white
                scene.fog = new Fog(color, this.fogNear, this.fogFar);

                const clock = new Clock();
                controls.movementSpeed = 1000;
                controls.domElement = renderer.renderer.domElement;
                controls.rollSpeed = Math.PI / 16;
                controls.autoForward = false;
                controls.dragToLook = true;

                renderer.onAfterRender(() => {
                    const userPosition = this.camera.camera.position;
                    this.distanceToEarth = Math.sqrt(Math.pow(userPosition.x, 2) + Math.pow(userPosition.y, 2) + Math.pow(userPosition.z, 2))
                })
                renderer.onBeforeRender(() => {
                    if (!this.loading) {
                        const gravityFactor = this.gravityFactor()
                        if (this.spaceshipStatus == "decelerating") {
                            this.speed -= this.acceleration
                            if (this.speed < this.minimumSpeed)
                                this.speed = this.minimumSpeed
                        } 
                        else if (this.spaceshipStatus == "accelerating") {
                            this.speed += this.acceleration * gravityFactor
                            if (this.speed > this.maximumSpeed * gravityFactor)
                                this.speed = this.maximumSpeed * gravityFactor
                        } else {
                        }
                        this.speed = Math.min(this.speed, this.maximumSpeed * this.closestDistanceToStar / 2)
                        const delta = clock.getDelta();
                        const moveMult = delta * this.speed;
                        const rotMult = delta * controls.rollSpeed;
                        controls.object.translateZ( -moveMult );
                        if (this.setRotationVectorJoystick) {
                            controls.tmpQuaternion.set( this.currentRotationVector.x * rotMult, this.currentRotationVector.y * rotMult, controls.rotationVector.z * rotMult, 1 ).normalize();
                        }
                        else {
                            if (this.currentRotationVector.x != controls.rotationVector.x || this.currentRotationVector.y != controls.rotationVector.y) {
                                this.currentRotationVector = {x: controls.rotationVector.x, y: controls.rotationVector.y}
                                stateStore.setRotationVector(this.currentRotationVector)
                            }
                            controls.tmpQuaternion.set( controls.rotationVector.x * rotMult, controls.rotationVector.y * rotMult, controls.rotationVector.z * rotMult, 1 ).normalize();
                        }
                        controls.object.quaternion.multiply( controls.tmpQuaternion );
                    } else {
                        if (!this.requesting) {
                            this.requesting = true
                            const userPosition = this.camera.camera.position;
                            this.loadPosition = Utils.deepCopy(userPosition)
                        }
                    }

                });

                stateStore.$onAction((action) => {
                    if (action.name == "setSpaceshipStatusText") {
                        const spaceshipStatusText = action.args[0]
                        this.spaceshipStatus = spaceshipStatusText

                    }
                    if (action.name == "setRotationVectorJoystick") {
                        const rotationVector = action.args[0]
                        if (rotationVector.x == 0&& rotationVector.y == 0) {
                            this.setRotationVectorJoystick = false
                        } else {
                            this.setRotationVectorJoystick = true
                        }
                        this.currentRotationVector.x = rotationVector.x
                        this.currentRotationVector.y = rotationVector.y
                    }
                })
            }
        }
    },
    created() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    },
    mounted() {

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
    },
};
</script>

<template>
    <SpaceshipPanel @onClosestDistance="onClosestDistance($event);">
        <template #distanceToEarth>
            {{distanceToEarth.toFixed(2)}}
        </template>
        <template #relativeVelocity>
            {{speed.toFixed(2)}}
        </template>
    </SpaceshipPanel>
</template>
        