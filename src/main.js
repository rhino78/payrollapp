const { invoke, dialog } = window.__TAURI__.tauri;
const modal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');

document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation
  setupNavigation();

  //show the home page by defeault
  showPage("home-page");
});

function showModal(message) {
  modalMessage.textContent = message;
  modal.style.display = 'block';
}



function setupNavigation() {
  document.getElementById('home-link').addEventListener('click', () => {
    showPage("home-page");
  });
  document.getElementById('stocks-link').addEventListener('click', () => {
    showPage("stocks-page");
  });
  document.getElementById('employee-link').addEventListener('click', () => {
    showPage("employee-page");
  });
  document.getElementById('about-link').addEventListener('click', () => {
    showPage("about-page");
  });

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  //handle employee form submission
  const employeeForm = document.getElementById('employee-form');
  if (employeeForm) {
    employeeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(employeeForm);
      const employeeData = Object.fromEntries(formData.entries());
      
      employeeData.number_of_dependents = parseInt(employeeData.number_of_dependents, 10);
      employeeData.wage = parseFloat(employeeData.wage);
      console.log('Employee Data:', employeeData);

      try {
        const response = await invoke('save_employee_data', {employee: employeeData});
        console.log("the respoonse is ",response);
        //await dialog.message('Employee data saved successfully!');
        showModal("Employee data saved successfully!");
      } catch (error) {
        console.error('Error saving employee data: ', error);
        //await dialog.message('Error saving employee data: ', { titel: 'Error', type: 'error' });
        showModal("Failed to save data");
      }
    });
  }
}


function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  //show the selected page
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
  }

  //if the stocks page is shown fetch and display stocks data
  if (pageId === "stocks-page") {
    fetchStockData('WBA', 'walgreens-data', 'walgreens-chart');
    fetchStockData('CVS', 'cvs-data', 'cvs-chart');
  }
}

async function fetchStockData(ticker, elementId, chartId) {
  try {
    const stockData = await invoke('fetch_stock_data', { ticker });
    console.log(`Fetched data for ${ticker}:`, stockData);

    document.getElementById(elementId).innerHTML = `
      <p><strong>${ticker}</strong>: $${stockData.price}</p>
    `;
    renderChart(chartId, stockData.historical);
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    document.getElementById(elementId).textContent = `Failed to load data for ${ticker}.`;
  }
}

function renderChart(canvasId, historicalData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const labels = historicalData.map(entry => entry.date);
  const prices = historicalData.map(entry => entry.price);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Price',
        data: prices,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
