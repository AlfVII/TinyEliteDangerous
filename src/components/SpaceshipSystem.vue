
<script setup>
import { Object3D, MathUtils, Clock, Fog, Color, Vector3 } from 'three';

import { ref, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import axios from "axios";
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { useTimer } from 'vue-timer-hook';
import * as dfd from "danfojs/dist/danfojs-base"
import * as FormDataEa from "form-data"

import Header from '/src/components/Header.vue'
import SpaceshipPanelSystem from '/src/components/SpaceshipPanelSystem.vue'
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
    data() {
        return {
            spaceshipStatus: "drifting",
            speed: 0,
            fogNear: 10,
            distanceToStar: 0,
            currentRotationVector: {x: 0, y: 0},
            setRotationVectorJoystick: false,
            closestDistanceToBody: 1,
            renderer: null,
            scene: null,
            camera: null,
            sending: false,
            receiving: 0,
            usersInSystem: [],
            nearbyExplorersList: {},
        }
    },
    computed: {
        nearbyExplorersText() {
            var nearbyExplorersText = "Nearby Explorers:\n"
            for (const [name, text] of Object.entries(this.nearbyExplorersList)) {
                nearbyExplorersText += text
            }
            return nearbyExplorersText
        }
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
            this.closestDistanceToBody = distance
        },
        gravityFactor() {
            const factor = Math.max(0.001, Math.min(1, this.closestDistanceToBody / 1000))
            return factor
        },
        tryStart() {
            if (this.renderer != null && this.scene != null && this.camera != null)  {
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

                timer.start();

                renderer.onAfterRender(() => {
                    const userPosition = this.camera.camera.position;
                    this.distanceToStar = Math.sqrt(Math.pow(userPosition.x, 2) + Math.pow(userPosition.y, 2) + Math.pow(userPosition.z, 2))
                })
                renderer.onBeforeRender(() => {
                    const gravityFactor = this.gravityFactor()
                    if (this.spaceshipStatus == "decelerating") {
                        this.speed -= this.acceleration * gravityFactor
                        if (this.speed < this.minimumSpeed)
                            this.speed = this.minimumSpeed
                    } 
                    else if (this.spaceshipStatus == "accelerating") {
                        this.speed += this.acceleration * gravityFactor
                        if (this.speed > this.maximumSpeed * gravityFactor)
                            this.speed = this.maximumSpeed * gravityFactor
                    } else {
                    }
                    this.speed = Math.min(this.speed, this.maximumSpeed * this.closestDistanceToBody / 2)
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

                    if (!this.sending) {
                        this.sending = true
                        const date = new Date();
                        const dateString = date.toISOString(); 
                        fetch(
                        'https://api.tinybird.co/v0/events?name=Users',
                        {
                          method: 'POST',
                          body: JSON.stringify({
                            last_connection: date,
                            last_ping_today: dateString,
                            system_coords_x: this.camera.camera.position.x * 10,
                            system_coords_y: this.camera.camera.position.y * 10,
                            system_coords_z: this.camera.camera.position.z * 10,
                            system_name: this.systemName,
                            user: this.userName,
                          }),
                          headers: { Authorization: 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICIzMjhjZmQ1My1iODMxLTQyNDgtYjMzMi00Y2NmOGE4Mzk5NzcifQ.Hz6M7ZUBl-HdgydJA8dSWzD4ZyvwPKBQJ8c4HIlXqgk' }
                        }
                        ).then(res => res.json())
                        .then(data => {
                            this.sending = false
                        })
                        .catch(error => {
                            this.sending = false
                        }); 
                    }

                    if (this.receiving == 0) {
                        this.usersInSystem.forEach((user, index) => {
                            this.receiving += 1

                            axios.get('https://api.tinybird.co/v0/pipes/OnlineUsersCoordinates.json', {
                                params: {
                                    'nearbyUser': user
                                },
                                headers: {
                                    'Authorization': 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICI2N2E4Njg0Yy01NWJmLTQ2YjYtODRhNS1iZjUzNGZjZmMyMDgifQ.tfwDxSGIDxd051G3G-ZQ30uDRnom9qSwu7Ylfg9sb80'
                                }
                            })
                            .then(response => {
                                const date_1 = new Date(response.data.data[1]["last_ping_today"])
                                const date_0 = new Date(response.data.data[0]["last_ping_today"])
                                const diff = (Date.now() - date_1.getTime()) / 1000
                                this.receiving -= 1
                                const info = {}
                                const distance = Math.sqrt(Math.pow(response.data.data[0]["system_coords_x"] - response.data.data[1]["system_coords_x"], 2) + Math.pow(response.data.data[0]["system_coords_y"] - response.data.data[1]["system_coords_y"], 2) + Math.pow(response.data.data[0]["system_coords_z"] - response.data.data[1]["system_coords_z"], 2))
                                const time = (date_0.getTime() - date_1.getTime()) / 1000
                                info["user"] = user
                                info["speed"] = distance / time
                                info["timestamp"] = date_1
                                info["position"] = new Vector3(response.data.data[1]["system_coords_x"] / 10, response.data.data[1]["system_coords_y"] / 10, response.data.data[1]["system_coords_z"] / 10)
                                info["target"] = new Vector3(response.data.data[0]["system_coords_x"] / 10, response.data.data[0]["system_coords_y"] / 10,response.data.data[0]["system_coords_z"] / 10)
                                info["direction"] = new Vector3(response.data.data[0]["system_coords_x"] / 10 - response.data.data[1]["system_coords_x"] / 10, response.data.data[0]["system_coords_y"] / 10 - response.data.data[1]["system_coords_y"] / 10, response.data.data[0]["system_coords_z"] / 10 - response.data.data[1]["system_coords_z"] / 10).normalize()
                                const userPosition = this.camera.camera.position;
                                const distanceToUser = Math.sqrt(Math.pow(userPosition.x * 10 - response.data.data[1]["system_coords_x"], 2) + Math.pow(userPosition.y * 10 - response.data.data[1]["system_coords_y"], 2) + Math.pow(userPosition.z * 10 - response.data.data[1]["system_coords_z"], 2))
                                this.nearbyExplorersList[user] = user + " at " + Utils.removeTrailingZeroes(distanceToUser, 1) + " Mm " + Utils.removeTrailingZeroes(diff, 2) + " seconds ago\n"

                                this.$emit("onSpaceshipsInfo", info)

                            })
                            .catch(error => {
                                this.receiving -= 1
                            }); 
                        })
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

                watchEffect(async () => {
                    if(timer.isExpired.value) {
                        axios.get('https://api.tinybird.co/v0/pipes/OnlineUsersList.json', {
                            params: {
                                'mySystem': this.systemName,
                                'myUser': this.userName,
                            },
                            headers: {
                                'Authorization': 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICJkNmY0OWYzYy04ZTY5LTQxNjgtYWRhMi02ZjBiMzFmMDczMGUifQ.u3EIOw743wI83pKRSiZApI9d3yqCZYUWHPzUfzAyrUo'
                            }
                        })
                        .then(response => {
                            this.usersInSystem = []
                            const newNearbyExplorersList = {}
                            response.data.data.forEach((item, index) => {
                                this.usersInSystem.push(item["user"])
                                if (item["user"] in this.nearbyExplorersList)
                                    newNearbyExplorersList[item["user"]] = this.nearbyExplorersList[item["user"]]
                                else
                                    newNearbyExplorersList[item["user"]] = ""
                            });
                            this.nearbyExplorersList = newNearbyExplorersList

                        })
                        .catch(error => {
                            this.receiving = false
                        });

                        time.setSeconds(time.getSeconds() + 0.01);
                        timer.restart(time);
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
    <SpaceshipPanelSystem :systemBodies="systemBodies" :systemName="systemName" @onClosestDistance="onClosestDistance($event);" @exitSystem="$emit('exitSystem')">
        <template #distanceToStar>
            {{(distanceToStar * 10).toFixed(2)}}
        </template>
        <template #relativeVelocity>
            {{(speed * 10).toFixed(2)}}
        </template>
        <template #nearbyExplorers>
            {{"" + nearbyExplorersText}}
        </template>
    </SpaceshipPanelSystem>
</template>
        