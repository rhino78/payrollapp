import { invoke } from "@tauri-apps/api/core";

export async function initAboutPage() {
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
}
