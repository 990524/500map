<template>
  <div ref="main" class="main">
    <div class="sidebar">
      <Tabs class="tabs">
        <TabPane label="底图切换">
          <div class="content">
            <make-selectable
              v-for="{ name, label, img } in selectableLayers.base.options"
              :key="name"
              @click.native="selectableLayers.base.selected = [name]"
              :selected="selectableLayers.base.selected.includes(name)"
              class="selectable-item"
            >
              <Card dis-hover :bordered="false" :padding="0" class="card">
                <img ondragstart="return false" :src="img">
                <div class="divider"></div>
                <h3>{{ label }}</h3>
              </Card>
            </make-selectable>
          </div>
        </TabPane>
        <TabPane label="图层控制">
          <Menu style="width: 100%;">
            <div v-for="(layer, index) in selectableLayers.base.options" :key="index">
              <MenuGroup :title="layer.label" v-if="layer.children">
                <MenuItem :name="child.name" v-for="child in layer.children" :key="child.id">{{ child.label }}</MenuItem>
              </MenuGroup>
              <MenuItem :name="layer.name" v-else>{{ layer.label }}</MenuItem>
            </div>
          </Menu>
        </TabPane>
      </Tabs>
    </div>

    <div id="map" class="map"></div>

    <div class="toolbar">
      <div class="item" @click="handleZoomIn">
        <Icon type="md-add" />
      </div>
      <div class="item" @click="handleZoomOut">
        <Icon class="item" type="md-remove" />
      </div>
      <div class="item">
        <Icon class="item" type="md-search" />
      </div>
      <div class="item" @click="handleToggleMapFullScreen">
        <Icon class="item" type="md-qr-scanner" />
      </div>
    </div>
  </div>
</template>

<script>
import AMapLoader from '../components/AMapLoader'
import MakeSelectable from '../components/MakeSelectable'
import _ from 'lodash'

export default {
  name: 'Map',
  components: { MakeSelectable },
  data () {
    return {
      // 高德底图初始化对象
      AMap: null,

      // 地图实例
      map: null,

      // 可选图层列表
      selectableLayers: {
        // 底图
        base: {
          // 已选择
          selected: ['satellite'],
          // 选项列表
          options: [
            {
              label: '标准图层',
              name: 'standard',
              img: '/static/standardLayer.png',
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer()
              }
            },
            {
              label: '卫星图层',
              name: 'satellite',
              img: '/static/satelliteLayer.png',
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer.Satellite()
              }
            }
          ],
          layerGroup: null
        },
        // 扩展图层
        extends: {
          selected: [],
          options: [],
          layerGroup: null
        }
      }
    }
  },
  async beforeRouteEnter (from, to, next) {
    // 加载高德地图API
    const instance = await AMapLoader()
    next(vm => (vm.AMap = instance))
  },
  created () {
    this.$nextTick(() => {
      this.initMap()
      this.registerLayerToggleListener()
      this.addMapControls()
    })
  },
  methods: {
    initMap () {
      this.map = new this.AMap.Map('map', {
        viewMode: '3D',
        pitch: 0,
        layers: []
      })

      // 移除默认图层(消耗资源)
      this.map.remove(this.map.getLayers())

      this.selectableLayers.base.layerGroup = new this.AMap.LayerGroup([])
      this.selectableLayers.extends.layerGroup = new this.AMap.LayerGroup([])

      // 图层组必须使用 setMap 方法注入地图
      this.selectableLayers.base.layerGroup.setMap(this.map)
      this.selectableLayers.extends.layerGroup.setMap(this.map)
    },
    registerLayerToggleListener () {
      // 注册底图切换监听器
      this.$watch('selectableLayers.base.selected', (selected) => {
        // 所选图层实例数组
        const layers = selected.reduce((res, name) => {
          let { layerInstance, generateLayer } = _.find(this.selectableLayers.base.options, { name }) || {}
          return [...res, layerInstance || generateLayer(this.AMap)]
        }, [])

        // 添加图层至地图
        this.selectableLayers.base.layerGroup.addLayers(layers)

        this.selectableLayers.base.layerGroup.eachLayer(layer => {
          // 对其他图层隐藏操作
          _.findIndex(layers, { CLASS_NAME: layer.CLASS_NAME }) !== -1
            ? layer.show()
            : layer.hide()
        })
      }, {
        immediate: true,
        deep: true
      })
    },
    addMapControls () {
      // 比例尺插件
      this.map.addControl(new this.AMap.Scale())
      this.map.addControl(new this.AMap.ControlBar({ showZoomBar: false }))
    },
    handleZoomIn () {
      this.map.zoomIn()
    },
    handleZoomOut () {
      this.map.zoomOut()
    },
    handleToggleMapFullScreen () {
      const isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement

      if (!isFullScreen) {
        const targetElement = this.$refs.main

        const request = targetElement.requestFullscreen || targetElement.msRequestFullscreen || targetElement.mozRequestFullScreen || targetElement.webkitRequestFullscreen

        request.call(targetElement)
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;

  .sidebar {
    z-index: 10;
    flex-shrink: 0;
    height: 100%;
    width: 380px;
    background: white;
    display: flex;
    align-items: center;
    box-shadow: 5px 0 5px -5px #888888;

    &::v-deep .tabs {
      height: 100%;
      width: 100%;

      .ivu-tabs-bar {
        margin: 0;
      }

      .content {
        height: calc(100vh - 60px - 36px);  // 60px导航栏 36px tabs选择
        margin-bottom: 36px;
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

  .map {
    z-index: 5;
    flex-shrink: 0;
    width: calc(100vw - 380px);
    height: 100%;

    &::v-deep .amap-logo,&::v-deep .amap-copyright {
      display: none !important;
    }
  }

  .toolbar {
    z-index: 15;
    position: absolute;
    right: 125px;
    top: calc(65px - 40px / 2);
    height: 40px;
    background: #fafafa;
    border-radius: 15px;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 5px 0 #888888;
    padding: 0 10px;
    .item {
      font-size: 2rem;
      padding: 0 6px;
      cursor: pointer;
      position: relative;
      &:hover .ivu-icon{
        color: #4879ff;
      }

      &:not(:last-of-type):after {
        content: '';
        position: absolute;
        right: 0;
        top: 10px;
        width: 1px;
        height: 60%;
        border-right: 1px solid #cccccc;
      }
    }
  }
}
</style>
