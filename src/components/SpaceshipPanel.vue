<script setup>
import { ref, watch, computed, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import { useTimer } from 'vue-timer-hook';
import axios from "axios";
import * as Utils from '/src/assets/js/utils.js'

</script>

<script>
import slider from "vue3-slider"
import joystick from '/src/components/Joystick.vue'

const stateStore = useStateStore()
const spaceshipStatus = ref(0);
const systemsConsole = ref(null);
const joyStick = ref(null);

const style = getComputedStyle(document.body);
const theme = {
  primary: style.getPropertyValue('--bs-primary'),
  secondary: style.getPropertyValue('--bs-secondary'),
  success: style.getPropertyValue('--bs-success'),
  info: style.getPropertyValue('--bs-info'),
  warning: style.getPropertyValue('--bs-warning'),
  danger: style.getPropertyValue('--bs-danger'),
  light: style.getPropertyValue('--bs-light'),
  dark: style.getPropertyValue('--bs-dark'),
  white: style.getPropertyValue('--bs-white'),
}
const time = new Date();
time.setSeconds(time.getSeconds() + 1);
const timer = useTimer(time, false);


const closestStarSubType = ref(null)
const closestStar = ref(null)


export default {
    components: {
        "vue3-slider": slider,
        "vue3-joystick": joystick,
    },
    methods: {
        statusChange(newValue) {
            if (newValue == 0)
                stateStore.setSpaceshipStatusText("drifting")
            else if (newValue == 1)
                stateStore.setSpaceshipStatusText("accelerating")
            else
                stateStore.setSpaceshipStatusText("decelerating")
        },
        requestReallyCloseStars(distance, user_coords) {
            axios.get('https://api.tinybird.co/v0/pipes/ReallyCloseStars.json', {
                params: {
                    'distance': distance,
                    'user_coords_x': user_coords.x,
                    'user_coords_y': user_coords.y,
                    'user_coords_z': user_coords.z,
                    'token': 'p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICI4Yjg2NmU5NC1mYTQ2LTQ3NTMtODdhOS04Zjc5NmVlYThmNzUifQ.OsT2Is3MvtrfgIFMfiQSSvHCRO8pkaA6kxXrONy0Bqg'
                },
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICI4Yjg2NmU5NC1mYTQ2LTQ3NTMtODdhOS04Zjc5NmVlYThmNzUifQ.OsT2Is3MvtrfgIFMfiQSSvHCRO8pkaA6kxXrONy0Bqg'
                }
            })
            .then(response => {
                systemsConsole.value.innerHTML = "Nearby Systems:\n"
                response.data.data.forEach((item, index) => {
                    systemsConsole.value.innerHTML = systemsConsole.value.innerHTML + item["name"] + " at " + String(Utils.removeTrailingZeroes(item["star_distance"], 2)) + " ly" + "\n"
                });
                const closestDistance = response.data.data[0]["star_distance"]
                this.closestStarSubType = response.data.data[0]["subType"]
                this.$emit("onClosestDistance", closestDistance)
                if (closestDistance < 0.5) {
                    this.closestStar = response.data.data[0]["name"]
                }
                else {
                    this.closestStar = null
                }
            })
            .catch(error => {
            }); 
        },
        handleChange(id, { x, y, speed, angle }) {
            stateStore.setRotationVectorJoystick({x: -y / 32., y: -x / 32.})
        },
        loadSystem() {
            axios.get('https://api.tinybird.co/v0/pipes/SystemBodiesByName.json', {
                params: {
                    'name': this.closestStar,
                    'token': 'p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICI5NjU1NDUzNC0yYmJmLTRhNjQtOWFkNC02MzNlMWE2NjY5ZTUifQ.6H7N31PKJzAQ2a7LrnTW14traQtTkvrBPzMmdmh-Ofk'
                },
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICI5NjU1NDUzNC0yYmJmLTRhNjQtOWFkNC02MzNlMWE2NjY5ZTUifQ.6H7N31PKJzAQ2a7LrnTW14traQtTkvrBPzMmdmh-Ofk'
                }
            })
            .then(response => {
                console.log(response.data)
                var bodies
                if (response.data.data.length == 0) {
                    bodies = [{'bodyId': 0, 'name': this.closestStar, 'type': 'Star', 'subType': this.closestStarSubType, 'orbitRadius': 0, 'radius': 696339.9679613516}]
                }
                else {
                    var jsonValue = response.data.data[0]["bodies"]
                    jsonValue = jsonValue.replaceAll("\':", "\":").replaceAll(", \'", ", \"")
                    jsonValue = jsonValue.replaceAll(": \'", ": \"").replaceAll("\',", "\",")
                    jsonValue = jsonValue.replaceAll("\{\'", "\{\"")
                    bodies = JSON.parse(jsonValue)
                }
                console.log(bodies)
                const data = {name: this.closestStar, bodies: bodies, currentSpacePosition: this.camera.camera.position}
                this.$emit("enterSystem", data)

            })
            .catch(error => {
            }); 
        }
    },
    data() {
        return {
            sliderConf: {
                orientation: "vertical",
                max: 1,
                min: -1,
                step: 1,
                width: "50px",
                color: theme['primary'],
                // trackColor: theme['primary'],
                height: 20,
                sticky: true,
                alwaysShowHandle: true,
                camera: null,
            },
        }
    },
    mounted() {


        stateStore.$onAction((action) => {
            if (action.name == "setSpaceshipStatus") {
                const spaceshipStatusText = action.args[0]
                if (spaceshipStatusText == "drifting")
                    spaceshipStatus.value = 0
                else if (spaceshipStatusText == "accelerating")
                    spaceshipStatus.value = 1
                else
                    spaceshipStatus.value = -1
            }
            if (action.name == "setCamera") {
                this.camera = action.args[0]
                timer.start();
            }
            if (action.name == "setRotationVector") {
                const rotationVector = action.args[0]
                joyStick.value.updatePositionNoUpdate(-rotationVector.y * 32, -rotationVector.x * 32)

            }
        })

        watchEffect(async () => {
            if(timer.isExpired.value) {
                if (this.camera != null) {
                    const userPosition = this.camera.camera.position;
                    this.requestReallyCloseStars(10, userPosition)
                }
                time.setSeconds(time.getSeconds() + 1);
                timer.restart(time);
            }
        })

    }
}

</script>



<template>
    <div class="container-flex text-white mx-2 mt-2 row">
            <textarea ref="systemsConsole" class="col-2" id="systemsConsole" style="height: 11vh; background-color: black;color: green;" rows="5" disabled>Nearby systems</textarea>
            <div class="col-2" >
                <label class="fs-5 ms-3">Distance to Earth:</label>
                <div></div>
                <label class="fs-5 ms-1 bg-dark text-white" style="width: 100%; max-width: 50px; text-align:right;"><slot name="distanceToEarth"></slot></label>
                <label class="fs-5 ms-2 me-4" style="width: 10px;">{{'ly'}}</label>
            </div>

            <div class="col-1 " >
                <vue3-joystick ref="joyStick" @change="handleChange('left', $event);" />
            </div>


            <div class="col-1" >
                <button class="btn bg-light text-white text-center" :disabled="closestStar == null" @click="loadSystem">{{closestStar == null? "Too far away" : "Enter system " + closestStar}}</button>
            </div>

            <div class="col-2 row" >
                <div class="col-3 " >
                    <vue3-slider class="float-end mt-2" v-model="spaceshipStatus" v-bind="sliderConf" @change="statusChange" />
                </div>

                <div class="col-6" >
                    <label class="fs-6 ms-0">Accelerating</label>
                    <label class="fs-6 ms-0">Drifting</label>
                    <label class="fs-6 ms-0">Decelerating   </label>
                </div>
            </div>


            <div class="col-2" >
                <label class="fs-5 ms-3">Relative Velocity:</label>
                <div></div>
                <label class="fs-5 ms-3 bg-dark text-white" style="width: 100%; max-width: 40px; text-align:right;"><slot name="relativeVelocity"></slot></label>
                <label class="fs-5 ms-2 me-4" style="width: 10px;">{{'ly/s'}}</label>
            </div>

            <textarea  class="col-2" id="explorers_console" style="height: 11vh; background-color: black;color: green;" rows="5" disabled>Nearby explorers</textarea>
    </div>
</template>

