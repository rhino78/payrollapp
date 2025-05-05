import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export async function initPub15Page() {
  let marriedPath = null;
  let singlePath = null;

  document
    .getElementById("select-married")
    .addEventListener("click", async () => {
      marriedPath = await open({
        multiple: false,
        filters: [{ name: "XML", extensions: ["xml"] }],
      });
      document.getElementById("married-file").textContent =
        marriedPath || "No file selected";
    });

  document
    .getElementById("select-single")
    .addEventListener("click", async () => {
      singlePath = await open({
        multiple: false,
        filters: [{ name: "XML", extensions: ["xml"] }],
      });
      document.getElementById("single-file").textContent =
        singlePath || "No file selected";
    });

  document
    .getElementById("start-import")
    .addEventListener("click", async () => {
      const status = document.getElementById("import-status");
      if (!marriedPath || !singlePath) {
        status.textContent = "Please select both XML files.";
        return;
      }

      const progressBar = document.getElementById("import-progress-bar");
      const statusImport = document.getElementById("import-status");

      await listen("import_progress", (event) => {
        const [statusType, percent] = event.payload.split(":");
        progressBar.style.width = `${percent}`;
        status.textContent = `Importing (${statusType})... ${percent}%`;
      });

      status.textContent = "Starting import...";

      listen("import_progress", (event) => {
        const [statusLabel, index, total] = event.payload.split(":");
        status.textContent = `Importing ${statusLabel}: ${index} of ${total}`;
      });

      try {
        await invoke("start_withholding_import", {
          marriedPath,
          singlePath,
        });
        status.textContent = "✅ Import complete.";
      } catch (err) {
        status.textContent = "❌ Import failed: " + err;
      }
    });
  document
    .getElementById("select-married")
    .addEventListener("click", async () => {
      marriedPath = await open({
        multiple: false,
        filters: [{ name: "XML", extensions: ["xml"] }],
      });
      document.getElementById("married-file").textContent =
        marriedPath || "No file selected";
    });

  document
    .getElementById("select-single")
    .addEventListener("click", async () => {
      singlePath = await open({
        multiple: false,
        filters: [{ name: "XML", extensions: ["xml"] }],
      });
      document.getElementById("single-file").textContent =
        singlePath || "No file selected";
    });

  document
    .getElementById("start-import")
    .addEventListener("click", async () => {
      const status = document.getElementById("import-status");
      if (!marriedPath || !singlePath) {
        status.textContent = "Please select both XML files.";
        return;
      }

      status.textContent = "Starting import...";

      listen("import_progress", (event) => {
        const [statusLabel, index, total] = event.payload.split(":");
        status.textContent = `Importing ${statusLabel}: ${index} of ${total}`;
      });

      try {
        await invoke("start_withholding_import", {
          marriedPath,
          singlePath,
        });
        status.textContent = "✅ Import complete.";
      } catch (err) {
        status.textContent = "❌ Import failed: " + err;
      }
    });
}
