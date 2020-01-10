<template>
  <div class="layout">
    <Menu mode="horizontal" :theme="theme" active-name="1" class="header">
      <MenuItem name="1">
        <Icon type="ios-paper" />
        内容管理
      </MenuItem>
      <MenuItem name="2">
        <Icon type="ios-people" />
        用户管理
      </MenuItem>
      <Submenu name="3">
        <template slot="title">
          <Icon type="ios-stats" />
          统计分析
        </template>
        <MenuGroup title="使用">
          <MenuItem name="3-1">新增和启动</MenuItem>
          <MenuItem name="3-2">活跃分析</MenuItem>
          <MenuItem name="3-3">时段分析</MenuItem>
        </MenuGroup>
        <MenuGroup title="留存">
          <MenuItem name="3-4">用户留存</MenuItem>
          <MenuItem name="3-5">流失用户</MenuItem>
        </MenuGroup>
      </Submenu>
      <MenuItem name="4">
        <Icon type="ios-construct" />
        综合设置
      </MenuItem>
    </Menu>
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data () {
    return {
      theme: 'dark' // light dark primary(mode="horizontal")
    }
  }
}
</script>

<style lang="scss" scoped>
$header_height: 60px;

.layout {
  .header {
    height: $header_height;
  }

  .main {
    min-height: calc(100vh - $header_height);
  }
}
</style>
