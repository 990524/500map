<template>
  <div class="layout">
    <nav class="nav">
      <div class="logo">
        <span class="title">Map</span>
      </div>

      <div class="menu">
        <Menu mode="horizontal" theme="dark" :active-name="activeMenu">
          <MenuItem v-for="menu in menus" :key="menu.name" :name="menu.name" :to="menu.url">
            <Icon v-if="menu.iconType" :type="menu.iconType" />{{ menu.label }}
          </MenuItem>
        </Menu>
      </div>

      <div class="user">
        <Avatar class="avatar" icon="ios-person" size="large" />
      </div>
    </nav>

    <main class="view">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      theme: 'dark',
      menus: [
        {
          label: '地图管理',
          name: 'content',
          url: '/map',
          iconType: 'ios-paper'
        },
        {
          label: '用户管理',
          name: 'user',
          url: '/other/user',
          iconType: 'ios-people'
        },
        {
          label: '统计分析',
          name: 'statistics',
          url: '/other/statistics',
          iconType: 'ios-stats'
        },
        {
          label: '综合设置',
          name: 'multiple',
          url: '/other/multiple',
          iconType: 'ios-construct'
        }
      ]
    }
  },
  computed: {
    activeMenu() {
      for (const { url, name } of this.menus) {
        if (url === this.$route.fullPath) return name
      }

      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
$nav_background: #515a6e;

.layout {
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    height: 60px;
    overflow: hidden;
    background: $nav_background;
    .logo {
      width: 25%;
      .title {
        color: #efefef;
        font-size: 2rem;
        font-weight: bold;
        cursor: pointer
      }
    }
    .menu {
      display: flex;
      justify-content: center;
      width: 50%;
      .ivu-menu {
        background: none;
      }
    }
    .user {
      display: flex !important;
      justify-content: flex-end !important;
      width: 25%;
      .avatar {
        cursor: pointer;
      }
    }
  }

  .view {
    height: calc(100vh - 60px); // 内容高度(60px: 导航栏)
  }
}
</style>
