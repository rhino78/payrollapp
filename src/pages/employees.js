export const employeePage = `
  <div class="page">
    <h1>Employee Management System</h1>

    <div class="employee-main-container">
      <!-- Hidden form -->
      <div id="employee-form-container" class="employee-form-container" style="display: none; flex 0 0 70%">
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

          <!-- Second Row: Address -->
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

          <!-- Fourth Row: Wage, Dependents, Filing Status -->
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

          <!-- Fifth Row: SSN, Hired Date, Birthdate -->
          <div class="form-row personal-details">
            <div class="form-group">
              <label for="ssn">SSN:</label>
              <input type="text" id="ssn" name="ssn" required>
            </div>
            <div class="form-group">
              <label for="hired-date">Hired Date:</label>
              <input type="date" id="hired-date" name="hired_date" required>
            </div>
            <div class="form-group">
              <label for="birthdate">Birthdate:</label>
              <input type="date" id="birthdate" name="birthdate" required>
            </div>
          </div>

          <!-- Sixth Row: Notes -->
          <div class="form-row personal-notes">
            <div class="form-group">
              <label for="notes">Notes:</label>
              <input type="text" id="notes" name="notes">
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button id="clear-form-btn" class="action-button">Clear Form</button>
            <button type="submit" id="save-employee-btn">Save</button>
            <button type="button" id="cancel-employee-btn">Cancel</button>
          </div>
        </form>
      </div>

      <div class="employee-list-section" style="flex: 0 0 30%;">
        <div class="employee-header">
          <h2>Current Employees</h2>
          <button id="add-employee-btn" class="action-button">+ Add Employee</button>
        </div>
        <div id="employee-list" class="employee-list"></div>
      </div>
    </div>

    <div id="notification-area"></div>
  </div>
`;
