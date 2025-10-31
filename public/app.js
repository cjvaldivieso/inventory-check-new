// Ensure everything runs after page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ app.js loaded successfully");

  const csvUpload = document.getElementById("csvUpload");
  const logTbody = document.getElementById("logTbody");
  const currentBinDisplay = document.getElementById("currentBin");
  let currentBin = null;

  if (!csvUpload) {
    console.error("❌ CSV upload input not found!");
    return;
  }

  // =========================
  // 📦 CSV UPLOAD HANDLER
  // =========================
  csvUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.rows) {
        logTbody.innerHTML = "";
        data.rows.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.item_id || ""}</td>
            <td>${row.expected_bin || ""}</td>
            <td>${row.scanned_bin || ""}</td>
            <td>${row.status || ""}</td>`;
          logTbody.appendChild(tr);
        });
      } else {
        alert("Error reading CSV.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to process CSV file.");
    }
  });

  // =========================
  // 📸 QR SCANNER (BIN + ITEM)
  // =========================
  const createScanner = async (label) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const video = document.createElement("video");
      video.setAttribute("playsinline", true);
      video.srcObject = stream;
      await video.play();

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "9999";

      const text = document.createElement("p");
      text.innerText = `Scanning ${label} QR...`;
      text.style.color = "#fff";
      text.style.marginBottom = "12px";
      overlay.appendChild(text);
      overlay.appendChild(video);
      document.body.appendChild(overlay);

      const { default: QrScanner } = await import(
        "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js"
      );
      const qrScanner = new QrScanner(video, (result) => {
        alert(`${label} Scanned: ${result.data}`);
        if (label === "BIN") {
          currentBin = result.data;
          currentBinDisplay.textContent = `Current Bin: ${currentBin}`;
        }
        qrScanner.stop();
        stream.getTracks().forEach((t) => t.stop());
        document.body.removeChild(overlay);
      });
      qrScanner.start();
    } catch (err) {
      console.error("Camera access failed:", err);
      alert(
        "⚠️ Unable to access camera. Go to iPhone Settings → Chrome or Safari → enable Camera."
      );
    }
  };

  document
    .getElementById("scanBinQrBtn")
    ?.addEventListener("click", () => createScanner("BIN"));
console.log("✅ Scan BIN button clicked");
  document
    .getElementById("scanItemQrBtn")
    ?.addEventListener("click", () => createScanner("Item"));

  // =========================
  // 📤 EXPORT CSV
  // =========================
  document
    .getElementById("exportCsvBtn")
    ?.addEventListener("click", () => alert("Export CSV not implemented yet."));

  // =========================
  // 🧾 FINALIZE AUDIT
  // =========================
  document
    .getElementById("finalizeBtn")
    ?.addEventListener("click", () => alert("Audit finalized! ✅"));

  // =========================
  // 📲 PWA INSTALL PROMPT
  // =========================
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.createElement("button");
    installBtn.textContent = "Install Shappi Inventory";
    installBtn.style.position = "fixed";
    installBtn.style.bottom = "20px";
    installBtn.style.right = "20px";
    installBtn.style.background = "#6c4ef3";
    installBtn.style.color = "#fff";
    installBtn.style.padding = "10px 16px";
    installBtn.style.border = "none";
    installBtn.style.borderRadius = "8px";
    installBtn.style.cursor = "pointer";
    installBtn.style.zIndex = "1000";

    installBtn.onclick = async () => {
      installBtn.style.display = "none";
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      deferredPrompt = null;
    };

    document.body.appendChild(installBtn);
  });
});

