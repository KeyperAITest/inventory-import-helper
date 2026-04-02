// ==================================================
// FINAL CANONICAL IMPORT FORMAT
// ==================================================
const EXPECTED_HEADERS = [
  "stocknumber",
  "make",
  "model",
  "year",
  "extcolor",
  "",
  "intcolor",
  "vin"
];

const EXPECTED_COL_COUNT = 8;
const MIN_VIN_LENGTH = 7;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileInput").addEventListener("change", handleFile);
});

// ==================================================
// FILE INGESTION
// ==================================================
function handleFile(event) {
  const file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data;

      if (!hasValidStockNumbers(rows)) {
        showStatus(
          "❌ StockNumber is required for import. One or more rows are missing it.",
          "error"
        );
        return;
      }

      if (isAlreadyValid(rows)) {
        showStatus(
          "✅ This file already matches the required import format.",
          "success"
        );
        formatAndDownload(rows); // still normalize to avoid drift
      } else {
        showStatus(
          "ℹ️ File was formatted to match the required import structure.",
          "info"
        );
        formatAndDownload(rows);
      }
    }
  });
}

// ==================================================
// VALIDATION
// ==================================================
function hasValidStockNumbers(rows) {
  return rows.slice(1).every(
    row => row[0] && row[0].toString().trim() !== ""
  );
}

function isAlreadyValid(rows) {
  const headerRow = rows[0];
  if (!headerRow || headerRow.length < EXPECTED_COL_COUNT) return false;

  return EXPECTED_HEADERS.every((expected, idx) => {
    if (expected === "") return true; // allow blank placeholder columns

    const actual = (headerRow[idx] || "")
      .toString()
      .trim()
      .toLowerCase();

    return actual === expected;
  });
}

// ==================================================
// VIN HANDLING
// ==================================================
function extractVin(row) {
  const candidate = row[row.length - 1];
  if (!candidate) return "";

  const vin = candidate.toString().trim();
  return vin.length >= MIN_VIN_LENGTH ? vin : "";
}

// ==================================================
// FORMAT + NORMALIZE
// ==================================================
function formatAndDownload(rows) {
  const output = [];

  output.push([
    "StockNumber",
    "Make",
    "Model",
    "Year",
    "ExtColor",
    "",
    "IntColor",
    "VIN"
  ]);

  rows.forEach((row, index) => {
    // Skip header row if present
    if (index === 0 && row[0]?.toString().toLowerCase().trim() === "stocknumber") {
      return;
    }

    const normalized = new Array(EXPECTED_COL_COUNT).fill("");

    normalized[0] = row[0] || "";
    normalized[1] = row[1] || "";
    normalized[2] = row[2] || "";
    normalized[3] = row[3] || "";
    normalized[4] = row[4] || "";
    normalized[6] = row[6] || "";
    normalized[7] = extractVin(row);

    output.push(normalized);
  });

  downloadCSV(output);
}

// ==================================================
// STATUS UI
// ==================================================
function showStatus(message, type) {
  const area = document.getElementById("mappingArea");
  area.innerHTML = "";

  const notice = document.createElement("p");
  notice.textContent = message;
  notice.style.padding = "10px";
  notice.style.marginTop = "15px";
  notice.style.borderRadius = "4px";

  if (type === "success") {
    notice.style.backgroundColor = "#e6f4ea";
    notice.style.color = "#1e4620";
  } else if (type === "error") {
    notice.style.backgroundColor = "#fdecea";
    notice.style.color = "#611a15";
  } else {
    notice.style.backgroundColor = "#eef3fc";
    notice.style.color = "#1c3c78";
  }

  area.appendChild(notice);
}

// ==================================================
// CSV OUTPUT
// ==================================================
function downloadCSV(data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "formatted_inventory.csv";
  link.click();
}
