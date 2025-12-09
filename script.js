// script.js

let mockData = null;

async function loadMockData() {
  const res = await fetch("mock_data.json");
  mockData = await res.json();
  // initialize metrics and charts once data is loaded
  updateMetrics(mockData);
  renderCharts(mockData);
}

function updateMetrics(data) {
  const stability = document.getElementById("stabilityValue");
  const pf = document.getElementById("pfValue");
  const turns = document.getElementById("turnsValue");

  stability.textContent = data.stability_score.toFixed(3);
  pf.textContent = data.pf_like_metric.toFixed(3);
  turns.textContent = data.drift_series.length.toString();
}

function renderCharts(data) {
  const turns = data.drift_series.length;
  const x = Array.from({ length: turns }, (_, i) => i + 1);

  // Drift curve
  const driftTrace = {
    x,
    y: data.drift_series,
    type: "scatter",
    mode: "lines+markers",
    line: { color: "#1d4ed8", width: 3 },
    marker: { size: 7 },
    name: "Drift vs. Safe Region",
  };

  const driftLayout = {
    margin: { t: 20, r: 10, b: 40, l: 40 },
    xaxis: {
      title: "Turn",
      tickmode: "linear",
      dtick: 1,
      zeroline: false,
    },
    yaxis: {
      title: "Drift magnitude",
      zeroline: true,
      zerolinecolor: "#e5e7eb",
    },
    showlegend: false,
  };

  Plotly.newPlot("driftCurve", [driftTrace], driftLayout, { displayModeBar: false });

  // Heatmap
  const heatmapTrace = {
    z: data.heatmap,
    x,
    y,
    type: "heatmap",
    colorscale: "Blues",
    reversescale: true,
    showscale: true,
    hoverongaps: false,
  };

  const heatmapLayout = {
    margin: { t: 20, r: 10, b: 40, l: 40 },
    xaxis: {
      title: "Turn",
      tickmode: "linear",
      dtick: 1,
    },
    yaxis: {
      title: "Turn",
      autorange: "reversed",
      tickmode: "linear",
      dtick: 1,
    },
  };

  Plotly.newPlot("driftHeatmap", [heatmapTrace], heatmapLayout, {
    displayModeBar: false,
  });
}

function animateDrift() {
  if (!mockData) return;

  const fullSeries = mockData.drift_series;
  const turns = fullSeries.length;
  const x = Array.from({ length: turns }, (_, i) => i + 1);

  let current = [];
  let step = 0;

  const interval = setInterval(() => {
    current.push(fullSeries[step]);
    const partialData = {
      ...mockData,
      drift_series: current,
      heatmap: mockData.heatmap.slice(0, step + 1).map(row => row.slice(0, step + 1)),
    };

    updateMetrics({
      ...mockData,
      drift_series: fullSeries.slice(0, step + 1),
    });
    renderCharts(partialData);

    step += 1;
    if (step >= turns) {
      clearInterval(interval);
    }
  }, 260);
}

document.addEventListener("DOMContentLoaded", () => {
  loadMockData();

  const simulateButton = document.getElementById("simulateButton");
  const resetButton = document.getElementById("resetButton");

  simulateButton.addEventListener("click", () => {
    animateDrift();
  });

  resetButton.addEventListener("click", () => {
    if (mockData) {
      updateMetrics(mockData);
      renderCharts(mockData);
    }
  });
});
