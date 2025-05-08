import { navigateToPage } from "./navigation.js";
import { invoke } from "@tauri-apps/api/core";

window.addEventListener("DOMContentLoaded", () => {
  checkForUpdatesOnLoad();
  checkForBackupOnLoad();
  cleanUpOldBackups();
  checkEnvAndWithholding();
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage(link.getAttribute("data-page"));
    });
  });
  navigateToPage("home");
});

async function checkEnvAndWithholding() {
  try {
    await invoke("check_env_vars");
  } catch (err) {
    alert("⚠️ Environment variable missing: " + err);
  }

  try {
    await invoke("check_withholding_data");
  } catch (err) {
    const userConfirmed = confirm(
      "⚠️ " + err + "\n\nDo you want to import data now?",
    );
    if (userConfirmed) {
      import("./navigation.js").then(({ navigateToPage }) =>
        navigateToPage("pub15"),
      );
    }
  }
}

async function cleanUpOldBackups() {
  try {
    await invoke("cleanup_old_backups", { keepDays: 5 });

    console.log("Auto backup clean check complete");
  } catch (err) {
    console.error("backup clean error: ", err);
  }
}

async function checkForBackupOnLoad() {
  try {
    await invoke("auto_backup");
    console.log("Auto backup check complete");
  } catch (err) {
    console.error("backup error: ", err);
  }
}

async function checkForUpdatesOnLoad() {
  const updateNotification = document.getElementById("update-notification");

  try {
    const [latestVersion, _notes] = await invoke("check_for_updates_tauri");

    if (latestVersion) {
      //update available
      updateNotification.style.display = "block";
      updateNotification.style.backgroundColor = "#2563eb";
      updateNotification.textContent = "🔔 Update available! Click to update.";

      updateNotification.onclick = async () => {
        try {
          updateNotification.textContent = "⏳ Updating... please wait.";
          const result = await invoke("perform_update_tauri");
          updateNotification.textContent = "✅ " + result;
          setTimeout(() => {
            updateNotification.style.display = "none";
          }, 3000);
        } catch (err) {
          updateNotification.textContent = "❌ Update failed:" + err;
        }
      };
    } else {
      //already up to date
      updateNotification.style.display = "block";
      updateNotification.style.backgroundColor = "#22c55e";
      updateNotification.textContent = "✅ You're running the latest version.";

      setTimeout(() => {
        updateNotification.style.display = "none";
      }, 3000);
    }
  } catch (err) {
    console.error("Error auto-checking for updates: ", err);
    updateNotification.style.display = "block";
    updateNotification.style.backgroundColor = "#ef4444";
    updateNotification.textContent = "" + err;
    setTimeout(() => {
      updateNotification.style.display = "none";
    }, 3000);
  }
}
