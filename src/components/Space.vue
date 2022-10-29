
<script setup>
import { Object3D, MathUtils, Clock, Fog, Color } from 'three';
import {Camera, EffectComposer, Renderer, RenderPass, AmbientLight, Scene, UnrealBloomPass, } from 'troisjs';

import { ref, defineProps, onMounted, watchEffect } from 'vue'
import Stars from '/src/components/Stars.vue'
import { useStateStore } from '/src/stores/state'
import axios from "axios";
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { useTimer } from 'vue-timer-hook';
import * as dfd from "danfojs/dist/danfojs-base"

import Header from '/src/components/Header.vue'
import Spaceship from '/src/components/Spaceship.vue'
import * as Utils from '/src/assets/js/utils.js'


</script>
<script>

const stateStore = useStateStore()
const time = new Date();
time.setSeconds(time.getSeconds() + 1);
const timer = useTimer(time, false);

export default {
    props: {
        currentSpacePosition: {
            type: Object,
            required: true,
        },
    },
    components: {
        Camera,
        EffectComposer,
        Renderer,
        RenderPass,
        AmbientLight,
        Scene,
        UnrealBloomPass,
        Stars,
        Spaceship,
    },
    data() {

        return {
            loadPosition: {x: 0, y: 0, z: 0},
            starRequestRadius: 100,
            loading: false,
            requesting: false
        }
    },
    computed: {
        uniqueStarColors() {
            const uniqueStarColors = {}
            for (const [key, value] of Object.entries(Utils.starColors)) {
                if (!(value in uniqueStarColors)) {
                    uniqueStarColors[value] = [key]
                }
                else {
                    uniqueStarColors[value].push(key)
                }
            }
            return uniqueStarColors;
        },
    },
    methods: {
        groupData(data) {
            const df = new dfd.DataFrame(data)
            let starsGrouped = df.groupby(["subType"])
            const uniqueStarColors = {}
            for (const [starType, stars] of Object.entries(starsGrouped.colDict)) {
                const starsDf = new dfd.DataFrame(stars)
                if (!(Utils.starColors[starType] in uniqueStarColors)) {
                    uniqueStarColors[Utils.starColors[starType]] = starsDf
                }
                else {
                    uniqueStarColors[Utils.starColors[starType]] = dfd.concat({ dfList: [uniqueStarColors[Utils.starColors[starType]], starsDf], axis: 0 })
                }
            }
            return uniqueStarColors
        },
        requestNearbyStars(distance, user_coords) {
            axios.get('https://api.tinybird.co/v0/pipes/NearbyStars.json', {
                params: {
                    'distance': distance,
                    'user_coords_x': user_coords.x,
                    'user_coords_y': user_coords.y,
                    'user_coords_z': user_coords.z,
                    'token': 'p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICJiMDA1NDY1MC1iYmRlLTRmZTYtOTUxZS05MWQ2NzM2YjI1ZTAifQ.HtRryjcZFzUa6Pj8raVUhRF8UIlHLOQJqFQZh54_Sbc'
                },
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer p.eyJ1IjogImUwYjU5OTlmLTYwMWItNDMxNy1hMjQyLTM3YTI5NzRhZTUzZCIsICJpZCI6ICJiMDA1NDY1MC1iYmRlLTRmZTYtOTUxZS05MWQ2NzM2YjI1ZTAifQ.HtRryjcZFzUa6Pj8raVUhRF8UIlHLOQJqFQZh54_Sbc'
                }
            })
            .then(response => {
                const starsGrouped = this.groupData(response.data.data)
                console.log(starsGrouped)
                stateStore.setStarData(starsGrouped)
                time.setSeconds(time.getSeconds() + 1);
                timer.start(time);
                this.requesting = false
            })
            .catch(error => {
            });
        },
    },
    mounted() {
        const renderer = this.$refs.renderer;
        stateStore.setRenderer(renderer)
        const scene = this.$refs.scene;
        stateStore.setScene(scene)
        const camera = this.$refs.camera;
        stateStore.setCamera(camera)

        this.requestNearbyStars(this.starRequestRadius, {x: 0, y: 0, z: 0})
        watchEffect(async () => {
            if(timer.isExpired.value) {
                const userPosition = stateStore.getCamera;
                const distance = Math.sqrt(Math.pow(this.loadPosition.x - userPosition.x, 2) + Math.pow(this.loadPosition.y - userPosition.y, 2) + Math.pow(this.loadPosition.z - userPosition.z, 2))
                if (distance > this.starRequestRadius - this.fogFar) {
                    this.loading = true
                    this.requestNearbyStars(this.starRequestRadius, userPosition)
                }
                time.setSeconds(time.getSeconds() + 1);
                timer.restart(time);
            }
        })
    },
};
</script>

<template>
    <Renderer ref="renderer" resize=true shadow>
        <div ref="spaceScene">
            <Camera ref="camera" :near="0.001" :position="currentSpacePosition"/>
            <Scene ref="scene">
                <AmbientLight />
                    <Stars v-for="item, index in uniqueStarColors"
                            :color="index"
                    ></Stars>
            </Scene>
            <EffectComposer>
                <RenderPass />
                <UnrealBloomPass :strength="2" />
            </EffectComposer>
            <Spaceship @enterSystem="$emit('enterSystem', $event)"/>
        </div>
    </Renderer>
</template>
        