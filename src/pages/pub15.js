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

    <div id="import-status"></div>
  </div>
`;
