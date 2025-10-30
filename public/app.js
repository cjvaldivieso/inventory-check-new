// ✅ Confirm that the JS file is loaded
console.log("✅ app.js loaded successfully");

document.addEventListener("DOMContentLoaded", () => {
  const csvUpload = document.getElementById("csvUpload");
  const logTbody = document.getElementById("logTbody");
  const currentBinDisplay = document.getElementById("currentBin");

  if (!csvUpload) {
    console.error("CSV upload input not found!");
    return;
  }

  // ✅ CSV upload handler
  csvUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload CSV");
      const data = await res.json();

      alert(`✅ ${data.message}\n📦 ${data.total} records loaded.`);

      // 🧾 Display results in table
      if (data.records && Array.isArray(data.records)) {
        logTbody.innerHTML = "";
        data.records.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row["Item ID"] || ""}</td>
            <td>${row["Warehouse Bin ID"] || ""}</td>
            <td>${row["Status"] || ""}</td>
            <td>${row["Category"] || ""}</td>
          `;
          logTbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Error uploading file: " + err.message);
    }
  });
});

