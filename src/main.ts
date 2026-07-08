import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import tc from 'timezonecomplete';
import tzdata from 'tzdata';
import naive from 'naive-ui';

import App from './App.vue';
import Home from './pages/Home.vue';
import RestCalculation from './pages/RestCalculation.vue';

tc.TzDatabase.init(tzdata);

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/sequence/:sequence', component: RestCalculation },
    ],
});

const app = createApp(App);

app.use(naive);
app.use(router);

app.mount("#app");