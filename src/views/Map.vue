<template>
  <div class="main">
    <div id="map" class="map"></div>

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

    <div class="toolbar">
      toolbar
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
            },
            {
              label: '路网图层',
              name: 'satelliteRoute',
              img: '/static/satelliteRouteLayer.png',
              visible: false,
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer.RoadNet()
              }
            },
            {
              label: '实时交通图层',
              name: 'floorFast',
              img: '/static/floorFastLayer.png',
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer.Traffic()
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
  watch: {
  },
  async beforeRouteEnter (from, to, next) {
    // 加载高德地图API
    const instance = await AMapLoader()
    next(vm => (vm.AMap = instance))
  },
  created () {
    this.$nextTick(() => {
      this.renderMap()

      // 动态注册监听器（需要在调用 $nextTick 后注册,防止AMap加载失败）
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
    })
  },
  methods: {
    renderMap () {
      // 初始化地图
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
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  width: 100%;
  position: relative;

  .map {
    height: 100%;

    &::v-deep .amap-logo,&::v-deep .amap-copyright {
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
