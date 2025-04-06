const { invoke } = window.__TAURI__.core;

export async function initReportsPage() {
  const listContainer = document.getElementById('employee-toggle-list');
  const runButton = document.getElementById('run-report-btn');
  const reportOutput = document.getElementById('report-output');

  try {
    const employees = await invoke('get_employees');

    listContainer.innerHTML = employees.map(emp => `
      <label class="employee-toggle">
        <input type="checkbox" value="${emp.id}" />
        ${emp.first_name} ${emp.last_name}
      </label>
    `).join('');

    runButton.addEventListener('click', () => {
      const selectedIds = Array.from(
        listContainer.querySelectorAll('input[type="checkbox"]:checked')
      ).map(cb => parseInt(cb.value));

      if (selectedIds.length === 0) {
        showNotification("Please select at least one employee.", "error");
        return;
      }

      // For now, just display the IDs
      reportOutput.innerHTML = `
        <h3>Selected Employees:</h3>
        <p>${selectedIds.join(', ')}</p>
      `;

      // Later: fetch report data from Tauri using selectedIds
    });

    generatePayPeriods();

  } catch (err) {
    console.error("Error loading employees for reports:", err);
    listContainer.innerHTML = '<p class="no-items">Failed to load employees.</p>';
  }
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

