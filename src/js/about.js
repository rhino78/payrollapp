const { invoke } = window.__TAURI__.core;

export async function initAboutPage() {
  console.log("Initializing About Page");
  const updateBtn = document.getElementById('check-update-btn');
  const statusEl = document.getElementById('update-status');

  updateBtn.addEventListener('click', async (e) => {
    try {
      const [latestVersion, notes] = await invoke("check_for_updates_tauri");
      if (latestVersion) {
        statusEl.textContent ="Update available: " + latestVersion;
        console.log(`🚀 Update available: ${latestVersion}`);
        console.log(`📓 Notes: ${notes}`);
        // Show modal / button to trigger update
      } else {
        statusEl.textContent ="you are running the latest version";
        console.log("✅ You're running the latest version.");
      }
    } catch (err) {
        statusEl.textContent ="there was an error" + err;
      console.error("❌ Error checking for updates:", err);
    }



  });


}

