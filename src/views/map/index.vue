<template>
  <div ref="main" class="main">
    <div class="sidebar">
      <div class="content">
        <transition name="sidebar">
          <Tabs v-if="showTabBar" v-model="tab" class="tabs">
            <TabPane label="底图切换" name="base">
              <div class="content">
                <make-selectable
                  v-for="{ name, label, img } in baseLayers"
                  :key="name"
                  :selected="selectedBaseLayerNames.includes(name)"
                  class="selectable-item"
                  @click.native="selectedBaseLayerNames = [name]"
                >
                  <Card dis-hover :bordered="false" :padding="0" class="card">
                    <img ondragstart="return false" :src="img">
                    <div class="divider" />
                    <h3>{{ label }}</h3>
                  </Card>
                </make-selectable>
              </div>
            </TabPane>
            <TabPane label="图层控制" name="overlay">
              <layer-list
                v-model="selectedOverLayerNames"
                :items="overLayers"
                :loadings="loadingLayerNames"
              />
            </TabPane>
          </Tabs>
        </transition>

        <div class="shrink" @click="showTabBar = !showTabBar">
          <Icon v-if="showTabBar" type="ios-arrow-back" />
          <Icon v-else type="ios-arrow-forward" />
        </div>
      </div>
    </div>

    <div id="map" class="map" />

    <div class="toolbar">
      <div class="item" @click="handleZoomIn">
        <Icon type="md-add" />
      </div>
      <div class="item" @click="handleZoomOut">
        <Icon class="item" type="md-remove" />
      </div>
      <div class="item">
        <Poptip title="POI搜索" placement="bottom">
          <Icon class="item" type="md-search" />
          <div slot="content" class="address-search">
            <i-input v-model="poiSearchString" placeholder="请输入地址" class="input" />
            <Button type="primary" @click="handleSearchAddress">确认</Button>
          </div>
        </Poptip>
      </div>
      <div class="item" @click="handleToggleMapFullScreen">
        <Icon class="item" type="md-qr-scanner" />
      </div>
    </div>

    <transition name="dialog">
      <div v-if="dialogVisible" class="dialog">
        <Card :bordered="false">
          <p slot="title" class="title">
            <span>{{ dialog.properties.name }}</span>
            <span class="close" @click="dialogVisible = false">
              <Icon type="ios-close-circle-outline" />
            </span>
          </p>
          <div class="statistics">
            <div class="counts">
              <div class="confirmed">
                <div class="count">
                  <span class="value">{{ dialog.epidemic.confirmedCount }}</span>
                  <span class="unit">例</span>
                </div>
                <div class="title">确诊</div>
              </div>
              <div class="suspected">
                <div class="count">
                  <span class="value">{{ dialog.epidemic.suspectedCount }}</span>
                  <span class="unit">例</span>
                </div>
                <div class="title">疑似</div>
              </div>
              <div class="cured">
                <div class="count">
                  <span class="value">{{ dialog.epidemic.curedCount }}</span>
                  <span class="unit">例</span>
                </div>
                <div class="title">治愈</div>
              </div>
              <div class="dead">
                <div class="count">
                  <span class="value">{{ dialog.epidemic.deadCount }}</span>
                  <span class="unit">例</span>
                </div>
                <div class="title">死亡</div>
              </div>
            </div>
            <p class="time">最后更新:{{ dialog.epidemic.updateTime | updateTime }}</p>
          </div>
        </Card>
      </div>
    </transition>
  </div>
</template>

<script>
import { Scene } from '@antv/l7'
import center from '@turf/center'
import AMapLoader from './components/AMapLoader'
import MakeSelectable from './components/MakeSelectable'
import axios from 'axios'
import LayerList from './components/LayerList'
import provincesOfCountryGeoJson from './provincesOfCountry'
import _ from 'lodash'

// 可选图层公用网关操作接口
class CGI {
  constructor(show, hide) {
    if (typeof show !== 'function' || typeof hide !== 'function') {
      throw new Error('CGI error: Invalid type')
    }

    this.show = show
    this.hide = hide
  }
}

export default {
  name: 'Map',
  filters: {
    updateTime(number) {
      const transform = (timestamp, format = 'Y/M/D h:m:s') => {
        const formatNumber = (n) => {
          n = n.toString()
          return n[1] ? n : '0' + n
        }

        var formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
        var returnArr = []

        var date = new Date(number)
        returnArr.push(date.getFullYear())
        returnArr.push(formatNumber(date.getMonth() + 1))
        returnArr.push(formatNumber(date.getDate()))

        returnArr.push(formatNumber(date.getHours()))
        returnArr.push(formatNumber(date.getMinutes()))
        returnArr.push(formatNumber(date.getSeconds()))

        for (var i in returnArr) {
          format = format.replace(formateArr[i], returnArr[i])
        }
        return format
      }

      return transform(number)
    }
  },
  components: { LayerList, MakeSelectable },
  data() {
    return {
      AMap: null, // 高德底图初始化对象
      scene: null, // L7
      tab: 'overlay',
      showTabBar: true,
      baseLayers: [
        {
          label: '标准图层',
          name: 'standard',
          img: '/static/standardLayer.png',
          loading: false,
          CGI: null,
          layerCreater: () => {
            const layer = new this.AMap.TileLayer()

            layer.setMap(this.scene.map)

            return new CGI(() => layer.show(), () => layer.hide())
          }
        },
        {
          label: '卫星图层',
          name: 'satellite',
          img: '/static/satelliteLayer.png',
          loading: false, // 加载中提示
          CGI: null,
          layerCreater: () => {
            const layer = new this.AMap.TileLayer.Satellite()

            layer.setMap(this.scene.map)

            return new CGI(() => layer.show(), () => layer.hide())
          }
        }
      ],
      overLayers: [
        {
          label: '新冠肺炎疫情地图演示',
          name: 'epidemic',
          CGI: null,
          layerCreater: async() => {
            this.loadingLayerNames.push('epidemic')

            let results

            try {
              /** @see https://lab.isaaclin.cn/nCoV/zh 数据API */
              const { data } = await axios.get(`https://lab.isaaclin.cn/nCoV/api/area?latest=1`)
              results = data.results
            } catch (e) {
              this.$Message.error('疫情数据请求失败')
            }

            let geoJson

            try {
              const { data } = await axios.get(`https://geo.datav.aliyun.com/areas/bound/100000_full.json`)
              geoJson = data
            } catch (e) {
              geoJson = provincesOfCountryGeoJson
            }

            // 渲染面图层
            const polygon = this.scene.PolygonLayer().source(geoJson)
              .color('adcode', (adcode) => {
                const confirmedCount = (_.find(results, { locationId: adcode }) || {}).confirmedCount

                switch (true) {
                  case confirmedCount === 0 : return '#f5f5f5'
                  case confirmedCount <= 9 : return '#fbeed3'
                  case confirmedCount <= 99 : return '#f2a88c'
                  case confirmedCount <= 499 : return '#e26554'
                  case confirmedCount <= 1000 : return '#c92f31'
                  case confirmedCount > 1000 : return '#76161b'
                  default : return 'white'
                }
              })
              .shape('fill')
              .on('click', (props) => {
                polygon.setActive(props.featureId, '#f7ffb0')
                this.dialog = {
                  properties: props.feature.properties,
                  epidemic: _.find(results, { locationId: props.feature.properties.adcode })
                }
                this.dialogVisible = true
              })
              .render()

            // 渲染线图层
            const line = this.scene.PolygonLayer({ zIndex: 100 })
              .source(geoJson)
              .shape('line')
              .color('white')
              .size(20)
              .render()

            // 计算多边形面中心点
            const centerPointCollect = geoJson.features.map(feature => {
              const [lng, lat] = center(feature).geometry.coordinates
              return { name: feature.properties.name, lng, lat }
            })

            // 绘制地名图层
            const text = this.scene.PointLayer({ zIndex: 2 })
              .source(centerPointCollect, {
                parser: {
                  type: 'json',
                  x: 'lng',
                  y: 'lat'
                }
              })
              .shape('name', 'text')
              .active(true)
              .size(12)
              .color('#fff')
              .style({
                // fontFamily: 'Monaco, monospace', // 字体
                fontWeight: 200,
                textAnchor: 'center', // 文本相对锚点的位置 center|left|right|top|bottom|top-left
                textOffset: [0, 0], // 文本相对锚点的偏移量 [水平, 垂直]
                spacing: 2, // 字符间距
                padding: [4, 4], // 文本包围盒 padding [水平，垂直]，影响碰撞检测结果，避免相邻文本靠的太近
                strokeColor: 'white', // 描边颜色
                strokeWidth: 2, // 描边宽度
                strokeOpacity: 1.0
              })
              .render()

            this.loadingLayerNames.splice(this.loadingLayerNames.indexOf('epidemic'))

            return new CGI(
              () => {
                polygon.show()
                line.show()
                text.show()
              },
              () => {
                polygon.hide()
                line.hide()
                text.hide()
              }
            )
          }
        },
        {
          label: '分类A',
          children: [
            {
              label: 'GeoJson图层',
              name: 'geoJson',
              CGI: null,
              layerCreater: async() => {
                this.loadingLayerNames.push('geoJson')

                const { data: geoJSON } = await axios.get('https://a.amap.com/jsapi_demos/static/geojson/chongqing.json')

                const layer = new this.AMap.GeoJSON({
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

                layer.setMap(this.scene.map)

                this.loadingLayerNames.splice(this.loadingLayerNames.indexOf('geoJson'))

                return new CGI(() => layer.show(), () => layer.hide())
              }
            }
          ]
        },
        {
          label: '楼块图层',
          name: 'buildings',
          CGI: null,
          layerCreater: () => {
            this.loadingLayerNames.push('buildings')

            const layer = new this.AMap.Buildings()

            layer.setMap(this.scene.map)

            this.loadingLayerNames.splice(this.loadingLayerNames.indexOf('buildings'))

            return new CGI(() => layer.show(), () => layer.hide())
          }
        },
        {
          label: '北美洲WMTS图层',
          name: 'NorthAmericaWMTS',
          CGI: null,
          layerCreater: () => {
            this.loadingLayerNames.push('NorthAmericaWMTS')

            const layer = new this.AMap.TileLayer.WMTS({
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

            layer.setMap(this.scene.map)

            this.loadingLayerNames.splice(this.loadingLayerNames.indexOf('NorthAmericaWMTS'))

            return new CGI(() => layer.show(), () => layer.hide())
          }
        },
        {
          label: '分类B',
          children: [
            {
              label: '全国行政区图层',
              name: 'citys',
              CGI: null,
              layerCreater: async() => {
                this.loadingLayerNames.push('citys')

                const { data: geoJSON } = await axios.get('https://gw.alipayobjects.com/os/rmsportal/JToMOWvicvJOISZFCkEI.json')

                const layer = new this.AMap.GeoJSON({
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
                      fillColor:
                        colors[Math.floor(Math.random() * colors.length)]
                    })
                  }
                })

                layer.setMap(this.scene.map)

                this.loadingLayerNames.splice(this.loadingLayerNames.indexOf('citys'))

                return new CGI(() => layer.show(), () => layer.hide())
              }
            }
          ]
        }
      ],
      loadingLayerNames: [],
      selectedBaseLayerNames: ['satellite'],
      selectedOverLayerNames: [],
      selectedProvinceName: null,
      dialogVisible: false,
      dialog: {},

      // todo
      poiSearchString: ''
    }
  },
  async beforeRouteEnter(from, to, next) {
    // 加载高德地图API
    const AMap = await AMapLoader()
    next(vm => (vm.AMap = AMap))
  },
  created() {
    this.$nextTick(async() => {
      await this.createScene()
      this.registerLayerToggleListener()
      this.addMapControls()
    })
  },
  methods: {
    async createScene() {
      const map = new this.AMap.Map('map', {
        viewMode: '3D',
        center: [107.796, 34.677],
        zoom: 4.5,
        pitch: 0
      })

      // 移除默认图层(消耗资源,优化性能)
      map.remove(map.getLayers())

      this.scene = new Scene({
        map,
        zoomControl: false,
        scaleControl: false,
        attributionControl: false
      })

      return new Promise(resolve => this.scene.on('loaded', resolve))
    },
    registerLayerToggleListener() {
      // 批量切换图层实例显示状态
      const toggleLayersVisible = async(layers, selected) => {
        for (const layer of layers) {
          if (selected.includes(layer.name)) {
            // 第一次展示时调用图层创建方法，后续直接调用图层实例显隐
            if (!layer.CGI) {
              layer.CGI = await layer.layerCreater()
            }
            layer.CGI.show()
          } else {
            layer.CGI && layer.CGI.hide()
          }
        }
      }

      // 平铺图层
      const flattenLayers = (layers, all = []) => {
        for (const layer of layers) {
          all.push(layer) && layer.children && flattenLayers(layer.children, all)
        }

        return all
      }

      // 注册地图与叠加图层的切换监听器，进行同步图层切换
      this.$watch('selectedBaseLayerNames', v => toggleLayersVisible(flattenLayers(this.baseLayers), v), { immediate: true, deep: true })
      this.$watch('selectedOverLayerNames', v => toggleLayersVisible(flattenLayers(this.overLayers), v), { immediate: true, deep: true })
    },
    /**
     * 添加地图插件
     * @see https://lbs.amap.com/api/javascript-api/reference/map-control/#control-bar
     */
    addMapControls() {
      // 比例尺插件
      this.scene.map.addControl(new this.AMap.Scale({ position: 'RB' }))
      // 组合了旋转、倾斜、复位、缩放在内的地图控件
      this.scene.map.addControl(new this.AMap.ControlBar({ showZoomBar: false }))
    },
    handleZoomIn() {
      this.scene.map.zoomIn()
    },
    handleZoomOut() {
      this.scene.map.zoomOut()
    },
    handleToggleMapFullScreen() {
      const isFullScreen =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement

      if (isFullScreen) {
        const cancelMethods = [
          'exitFullscreen',
          'msExitFullscreen',
          'mozCancelFullScreen',
          'webkitExitFullscreen'
        ]

        for (const method of cancelMethods) {
          if (document[method]) return document[method]()
        }
      } else {
        const requestMethods = [
          'requestFullscreen',
          'msRequestFullscreen',
          'mozRequestFullScreen',
          'webkitRequestFullscreen'
        ]

        const targetElement = this.$refs.main

        for (const method of requestMethods) {
          // eslint-disable-next-line no-useless-call
          if (targetElement[method]) { return targetElement[method].call(targetElement) }
        }
      }
    },
    handleSearchAddress() {
      const geocoder = new this.AMap.Geocoder()

      geocoder.getLocation(this.poiSearchString, (status, result) => {
        console.log('result')
        console.log(result)

        if (status === 'complete' && result.info === 'OK') {
          console.log(233333)
          console.log(this.scene.map.getZoom())
          // const zoomLevelMap = {
          //   '国家':
          // }

          // result中对应详细地理坐标信息
          const { lng, lat } = result.geocodes[0].location

          this.scene.map.panTo(new this.AMap.LngLat(lng, lat))
        } else {
          this.$Message.warning('暂无该地址信息～')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarWidth: 380px;
.main {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;

  .sidebar {
    z-index: 10;
    height: 100%;

    .content {
      background: white;
      flex-shrink: 0;
      align-items: center;
      position: absolute;
      height: 100%;
      display: flex;
      box-shadow: 5px 0 5px -5px #888888;
      &::v-deep .tabs {
        height: 100%;
        width: $sidebarWidth;

        .ivu-tabs-bar {
          margin: 0;
        }

        .content {
          height: calc(100vh - 60px - 36px); // 60px导航栏 36px tabs选择
          margin-bottom: 36px;
          padding: 5px;
          display: block;
          overflow: auto;
          &::-webkit-scrollbar {
            width: 3px; /*高宽分别对应横竖滚动条的尺寸*/
            height: 1px;
          }
          &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
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
              width: 100%;
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
          width: $sidebarWidth / 2;
        }
      }

      .shrink {
        cursor: pointer;
        position: absolute;
        width: 14px;
        height: 80px;
        right: -14px;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        border-right: #cccccc 1px solid;
        border-top: #cccccc 1px solid;
        border-bottom: #cccccc 1px solid;
        border-bottom-right-radius: 10px;
        border-top-right-radius: 10px;
        &:hover {
          color: #2d8cf0;
        }
      }

      $slide: 100px;

      .sidebar-enter-active {
        transition: all 0.3s ease;
      }
      .sidebar-leave-active {
        transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
      }
      .sidebar-enter, .sidebar-leave-to
        /* .slide-fade-leave-active for below version 2.1.8 */ {
        transform: translateX(-$slide);
        opacity: 0;
        width: 0;
      }
    }
  }

  .map {
    z-index: 5;
    flex-shrink: 0;
    width: 100vw;
    height: 100%;

    &::v-deep .amap-logo,
    &::v-deep .amap-copyright {
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
      &:hover .ivu-icon {
        color: #2d8cf0;
      }

      &:not(:last-of-type):after {
        content: "";
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

  .dialog {
    position: absolute;
    z-index: 15;
    right: 55px;
    background: #ececec;
    width: 350px;
    padding: 5px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .close {
        cursor: pointer;
        &:hover {
          color: #2d8cf0;
        }
      }
    }

    .statistics {
      .counts {
        display: flex;
        justify-content: space-around;
        align-items: center;
        & > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          .count {
            font-weight: bold;
            .value {
              font-size: 1.3rem;
              color: #2d8cf0;
            }
            .unit {
              font-size: .5rem;
            }
          }
          .title {
            font-size: .7rem;
          }
        }
      }

      .time {
        text-align: center;
      }
    }
  }

  .dialog-enter-active {
    transition: all 0.3s ease;
  }
  .dialog-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .dialog-enter, .dialog-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
    transform: translateX(50px);
    opacity: 0;
  }
}
</style>
