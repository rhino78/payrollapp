// payroll.js - Payroll processing functionality
const { invoke } = window.__TAURI__.core;

function generatePayPeriods() {
  const payPeriodSelect = document.getElementById('pay-period');
  const currentYear = new Date().getFullYear();

  let currentDate = new Date(currentYear, 0, 1);

  while (currentDate.getDay() !==5) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const payPeriods = [];
  while (currentDate.getFullYear() === currentYear) {
    const formattedDate = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

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

async function loadEmployeeRate() {
  const employeeSelect = document.getElementById('payroll-employee');
  const employeeId = parseInt(employeeSelect.value, 10);
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
      if (hoursWorked ) {
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
  const rate = parseFloat(document.getElementById('payroll-rate').value) || 0;
  const gross = hours * rate;

  document.getElementById('payroll-gross').value = gross.toFixed(2).toString();
  calculateDeductions(gross);
}

function calculateDeductions(gross) {
  const withholding = gross * 0.2;
  const socialSecurity = gross * 0.062;
  const ira = gross * 0.03;
  const net = gross - withholding - socialSecurity - ira;

  document.getElementById('payroll-withholding').value = withholding.toFixed(2).toString();
  document.getElementById('payroll-social-security').value = socialSecurity.toFixed(2).toString();
  document.getElementById('payroll-ira').value = ira.toFixed(2).toString();
  document.getElementById('payroll-net').value = net.toFixed(2).toString();
}

export async function initPayrollPage() {
  const payrollForm = document.getElementById('payroll-form');
  if (!payrollForm) return;

  const employeeSelect = document.getElementById('payroll-employee');
  const hoursInput = document.getElementById('payroll-hours');
  employeeSelect.addEventListener('change', loadEmployeeRate);
  hoursInput.addEventListener('change', calculateGross);

  generatePayPeriods();

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
    await savePayrollRecord();
  });
}

async function savePayrollRecord() {
  const payrollForm = document.getElementById('payroll-form');
  try {
    const formData = {
      emp_id: parseInt(document.getElementById('payroll-employee').value),
      date_of_pay: document.getElementById('pay-period').value,
      hours_worked: parseFloat(document.getElementById('payroll-hours').value),
      pay_rate: parseFloat(document.getElementById('payroll-rate').value),
      gross: parseFloat(document.getElementById('payroll-gross').value),
      withholding: parseFloat(document.getElementById('payroll-withholding').value),
      social_security: parseFloat(document.getElementById('payroll-social-security').value),
      ira: parseFloat(document.getElementById('payroll-ira').value),
      net: parseFloat(document.getElementById('payroll-net').value),
    };

    const requiredFields = ['emp_id', 'date_of_pay', 'hours_worked', 'pay_rate', 'gross', 'withholding', 'social_security', 'ira', 'net'];
    const missingFields = requiredFields.filter(field => formData[field] === undefined || formData[field] === null || formData[field] == '');

    if (missingFields.length > 0 ) {
      showNotification(`Please fill in all required fields: ${missingFields.join(',')}`, 'error');
      return;
    }

    console.log('Preparing to save payrroll record: ', formData);
    showNotification('Payroll is ready to be saved', 'info');
    const result = await invoke('add_payroll', { payroll: formData});
    payrollForm.reset();
    return result;
  } catch (error) {
    console.error('Error processing payroll:', error);
    showNotification('Failed to process payroll. Please try again.', 'error');
  }
}

function showNotification(message, type= 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
