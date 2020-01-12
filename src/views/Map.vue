<template>
  <div class="main">
    <div id="map" class="map"></div>

    <div class="sidebar">
      <Menu theme="light" class="menu" active-name="1">
        <MenuGroup title="内容管理">
          <MenuItem name="1">
            <Icon type="md-document" />
            文章管理
          </MenuItem>
          <MenuItem name="2">
            <Icon type="md-chatbubbles" />
            评论管理
          </MenuItem>
        </MenuGroup>
        <MenuGroup title="统计分析">
          <MenuItem name="3">
            <Icon type="md-heart" />
            用户留存
          </MenuItem>
          <MenuItem name="4">
            <Icon type="md-leaf" />
            流失用户
          </MenuItem>
        </MenuGroup>
      </Menu>
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
      scene: null
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
          pitch: 35.210526315789465,
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
    background: red;
    opacity: .5;
    .menu {
      width: 100% !important;
      height: 100%;
    }
  }
}
</style>
