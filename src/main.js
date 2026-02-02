import './styles/style.css';
import { initOcean } from './js/ocean.js';
import { initUI } from './js/ui.js';

// 各機能を初期化
initOcean();
initUI();

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.classList.add('loaded');
});