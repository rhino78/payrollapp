export async function initHomePage() {
  await loadChartJS();

    const API_KEY = '67RFYwuUL3jCWbV3gHDNIwvqwngt9OWk';

    try {
      const [cvsRes, wbaRes, cvsHistRes, wbaHistRes] = await Promise.all([
         fetch(`https://financialmodelingprep.com/api/v3/quote-short/CVS?apikey=${API_KEY}`),
         fetch(`https://financialmodelingprep.com/api/v3/quote-short/WBA?apikey=${API_KEY}`),
         fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/CVS?serietype=line&apikey=${API_KEY}`),
         fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/WBA?serietype=line&apikey=${API_KEY}`),
      ]);

      const cvsPrice = (await cvsRes.json())[0].price;
      const wbaPrice = (await wbaRes.json())[0].price;
      const cvsHistory = (await cvsHistRes.json()).historical.slice(0, 30).reverse();
      const wbaHistory = (await wbaHistRes.json()).historical.slice(0, 30).reverse();

      document.getElementById('stock-cvs').innerText = `CVS: $${cvsPrice.toFixed(2)}`;
      document.getElementById('stock-wba').innerText = `Walgreens: $${wbaPrice.toFixed(2)}`;

      document.getElementById('stock-updated').innerText =
        `Last updated: ${new Date().toLocaleTimeString()}`;

    const labels = cvsHistory.map(entry => entry.date);
    const cvsData = cvsHistory.map(entry => entry.close);
    const wbaData = wbaHistory.map(entry => entry.close);

        new Chart(document.getElementById('stockChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'CVS',
            data: cvsData,
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Walgreens',
            data: wbaData,
            borderWidth: 2,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 7
            }
          },
          y: {
            beginAtZero: false
          }
        }
      }
    });

  } catch (err) {
    console.error("Error loading stock prices", err);
    document.getElementById('stock-cvs').innerText = 'CVS: unavailable';
    document.getElementById('stock-wba').innerText = 'Walgreens: unavailable';
  }
  }

async function loadChartJS() {
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.head.appendChild(script);
    await new Promise(resolve => {
      script.onload = resolve;
    });
  }
}

