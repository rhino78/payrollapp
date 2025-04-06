// payroll.js - Payroll processing functionality
const { invoke } = window.__TAURI__.core;

function generatePayPeriods() {
        const payPeriodSelect = document.getElementById('pay-period');
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

async function filterPayPeriods(empId) {
        const payPeriodSelect = document.getElementById('pay-period');  
        if (!empId || !payPeriodSelect) return;

        try {
                const usedDates = await invoke('get_date_of_pay', { empId: empId });

                const currentYear = new Date().getFullYear();
                let currentDate = new Date(currentYear, 0, 1);

                if (isNaN(currentDate)) throw new Error('Invalid date');

                while (currentDate.getDay() !==5){
                        currentDate.setDate(currentDate.getDate() + 1);
                }

                const payPeriods = [];

                while (currentDate.getFullYear() === currentYear){
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        const day = String(currentDate.getDate()).padStart(2, '0');
                        const fullDate = `${year}-${month}-${day}`; // Full date for DB

                        if (!usedDates.includes(fullDate)){
                                const label = currentDate.toLocaleString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                });
                                payPeriods.push({value: fullDate, display: label});
                        }
                        currentDate.setDate(currentDate.getDate() + 14);
                }

                payPeriodSelect.innerHTML = `
                        <option value="">Select Pay Period</option>
                        ${payPeriods.map(p =>
                                `<option value="${p.value}">${p.display}</option>`
                        ).join('')}
                `;
        } catch (error) {
                console.error('Error filtering pay periods:', error);
        }
}

async function loadEmployeeRate() {
        const employeeSelect = document.getElementById('payroll-employee');
        const employeeId = parseInt(employeeSelect.value, 10);
        const payRateInput = document.getElementById('payroll-rate');

        if (!employeeId) {
                payRateInput.value = '';
                document.getElementById('emp-address').textContent = '';
                document.getElementById('emp-location').textContent = '';
                document.getElementById('emp-wage').textContent = '';
                document.getElementById('emp-dependents').textContent = '';
                return;
        }

        try {
                const employee = await invoke('get_employee_by_id', { id: employeeId });
                if (employee && employee.wage) {
                        payRateInput.value = employee.wage.toFixed(2);
                        console.log("getting payroll for id: ", employeeId);
                        await loadPayrollHistory(employeeId);
                        await filterPayPeriods(employeeId);

                        const hoursWorked = document.getElementById('payroll-hours').value;
                        if (hoursWorked) {
                                calculateGross();
                        }
                        document.getElementById('emp-address').textContent = employee.address;
                        document.getElementById('emp-location').textContent = employee.city + ', ' + employee.state + ' ' + employee.zip;
                        document.getElementById('emp-wage').textContent = employee.wage;
                        document.getElementById('emp-dependents').textContent = employee.dependents;
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

                if (missingFields.length > 0) {
                        showNotification(`Please fill in all required fields: ${missingFields.join(',')}`, 'error');
                        return;
                }

                console.log('Saving payroll record:', formData);
                const result = await invoke('add_payroll', { payroll: formData });
                showNotification('Payroll saved!', 'info');
                payrollForm.reset();
                await loadPayrollHistory(formData.emp_id);
                return result;
        } catch (error) {
                console.error('Error processing payroll:', error);
                showNotification('Failed to process payroll. Please try again.', 'error');
        }
}

async function loadPayrollHistory(empId) {
        const historyTable = document.querySelector('#payroll-history-table');
        const tbody = historyTable.querySelector('tbody');

        if (!empId || !tbody) return;

        try {
                const payrolls = await invoke('get_payroll_by_id', { empId });

                if (payrolls.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="7" class="no-items">No payroll history found for this employee.</td></tr>';
                        return;
                }

                generatePayPeriods();

                tbody.innerHTML = payrolls.map(payroll => `
                <tr data-id="${payroll.id}">
                        <td id="payroll-id">${payroll.id}</td>
                        <td>${formatDate(payroll.date_of_pay)}</td>
                        <td>${Math.round(payroll.hours_worked)}</td>
                        <td>$${payroll.gross.toFixed(2)}</td>
                        <td>$${payroll.withholding.toFixed(2)}</td>
                        <td>$${payroll.social_security.toFixed(2)}</td>
                        <td>$${payroll.ira.toFixed(2)}</td>
                        <td>$${payroll.net.toFixed(2)}</td>
                         <td><button class="delete-payroll-btn">🗑️</button></td>
                      </tr>
                    `).join('');

                tbody.querySelectorAll('.delete-payroll-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                                const row = e.target.closest('tr');
                                const payrollId = row.getAttribute('data-id');
                                if (confirm('Are you sure you want to delete this payroll entry?')) {
                                        try {
                                                await invoke('delete_payroll', { payrollId: parseInt(payrollId, 10) });
                                                row.remove();
                                                showNotification('Payroll entry deleted successfully!', 'info');
                                        } catch (err) {
                                                console.error('Error deleting payroll entry:', err);
                                                showNotification('Failed to delete payroll entry. Please try again.', 'error');
                                        }
                                }
                        });
                });
        } catch (err) {
                console.error('Error loading employee history:', err);
                tbody.innerHTML = '<tr><td colspan="7" class="no-items">Failed to load employee history. Please try again.</td></tr>';
        }
}

function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${month}-${day}-${year}`;
}

function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => {
                notification.remove();
        }, 3000);
}
