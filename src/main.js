import { navigateToPage } from "./navigation.js";
import { invoke } from "@tauri-apps/api/core";

window.addEventListener("DOMContentLoaded", () => {
  checkForUpdatesOnLoad();
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage(link.getAttribute("data-page"));
    });
  });
  navigateToPage("home");
});

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
