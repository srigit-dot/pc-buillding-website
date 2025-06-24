import React, { useState, useEffect } from "react";
import "./BottleneckChecker.css";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function BottleneckChecker() {
  const [cpus, setCpus] = useState([]);
  const [gpus, setGpus] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [selectedCpu, setSelectedCpu] = useState("");
  const [selectedGpu, setSelectedGpu] = useState("");
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("general");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await fetch("http://localhost:3004/api/parts");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.cpuList || !data.gpuList || !data.monitorList) {
          throw new Error("Missing required data in response");
        }
        setCpus(data.cpuList);
        setGpus(data.gpuList);
        setMonitors(data.monitorList);
        setError(null);
      } catch (error) {
        console.error("Error fetching parts:", error);
        setError("Failed to load component options. Please try again later.");
      }
    };

    fetchParts();
  }, []);

  const calculateBottleneck = () => {
    if (!selectedCpu || !selectedGpu || !selectedMonitor) {
      setError("Please select all components!");
      return;
    }

    const cpu = cpus.find((c) => c.name === selectedCpu);
    const gpu = gpus.find((g) => g.name === selectedGpu);
    const monitor = monitors.find((m) => m.name === selectedMonitor);

    if (!cpu || !gpu || !monitor) {
      setError("Invalid selection! Please retry.");
      return;
    }

    setLoading(true);
    setError(null);

    const cpuScore = cpu.benchmark_score;
    const gpuScore = gpu.benchmark_score;
    const resolution = monitor.resolution;

    let bottleneck =
      (Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore)) * 100;

    // Adjust bottleneck based on purpose and resolution
    if (selectedPurpose === "gaming") {
      if (resolution.includes("3840") || resolution.includes("4K")) {
        bottleneck *= 0.8;
      } else if (resolution.includes("1920")) {
        bottleneck *= 1.2;
      }
    } else if (selectedPurpose === "cpu") {
      bottleneck *= 1.5;
    } else if (selectedPurpose === "gpu") {
      bottleneck *= 0.7;
    }

    let suggestion = "✅ Perfect balance!";
    if (bottleneck > 30) {
      suggestion = "🔥 Severe bottleneck! Immediate upgrade needed!";
    } else if (bottleneck > 20) {
      suggestion =
        cpuScore > gpuScore ? "⚡ Upgrade your GPU!" : "⚡ Upgrade your CPU!";
    } else if (bottleneck > 10) {
      suggestion = "⚠️ Minor imbalance, but acceptable.";
    }

    setResult({
      cpu: cpu.name,
      gpu: gpu.name,
      monitor: monitor.name,
      cpuScore,
      gpuScore,
      resolution,
      bottleneck: bottleneck.toFixed(2),
      suggestion,
      upgradeHint:
        cpuScore < gpuScore
          ? "⚡ Consider upgrading your CPU for better balance."
          : "⚡ Consider upgrading your GPU for better balance.",
    });

    setLoading(false);
  };

  return (
    <div className="bottleneck-container">
      <h1>💻 PC Bottleneck Checker</h1>

      <div className="selectors">
        <select
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
          className="form-select"
        >
          <option value="general">General Tasks</option>
          <option value="gaming">Gaming</option>
          <option value="cpu">CPU-Intensive Tasks</option>
          <option value="gpu">GPU-Intensive Tasks</option>
        </select>

        <select
          value={selectedCpu}
          onChange={(e) => setSelectedCpu(e.target.value)}
          className="form-select"
        >
          <option value="">Select CPU</option>
          {cpus.map((cpu) => (
            <option key={cpu.name} value={cpu.name}>
              {cpu.name}
            </option>
          ))}
        </select>

        <select
          value={selectedGpu}
          onChange={(e) => setSelectedGpu(e.target.value)}
          className="form-select"
        >
          <option value="">Select GPU</option>
          {gpus.map((gpu) => (
            <option key={gpu.name} value={gpu.name}>
              {gpu.name}
            </option>
          ))}
        </select>

        <select
          value={selectedMonitor}
          onChange={(e) => setSelectedMonitor(e.target.value)}
          className="form-select"
        >
          <option value="">Select Monitor</option>
          {monitors.map((monitor) => (
            <option
              key={`${monitor.name}-${monitor.resolution}-${
                monitor.id || Math.random()
              }`}
              value={monitor.name}
            >
              {monitor.name} ({monitor.resolution})
            </option>
          ))}
        </select>

        <button
          onClick={calculateBottleneck}
          disabled={loading}
          className="check-button"
        >
          {loading ? "Calculating..." : "Check Bottleneck"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">🔄 Calculating...</div>}

      {result && !loading && !error && (
        <div className="result-container">
          <h2>Result:</h2>
          <div className="component-info">
            <p>
              <strong>Purpose:</strong> {selectedPurpose}
            </p>
            <p>
              <strong>CPU:</strong> {result.cpu}
            </p>
            <p>
              <strong>GPU:</strong> {result.gpu}
            </p>
            <p>
              <strong>Monitor:</strong> {result.monitor} ({result.resolution})
            </p>
            <p>
              <strong>CPU Score:</strong> {result.cpuScore.toLocaleString()}
            </p>
            <p>
              <strong>GPU Score:</strong> {result.gpuScore.toLocaleString()}
            </p>
          </div>

          <div className="chart-container">
            <Bar
              data={{
                labels: ["CPU", "GPU"],
                datasets: [
                  {
                    label: "Benchmark Score",
                    data: [result.cpuScore, result.gpuScore],
                    backgroundColor: [
                      parseFloat(result.bottleneck) < 30
                        ? "#4CAF50"
                        : "#ff4444",
                      parseFloat(result.bottleneck) < 30
                        ? "#4CAF50"
                        : "#ff4444",
                    ],
                    borderColor: [
                      parseFloat(result.bottleneck) < 30
                        ? "#388E3C"
                        : "#cc0000",
                      parseFloat(result.bottleneck) < 30
                        ? "#388E3C"
                        : "#cc0000",
                    ],
                    borderWidth: 1,
                    barThickness: 40,
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `Score: ${context.raw.toLocaleString()}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      font: {
                        size: 12,
                      },
                      callback: function (value) {
                        return value.toLocaleString();
                      },
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: "bold",
                      },
                    },
                  },
                },
                layout: {
                  padding: {
                    left: 10,
                    right: 30,
                    top: 10,
                    bottom: 10,
                  },
                },
              }}
            />
          </div>

          <div className="analysis-section">
            <h3>Analysis</h3>
            <p className="bottleneck-value">
              Bottleneck:{" "}
              <span className="percentage">{result.bottleneck}%</span>
            </p>
            <p className="suggestion">{result.suggestion}</p>
            <p className="upgrade-hint">{result.upgradeHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BottleneckChecker;
