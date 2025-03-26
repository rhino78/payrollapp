// pages.js - Contains HTML templates for pages
export const pages = {
  home: `
    <div class="page">
      <h1>You have reached the Home page</h1>
    </div>
  `,
  employees: `
  <div class="page">
    <h1>Employees Management</h1>
    
    <div class="employee-container">
  <!-- Form Section on the Left -->
<div class="employee-form-section">
  <h2 id="form-title">Add New Employee</h2>
  <form id="employee-form">
    <!-- First Row: First Name and Last Name -->
    <div class="form-row personal-info">
      <div class="form-group">
        <label for="first-name">First Name:</label>
        <input type="text" id="first-name" name="first_name" required>
      </div>
      <div class="form-group">
        <label for="last-name">Last Name:</label>
        <input type="text" id="last-name" name="last_name" required>
      </div>
    </div>

    <!-- Second Row: Address (Full Width) -->
    <div class="form-row address-line">
      <div class="form-group">
        <label for="address">Address:</label>
        <input type="text" id="address" name="address" required>
      </div>
    </div>

    <!-- Third Row: City, State, ZIP -->
    <div class="form-row location">
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
    </div>

    <!-- Fourth Row: Phone -->
    <div class="form-row phone-line">
      <div class="form-group">
        <label for="phone">Phone:</label>
        <input type="text" id="phone" name="phone" required>
      </div>
    </div>

    <!-- Fifth Row: Wage, Dependents, Filing Status -->
    <div class="form-row employment-details">
      <div class="form-group">
        <label for="wage">Wage:</label>
        <input type="number" step="0.01" id="wage" name="wage" required>
      </div>
      <div class="form-group">
        <label for="dependents">Dependents:</label>
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
    </div>

    <!-- Form Actions: Save and Cancel Buttons -->
    <div class="form-actions">
      <button type="submit" id="save-employee-btn">Save</button>
      <button type="button" id="cancel-employee-btn">Cancel</button>
    </div>
  </form>
</div>
      
      <!-- List Section on the Right -->
      <div class="employee-list-section">
        <h2>Current Employees</h2>
        <div class="search-container">
          <input type="text" id="employee-search" placeholder="Search employees..." />
        </div>
        <div id="employee-list" class="employee-list"></div>
        <button id="add-employee-btn" class="action-button">Add New Employee</button>
      </div>
    </div>
    
    <!-- Notification Section -->
    <div id="notification-area"></div>
  </div>
`,
  // Update the payroll section in pages.js
  payroll: `
    <div class="page payroll-page">
      <h1>Payroll Processing</h1>
      <div class="payroll-header">
        <div class="payroll-employee">
          <label for="payroll-employe">Employee:</label>
            <select id="payroll-employee" name="employee" required>
              <option value="">Select Employee</option>
              <!-- Options would be dynamically populated -->
            </select>
        </div>
    </div>
      <div class="payroll-container">
        <form id="payroll-form" class="horizontal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="pay-period">Pay Period:</label>
              <select id="pay-period" name="pay_period" required>
                <option value="">Select Pay Period</option>
              </select>
            </div>
            <div class="form-group">
            <label for="payroll-rate">Pay Rate:</label>
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <input type="number" id="payroll-rate" name="payroll-rate" required>
              </div>
            </div>
            <div class="form-group">
              <label for="payroll-hours">Hours Worked:</label>
              <input type="number" id="payroll-hours" name="payroll-hours" required>
            </div>
            <div class="form-group">
              <label for="payroll-gross">Gross:</label>
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <input type="number" id="payroll-gross" name="payroll-gross" required>
            </div>
            </div>
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <label for="payroll-withholding">Withholding:</label>
              <input type="number" id="payroll-withholding" name="payroll-withholding" required>
            </div>
            </div>
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <label for="payroll-social-security">Social Security:</label>
              <input type="number" id="payroll-social-security" name="payroll-social-security" required>
            </div>
            </div>
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <label for="payroll-ira">IRA:</label>
              <input type="number" id="payroll-ira" name="payroll-ira" required>
            </div>
            </div>
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon">$</span>
              <label for="payroll-net">Net:</label>
              <input type="number" id="payroll-net" name="net">
            </div>
            </div>
            <div class="form-group">
              <label for="calculate-payroll-btn">Calculate:</label>
              <button type="submit" id="calculate-payroll-btn">Calculate Payroll</button>
            </div>
          </div>
        </form>
      </div>
      <div id="payroll-results" class="payroll-results"></div>
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
