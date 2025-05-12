import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";

export async function initAboutPage() {
  const databasePath = await invoke("get_db_path");
  const dbLocationElem = document.getElementById("db-location");
  const lastBackupElem = document.getElementById("last-backup-time");
  const lastBackupCountElem = document.getElementById("backup-count");

  //get the database path
  try {
    const databasePath = await invoke("get_db_path");
    dbLocationElem.textContent = databasePath;

  } catch {
    dbLocationElem.textContent = "❌ Could not fetch database location.";
  }

  //get the number of backups
  try {
    const backupCount = await invoke("count_backups");
    lastBackupCountElem.textContent = `🗂️ ${backupCount}`;
  } catch (err) {
    lastBackupCountElem.textContent = "❌ Could not fetch backup count.";
  }

  //get the last backup time
  try {
    const lastBackupTime = await invoke("get_last_backup_time");
    if (lastBackupTime) {
      const date = new Date(lastBackupTime * 1000);
      lastBackupElem.textContent = date.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } else {
      lastBackupElem.textContent = "Never";
    }
  } catch {
    lastBackupElem.textContent = "❌ Could not fetch last backup time.";
  }

  const releaseNotesDiv = document.getElementById("release-notes");

  try {
    const appVersion = await getVersion();
    const [latestVersion, notes] = await invoke("check_for_updates_tauri");
    const isUpdateAvailable = !!latestVersion;

    releaseNotesDiv.innerHTML = `
        <h2 style="margin: 0;">Current Revision: ${appVersion}</h2>
      ${isUpdateAvailable ? `<p><strong>Update Available:</strong> ${latestVersion}</p>` : ""}
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
