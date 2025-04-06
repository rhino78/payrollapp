  export const payrollPage = `
    <div class="page payroll-page">
      <h1>Payroll Processing</h1>
      <div class="payroll-header">
        <div class="payroll-employee">
          <label for="payroll-employe">Employee:</label>
          <select id="payroll-employee" name="employee" class="uniform-select" required>
              <option value="">Select Employee</option>
              <!-- Options would be dynamically populated -->
            </select>
            <div id="employee-details" class="employee-info">
              <!-- Employee details will be displayed here -->
              <p><strong>Address:</strong> <span id="emp-address"></span></p>
              <p><strong>City/State/ZIP:</strong> <span id="emp-location"></span></p>
              <p><strong>Wage:</strong> <span id="emp-wage"></span></p>
              <p><strong>Dependents:</strong> <span id="emp-dependents"></span></p>
          </div>
        </div>
    </div>
      <div class="payroll-container">
        <form id="payroll-form" class="horizontal-form">
          <div class="form-row">
            <div class="form-group" id="pay-period-group">
              <label for="pay-period">Pay Period:</label>
              <select id="pay-period" name="pay_period" class="uniform-select" required>
                <option value="">Select Pay Period</option>
              </select>
            </div>
            <div class="form-group">
              <label for="payroll-rate">Pay Rate:</label>
              <div class="dollar-input-wrapper">
                <span class="dollar-symbol">$</span>
                <input type="number" id="payroll-rate" name="payroll-rate" step="0.01" class="dollat-input" required>
              </div>
            </div>
            <div class="form-group">
              <label for="payroll-hours">Hours:</label>
              <input type="number" id="payroll-hours" name="payroll-hours" step="0.01" required>
            </div>
                <div class="form-group">
                  <label for="payroll-gross">Gross:</label>
                  <div class="dollar-input-wrapper">
                    <span class="dollar-symbol">$</span>
                    <input type="number" id="payroll-gross" name="payroll-gross" step="0.01" class="dollar-input" required>
                  </div>
                </div>
            <div class="form-group">
              <label for="payroll-withholding">Withholding:</label>
                  <div class="dollar-input-wrapper">
                    <span class="dollar-symbol">$</span>
                      <input type="number" id="payroll-withholding" name="payroll-withholding" step="0.01" class="dollar-input" required>
                  </div>
            </div>
            <div class="form-group">
              <label for="payroll-social-security">Social Security:</label>
              <div class="dollar-input-wrapper">
                    <span class="dollar-symbol">$</span>
                <input type="number" id="payroll-social-security" name="payroll-social-security" step="0.01" class="dollar-input" required>
              </div>
            </div>
            <div class="form-group">
              <label for="payroll-ira">IRA:</label>
              <div class="dollar-input-wrapper">
                    <span class="dollar-symbol">$</span>
                <input type="number" id="payroll-ira" name="payroll-ira" step="0.01" class="dollar-input" required>
              </div>
            </div>
            <div class="form-group">
              <label for="payroll-net">Net:</label>
              <div class="dollar-input-wrapper">
                    <span class="dollar-symbol">$</span>
              <input type="number" id="payroll-net" name="net" step="0.01" class="dollar-input" required>
              </div>
            </div>
            <div class="form-group">
              <label for="save-payroll-btn">Save</label>
              <button type="submit" id="save-payroll-btn">Save</button>
            </div>
          </div>
        </form>
      </div>
      <div id="payroll-results" class="payroll-results"></div>
    <div id="payroll-history" class="payroll-history-section">
      <h2>Payroll History</h2>
      <table id="payroll-history-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Date</th>
            <th>Hours</th>
            <th>Gross</th>
            <th>Holding</th>
            <th>SS</th>
            <th>IRA</th>
            <th>Net</th>
            <th>Delete</th>
          </tr>
        </thread>
          <tbody>
          <!--payroll entries will be injected here -->
          </tbody>
      </table>
    </div>
    </div>
  `;
