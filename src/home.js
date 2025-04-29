import { invoke } from "@tauri-apps/api/core";

export async function initHomePage() {
  await loadChartJS();

  const API_KEY = await invoke("get_api_key");

  try {
    const [cvsRes, wbaRes] = await Promise.all([
      fetch(
        `https://api.twelvedata.com/time_series?symbol=CVS&interval=1day&outputsize=30&apikey=${API_KEY}`,
      ),
      fetch(
        `https://api.twelvedata.com/time_series?symbol=WBA&interval=1day&outputsize=30&apikey=${API_KEY}`,
      ),
    ]);

    const cvsDataJson = await cvsRes.json();
    const wbaDataJson = await wbaRes.json();

    const cvsHistory = cvsDataJson?.values || [];
    const wbaHistory = wbaDataJson?.values || [];

    if (cvsHistory.length === 0 || wbaHistory.length === 0) {
      throw new Error("Stock data unavailable");
    }

    const cvsPrice = parseFloat(cvsHistory[cvsHistory.length - 1].close);
    const wbaPrice = parseFloat(wbaHistory[wbaHistory.length - 1].close);

    document.getElementById("stock-cvs").innerText =
      `CVS: $${cvsPrice.toFixed(2)}`;
    document.getElementById("stock-wba").innerText =
      `Walgreens: $${wbaPrice.toFixed(2)}`;
    document.getElementById("stock-updated").innerText =
      `Last updated: ${new Date().toLocaleTimeString()}`;

    const labels = cvsHistory.map((entry) => entry.datetime);
    const cvsData = cvsHistory.map((entry) => entry.close);
    const wbaData = wbaHistory.map((entry) => entry.close);

    if (!window.Chart) {
      console.error("chart not loaded");
      return;
    }
    new Chart(document.getElementById("stockChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "CVS",
            data: cvsData,
            borderWidth: 2,
            fill: false,
          },
          {
            label: "Walgreens",
            data: wbaData,
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 7,
            },
          },
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error loading stock prices", err);
    document.getElementById("stock-cvs").innerText = "CVS: unavailable";
    document.getElementById("stock-wba").innerText = "Walgreens: unavailable";
  }
}

async function loadChartJS() {
  if (!window.Chart) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    document.head.appendChild(script);
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }
}
