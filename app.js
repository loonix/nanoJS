import { loadComponent } from './componentLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('./components/MyComponent.html', '#app');
});
