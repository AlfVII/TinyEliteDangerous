
<script>
import { Object3D, MathUtils } from 'three';
import {InstancedMesh, PhongMaterial, SphereGeometry, } from 'troisjs';

import { ref, defineProps, onMounted } from 'vue'
import { useStateStore } from '/src/stores/state'
import * as Utils from '/src/assets/js/utils.js'


function rendererReady() {
        stateStore.setRenderer(renderer)
}
const stateStore = useStateStore()

export default {
    components: {
        InstancedMesh,
        PhongMaterial,
        SphereGeometry,
    },
    props: {
        color: {
            type: String,
            required: true,
        },
        radius: {
            type: Number,
            required: false,
            default: 5,
        },
    },
    data() {
        var dummy;
        return {
            numberInstances: 10000,
            dummy,
        }
    },
    methods: {
        renderStars(stars) {
            const imesh = this.$refs.imesh.mesh;

            imesh.count = stars.values.length
            stars.values.forEach((item, index) => {
                this.dummy.position.set(item[0], item[1], item[2]);

                const scale = 0.005;
                this.dummy.scale.set(scale, scale, scale);
                this.dummy.updateMatrix();
                imesh.setMatrixAt(index, this.dummy.matrix);

            });
            imesh.instanceMatrix.needsUpdate = true;
        }
    },
    setup() {
        return {
            NUM_INSTANCES: 2,
        };
    },
    mounted() {
        const material = this.$refs.material;
        const colorRGB = Utils.hexToRgb(this.color)

        material.material.color.r = colorRGB.r / 255
        material.material.color.g = colorRGB.g / 255
        material.material.color.b = colorRGB.b / 255
        this.dummy = new Object3D();
        
        stateStore.$subscribe((mutation, state) => {
            const starData = stateStore.getStarData.value
            if (this.color in starData) {
                var myStars = starData[this.color];
                this.renderStars(myStars)
            }
        });
    },
};
</script>

<template>
    <InstancedMesh ref="imesh" :count="numberInstances" :cast-shadow="false" :receive-shadow="false">
        <SphereGeometry :radius="radius" />
        <PhongMaterial ref="material"/>
    </InstancedMesh>
</template>
        