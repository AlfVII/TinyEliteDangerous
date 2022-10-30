
<script setup>
import { ref, defineProps, onMounted, watchEffect } from 'vue'
import { useStateStore } from '/src/stores/state'
import axios from "axios";
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { useTimer } from 'vue-timer-hook';
import * as dfd from "danfojs/dist/danfojs-base"

import Header from '/src/components/Header.vue'
import Welcome from '/src/components/Welcome.vue'
import Space from '/src/components/Space.vue'
import System from '/src/components/System.vue'
import * as Utils from '/src/assets/js/utils.js'


</script>
<script>

const stateStore = useStateStore()

export default {
    components: {
        Space,
        System,
        Welcome,
    },
    data() {
        return {
            systemBodies: null,
            systemName: null,
            inSystem: false,
            hasToIntroduceName: true,
            currentSpacePosition: { x: 0, y: 0.05, z: 0.2 },
            userName: null,
        }
    },
    computed: {
    },
    methods: {
        enterSystem(data) {
            console.log("Scene enterSystem")
            console.log(data)
            this.systemBodies = data["bodies"]
            this.systemName = data["name"]
            this.currentSpacePosition = data["currentSpacePosition"]
            this.inSystem = true
        },
        exitSystem() {
            console.log("Scene exitSystem")
            this.inSystem = false
        },
        onPlayerReady(data) {
            this.userName = data['name']
            this.hasToIntroduceName = false
            console.log(this.userName)
        },
    },
    created() {
    },
    mounted() {
    },
};
</script>

<template>
    <Header />
    <Welcome v-if="hasToIntroduceName" @onPlayerReady="onPlayerReady"/>
    <System v-else-if="inSystem" :systemBodies="systemBodies" :systemName="systemName" :userName="userName" @exitSystem="exitSystem"/>
    <Space v-else :currentSpacePosition="currentSpacePosition" :userName="userName" @enterSystem="enterSystem"/>
</template>
        