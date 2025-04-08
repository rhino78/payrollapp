const { invoke } = window.__TAURI__.core;

export async function initReportsPage() {
  const listContainer = document.getElementById('employee-toggle-list');
  const runButton = document.getElementById('run-report-btn');
  const reportOutput = document.getElementById('report-output');
  const payPeriodSelect = document.getElementById('report-pay-period');

  listContainer.innerHTML = '<p class="no-items">Please select a pay period.</p>';

  payPeriodSelect.addEventListener('change', async () => {
    const selectedPeriod = payPeriodSelect.value;

    if (!selectedPeriod) {
        listContainer.innerHTML = '<p class="no-items">Please select a pay period.</p>';
      return;
    }

    try {
      const employees = await invoke('get_employees_by_pay_date', {pay_date: selectedPeriod});

      if (employees.length === 0 ) {
        listContainer.innerHTML = '<p class="no-items">No employees found for this pay period.</p>'
        return;
      }

      listContainer.innerHTML = employees.map(emp => `
        <label class="employee-toggle">
          <input type="checkbox" value="${emp.id}" />
          ${emp.first_name} ${emp.last_name}
        </label>
      `).join('');
  } catch (err) {
    console.error("Error loading employees for reports:", err);
    listContainer.innerHTML = '<p class="no-items">Failed to load employees.</p>';
    }
  });

  runButton.addEventListener('click', () => {
    const selectedIds = Array.from(
      listContainer.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    if (selectedIds.length === 0) {
      showNotification("Please  select at least one employee", "error");
      return;
    }

    const payPeriod = payPeriodSelect.value;
    if (!payPeriod) {
      showNotification("Please select a pay period", "error");
      return;
    }

    reportOutput.innerHTML = `
      <h3>Selected Pay Period: ${payPeriod}</h3>
      <p>Selected Employees: ${selectedIds.join(', ')}</p>
      `;

  });

  generatePayPeriods();
}

function generatePayPeriods() {
        const payPeriodSelect = document.getElementById('report-pay-period');
        const currentYear = new Date().getFullYear();

        let currentDate = new Date(currentYear, 0, 1);

        while (currentDate.getDay() !== 5) {
                currentDate.setDate(currentDate.getDate() + 1);
        }

        const payPeriods = [];
        while (currentDate.getFullYear() === currentYear) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`; // Full date for DB

                const displayDate = currentDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                });

                payPeriods.push({ value: formattedDate, display: displayDate });
                currentDate.setDate(currentDate.getDate() + 14);
        }
        payPeriodSelect.innerHTML = `
  <option value="">Select Pay Period</option>
  ${payPeriods.map(period =>
                `<option value="${period.value}">${period.display}</option>`
        ).join('')}
`;

}

