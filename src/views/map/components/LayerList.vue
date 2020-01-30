<template>
  <div class="layer-list">
    <div v-for="item in items" :key="item.name">
      <layer-list-item @toggle="handleSelected" :item="item" :all-selected="selected"></layer-list-item>
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'

import LayerListItem from './LayerListItem'
export default {
  name: 'LayerList',
  components: { LayerListItem },
  props: {
    items: {
      type: Array,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      selected: this.value,
      showExpand: false
    }
  },
  watch: {
    selected: {
      deep: true,
      immediate: true,
      handler (selected) {
        this.$emit('input', selected)
      }
    }
  },
  methods: {
    handleSelected (item) {
      if (!item.children) {
        const findIndex = this.selected.indexOf(item.name)
        const has = findIndex > -1
        has ? this.selected.splice(findIndex, 1) : this.selected.push(item.name)
        return
      }

      const listAllChildren = (children, list = []) => {
        for (const child of children) {
          list.push(child) && child.children && listAllChildren(child.children, list)
        }

        return list
      }

      let allChildrenSelected = true

      const names = listAllChildren(item.children).map(item => (item.name))

      for (const name of names) {
        if (!this.selected.includes(name)) {
          allChildrenSelected = false
          break
        }
      }

      // 如果有未选中状态，切换全部子集为选中
      for (const name of names) {
        const index = this.selected.indexOf(name)
        const has = index > -1

        has && allChildrenSelected && this.selected.splice(index, 1)
        !has && !allChildrenSelected && this.selected.push(name)
      }
    }
  }
}
</script>
