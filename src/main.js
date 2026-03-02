import { Homepage } from './homepage/Homepage.js';

const app = document.getElementById('app');
const homepage = new Homepage(app);
homepage.mount();
