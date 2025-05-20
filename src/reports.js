import { invoke } from "@tauri-apps/api/core";

export async function initReportsPage() {
  const listContainer = document.getElementById("employee-toggle-list");
  const runButton = document.getElementById("run-report-btn");
  const reportOutput = document.getElementById("report-output");
  const payPeriodSelect = document.getElementById("report-pay-period");

  listContainer.innerHTML =
    '<p class="no-items">Please select a pay period.</p>';

  payPeriodSelect.addEventListener("change", async () => {
    const selectedPeriod = payPeriodSelect.value;

    if (!selectedPeriod) {
      listContainer.innerHTML =
        '<p class="no-items">Please select a pay period.</p>';
      return;
    }

    try {
      const employees = await invoke("get_employees_by_pay_date", {
        payDate: selectedPeriod,
      });

      if (employees.length === 0) {
        listContainer.innerHTML =
          '<p class="no-items">No employees found for this pay period.</p>';
        return;
      }

      listContainer.innerHTML = employees
        .map(
          (emp) => `
        <label class="employee-toggle">
          <input type="checkbox" value="${emp.id}" />
          ${emp.first_name} ${emp.last_name}
        </label>
      `,
        )
        .join("");
      const selectAllBottomBtn = document.createElement("button");
      selectAllBottomBtn.textContent = "Select All Employees";
      selectAllBottomBtn.className = "select-all-btn";
      selectAllBottomBtn.addEventListener("click", () => {
        const checkboxes = listContainer.querySelectorAll(
          "input[type='checkbox']",
        );
        checkboxes.forEach((cb) => (cb.checked = true));
      });
      const employeeListSection = document.getElementById(
        "employee-toggle-list",
      );
      employeeListSection.appendChild(selectAllBottomBtn);
    } catch (err) {
      console.error("Error loading employees for reports:", err);
      listContainer.innerHTML =
        '<p class="no-items">Failed to load employees.</p>';
    }
  });

  runButton.addEventListener("click", async () => {
    const selectedIds = Array.from(
      listContainer.querySelectorAll('input[type="checkbox"]:checked'),
    ).map((cb) => parseInt(cb.value));

    const payPeriod = payPeriodSelect.value;

    if (selectedIds.length === 0) {
      showNotification("Please  select at least one employee", "error");
      return;
    }

    if (!payPeriod) {
      showNotification("Please select a pay period", "error");
      return;
    }

    try {
      const records = await invoke("get_payroll_report", {
        employeeIds: selectedIds,
        payDate: payPeriod,
      });

      if (!records.length) {
        showNotification("No payroll data found", "error");
        return;
      }

      let csv = "First Name,Last Name,Pay Date,Hours,Gross,WH,SS,IRA,NET\n";
      let totalWH = 0,
        totalSS = 0,
        totalNET = 0;

      records.forEach((r) => {
        csv += `${r.first_name},${r.last_name},${r.pay_date},${r.hours},${r.gross},${r.wh},${r.ss},${r.ira},${r.net}\n`;
        totalWH += r.wh;
        totalSS += r.ss;
        totalNET += r.net;
      });

      csv += `,,,,,,\nTOTALS,,,,,${totalWH.toFixed(2)},${totalSS.toFixed(2)},,${totalNET.toFixed(2)}\n`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payroll_Report_${payPeriod}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification("Report downloaded", "success");
    } catch (err) {
      console.error("Error Generating report: ", err);
      showNotification("Failed to generate report", "error");
    }
  });

  generatePayPeriods();
}

function generatePayPeriods() {
  const payPeriodSelect = document.getElementById("report-pay-period");
  const currentYear = new Date().getFullYear();

  let currentDate = new Date(currentYear, 0, 1);

  while (currentDate.getDay() !== 5) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const payPeriods = [];
  while (currentDate.getFullYear() === currentYear) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`; // Full date for DB

    const displayDate = currentDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    payPeriods.push({ value: formattedDate, display: displayDate });
    currentDate.setDate(currentDate.getDate() + 14);
  }
  payPeriodSelect.innerHTML = `
  <option value="">Select Pay Period</option>
  ${payPeriods
    .map(
      (period) => `<option value="${period.value}">${period.display}</option>`,
    )
    .join("")}
`;

  if (payPeriodSelect.options.length > 1) {
    payPeriodSelect.selectedIndex = 1;
    calculateGross();
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
