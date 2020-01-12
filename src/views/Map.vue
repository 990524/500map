<template>
  <div class="main">
    <div id="map" class="map"></div>

    <div class="sidebar">
      <Tree :data="data" show-checkbox></Tree>
    </div>
  </div>
</template>

<script>
import { Scene } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

export default {
  name: 'home',
  data () {
    return {
      scene: null,
      data: [
        {
          title: 'parent 1',
          expand: true,
          children: [
            {
              title: 'parent 1-1',
              expand: true,
              children: [
                {
                  title: 'leaf 1-1-1'
                },
                {
                  title: 'leaf 1-1-2'
                }
              ]
            },
            {
              title: 'parent 1-2',
              expand: true,
              children: [
                {
                  title: 'leaf 1-2-1'
                },
                {
                  title: 'leaf 1-2-1'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  created () {
    this.$nextTick(this.createScene)
  },
  methods: {
    createScene () {
      this.scene = new Scene({
        id: 'map',
        map: new GaodeMap({
          pitch: 0,
          style: 'light',
          center: [ 104.288144, 31.239692 ],
          zoom: 4.4,
          token: '28fcf20c127cd159a1737c647244254b'
        })
      })
    }
  }
}
</script>

<style lang="scss">
.main {
  height: 100%;
  width: 100%;
  position: relative;

  .map {
    .l7-ctrl-logo {
      display: none;  // 隐藏 AntV L7 logo
    }
  }

  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 400px;
    opacity: .5;
    background: white;
    .menu {
      width: 100% !important;
      height: 100%;
    }
  }
}
</style>
