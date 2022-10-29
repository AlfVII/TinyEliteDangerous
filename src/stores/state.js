import { defineStore } from 'pinia'
import { ref, watch, computed  } from 'vue'

export const useStateStore = defineStore("state", () => {
    const starData = ref([])
    const scene = ref(null)
    const renderer = ref(null)
    const camera = ref(null)
    const spaceshipStatus = ref("drifting")
    const rotationVector = ref([0, 0])
    const relativeVelocity = ref(0)
    const getRenderer = computed(() => {
        return renderer
    })
    const getScene = computed(() => {
        return scene
    })
    const getCamera = computed(() => {
        return camera
    })
    const getSpaceshipStatus = computed(() => {
        return spaceshipStatus
    })
    const getRotationVector = computed(() => {
        return rotationVector
    })
    const getStarData = computed(() => {
        return starData
    })
    function setRenderer(renderer) {
        this.renderer = renderer
    }
    function setScene(scene) {
        this.scene = scene
    }
    function setCamera(camera) {
        this.camera = camera
    }
    function setStarData(starData) {
        this.starData = starData
    }
    function setSpaceshipStatus(spaceshipStatus) {
        this.spaceshipStatus = spaceshipStatus
    }
    function setSpaceshipStatusText(spaceshipStatus) {
        this.spaceshipStatus = spaceshipStatus
    }
    function setRotationVector(rotationVector) {
        this.rotationVector = rotationVector
    }
    function setRotationVectorJoystick(rotationVector) {
        this.rotationVector = rotationVector
    }
    return {
        starData,
        getRenderer,
        setRenderer,
        getScene,
        setScene,
        getCamera,
        setCamera,
        getStarData,
        setStarData,
        getSpaceshipStatus,
        setSpaceshipStatus,
        setSpaceshipStatusText,
        getRotationVector,
        setRotationVector,
        setRotationVectorJoystick,
    }
})
