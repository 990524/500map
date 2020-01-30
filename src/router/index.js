import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '../layout/index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Layout,
    redirect: 'map',
    children: [
      {
        path: 'map',
        name: 'map',
        component: () => import('../views/map')
      },
      {
        path: 'other/:name',
        name: 'other',
        component: () => import('../views/Other')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
