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

  const EXPECTED_COL_COUNT = OUTPUT_SCHEMA.length;

  // Header row for visibility
  output.push(OUTPUT_SCHEMA);

  parsedRows.forEach(row => {
    // Ensure row has correct number of columns
    const normalizedRow = [...row];
    while (normalizedRow.length < EXPECTED_COL_COUNT) {
      normalizedRow.push("");
    }

    const newRow = [];
    for (let i = 0; i < EXPECTED_COL_COUNT; i++) {
      newRow.push(normalizedRow[i] || "");
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


  const csv = Papa.unparse(output);
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "formatted_inventory.csv";
  link.click();
}
