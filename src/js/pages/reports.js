export const reportsPage = `
  <div class="page">
    <h1>Reports</h1>

    <div class="form-group">
      <label for="report-pay-period">Select Pay Period</label>
      <select id="report-pay-period" class="uniform-select"></select>
    </div>
    <div id="employee-report-selector" class="employee-list-section">
      <h2>Select Employees</h2>
      <div id="employee-toggle-list" class="employee-toggle-list">
        <!-- toggles injected here -->
      </div>
    </div>

    <div class="form-actions">
      <button id="run-report-btn">Run Report</button>
    </div>

    <div id="report-output" class="report-output"></div>
  </div>
`;

