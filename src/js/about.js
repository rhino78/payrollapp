const { invoke } = window.__TAURI__.core;

export async function initAboutPage() {
  console.log("Initializing About Page");
  const updateBtn = document.getElementById('check-update-btn');
  const statusEl = document.getElementById('update-status');
  const runUpdateBtn = document.getElementById('run-update-btn');

  updateBtn.addEventListener('click', async (e) => {
    try {
      const [latestVersion, notes] = await invoke("check_for_updates_tauri");
      if (latestVersion) {
        statusEl.textContent ="Update available: " + latestVersion;
        runUpdateBtn.style.display = "inline-block";
        console.log(`🚀 Update available: ${latestVersion}`);
        console.log(`📓 Notes: ${notes}`);
      } else {
        statusEl.textContent ="you are running the latest version";
        console.log("✅ You're running the latest version.");
        runUpdateBtn.style.display =  "none";
      }
    } catch (err) {
        statusEl.textContent ="there was an error" + err;
        console.error("❌ Error checking for updates:", err);
        runUpdateBtn.style.display =  "none";
    }

    runUpdateBtn.addEventListener('click', async () => {
      try {
      statusEl.textContent = "Downloading and applying update";
      const result = await invoke("perform_update_tauri");
      statusEl.textContent = "✅ " + result;
      } catch (err) {
        console.err("Update failed: ", err);
        statusEl.textContent = "❌ Update failed: " + err;

      }
    });
  });
}

