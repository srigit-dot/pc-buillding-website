async function generateBuild() {
  const budget     = parseInt(document.getElementById("budget").value, 10);
  const task       = document.getElementById("task").value;
  const buildOut   = document.getElementById("buildOutput");
  const suggestOut = document.getElementById("suggestionOutput");

  buildOut.innerHTML = '';
  suggestOut.innerHTML = '';

  if (isNaN(budget) || budget <= 0) {
    suggestOut.innerHTML = '<p style="color:red">❌ Please enter a valid budget.</p>';
    return;
  }

  try {
    const resp = await fetch(`/api/ai-build?task=${task}&budget=${budget}`);
    if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
    const data = await resp.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate build');
    }

    // Display the build information
    buildOut.innerHTML = `
      <p><strong>Task:</strong> ${data.task}</p>
      <p><strong>Budget:</strong> ${data.budget}</p>
      <p><strong>Status:</strong> ${data.message}</p>
    `;

    suggestOut.innerHTML = '<p style="color:green">✅ Build generated successfully!</p>';

  } catch (err) {
    suggestOut.innerHTML = `<p style="color:red">❌ Error: ${err.message}</p>`;
  }
}
