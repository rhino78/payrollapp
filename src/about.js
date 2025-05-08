import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";

export async function initAboutPage() {
  const databasePath = await invoke("get_db_path");
  const backupCountSpan = document.createElement("dvi");
  backupCountSpan.style.marginTop = "10px";
  try {
    const backupCount = await invoke("count_backups");
    backupCountSpan.textContent = `🗂️ Number of backups: ${backupCount}`;
  } catch (err) {
    backupCountSpan.textContent = "❌ Could not fetch backup count.";
  }

  const databaseInfoDiv = document.getElementById("database-info");
  databaseInfoDiv.textContent = "the database is located: " + databasePath;
  databaseInfoDiv.appendChild(backupCountSpan);

  const releaseNotesDiv = document.getElementById("release-notes");

  try {
    const appVersion = await getVersion();
    const [latestVersion, notes] = await invoke("check_for_updates_tauri");
    const isUpdateAvailable = !!latestVersion;
    const badgeColor = isUpdateAvailable ? "#3b82f6" : "22c55e";
    const badgeText = isUpdateAvailable ? "Update Available" : "Up to Date";
    const badgeAnimationClass = isUpdateAvailable ? "pulse-badge" : "";

    releaseNotesDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <h2 style="margin: 0;">Current Revision: ${appVersion}</h2>
        <span class="${badgeAnimationClass}" style="background-color: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 0.8rem;">
          ${badgeText}
        </span>
      </div>

      ${isUpdateAvailable ? `<p><strong>Update Available:</strong> ${latestVersion}</p>` : ""}

      <h2>Release Notes:</h2>
      <p style="white-space: pre-line;">${notes}</p>
    `;
  } catch (err) {
    releaseNotesDiv.textContent = "❌ Could not load release notes.";
    console.error("Error loading about page info", err);
  }

  const backupBtn = document.getElementById("backup-now-btn");
  const statusDiv = document.getElementById("backup-status");

  if (backupBtn && statusDiv) {
    backupBtn.addEventListener("click", async () => {
      statusDiv.textContent = "⏳ Running backup...";
      try {
        await invoke("auto_backup");
        statusDiv.textContent = "✅ Backup complete.";
      } catch (err) {
        console.error("backup failed", err);
        statusDiv.textContent = "❌ Backup failed. See console.";
      }
    });
  }
}
