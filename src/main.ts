import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import tc from 'timezonecomplete';
import tzdata from 'tzdata';
import naive from 'naive-ui';

import App from './App.vue';
import CreateSequence from './pages/sequence/CreateSequence.vue';
import CalculateRest from './pages/rest/CalculateRest.vue';
import Home from './pages/Home.vue';

tc.TzDatabase.init(tzdata);

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },

    { path: '/sequence/create/:sequence', component: CreateSequence },

    { path: '/rest/calculate/:sequence', component: CalculateRest },
  ],
});

const app = createApp(App);

app.use(naive);
app.use(router);

app.mount('#app');