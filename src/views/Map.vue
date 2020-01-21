<template>
  <div ref="main" class="main">
    <div class="sidebar">
      <Tabs class="tabs" v-model="tab">
        <TabPane label="底图切换" name="base">
          <div class="content">
            <make-selectable
              v-for="{ name, label, img } in baseSelectableLayerOptions"
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
        <TabPane label="图层控制" name="overlay">
          <layer-list :items="overlaySelectableLayerOptions" v-model="selectableLayers.overlay.selected"></layer-list>
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
        <Poptip title="兴趣点搜索" placement="bottom">
          <Icon class="item" type="md-search" />
          <div slot="content" class="address-search">
            <i-input v-model="addressSearch.location" placeholder="请输入地址" class="input"></i-input>
            <Button @click="handleSearchAddress" type="primary">确认</Button>
          </div>
        </Poptip>
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
import axios from 'axios'
import LayerList from '../components/LayerList'

export default {
  name: 'Map',
  components: { LayerList, MakeSelectable },
  data () {
    return {
      // 高德底图初始化对象
      AMap: null,

      // 地图实例
      map: null,

      tab: 'overlay',

      // 可选图层列表
      selectableLayers: {
        // 底图
        base: {
          // 已选择
          selected: ['satellite'],
          /**
           * 底图选项列表参数
           *
           * @param label 标注
           * @param name 唯一识别符
           * @param img 图片
           * @param zIndex 排序
           * @param loading 加载中提示
           * @param layerInstance 图层实例
           * @param generateLayer 图层生成器
           */
          options: [
            {
              label: '标准图层',
              name: 'standard',
              img: '/static/standardLayer.png',
              zIndex: 1,
              loading: false,
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer()
              }
            },
            {
              label: '卫星图层',
              name: 'satellite',
              img: '/static/satelliteLayer.png',
              zIndex: 2,
              loading: false, // 加载中提示
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer.Satellite()
              }
            }
          ]
        },
        // 叠加图层
        overlay: {
          selected: [],
          /**
           * 叠加图层选项列表参数
           *
           * category 分类项:
           * @param label 标注
           * @param children 子项目(item列表)
           *
           * item 选择项:
           * @param label 标注
           * @param name 唯一识别符
           * @param zIndex 排序
           * @param loading 加载中提示
           * @param layerInstance 图层实例
           * @param generateLayer 图层生成器
           */
          options: [
            {
              label: '分类A',
              children: [
                {
                  label: 'GeoJson图层',
                  name: 'geoJson',
                  layerInstance: null,
                  zIndex: 1,
                  generateLayer: async () => {
                    const { data: geoJSON } = await axios.get('https://a.amap.com/jsapi_demos/static/geojson/chongqing.json')

                    return new this.AMap.GeoJSON({
                      geoJSON,
                      zIndex: 5,
                      getPolygon: (geojson, lnglats) => {
                        return new this.AMap.Polygon({
                          path: lnglats,
                          strokeColor: 'white',
                          fillColor: 'red'
                        })
                      }
                    })
                  }
                }
              ]
            },
            {
              label: '楼块图层',
              name: 'buildings',
              zIndex: 2,
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.Buildings()
              }
            },
            {
              label: '北美洲WMTS图层',
              name: 'NorthAmericaWMTS',
              layerInstance: null,
              generateLayer: () => {
                return new this.AMap.TileLayer.WMTS({
                  url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
                  blend: false,
                  tileSize: 256,
                  params: {
                    Layer: '0',
                    Version: '1.0.0',
                    Format: 'image/png',
                    TileMatrixSet: 'EPSG:3857'
                  }
                })
              }
            },
            {
              label: '分类B',
              children: [
                {
                  label: '全国行政区图层',
                  name: 'citys',
                  layerInstance: null,
                  generateLayer: async () => {
                    const { data: geoJSON } = await axios.get('https://gw.alipayobjects.com/os/rmsportal/JToMOWvicvJOISZFCkEI.json')

                    return new this.AMap.GeoJSON({
                      geoJSON,
                      zIndex: 5,
                      getPolygon: (geojson, lnglats) => {
                        const colors = [
                          '#D7F9F0',
                          '#A6E1E0',
                          '#72BED6',
                          '#5B8FF9',
                          '#3474DB',
                          '#005CBE',
                          '#00419F',
                          '#00287E'
                        ]

                        return new this.AMap.Polygon({
                          path: lnglats,
                          strokeColor: 'white',
                          fillColor: colors[Math.floor(Math.random() * colors.length)]
                        })
                      }
                    })
                  }
                }
              ]
            }
          ]
        }
      },

      addressSearch: {
        location: ''
      }
    }
  },
  computed: {
    baseSelectableLayerOptions () {
      return _.sortBy(this.selectableLayers.base.options, 'zIndex')
    },
    overlaySelectableLayerOptions () {
      return _.sortBy(this.selectableLayers.overlay.options, 'zIndex')
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
        pitch: 0
      })

      // 移除默认图层(消耗资源,优化性能)
      this.map.remove(this.map.getLayers())
    },
    registerLayerToggleListener () {
      // 切换图层实例显示
      const layerToggleVisible = async (options, selected) => {
        for (const layer of options) {
          if (selected.includes(layer.name)) {
            if (!layer.layerInstance) {
              layer.layerInstance = await layer.generateLayer()
              layer.layerInstance.setMap(this.map)
            }
            layer.layerInstance.show()
          } else {
            layer.layerInstance && layer.layerInstance.hide()
          }
        }
      }

      const watchOptions = { immediate: true, deep: true }

      const listSelectableOptions = (options, list = []) => {
        for (const child of options) {
          list.push(child) && child.children && listSelectableOptions(child.children, list)
        }

        return list
      }

      // 注册图层切换监听器
      this.$watch(
        'selectableLayers.base.selected',
        selected => layerToggleVisible(listSelectableOptions(this.selectableLayers.base.options), selected),
        watchOptions
      )
      this.$watch(
        'selectableLayers.overlay.selected',
        selected => layerToggleVisible(listSelectableOptions(this.selectableLayers.overlay.options), selected),
        watchOptions
      )
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

      if (isFullScreen) {
        const cancelMethods = ['exitFullscreen', 'msExitFullscreen', 'mozCancelFullScreen', 'webkitExitFullscreen']

        for (const method of cancelMethods) {
          if (document[method]) return document[method]()
        }
      } else {
        const requestMethods = ['requestFullscreen', 'msRequestFullscreen', 'mozRequestFullScreen', 'webkitRequestFullscreen']

        const targetElement = this.$refs.main

        for (const method of requestMethods) {
          // eslint-disable-next-line no-useless-call
          if (targetElement[method]) return targetElement[method].call(targetElement)
        }
      }
    },
    handleSearchAddress () {
      const geocoder = new this.AMap.Geocoder()

      geocoder.getLocation(this.addressSearch.location, (status, result) => {
        console.log('result')
        console.log(result)

        if (status === 'complete' && result.info === 'OK') {
          console.log(233333)
          console.log(this.map.getZoom())
          // const zoomLevelMap = {
          //   '国家':
          // }

          // result中对应详细地理坐标信息
          const { lng, lat } = result.geocodes[0].location

          this.map.panTo(new this.AMap.LngLat(lng, lat))
        } else {
          this.$Message.warning('暂无该地址信息～')
        }
      })
    },

    handleA (item) {
      console.log(item)
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
        color: #2d8cf0;
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

      .address-search {
        width: 300px;
        display: flex;
        justify-content: space-between;
        .input {
          margin-right: 5px;
        }
      }
    }
  }
}
</style>
