export const employeePage = `
  <div class="page">
    <h1>Employee Management</h1>

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
      <div class="form-group">
        <label for="city">City:</label>
        <input type="text" id="city" name="city" required>
      </div>
    </div>

    <!-- Third Row: City, State, ZIP -->
    <div class="form-row location">
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
        <input type="text" id="phone" name="phone" required>
      </div>
    </div>

    <!-- Fourth Row: Phone -->
    <div class="form-row phone-line">
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
        <select id="filing-status" name="filing_status" class="uniform-select" required>
          <option value="">-- Select Status --</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
        </select>
      </div>
    </div>

    <!-- Fifth Row: Wage, Dependents, Filing Status -->
    <div class="form-row employment-details">
    </div>

    <!-- Form Actions: Save and Cancel Buttons -->
    <div class="form-actions">
        <button id="clear-form-btn" class="action-button">Clear Form</button>
        <button type="submit" id="save-employee-btn">Save</button>
        <button type="button" id="cancel-employee-btn">Cancel</button>
    </div>
  </form>
</div>

      <!-- List Section on the Right -->
      <div class="employee-list-section">
        <h2>Current Employees</h2>
        <div id="employee-list" class="employee-list"></div>
      </div>
    </div>

    <!-- Notification Section -->
    <div id="notification-area"></div>
  </div>
`;
