# 🛠️ Tauri App Update Release – Work Instructions

## 🔁 Prerequisites
- GitHub Release created (e.g., `0.1.2`)  
- `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` environment variables set  
- `zip` utility installed (use GOW or 7-Zip CLI)

---

## 1. 🧼 Clean Up Old Artifacts
In `target/release`:
```powershell
Remove-Item payroll_*.zip
Remove-Item *.sig
```

---

## 2. 🔨 Build the App
```powershell
cargo tauri build
```
This creates a fresh `payroll.exe` in `target/release`.

---

## 3. 📦 Create a Compatible .zip Archive
In `target/release`, run:
```bash
zip -0 payroll_0.1.2_x86_64-pc-windows-msvc.zip payroll.exe
```
> `-0` ensures “stored” compression — required for Tauri's updater to extract properly.

---

## 4. 🔏 Sign the Update Archive
```powershell
cargo tauri signer sign `
  "target/release/payroll_0.1.2_x86_64-pc-windows-msvc.zip" `
  --private-key $env:TAURI_SIGNING_PRIVATE_KEY `
  --password $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD
```
Note: Password must be quoted if empty (`""`) or set as an environment variable.

---

## 5. ⬆️ Upload to GitHub
Go to the [GitHub Releases page](https://github.com/rhino78/payrollapp/releases).

1. Open the correct version (e.g., `0.1.2`)
2. Upload:
   - `payroll_0.1.2_x86_64-pc-windows-msvc.zip`
   - `payroll_0.1.2_x86_64-pc-windows-msvc.zip.sig`

---

## 6. 🧾 Create `latest.json`
Example:
```json
{
  "version": "0.1.2",
  "notes": "Bug fixes and improvements",
  "pub_date": "2025-06-05T20:00:00Z",
  "platforms": {
    "x86_64-pc-windows-msvc": {
      "signature": "<PASTE .sig OUTPUT HERE>",
      "url": "https://github.com/rhino78/payrollapp/releases/download/0.1.2/payroll_0.1.2_x86_64-pc-windows-msvc.zip"
    }
  }
}
```
Upload `latest.json` to your update server (or GitHub Pages).

---

## 7. ✅ Test the Update
Launch the app and verify it checks for updates and installs the new version.
