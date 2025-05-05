export const pub15Page = `
  <div class="page">
    <h1>IRS Pub 15 Import</h1>
    <p>Use the buttons below to select the two XML files (married and single) to import withholding tables.</p>

    <button id="select-married">Select Married XML</button>
    <span id="married-file" class="file-label">No file selected</span>

    <br/><br/>

    <button id="select-single">Select Single XML</button>
    <span id="single-file" class="file-label">No file selected</span>

    <br/><br/>

    <button id="start-import">Start Import</button>
    <div id="import-status" style="margin-top: 10px;"></div>
    <div id="import-progress-container" style="margin-top: 10px; height: 20px; background: #eee; border-radius: 5px;">
      <div id="import-progress-bar" style="height: 100%; width: 0%; background: #3b82f6; border-radius: 5px;"></div>
    </div>
  </div>
`;
