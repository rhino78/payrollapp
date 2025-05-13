// employees.js - Employee management functionality
import { invoke } from '@tauri-apps/api/core';

let employees = [];
let currentEmployeeId = null;

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

export async function initEmployeesPage() {
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  const employeeFormContainer = document.getElementById('employee-form-container');
  const clearFormBtn = document.getElementById('clear-form-btn');
  const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
  const formTitle = document.getElementById('form-title');
  const employeeForm = document.getElementById('employee-form');
  const mainContainer = document.querySelector(".employee-main-container");

  await loadEmployees();

  addEmployeeBtn.addEventListener('click', () => {
    resetForm();
    formTitle.textContent = 'Add New Employee';
    employeeFormContainer.style.display = "block";
    mainContainer.classList.add("show-form");
  });

  clearFormBtn.addEventListener('click', () => {
    resetForm();
    formTitle.textContent = 'Add New Employee';
    currentEmployeeId = null;
  });

  cancelEmployeeBtn.addEventListener('click', () => {
    resetForm();
    employeeFormContainer.style.display = 'none';
    mainContainer.classList.remove("show-form");
  });

  employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEmployee();
    employeeFormContainer.style.display = 'none';
  });
}

async function loadEmployees() {
  try {
    employees = await invoke('get_employees');
    console.log(employees);
    renderEmployeeList(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
    showNotification('Failed to load employees. Please try again.', 'error');
  }
}

function renderEmployeeList(employeesToRender) {
  const employeeList = document.getElementById('employee-list');
  employeeList.innerHTML = '';

  if (employeesToRender.length === 0) {
    employeeList.innerHTML = '<p class="no-items">No employees found.</p>';
    return;
  }

  employeesToRender.forEach(employee => {
    const employeeItem = document.createElement('div');
    employeeItem.className = 'employee-item';
    employeeItem.innerHTML = `
  <div class="employee-card">
    <h3>
      <i class="fas fa-user"></i> ${employee.first_name} ${employee.last_name}
    </h3>

    <div class="employee-info-row">
      <div class="info-group">
        <span class="info-label">Address:</span>
        <span class="info-value">${employee.address}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Contact:</span>
        <span class="info-value">${employee.phone}</span>
      </div>
    </div>

    <div class="employee-info-row">
      <div class="info-group">
        <span class="info-label">Hired Date:</span>
        <span class="info-value">${employee.hired_date}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Position:</span>
        <span class="info-value">$${employee.wage.toFixed(2)}/hr</span>
      </div>
    </div>

    <div class="employee-actions">
      <button class="icon-btn edit-btn" data-id="${employee.id}" title="Edit">
        <i class="fas fa-pencil-alt"></i>
      </button>
      <button class="icon-btn delete-btn" data-id="${employee.id}" title="Delete">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
    `;

    employeeList.appendChild(employeeItem);

    employeeItem.querySelector('.edit-btn').addEventListener('click', () => {
      editEmployee(employee);
    });

    employeeItem.querySelector('.delete-btn').addEventListener('click', () => {
      confirmDeleteEmployee(employee.id);
    });
  });
}

function resetForm() {
  const employeeForm = document.getElementById('employee-form');
  employeeForm.reset();
  currentEmployeeId = null;
  document.getElementById('form-title').textContent = 'Add New Employee';
}

function editEmployee(employee) {
  const formTitle = document.getElementById('form-title');

  formTitle.textContent = `Edit Employee: ${employee.first_name} ${employee.last_name}`;

  document.getElementById('first-name').value = employee.first_name;
  document.getElementById('last-name').value = employee.last_name;
  document.getElementById('address').value = employee.address;
  document.getElementById('city').value = employee.city;
  document.getElementById('state').value = employee.state;
  document.getElementById('zip').value = employee.zip;
  document.getElementById('phone').value = employee.phone;
  document.getElementById('ssn').value = employee.ssn;
  document.getElementById('hired_date').value = employee.hired_date;
  document.getElementById('birthdate').value = employee.birthdate;
  document.getElementById('notes').value = employee.notes;
  document.getElementById('wage').value = employee.wage;
  document.getElementById('dependents').value = employee.number_of_dependents;
  document.getElementById('filing-status').value = employee.filing_status;

  currentEmployeeId = employee.id;
}

function confirmDeleteEmployee(employeeId) {
  if (confirm('Are you sure you want to delete this employee?')) {
    deleteEmployee(employeeId);
  }
}

async function deleteEmployee(id) {
  try {
    await invoke('delete_employee', { id });
    showNotification('Employee deleted successfully.', 'success');
    await loadEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
    showNotification('Failed to delete employee. Please try again.', 'error');
  }
}

async function saveEmployee() {
  const employeeForm = document.getElementById('employee-form');
  const formData = new FormData(employeeForm);

  const employee = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    wage: parseFloat(formData.get('wage')),
    number_of_dependents: parseInt(formData.get('number_of_dependents')),
    filing_status: formData.get('filing_status'),
    ssn: formData.get('filing_status'),
    hired_date: formData.get('hired_date'),
    birthdate: formData.get('birthdate'),
    notes: formData.get('notes'),
  };

  if (currentEmployeeId) {
    employee.id = currentEmployeeId;
  }

  try {
    if (currentEmployeeId) {
      await invoke('update_employee', { employee });
      showNotification('Employee updated successfully.', 'success');
    } else {
      await invoke('add_employee', { employee });
      showNotification('Employee added successfully.', 'success');
    }
    resetForm();
    await loadEmployees();
  } catch (error) {
    console.error('Error saving employee:', error);
    showNotification('Failed to save employee. Please try again.', 'error');
  }
}
