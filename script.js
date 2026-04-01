// ==========================================
// CANONICAL OUTPUT SCHEMA (ORDER IS CRITICAL)
// ==========================================
const OUTPUT_SCHEMA = [
  { key: "StockNumber", required: true },
  { key: "Make" },
  { key: "Model" },
  { key: "Year" },
  { key: "ExtColor" },
  { key: "Blank1", type: "blank" },
  { key: "IntColor" },
  { key: "VIN" }
];

// Parsed CSV data (array of rows)
let parsedData = [];

// Mapping from output field -> "Column X"
let mappings = {};

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("fileInput").addEventListener("change", handleFile);
  document.getElementById("downloadBtn").addEventListener("click", generateCSV);
});

// ==========================================
// FILE INGESTION (HEADERLESS CSV SUPPORT)
// ==========================================
function handleFile(event) {
  const file = event.target.files[0];

  Papa.parse(file, {
    header: false,           // IMPORTANT: we expect NO headers
    skipEmptyLines: true,
    complete: function (results) {
      parsedData = results.data;

      // Generate generic column names based on position
      const headers = parsedData[0].map(function (_, index) {
        return `Column ${index + 1}`;
      });

      buildMappingUI(headers);
    }
  });
}

// ==========================================
// BUILD COLUMN‑MAPPING UI
// ==========================================
function buildMappingUI(headers) {
  const container = document.getElementById("mappingArea");
  container.innerHTML = "<h2>Map Your Columns</h2>";

  mappings = {};

  OUTPUT_SCHEMA.forEach(function (field) {

    // Locked blank columns
    if (field.type === "blank") {
      mappings[field.key] = null;
      container.innerHTML +=
        `<p><strong>${field.key}</strong>: (system-required blank column)</p>`;
      return;
    }

    const select = document.createElement("select");
    select.innerHTML = `<option value="">-- Select Column --</option>`;

    headers.forEach(function (header) {
      const option = document.createElement("option");
      option.value = header;
      option.textContent = header;
      select.appendChild(option);
    });

    select.onchange = function (e) {
      mappings[field.key] = e.target.value;
    };

    container.appendChild(document.createTextNode(field.key + ": "));
    container.appendChild(select);
    container.appendChild(document.createElement("br"));
  });

  document.getElementById("downloadBtn").disabled = false;
}

// ==========================================
// GENERATE FINAL IMPORT‑READY CSV
// ==========================================
function generateCSV() {
  const output = [];

  // Optional but useful header row for readability
  output.push(
    OUTPUT_SCHEMA.map(function (field) {
      return field.type === "blank" ? "" : field.key;
    })
  );

  parsedData.forEach(function (row) {
    const newRow = [];

    OUTPUT_SCHEMA.forEach(function (field) {
      if (field.type === "blank") {
        newRow.push("");
      } else if (mappings[field.key]) {
        // Extract column number from "Column X"
        const columnIndex =
          parseInt(mappings[field.key].replace("Column ", ""), 10) - 1;

        newRow.push(row[columnIndex] || "");
      } else {
        newRow.push("");
      }
    });

    output.push(newRow);
  });

  const csv = Papa.unparse(output);
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "formatted_inventory.csv";
  link.click();
}
