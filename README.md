
# 💼 Medical Arts Pharmacy Payroll App

This is a custom-built desktop payroll management system created specifically for **Jim Shave** of Medical Arts Pharmacy. The application is designed to simplify employee wage tracking and payroll report generation for his accountant, **John Lister**.

---

## 📦 Features

- 💳 **Employee Management** — Add, edit, and delete employee records.
- 📅 **Payroll Calculation** — Select pay period, input hours worked, and automatically calculate gross pay, deductions, and net income.
- 📊 **Payroll Reports** — Export detailed payroll CSV reports for accountant use.
- 🔒 **Data Backup** — Automatic and manual database backup functionality.
- 📈 **Stock Price Dashboard** — Displays real-time prices of CVS and Walgreens stocks.
- 🔄 **Update System** — Built-in updater for deploying new features and fixes.
- 📥 **Withholding Import Tool** — Import IRS Pub. 15 XML files to calculate accurate withholdings.

---

## 🚀 Installation

1. Download the `.msi` installer from the [Releases](https://github.com/your-repo/releases) page.
2. Run the installer and follow the prompts.
3. Launch the app from your Start Menu or desktop.

---

## 🧰 Technologies Used

- 🦀 **Rust** (business logic & backend)
- 🖼️ **Tauri** (secure, lightweight desktop shell)
- ⚡ **Vite** (frontend build tool)
- 📜 **JavaScript** (frontend logic)
- 🗃️ **SQLite** (embedded database)

---

## 🧑‍💼 Intended Use

This app is used primarily by Jim Shave to:
- Track payroll payments to pharmacy employees
- Generate official payroll reports for submission to accountant John Lister
- Maintain a consistent and accurate record of employee pay history

---

## 👨‍🔧 Developer Notes

- This app runs **locally only** — no external data is stored or transmitted.
- Source code is modular and separated by page (`employees.js`, `payroll.js`, `about.js`, etc.)
- API integrations (e.g. stock price tracking) require a valid Twelve Data API key in the environment.

---

## 📬 Contact

If you encounter issues or need a feature enhancement, please contact:

**Developer:** Ryan Shave  
📧 rshave@gmail.com  
📍 Round Rock, TX

---

> Built with care for Jim Shave and Medical Arts Pharmacy ❤️

![CI](https://github.com/rhino78/payrollapp/actions/workflows/rust.yml/badge.svg)

