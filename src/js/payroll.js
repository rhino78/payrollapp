// payroll.js - Payroll processing functionality
const { invoke } = window.__TAURI__.core;

async function loadEmployeeRate() {
  const employeeSelect = document.getElementById('payroll-employee');
  const employeeId = employeeSelect.value;
  const payRateInput = document.getElementById('payroll-rate');

  if (!employeeId) {
    payRateInput.value = '';
    return;
  }

  try {
    const employee = await invoke('get_employee_by_id', { id: employeeId });
    if (employee && employee.wage) {
      payRateInput.value = employee.wage.toFixed(2);

      const hoursWorked = document.getElementById('payroll-hours').value;
      if (hours-worked) {
        calculateGross();
      }
    } else {
      console.warn('No wage found for employee:', employeeId);
      payRateInput.value = '';
    }
  } catch (error) {
    console.error('Error loading employee rate:', error);
  }
}

function calculateGross() {
  const hours = parseFloat(document.getElementById('payroll-hours').value) || 0;
  const rate = parseFloat(document.getElementById('payroll-rate').dataset.rate) || 0;
  const gross = hours * rate;

  document.getElementById('payroll-gross').value = gross.toFixed(2);
  calculateDeductions(gross);

}

function calculateDeductions(gross) {
  const withholding = gross * 0.2;
  const socialSecurity = gross * 0.062;
  const ira = gross * 0.03;
  const net = gross - withholding - socialSecurity - ira;

  document.getElementById('payroll-withholding').value = withholding.toFixed(2);
  document.getElementById('payroll-social-security').value = socialSecurity.toFixed(2);
  document.getElementById('payroll-ira').value = ira.toFixed(2);
  document.getElementById('payroll-net').value = net.toFixed(2);
}

export async function initPayrollPage() {
  const payrollForm = document.getElementById('payroll-form');
  if (!payrollForm) return;

  const employeeSelect = document.getElementById('payroll-employee');
  const hoursInput = document.getElementById('payroll-hours');
  employeeSelect.addEventListener('change', loadEmployeeRate);
  hoursInput.addEventListener('change', calculateGross);

  // Load employees into the dropdown
  try {
    const employees = await invoke('get_employees');
    employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
      employees.map(emp =>
        `<option value="${emp.id}">${emp.first_name} ${emp.last_name}</option>`
      ).join('');
  } catch (error) {
    console.error('Error loading employees:', error);
  }

  payrollForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await processPayroll();
  });
}

async function processPayroll() {
  try {
    const formData = {
      employeeId: document.getElementById('payroll-employee').value,
      payPeriod: document.getElementById('pay-period').value,
      hoursWorked: document.getElementById('payroll-hours').value,
      payRate: document.getElementById('payroll-rate').value,
      gross: document.getElementById('payroll-gross').value,
      withholding: document.getElementById('payroll-withholding').value,
      socialSecurity: document.getElementById('payroll-social-security').value,
      ira: document.getElementById('payroll-ira').value,
      net: document.getElementById('payroll-net').value,
    };

    const result = await invoke('process_payroll', { formData });
    console.log('Payroll processed:', result);
    showNotification('Payroll processed successfully.', 'success');
  } catch (error) {
    console.error('Error processing payroll:', error);
    showNotification('Failed to process payroll. Please try again.', 'error');
  }
}
