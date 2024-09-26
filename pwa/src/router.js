import { createRouter, createWebHistory } from 'vue-router';
import { session } from './data/session';
import { userResource } from '@/data/user';

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/pages/Login.vue'),
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('@/pages/ForgetPassword.vue'),
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/form/components/Notifications.vue'),
  },
  { 
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/pages/SignUp.vue'),
  },
  {
    path: '/newform',
    name: 'Form',
    component: () => import('@/pages/Form.vue'),
  },
  {
    path: '/',
    name: 'LandingPage',
    component: () => import('@/pages/LandingPage.vue'),
  },
  {
    path: '/list',
    name: 'ListPage',
    component: () => import('@/pages/ListPage.vue'),
  },
  {
    path: '/showform',
    name: 'Showform',
    component: () => import('@/pages/ShowForm.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/form/components/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory('/pwa'),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let isLoggedIn = session.isLoggedIn;
  try {
    await userResource.promise;
  } catch (error) {
    isLoggedIn = false;
  }

  if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'Home' });
  } else if (to.name === 'ForgetPassword' || to.name === 'Login' || to.name === 'SignUp' || isLoggedIn) {
    next();
  } else {
    next({ name: 'Login' });
  }
});

export default router;
