import { extractPngProvenance } from './provenance-reader.js';

const input = document.getElementById('provenanceFile');
const output = document.getElementById('provenanceOutput');
const status = document.getElementById('provenanceStatus');

input.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  output.textContent = '';
  status.textContent = 'Reading embedded PNG metadata locally…';
  try {
    const record = await extractPngProvenance(file);
    if (!record) {
      status.textContent = 'No Still Scenes provenance record was found.';
      return;
    }
    output.textContent = JSON.stringify(record, null, 2);
    status.textContent = 'Embedded provenance record found. No file data was transmitted.';
  } catch (error) {
    status.textContent = 'Could not read provenance: ' + error.message;
  }
});
