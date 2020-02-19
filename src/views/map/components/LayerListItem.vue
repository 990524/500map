<template>
  <div class="set">
    <div :class="['control', item.children ? 'category' : 'item']">
      <div class="title">
        <div class="down-icon" :class="{show: !!item.children}" @click="showExpand = !showExpand">
          <Icon v-show="showExpand" type="ios-arrow-down" />
          <Icon v-show="!showExpand" type="ios-arrow-forward" />
        </div>
        <div v-if="item.children" class="dir-icon">
          <Icon v-if="showExpand" type="ios-folder-open" />
          <Icon v-else type="ios-folder" />
        </div>
        <span>{{ item.label }}</span>
      </div>

      <div class="icon" @click="handleToggleSelect(item)">
        <Spin v-if="(loadings || []).includes(item.name)" fix style="left: -10px;"></Spin>
        <Icon v-else-if="selected" type="md-eye" class="on" />
        <Icon v-else type="md-eye-off" class="off" />
      </div>
    </div>
    <transition>
      <div v-if="item.children" v-show="showExpand" class="children">
        <layer-list-item v-for="child in item.children" :key="child.name" :all-selected="allSelected" :item="child" v-on="$listeners" />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'LayerListItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    loadings: Array,
    allSelected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showExpand: false
    }
  },
  computed: {
    selected() {
      let selected = this.allSelected.includes(this.item.name)

      if (this.item.children) {
        const listAllChildren = (children, list = []) => {
          for (const child of children) {
            list.push(child) && child.children && listAllChildren(child.children, list)
          }

          return list
        }

        const names = listAllChildren(this.item.children).map(item => (item.name))

        selected = true

        for (const name of names) {
          if (!this.allSelected.includes(name)) {
            selected = false
            break
          }
        }
      }

      return selected
    }
  },
  methods: {
    handleToggleSelect(item) {
      this.$emit('toggle', item)
    }
  }
}
</script>

<style lang="scss" scoped>
$border: 1px solid #ececec;

.set {
  .control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;border-bottom: $border;
    &:hover {
      background: #f7f7f7;
      color: #2d8cf0;
    }
    &.item {
      height: 45px;
    }
    &.category {
      height: 35px;
      color: #b4b4b4;
    }
    .title {
      display: flex;
      align-items: center;
      .down-icon,  .dir-icon {
        display: flex;
        align-items: center;
      }
      .down-icon {
        font-size: 1.2rem;
        cursor: pointer;
        display: none;
        &.show {
          display: inline-block;
        }
      }
      .dir-icon {
        margin-right: 5px;
      }
    }
    .icon {
      cursor: pointer;
      font-size: 1.2rem;
      position: relative;
      .on {
        color: #2d8cf0;
      }
      .off {
        color: #cccccc;
      }
    }
  }
  .children {
    .set {
      .control {
        padding-left: 30px;
      }
    }
  }
}
</style>

<style scoped>

</style>
