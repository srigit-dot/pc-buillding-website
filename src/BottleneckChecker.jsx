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

  useEffect(() => {
    console.log("Fetching parts from API...");
    fetch("http://localhost:3004/api/parts")
      .then((res) => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Received data:", {
          cpuCount: data.cpuList?.length || 0,
          gpuCount: data.gpuList?.length || 0,
          monitorCount: data.monitorList?.length || 0,
        });
        if (!data.cpuList || !data.gpuList || !data.monitorList) {
          throw new Error("Missing required data in response");
        }
        setCpus(data.cpuList);
        setGpus(data.gpuList);
        setMonitors(data.monitorList);
      })
      .catch((error) => {
        console.error("Error fetching parts:", error);
        setResult({
          error: `Failed to load component options: ${error.message}`,
        });
      });
  }, []);

  const calculateBottleneck = async () => {
    if (!selectedCpu || !selectedGpu || !selectedMonitor) {
      setResult({ error: "Please select CPU, GPU, and Monitor!" });
      return;
    }

    const cpu = cpus.find((c) => c.name === selectedCpu);
    const gpu = gpus.find((g) => g.name === selectedGpu);
    const monitor = monitors.find((m) => m.name === selectedMonitor);

    if (!cpu || !gpu || !monitor) {
      setResult({ error: "Invalid selection! Please retry." });
      return;
    }

    setLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      const cpuScore = cpu.benchmark_score;
      const gpuScore = gpu.benchmark_score;
      const resolution = monitor.resolution;

      let bottleneck =
        (Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore)) * 100;

      // Adjust bottleneck depending on monitor resolution and purpose
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
    }, 1200); // Loading delay for better UX
  };

  return (
    <div className="bottleneck-container">
      <h1>🖥️ PC Bottleneck Checker</h1>

      <div className="selectors">
        <select
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
        >
          <option value="general">General Tasks</option>
          <option value="cpu">CPU-Intensive Tasks</option>
          <option value="gpu">GPU-Intensive Tasks</option>
        </select>

        <select
          value={selectedCpu}
          onChange={(e) => setSelectedCpu(e.target.value)}
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
        >
          <option value="">Select Monitor</option>
          {monitors.map((monitor) => (
            <option
              key={`${monitor.name}-${monitor.resolution}`}
              value={monitor.name}
            >
              {monitor.name} ({monitor.resolution})
            </option>
          ))}
        </select>

        <button onClick={calculateBottleneck} disabled={loading}>
          {loading ? "Calculating..." : "Check Bottleneck"}
        </button>
      </div>

      {loading && <div className="loading">🔄 Calculating...</div>}

      {result && !loading && !result.error && (
        <div className="result">
          <h2>Result:</h2>
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
            <strong>CPU Score:</strong> {result.cpuScore}
          </p>
          <p>
            <strong>GPU Score:</strong> {result.gpuScore}
          </p>

          <div className="chart-container">
            <Bar
              data={{
                labels: ["CPU", "GPU"],
                datasets: [
                  {
                    label: "Benchmark Score",
                    data: [result.cpuScore, result.gpuScore],
                    backgroundColor: [
                      result.bottleneck > 30 ? "red" : "green",
                      result.bottleneck > 30 ? "red" : "green",
                    ],
                  },
                ],
              }}
              options={{ indexAxis: "y", responsive: true }}
            />
          </div>

          <p
            style={{
              color:
                result.bottleneck > 30
                  ? "red"
                  : result.bottleneck > 20
                  ? "orange"
                  : "green",
            }}
          >
            <strong>Bottleneck:</strong> {result.bottleneck}%
          </p>

          <div className="analysis">
            <strong>Analysis:</strong>
            <br />
            {result.suggestion}
            <br />
            <span style={{ fontWeight: "bold", color: "red" }}>
              {result.upgradeHint}
            </span>
          </div>
        </div>
      )}

      {result?.error && <div className="error">{result.error}</div>}
    </div>
  );
}

export default BottleneckChecker;
