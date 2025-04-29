import { pages } from './pages.js';
import { initEmployeesPage } from './employees.js';
import { initPayrollPage } from './payroll.js';
import { initReportsPage } from './reports.js';
import { initAboutPage } from './about.js';
import { initHomePage } from './home.js';
import { initPub15Page } from './pub15.js';

export async function navigateToPage(page) {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = pages[page];

  document.querySelectorAll('.navbar a').forEach((link) => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (page === 'home') {
    await initHomePage();
  }

  if (page === 'employees') {
    await initEmployeesPage();
  }

  if (page === 'about') {
    await initAboutPage();
  }

  if (page === 'reports') {
    initReportsPage();
  }

  if (page === 'payroll') {
    await initPayrollPage();
  }

  if (page === 'pub15') {
    console.log("intting pub15");
    await initPub15Page();
  }
}
