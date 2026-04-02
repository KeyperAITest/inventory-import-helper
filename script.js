// ==================================================
// FIXED OUTPUT SCHEMA (ORDER IS NON-NEGOTIABLE)
// ==================================================
const OUTPUT_SCHEMA = [
  { key: "StockNumber" },
  { key: "Make" },
  { key: "Model" },
  { key: "Year" },
  { key: "ExtColor" },
  { key: "Blank1", type: "blank" },
  { key: "IntColor" },
  { key: "VIN" }
];

let parsedRows = [];
let mappings = {};

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

      const columnNames = parsedRows[0].map((_, i) => `Column ${i + 1}`);
      buildMappingUI(columnNames);
    }
  });
}

function buildMappingUI(columnNames) {
  const container = document.getElementById("mappingArea");
  container.innerHTML = "<h2>Map Your Columns</h2>";
  mappings = {};

  OUTPUT_SCHEMA.forEach((field) => {
    if (field.type === "blank") {
      container.innerHTML += `<p><strong>${field.key}</strong>: (blank)</p>`;
      return;
    }

    const select = document.createElement("select");
    select.innerHTML = `<option value="">-- Select Column --</option>`;

    columnNames.forEach((name, idx) => {
      const option = document.createElement("option");
      option.value = idx;
      option.textContent = name;
      select.appendChild(option);
    });

    select.onchange = (e) => {
      mappings[field.key] = parseInt(e.target.value, 10);
    };

    container.appendChild(document.createTextNode(field.key + ": "));
    container.appendChild(select);
    container.appendChild(document.createElement("br"));
  });

  document.getElementById("downloadBtn").disabled = false;
}

function generateCSV() {
  const output = [];

  // Header row for human visibility
  output.push(
    OUTPUT_SCHEMA.map(f => (f.type === "blank" ? "" : f.key))
  );

  parsedRows.forEach((row) => {
    const outRow = [];

    OUTPUT_SCHEMA.forEach((field) => {
      if (field.type === "blank") {
        outRow.push("");
      } else {
        const idx = mappings[field.key];
        outRow.push(row[idx] ?? "");
      }
    });

    output.push(outRow);
  });

  const csv = Papa.unparse(output);
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "formatted_inventory.csv";
  a.click();
}
