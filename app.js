import { loadComponent } from './componentLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('./components/example.html', '#app');
    await loadComponent('./components/login.html', '#login');
});

