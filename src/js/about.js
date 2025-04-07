
export async function initAboutPage() {
  console.log("initing about page");
  const { emit, listen } = window.__TAURI__.event;
  await emit("tauri://update");
  await listen("tauri://update-available", ({ payload }) => {
    console.log("Update available!", payload);
  });

  const updateBtn = document.getElementById('check-update-btn');
  const statusEl = document.getElementById('update-status');

  if (!updateBtn || !statusEl) {
    console.error("Update button or status element not found.");
    return;
  }

  // 🛠 Set event listeners FIRST
  window.__TAURI__.event.listen('tauri://update-available', () => {
    statusEl.textContent = 'An update is available!';
  });

  window.__TAURI__.event.listen('tauri://update-not-available', () => {
    statusEl.textContent = 'You are using the latest version.';
  });

  window.__TAURI__.event.listen('tauri://update-download-complete', async () => {
    const confirm = window.confirm('Update downloaded. Restart now?');
    if (confirm) {
      await window.__TAURI__.process.relaunch();
    }
  });

  window.__TAURI__.event.listen('tauri://update-error', (event) => {
    console.error('Updater error:', event.payload);
    statusEl.textContent = 'Error checking for updates.';
  });

  updateBtn.addEventListener('click', async () => {
    console.log("Update button clicked");
    statusEl.textContent = 'Checking for updates...';

    // Trigger the update check
    const yes = await window.__TAURI__.event.emit("tauri://update");
    console.log(yes);

    statusEl.textContent = 'update came back';
  });
}
