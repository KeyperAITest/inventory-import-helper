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

let parsedData = [];
let mappings = {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileInput").addEventListener("change", handleFile);
  document.getElementById("downloadBtn").addEventListener("click", generateCSV);
});

function handleFile(event) {
  const file = event.target.files[0];

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      parsedData = results.data;
      buildMappingUI(Object.keys(results.data[0]));
    }
  });
}

function buildMappingUI(headers) {
  const container = document.getElementById("mappingArea");
  container.innerHTML = "<h2>Map Your Columns</h2>";
  mappings = {};

  OUTPUT_SCHEMA.forEach(field => {
    if (field.type === "blank") {
      mappings[field.key] = null;
      container.innerHTML += `<p><strong>${field.key}</strong>: (blank column)</p>`;
      return;
    }

    const select = document.createElement("select");
    select.innerHTML = `<option value="">-- Select Column --</option>`;

    headers.forEach(h => {
      select.innerHTML += `<option value="${h}">${h}</option>`;
    });

    select.onchange = e => mappings[field.key] = e.target.value;

    container.appendChild(document.createTextNode(field.key + ": "));
    container.appendChild(select);
    container.appendChild(document.createElement("br"));
  });

  document.getElementById("downloadBtn").disabled = false;
}

function generateCSV() {
  const output = [];

  parsedData.forEach(row => {
    const newRow = [];

    OUTPUT_SCHEMA.forEach(field => {
      if (field.type === "blank") {
        newRow.push("");
      } else if (mappings[field.key]) {
        newRow.push(row[mappings[field.key]] || "");
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
