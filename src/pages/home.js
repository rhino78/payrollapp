export const homePage = `
  <div class="page">
    <div id="import-overlay" class="overlay hidden">
      <script type="module" src="./home.js"></script>
    </div>
    <h1>Welcome to Medical Arts Pharmacy Payroll</h1>
    <div class="market-update">
      <h2>Pharmacy Market Update</h2>
      <div id="stock-cvs" class="stock-item">Loading CVS...</div>
      <div id="stock-wba" class="stock-item">Loading Walgreens...</div>
        <div class="chart-container">
          <canvas id="stockChart"></canvas>
        </div>
      <div id="stock-updated" class="stock-time"></div>
    </div>
  </div>
`;
