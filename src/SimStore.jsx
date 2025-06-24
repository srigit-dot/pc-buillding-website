import React, { useState } from "react";
import { useCart } from "./context/CartContext";
import "./styles/simstore.css";

export default function SimStore() {
  const [budget, setBudget] = useState("");
  const [task, setTask] = useState("general");
  const [output, setOutput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [currentBuild, setCurrentBuild] = useState(null);
  const { addToCart } = useCart();

  async function generateBuild() {
    if (!budget || parseFloat(budget) <= 0) {
      setSuggestion("❌ Please enter a valid budget.");
      setOutput("");
      setCurrentBuild(null);
      return;
    }

    try {
      console.log(`Fetching build for task: ${task}, budget: ${budget}`);
      const resp = await fetch(
        `http://localhost:3001/api/ai-build?task=${task}&budget=${budget}`
      );

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Server response:", errorText);
        throw new Error(`Server returned ${resp.status}: ${errorText}`);
      }

      const data = await resp.json();
      console.log("Received data:", data);

      if (data.error) {
        setSuggestion(`❌ ${data.error}`);
        setOutput("");
        setCurrentBuild(null);
        return;
      }

      setCurrentBuild(data.build);
      const parts = data.build;
      let total = 0;
      const html =
        parts
          .map((p) => {
            total += p.price;
            return `<p><strong>${p.type.toUpperCase()}</strong> ${
              p.model
            } <span style="float:right;">$${p.price}</span></p>`;
          })
          .join("") +
        `<hr><p><strong>Total:</strong> <span style="float:right;">$${total}</span></p>`;

      setOutput(html);
      setSuggestion(
        `✅ Build generated for ${task}-intensive tasks within your $${budget} budget!`
      );
    } catch (err) {
      console.error("Error details:", err);
      setSuggestion(`❌ Error generating build: ${err.message}`);
      setOutput("");
      setCurrentBuild(null);
    }
  }

  const handleAddToCart = async () => {
    if (!currentBuild) {
      setSuggestion(
        "❌ No build generated yet. Please generate a build first."
      );
      return;
    }

    try {
      // Add each component to cart
      for (const component of currentBuild) {
        await addToCart({
          productId: component.model,
          productName: `${component.type.toUpperCase()}: ${component.model}`,
          price: component.price,
          quantity: 1,
          type: component.type,
        });
      }
      setSuggestion("✅ All components added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSuggestion(`❌ Error adding to cart: ${error.message}`);
    }
  };

  return (
    <div className="simstore-container">
      <h1 className="simstore-title">🖥️ PC Build Simulation Store</h1>

      <div className="form-group">
        <label>Budget ($)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter your budget"
        />
      </div>

      <div className="form-group">
        <label>Usage Type</label>
        <select value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="general">General Tasks</option>
          <option value="cpu">CPU‑Intensive Tasks</option>
          <option value="gpu">GPU‑Intensive Tasks</option>
        </select>
      </div>

      <div className="button-group">
        <button onClick={generateBuild} className="simstore-btn simulate-btn">
          Simulate Build
        </button>

        {currentBuild && (
          <button
            onClick={handleAddToCart}
            className="simstore-btn add-cart-btn"
          >
            Add Build to Cart
          </button>
        )}
      </div>

      {output && (
        <div className="build-output">  
          <div dangerouslySetInnerHTML={{ __html: output }} />
        </div>
      )}

      {suggestion && (
        <div
          className={`suggestion ${
            suggestion.includes("❌") ? "error" : "success"
          }`}
        >
          {suggestion}
        </div>
      )}
    </div>
  );
}
