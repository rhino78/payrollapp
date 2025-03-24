import { navigateToPage } from './navigation.js';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navbar a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(link.getAttribute('data-page'));
    });
  });
  navigateToPage('home');
});
