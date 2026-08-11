import test from 'node:test';
import assert from 'node:assert/strict';
import { generateImage, getGenerationAdapter, listGenerationAdapters, validateEndpoint } from '../src/generate.js';

const pngBase64 = 'iVBORw0KGgo=';

test('generic adapter sends prompt and optional source through a mocked fetch only', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      async json() { return { image: { base64: pngBase64, mime_type: 'image/png' } }; }
    };
  };
  const result = await generateImage({
    adapterId: 'generic-json',
    endpoint: 'https://images.example.test/generate',
    apiKey: 'session-secret',
    prompt: 'OUTPUT CONTRACT\nOne scene.',
    sourceImage: { base64: pngBase64, mimeType: 'image/png', name: 'source.png' },
    size: '1536x1024'
  }, { fetchImpl });
  assert.equal(result.base64, pngBase64);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer session-secret');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.prompt, 'OUTPUT CONTRACT\nOne scene.');
  assert.equal(body.source_image.base64, pngBase64);
  assert.doesNotMatch(calls[0].init.body, /session-secret/);
});

test('OpenAI Images-compatible adapter follows the adapter interface', async () => {
  const adapter = getGenerationAdapter('openai-images');
  const request = adapter.buildRequest({
    endpoint: 'https://api.example.test/v1/images/generations',
    apiKey: 'key',
    prompt: 'One quiet scene',
    model: 'gpt-image-2',
    size: '1024x1024'
  });
  assert.equal(request.init.method, 'POST');
  assert.equal(request.init.headers.Authorization, 'Bearer key');
  assert.deepEqual(JSON.parse(request.init.body), {
    model: 'gpt-image-2',
    prompt: 'One quiet scene',
    size: '1024x1024',
    output_format: 'png'
  });
  const result = await adapter.parseResponse({ async json() { return { data: [{ b64_json: pngBase64 }] }; } });
  assert.equal(result.base64, pngBase64);
});

test('OpenAI image edits use the documented multipart image array field', () => {
  const adapter = getGenerationAdapter('openai-images');
  const request = adapter.buildRequest({
    endpoint: 'https://api.example.test/v1/images/generations',
    apiKey: 'key',
    prompt: 'Preserve the scene',
    sourceImage: { base64: pngBase64, mimeType: 'image/png', name: 'source.png' }
  });
  assert.equal(request.url, 'https://api.example.test/v1/images/edits');
  assert.ok(request.init.body instanceof FormData);
  assert.equal(request.init.body.get('image'), null);
  assert.ok(request.init.body.get('image[]') instanceof Blob);
  assert.equal(request.init.body.get('model'), 'gpt-image-2');
});

test('adapter registry is vendor-neutral and endpoint validation rejects embedded credentials', () => {
  assert.deepEqual(listGenerationAdapters().map((entry) => entry.id), ['generic-json', 'openai-images']);
  assert.equal(validateEndpoint('http://127.0.0.1:9000/generate'), 'http://127.0.0.1:9000/generate');
  assert.throws(() => validateEndpoint('https://secret@example.test/generate'), /credentials/);
});

test('a generic data URL result preserves its supported MIME type', async () => {
  const result = await generateImage({
    endpoint: 'https://images.example.test/generate',
    prompt: 'One scene'
  }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() { return { image_base64: 'data:image/jpeg;base64,' + pngBase64 }; }
    })
  });
  assert.equal(result.base64, pngBase64);
  assert.equal(result.mimeType, 'image/jpeg');
});
