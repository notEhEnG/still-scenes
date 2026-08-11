import { PROVENANCE_KEYWORD } from './provenance.js';

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readUint32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
}

function nullIndex(bytes, start) {
  for (let index = start; index < bytes.length; index += 1) if (bytes[index] === 0) return index;
  return -1;
}

function decodeITxt(data) {
  let cursor = nullIndex(data, 0);
  if (cursor < 0) return null;
  const keyword = new TextDecoder('latin1').decode(data.subarray(0, cursor));
  cursor += 1;
  const compressed = data[cursor];
  cursor += 2;
  const languageEnd = nullIndex(data, cursor);
  if (languageEnd < 0) return null;
  cursor = languageEnd + 1;
  const translatedEnd = nullIndex(data, cursor);
  if (translatedEnd < 0 || compressed !== 0) return null;
  cursor = translatedEnd + 1;
  return { keyword, text: new TextDecoder().decode(data.subarray(cursor)) };
}

function decodeText(data) {
  const separator = nullIndex(data, 0);
  if (separator < 0) return null;
  return {
    keyword: new TextDecoder('latin1').decode(data.subarray(0, separator)),
    text: new TextDecoder('latin1').decode(data.subarray(separator + 1))
  };
}

export function extractPngProvenanceBytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 8 || !PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error('The selected file is not a PNG.');
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const type = new TextDecoder('latin1').decode(bytes.subarray(offset + 4, offset + 8));
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const decoded = type === 'iTXt' ? decodeITxt(data) : type === 'tEXt' ? decodeText(data) : null;
    if (decoded?.keyword === PROVENANCE_KEYWORD) {
      try {
        return JSON.parse(decoded.text);
      } catch {
        throw new Error('The embedded Still Scenes provenance record is not valid JSON.');
      }
    }
    if (type === 'IEND') break;
    offset = end;
  }
  return null;
}

export async function extractPngProvenance(fileOrBlob) {
  if (!fileOrBlob || typeof fileOrBlob.arrayBuffer !== 'function') throw new Error('Choose a PNG file or Blob.');
  return extractPngProvenanceBytes(new Uint8Array(await fileOrBlob.arrayBuffer()));
}
