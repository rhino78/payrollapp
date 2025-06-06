// payroll.js - Payroll processing functionality
import { invoke } from "@tauri-apps/api/core";

function generatePayPeriods() {
  const payPeriodSelect = document.getElementById("pay-period");
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
}

async function filterPayPeriods(empId) {
  const payPeriodSelect = document.getElementById("pay-period");
  if (!empId || !payPeriodSelect) return;

  try {
    const usedDates = await invoke("get_date_of_pay", { empId: empId });

    const currentYear = new Date().getFullYear();
    let currentDate = new Date(currentYear, 0, 1);

    if (isNaN(currentDate)) throw new Error("Invalid date");

    while (currentDate.getDay() !== 5) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const payPeriods = [];

    while (currentDate.getFullYear() === currentYear) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${day}`; // Full date for DB

      if (!usedDates.includes(fullDate)) {
        const label = currentDate.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        payPeriods.push({ value: fullDate, display: label });
      }
      currentDate.setDate(currentDate.getDate() + 14);
    }

    payPeriodSelect.innerHTML = `
                        <option value="">Select Pay Period</option>
                        ${payPeriods
        .map(
          (p) =>
            `<option value="${p.value}">${p.display}</option>`,
        )
        .join("")}
                `;
  } catch (error) {
    console.error("Error filtering pay periods:", error);
  }
}

async function loadEmployeeRate() {
  const employeeSelect = document.getElementById("payroll-employee");
  const employeeId = parseInt(employeeSelect.value, 10);
  const payRateInput = document.getElementById("payroll-rate");

  if (!employeeId) {
    payRateInput.value = "";
    document.getElementById("emp-address").textContent = "";
    document.getElementById("emp-location").textContent = "";
    document.getElementById("emp-wage").textContent = "";
    document.getElementById("emp-dependents").textContent = "";
    return;
  }

  try {
    const employee = await invoke("get_employee_by_id", { id: employeeId });
    if (employee && employee.wage) {
      payRateInput.value = employee.wage.toFixed(2);
      await loadPayrollHistory(employeeId);
      await filterPayPeriods(employeeId);

      const hoursWorked = document.getElementById("payroll-hours").value;
      if (hoursWorked) {
        calculateGross();
      }
      document.getElementById("emp-address").textContent = employee.address;
      document.getElementById("emp-location").textContent =
        employee.city + ", " + employee.state + " " + employee.zip;
      document.getElementById("emp-wage").textContent = employee.wage;
      document.getElementById("emp-dependents").textContent =
        employee.number_of_dependents;
      document.getElementById("emp-status").textContent =
        employee.filing_status;
    } else {
      console.warn("No wage found for employee:", employeeId);
      payRateInput.value = "";
    }
  } catch (error) {
    console.error("Error loading employee rate:", error);
  }
}

function calculateGross() {
  const hours = parseFloat(document.getElementById("payroll-hours").value) || 0;
  const rate = parseFloat(document.getElementById("payroll-rate").value) || 0;
  const gross = hours * rate;

  document.getElementById("payroll-gross").value = gross.toFixed(2).toString();
  calculateDeductions(gross);
}

async function calculateDeductions(gross) {
  let filing = document.getElementById("emp-status").textContent;
  let dependentsText = document.getElementById("emp-dependents").textContent;
  let dependents = parseFloat(dependentsText);

  const withholding = await invoke("calculate_withholding", {
    gross,
    filing,
    dependents,
  });
  const socialSecurity = gross * 0.062;
  const ira = gross * 0.03;
  const net = gross - withholding - socialSecurity - ira;

  document.getElementById("payroll-withholding").value = withholding
    .toFixed(2)
    .toString();
  document.getElementById("payroll-social-security").value = socialSecurity
    .toFixed(2)
    .toString();
  document.getElementById("payroll-ira").value = ira.toFixed(2).toString();
  document.getElementById("payroll-net").value = net.toFixed(2).toString();
}

export async function initPayrollPage() {
  const payrollForm = document.getElementById("payroll-form");
  if (!payrollForm) return;

  const payPeroidSelect = document.getElementById("pay-period");
  const employeeSelect = document.getElementById("payroll-employee");
  const hoursInput = document.getElementById("payroll-hours");
  employeeSelect.addEventListener("change", loadEmployeeRate);
  hoursInput.addEventListener("change", calculateGross);

  payPeroidSelect.addEventListener("change", () => {
    calculateGross();
  });

  generatePayPeriods();

  // Load employees into the dropdown
  try {
    const employees = await invoke("get_employees");
    employeeSelect.innerHTML =
      '<option value="">Select Employee</option>' +
      employees
        .map(
          (emp) =>
            `<option value="${emp.id}">${emp.first_name} ${emp.last_name}</option>`,
        )
        .join("");
  } catch (error) {
    console.error("Error loading employees:", error);
  }

  hoursInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });

  payrollForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await savePayrollRecord();
  });
}

async function savePayrollRecord() {
  const payrollForm = document.getElementById("payroll-form");
  try {
    const formData = {
      emp_id: parseInt(document.getElementById("payroll-employee").value),
      date_of_pay: document.getElementById("pay-period").value,
      hours_worked: parseFloat(document.getElementById("payroll-hours").value),
      pay_rate: parseFloat(document.getElementById("payroll-rate").value),
      gross: parseFloat(document.getElementById("payroll-gross").value),
      withholding: parseFloat(
        document.getElementById("payroll-withholding").value,
      ),
      social_security: parseFloat(
        document.getElementById("payroll-social-security").value,
      ),
      ira: parseFloat(document.getElementById("payroll-ira").value),
      net: parseFloat(document.getElementById("payroll-net").value),
    };

    const requiredFields = [
      "emp_id",
      "date_of_pay",
      "hours_worked",
      "pay_rate",
      "gross",
      "withholding",
      "social_security",
      "ira",
      "net",
    ];
    const missingFields = requiredFields.filter(
      (field) =>
        formData[field] === undefined ||
        formData[field] === null ||
        (typeof formData[field] !== "number" && formData[field] === ""),
    );

    if (missingFields.length > 0) {
      showNotification(
        `Please fill in all required fields: ${missingFields.join(",")}`,
        "error",
      );
      return;
    }

    const result = await invoke("add_payroll", { payroll: formData });
    showNotification("Payroll saved!", "info");
    payrollForm.reset();

    await loadEmployeeRate();
    await loadPayrollHistory(formData.emp_id);
    return result;
  } catch (error) {
    console.error("Error processing payroll:", error);
    showNotification("Failed to process payroll. Please try again.", "error");
  }
}

async function loadPayrollHistory(empId) {
  const historyTable = document.querySelector("#payroll-history-table");
  const tbody = historyTable.querySelector("tbody");
  const yearFilter = document.getElementById("year-filter");

  if (!empId || !tbody) return;

  try {
    const payrolls = await invoke("get_payroll_by_id", { empId });

    if (payrolls.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="no-items">No payroll history found for this employee.</td></tr>';
      return;
    }

    const years = [...new Set(payrolls.map(p => new Date(p.date_of_pay).getFullYear()))].sort((a, b) => b - a);
    yearFilter.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');

    const selectedYear = parseInt(yearFilter.value || years[0]);

    function renderFilteredPayrolls(selectedYear) {
      const filtered = payrolls.filter(p => new Date(p.date_of_pay).getFullYear() === selectedYear);
      tbody.innerHTML = filtered.map(p => `
        <tr data-id="${p.id}">
          <td>${p.id}</td>
          <td>${formatDate(p.date_of_pay)}</td>
          <td>${Math.round(p.hours_worked)}</td>
          <td>$${p.gross.toFixed(2)}</td>
          <td>$${p.withholding.toFixed(2)}</td>
          <td>$${p.social_security.toFixed(2)}</td>
          <td>$${p.ira.toFixed(2)}</td>
          <td>$${p.net.toFixed(2)}</td>
          <td><button class="delete-payroll-btn">🗑️</button></td>
        </tr>
      `).join("");
    }

    yearFilter.onchange = () => {
      const newYear = parseInt(yearFilter.value);
      renderFilteredPayrolls(newYear);
    }

    renderFilteredPayrolls(selectedYear);
    generatePayPeriods();

    tbody.querySelectorAll(".delete-payroll-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const payrollId = row.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this payroll entry?")) {
          try {
            await invoke("delete_payroll", {
              payrollId: parseInt(payrollId, 10),
            });
            row.remove();
            showNotification("Payroll entry deleted successfully!", "info");
          } catch (err) {
            console.error("Error deleting payroll entry:", err);
            showNotification(
              "Failed to delete payroll entry. Please try again.",
              "error",
            );
          }
        }
      });
    });
  } catch (err) {
    console.error("Error loading employee history:", err);
    tbody.innerHTML =
      '<tr><td colspan="7" class="no-items">Failed to load employee history. Please try again.</td></tr>';
  }
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${month}-${day}-${year}`;
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
