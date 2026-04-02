// ==================================================
// FIXED POSITION IMPORT FORMAT
// ==================================================
const OUTPUT_SCHEMA = [
  "StockNumber",
  "Make",
  "Model",
  "Year",
  "ExtColor",
  "",          // Blank column
  "IntColor",
  "VIN"
];

let parsedRows = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileInput").addEventListener("change", handleFile);
  document.getElementById("downloadBtn").addEventListener("click", generateCSV);
});

function handleFile(event) {
  const file = event.target.files[0];

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
      parsedRows = results.data;
      document.getElementById("mappingArea").innerHTML =
        "<p><strong>File detected in standard import format.</strong></p>";
      document.getElementById("downloadBtn").disabled = false;
    }
  });
}

function generateCSV() {
  const output = [];

  // Header row for visibility
  output.push(OUTPUT_SCHEMA);

  // Copy rows positionally
  parsedRows.forEach(row => {
    const newRow = [];

    for (let i = 0; i < OUTPUT_SCHEMA.length; i++) {
      newRow.push(row[i] || "");
    }

    output.push(newRow);
  });

  const csv = Papa.unparse(output);
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "formatted_inventory.csv";
  link.click();
}
