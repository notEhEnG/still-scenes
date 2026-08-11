function firstImagePayload(data) {
  const first = Array.isArray(data.data) ? data.data[0] : null;
  const image = data.image && typeof data.image === 'object' ? data.image : null;
  const base64 = image?.base64 || image?.b64_json || data.image_base64 || data.b64_json || first?.b64_json || first?.base64;
  const url = image?.url || data.image_url || data.url || first?.url;
  const mimeType = image?.mime_type || image?.mimeType || data.mime_type || data.mimeType || first?.mime_type || 'image/png';
  return { base64, url, mimeType };
}

export const genericJsonAdapter = Object.freeze({
  id: 'generic-json',
  label: 'Generic JSON image endpoint',
  buildRequest({ endpoint, apiKey, prompt, sourceImage, model, size }) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
    return {
      url: endpoint,
      init: {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers,
        body: JSON.stringify({
          prompt,
          model: model || undefined,
          source_image: sourceImage ? {
            mime_type: sourceImage.mimeType,
            filename: sourceImage.name || 'source-image',
            base64: sourceImage.base64
          } : null,
          output: { format: 'png', size: size || 'auto' }
        })
      }
    };
  },
  async parseResponse(response) {
    const data = await response.json();
    const payload = firstImagePayload(data);
    if (!payload.base64 && !payload.url) {
      throw new Error('The endpoint response did not contain an image base64 value or image URL.');
    }
    return payload;
  }
});
