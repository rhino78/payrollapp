const { invoke } = window.__TAURI__.core;

const pages = {
   home: `
    <div class="page">
      <h1>You have reached the Home page</h1>
    </div>
  `,
  employees: `
    <div class="page">
      <h1>Employees Management</h1>
      
      <div class="employee-container">
        <div class="employee-list-section">
          <h2>Employee List</h2>
          <div class="search-container">
            <input type="text" id="employee-search" placeholder="Search employees...">
          </div>
          <div id="employee-list" class="employee-list"></div>
          <button id="add-employee-btn" class="action-button">Add New Employee</button>
        </div>
        
        <div class="employee-form-section">
          <h2 id="form-title">Add New Employee</h2>
          <form id="employee-form">
            <div class="form-group">
              <label for="first-name">First Name:</label>
              <input type="text" id="first-name" name="first_name" required>
            </div>
            
            <div class="form-group">
              <label for="last-name">Last Name:</label>
              <input type="text" id="last-name" name="last_name" required>
            </div>
            
            <div class="form-group">
              <label for="address">Address:</label>
              <input type="text" id="address" name="address" required>
            </div>
            
            <div class="form-group">
              <label for="city">City:</label>
              <input type="text" id="city" name="city" required>
            </div>
            
            <div class="form-group">
              <label for="state">State:</label>
              <input type="text" id="state" name="state" required>
            </div>
            
            <div class="form-group">
              <label for="zip">ZIP:</label>
              <input type="text" id="zip" name="zip" required>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone:</label>
              <input type="tel" id="phone" name="phone" required>
            </div>
            
            <div class="form-group">
              <label for="wage">Wage ($):</label>
              <input type="number" step="0.01" id="wage" name="wage" required>
            </div>
            
            <div class="form-group">
              <label for="dependents">Number of Dependents:</label>
              <input type="number" id="dependents" name="number_of_dependents" required>
            </div>
            
            <div class="form-group">
              <label for="filing-status">Filing Status:</label>
              <select id="filing-status" name="filing_status" required>
                <option value="">-- Select Status --</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" id="save-employee-btn">Save</button>
              <button type="button" id="cancel-employee-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
   payroll: `
    <div class="page">
      <h1>You have reached the Payroll page</h1>
    </div>
  `,
   reports: `
    <div class="page">
      <h1>You have reached the Reports page</h1>
    </div>
  `,
   pub15: `
    <div class="page">
      <h1>You have reached the Pub15 page</h1>
    </div>
  `,
   about: `
    <div class="page">
      <h1>You have reached the About page</h1>
    </div>
  `,

};

function navigateTo(page) {
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
}

async function initEmployeesPage() {
  const employeeList = document.getElementById('employee-list');
  const employeeForm = document.getElementById('employee-form');
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
  const formTitle = document.getElementById('form-title');

  await loadEmployees();

  addEmployeeBtn.addEventListener('click', () => {
    resetForm();
    formTitle.textContent = 'Add New Employee';
    currentEmployeeId = null;
  });

  cancelEmployeeBtn.addEventListener('click', () => {
    resetForm();
  });

  employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEmployee();
  });

}

let employees = [];

async function loadEmployees() {
  try {
    employees = await invoke('get_employees');
    renderEmployeeList(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
    showNotification('error', 'Failed to load employees. Please try again.');
  }
}

function renderEmployeeList(employeesToRender){
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
      <div class="employee-info">  
        <span class="employee-name">${employee.name} ${employee.last_name}</span>
      <span class="employee-details">Wage: $${employee.wage.toFixed(2)} | ${employee.filing_status}</span>
      </div>
      <div class="employee-actions">
      <button class="edit-btn" data-id="${employee.id}">Edit</button>
      <button class="delete-btn" data-id="${employee.id}">Delete</button>
      </div>
    `;

    employeeList.appendChild(employeeItem);

    employeeItem.querySelector('.edit-btn').addEventListener('click', () => {
      editEmployee(employee.id);
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
  const employeeForm = document.getElementById('employee-form');
  const formTitle = document.getElementById('form-title');

  formTitle.textContent = 'Edit Employee: ${employee.first_name} ${employee.last_name }';

  document.getElementById('first_name').value = employee.first_name;
  document.getElementById('last_name').value = employee.last_name;
  document.getElementById('address').value = employee.address;
  document.getElementById('city').value = employee.city;
  document.getElementById('state').value = employee.state;
  document.getElementById('zip').value = employee.zip;
  document.getElementById('wage').value = employee.wage;
  document.getElementById('number_of_dependents').value = employee.number_of_dependents;
  document.getElementById('filing_status').value = employee.filing_status;

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
    showNotification('success', 'Employee deleted successfully.');
    await loadEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
    showNotification('error', 'Failed to delete employee. Please try again.');
  }
}


async function saveEmployee(){
  const employeeForm = document.getElementById('employee-form');
  const formData = new FormData(employeeForm);

  const employee = {
    //id: currentEmployeeId,
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
  };
  try{
      await invoke('add_employee', {employee});
      showNotification('success', 'Employee added successfully.');
    resetForm();
    await loadEmployees();
  } catch (error) {
    console.error('Error saving employee:', error);
    showNotification('error', 'Failed to save employee. Please try again.');
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

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navbar a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-page'));
    });
  });
  navigateTo('home');
});
