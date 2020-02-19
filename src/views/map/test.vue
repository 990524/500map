<template>
  <div ref="map" id="map" style="height: 100px;width: 100px" />
</template>

<script>
import { Scene } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

export default {
  name: 'Test',
  created() {
    console.log(2333)
    this.$nextTick(this.createScene)
  },
  methods: {
    async createScene() {
      this.scene = new Scene({
        id: this.$refs.map,
        map: new GaodeMap({
          style: 'light',
          zoom: 4.5,
          center: [107.796, 34.677],
          pitch: 20,
          plugin: []
        })
      })

      return new Promise(resolve => this.scene.on('loaded', () => ((this.AMap = window.AMap) && resolve())))
    }
  }
}
</script>

<style scoped>

</style>
