<template>
  <div class="main">
    <div id="map" class="map"></div>

    <div class="sidebar">
      <Tabs class="tabs">
        <TabPane label="底图切换">
          <make-selectable class="selectable-item" v-for="selectable in selectableLayers.base" :key="selectable.id">
            <Card dis-hover :bordered="false" :padding="0" class="card">
              <img ondragstart="return false" :src="selectable.img">
              <div class="divider"></div>
              <h3>{{ selectable.label }}</h3>
            </Card>
          </make-selectable>
        </TabPane>
        <TabPane label="图层控制">
          <Menu style="width: 100%;">
            <div v-for="(layer, index) in selectableLayers.base" :key="index">
              <MenuGroup :title="layer.label" v-if="layer.children">
                <MenuItem :name="child.id" v-for="child in layer.children" :key="child.id">{{ child.label }}</MenuItem>
              </MenuGroup>
              <MenuItem :name="layer.id" v-else>{{ layer.label }}</MenuItem>
            </div>
          </Menu>
        </TabPane>
      </Tabs>
    </div>

    <div class="toolbar">
      toolbar
    </div>
  </div>
</template>

<script>
import AMapLoader from '../components/AMapLoader'
import MakeSelectable from '../components/MakeSelectable'

export default {
  name: 'Map',
  components: { MakeSelectable },
  data () {
    return {
      // 高德底图初始化对象
      AMapInstance: null,

      // 地图实例
      map: null,

      // 可选图层列表
      selectableLayers: {
        // 底图
        base: [
          {
            id: 1,
            label: '标准图层',
            img: '/static/standardLayer.png',
            visible: false,
            layerInstance: null
          },
          {
            id: 2,
            label: '卫星图层',
            img: '/static/satelliteLayer.png',
            visible: false,
            layerInstance: null
          },
          {
            id: 3,
            label: '路网图层',
            img: '/static/satelliteRouteLayer.png',
            visible: false,
            layerInstance: null
          },
          {
            id: 4,
            label: '楼块图层',
            img: '/static/floorFastLayer.png',
            visible: false,
            layerInstance: null
          }
        ],
        // 扩展图层
        extends: []
      }
    }
  },
  async beforeRouteEnter (from, to, next) {
    const instance = await AMapLoader()
    next(vm => (vm.AMapInstance = instance))
  },
  created () {
    this.$nextTick(() => {
      this.renderMap()
    })
  },
  methods: {
    renderMap () {
      this.map = new this.AMapInstance.Map('map')
    },
    renderRandomGeoJsonLayer () {
      // 随机渲染GeoJson图层
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
    height: 100%;

    .amap-logo, .amap-copyright {
      display: none !important;
    }
  }

  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 380px;
    background: white;
    display: flex;
    align-items: center;
    box-shadow: 5px 0 5px -5px #888888;

    .tabs {
      height: 100%;
      width: 100%;
      padding: 5px;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 3px;     /*高宽分别对应横竖滚动条的尺寸*/
        height: 1px;
      }
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        background: #c2d7f0;
      }
      &::-webkit-scrollbar-track {
        border-radius: 10px;
      }

      .selectable-item {
        text-align: center;
        box-shadow: 0 0 2px 1px #cccccc;

        &:not(:last-of-type) {
          margin-bottom: 10px;
        }

        .card {
          .divider {
            margin: 6px auto;
            height: 1px;
            width: 80%;
            border-bottom: 1px solid #f1f1f1;
          }

          img {
            height: 200px;
            width: 100%
          }

          img:after {
            position: absolute;
            width: 100%;
            height: 201px;
            content: "";
            display: block;
            top: 0;
            left: 0;
            background: #ededed;
            background-size: 100%;
          }
        }
      }

      .ivu-tabs-nav {
        width: 100% !important;
      }

      .ivu-tabs-tab {
        text-align: center;
        margin-right: 0;
        width: 50%;
      }
    }
  }

  .toolbar {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 300px;
    height: 40px;
    background: white;
    border-radius: 5px;
    padding: 3px;
    border: 1px solid #b9beff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
