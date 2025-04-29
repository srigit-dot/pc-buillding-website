import React, { useState } from "react";
import { useCart } from "./context/CartContext";

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
            return `<p><strong>${p.type}</strong>: ${p.model} <span style="float:right;">$${p.price} (Score: ${p.score})</span></p>`;
          })
          .join("") + `<hr><p><strong>Total:</strong> $${total}</p>`;

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
          productName: `${component.type}: ${component.model}`,
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
    <div className="p-4 max-w-xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">🖥️ PC Build Simulation Store</h1>

      <div className="space-y-4">
        <div>
          <label className="block">Budget ($)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block">Usage Type</label>
          <select
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="general">General Tasks</option>
            <option value="cpu">CPU‑Intensive Tasks</option>
            <option value="gpu">GPU‑Intensive Tasks</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateBuild}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
          >
            Simulate Build
          </button>

          {currentBuild && (
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
            >
              Add Build to Cart
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div dangerouslySetInnerHTML={{ __html: output }} />
        <div className="mt-4 text-sm">{suggestion}</div>
      </div>
    </div>
  );
}
