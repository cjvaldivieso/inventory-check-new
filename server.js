import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let inventoryData = [];

// ✅ Set up multer storage for uploads
const upload = multer({ dest: "uploads/" });

// ✅ CSV upload endpoint
app.post("/upload-csv", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      inventoryData = results;
      fs.unlinkSync(req.file.path); // cleanup temp file
      res.json({
  message: "CSV uploaded successfully",
  total: results.length,
  records: results.slice(0, 50), // send first 50 rows to browser
});
    })
    .on("error", (err) => {
      console.error("Error parsing CSV:", err);
      res.status(500).json({ message: "Error reading CSV file" });
    });
});

// ✅ Basic health route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

