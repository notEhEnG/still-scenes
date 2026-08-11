function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function editEndpoint(endpoint) {
  return endpoint.replace(/\/generations\/?$/i, '/edits');
}

export const openAIImagesAdapter = Object.freeze({
  id: 'openai-images',
  label: 'OpenAI Images-compatible',
  buildRequest({ endpoint, apiKey, prompt, sourceImage, model, size }) {
    const headers = {};
    if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
    if (sourceImage) {
      const body = new FormData();
      body.set('model', model || 'gpt-image-2');
      body.set('prompt', prompt);
      body.set('size', size || 'auto');
      body.set('output_format', 'png');
      body.append('image[]', new Blob([decodeBase64(sourceImage.base64)], { type: sourceImage.mimeType }), sourceImage.name || 'source.png');
      return {
        url: editEndpoint(endpoint),
        init: { method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', headers, body }
      };
    }
    headers['Content-Type'] = 'application/json';
    return {
      url: endpoint,
      init: {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers,
        body: JSON.stringify({
          model: model || 'gpt-image-2',
          prompt,
          size: size || 'auto',
          output_format: 'png'
        })
      }
    };
  },
  async parseResponse(response) {
    const data = await response.json();
    const first = Array.isArray(data.data) ? data.data[0] : null;
    if (!first?.b64_json && !first?.url) {
      throw new Error('The OpenAI Images-compatible response did not contain data[0].b64_json or data[0].url.');
    }
    return { base64: first.b64_json, url: first.url, mimeType: 'image/png' };
  }
});
