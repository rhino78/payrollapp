import { pages } from './pages.js';
import { initEmployeesPage } from './employees.js';
import { initPayrollPage } from './payroll.js';

export function navigateToPage(page) {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = pages[page];

  document.querySelectorAll('.navbar a').forEach((link) => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (page === 'employees') {
    initEmployeesPage();
  }

  if (page === 'payroll') {
    initPayrollPage();
  }
}
