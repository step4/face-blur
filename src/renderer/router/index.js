import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'video-page',
      component: require('@/components/VideoPage').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
