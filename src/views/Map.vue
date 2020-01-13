<template>
  <div class="main">
    <div id="map" class="map"></div>

    <div class="sidebar">
      <Tree :data="data" :render="renderContent"></Tree>
    </div>

    <div class="toolbar">
      toolbar
    </div>
  </div>
</template>

<script>
import { Scene } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

export default {
  name: 'Map',
  data () {
    return {
      scene: null,
      data_: [
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
      ],
      data: [
        {
          title: 'parent 1',
          expand: true,
          render: (h, { root, node, data }) => {
            return h('span', {
              style: {
                display: 'inline-block',
                width: '100%'
              }
            }, [
              h('span', [
                h('Icon', {
                  props: {
                    type: 'ios-folder-outline'
                  },
                  style: {
                    marginRight: '8px'
                  }
                }),
                h('span', data.title)
              ]),
              h('span', {
                style: {
                  display: 'inline-block',
                  float: 'right',
                  marginRight: '32px'
                }
              }, [
                h('Button', {
                  props: Object.assign({}, this.buttonProps, {
                    icon: 'ios-add',
                    type: 'primary'
                  }),
                  style: {
                    width: '64px'
                  },
                  on: {
                    click: () => { this.append(data) }
                  }
                })
              ])
            ])
          },
          children: [
            {
              title: 'child 1-1',
              expand: true,
              children: [
                {
                  title: 'leaf 1-1-1',
                  expand: true
                },
                {
                  title: 'leaf 1-1-2',
                  expand: true
                }
              ]
            },
            {
              title: 'child 1-2',
              expand: true,
              children: [
                {
                  title: 'leaf 1-2-1',
                  expand: true
                },
                {
                  title: 'leaf 1-2-1',
                  expand: true
                }
              ]
            }
          ]
        }
      ],
      buttonProps: {
        type: 'default',
        size: 'small'
      }
    }
  },
  // TODO 能不能从L7拿到AMap未初始化的实例
  created () {
    this.$nextTick(() => {
      this.createScene()
    })
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
          token: process.env.VUE_APP_AMAP_TOKEN
        })
      })
    },
    renderRandomGeoJsonLayer () {
      // 随机渲染GeoJson图层
    },
    /**
     * 自定义节点内容
     *
     * @param h
     * @param root 树的根节点
     * @param node 当前节点
     * @param data 当前节点数据
     * @returns {*}
     */
    renderContent (h, { root, node, data }) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', [
          h('Icon', {
            props: {
              type: 'ios-paper-outline'
            },
            style: {
              marginRight: '8px'
            }
          }),
          h('span', data.title)
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right',
            marginRight: '32px'
          }
        }, [
          h('Button', {
            props: Object.assign({}, this.buttonProps, {
              icon: 'ios-add'
            }),
            style: {
              marginRight: '8px'
            },
            on: {
              click: () => { this.append(data) }
            }
          }),
          h('Button', {
            props: Object.assign({}, this.buttonProps, {
              icon: 'ios-remove'
            }),
            on: {
              click: () => { this.remove(root, node, data) }
            }
          })
        ])
      ])
    },
    append (data) {
      const children = data.children || []
      children.push({
        title: 'appended node',
        expand: true
      })
      this.$set(data, 'children', children)
    },
    remove (root, node, data) {
      const parentKey = root.find(el => el === node).parent
      const parent = root.find(el => el.nodeKey === parentKey).node
      const index = parent.children.indexOf(data)
      parent.children.splice(index, 1)
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
    background: white;
    .menu {
      width: 100% !important;
      height: 100%;
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
