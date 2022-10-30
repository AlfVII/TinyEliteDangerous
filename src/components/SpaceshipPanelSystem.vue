<script setup>
import { ref, watch, computed, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import { useTimer } from 'vue-timer-hook';
import axios from "axios";
import * as Utils from '/src/assets/js/utils.js'
import { Vector3 } from 'three'

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
time.setSeconds(time.getSeconds() + 0.05);
const timer = useTimer(time, false);


const closestStar = ref(null)
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
    },
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
        handleChange(id, { x, y, speed, angle }) {
            stateStore.setRotationVectorJoystick({x: -y / 32., y: -x / 32.})
        },
        getClosestBodies() {
            this.systemBodies.forEach((item, index) => {
                item["currentDistance"] = scaleVector.subVectors(item.orbitPosition, this.camera.camera.position).length() * 10
            })
            this.systemBodies.sort((a,b) => a["currentDistance"] - b["currentDistance"]);
            systemsConsole.value.innerHTML = "Nearby Systems:\n"
            this.systemBodies.slice(0, 10).forEach((item, index) => {
                systemsConsole.value.innerHTML = systemsConsole.value.innerHTML + item["name"] + " at " + String(Utils.removeTrailingZeroes(item["currentDistance"], 2)) + " Mm" + "\n"
            });
            const closestDistance = this.systemBodies[0]["currentDistance"]
            this.$emit("onClosestDistance", closestDistance)
        },
        exitSystem() {
            this.$emit("exitSystem")
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
                    this.getClosestBodies()
                }
                time.setSeconds(time.getSeconds() + 0.05);
                timer.restart(time);
            }
        })

    }
}

</script>



<template>
    <div class="container-flex text-primary mx-2 mt-2 row">
            <textarea ref="systemsConsole" class="col-2" id="systemsConsole" style="height: 11vh; background-color: black; color: var(--bs-success);" rows="5" disabled>Nearby systems</textarea>
            <div class="col-2" >
                <label class="fs-5 ms-3">Distance to Star:</label>
                <div></div>
                <label class="fs-5 ms-1 bg-dark text-primary" style="width: 100%; max-width: 100px; text-align:right;"><slot name="distanceToStar"></slot></label>
                <label class="fs-5 ms-2 me-4" style="width: 10px;">{{'Mm'}}</label>
            </div>

            <div class="col-1 " >
                <vue3-joystick ref="joyStick" @change="handleChange('left', $event);" />
            </div>

            <div class="col-1" >
                <button class="btn bg-light text-primary text-center" @click="exitSystem">{{"Exit system " + systemName}}</button>
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
                <label class="fs-5 ms-3 bg-dark text-primary" style="width: 100%; max-width: 100px; text-align:right;"><slot name="relativeVelocity"></slot></label>
                <label class="fs-5 ms-2 me-4" style="width: 10px;">{{'Mm/s'}}</label>
            </div>

            <label  class="col-2" id="explorers_console" style="height: 11vh; background-color: black; color: var(--bs-success);" rows="5" disabled><pre><slot name="nearbyExplorers"></slot></pre></label>
    </div>
</template>

