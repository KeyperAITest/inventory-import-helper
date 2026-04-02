// ==================================================
// FINAL CANONICAL IMPORT FORMAT
// ==================================================
const EXPECTED_HEADERS = [
  "StockNumber",
  "Make",
  "Model",
  "Year",
  "ExtColor",
  "",
  "IntColor",
  "VIN"
];

const EXPECTED_COL_COUNT = 8;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileInput").addEventListener("change", handleFile);
});

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
        downloadCSV(rows);
      } else {
        formatAndDownload(rows);
      }
    }
  });
}

// ==================================================
// VALIDATION RULES
// ==================================================

function hasValidStockNumbers(rows) {
  // Skip header row if present
  return rows.slice(1).every(row => row[0] && row[0].toString().trim() !== "");
}

function isAlreadyValid(rows) {
  const headerRow = rows[0];

  if (!headerRow || headerRow.length < EXPECTED_COL_COUNT) return false;

  return (
    headerRow[0] === "StockNumber" &&
    headerRow[1] === "Make" &&
    headerRow[2] === "Model" &&
    headerRow[3] === "Year" &&
    headerRow[7] === "VIN"
  );
}

// ==================================================
// FORMAT + NORMALIZE FILE
// ==================================================

function formatAndDownload(rows) {
  const output = [];

  // Add canonical headers
  output.push(EXPECTED_HEADERS);

  rows.forEach((row, index) => {
    if (index === 0 && row[0] === "StockNumber") return;

    const normalized = new Array(EXPECTED_COL_COUNT).fill("");

    normalized[0] = row[0] || ""; // StockNumber (required)
    normalized[1] = row[1] || ""; // Make
    normalized[2] = row[2] || ""; // Model
    normalized[3] = row[3] || ""; // Year

    // VIN is assumed to be last populated value in loose files
    normalized[7] = row[row.length - 1] || "";

    output.push(normalized);
  });

  showStatus(
    "ℹ️ This file was formatted to match the required import structure.",
    "info"
  );

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
