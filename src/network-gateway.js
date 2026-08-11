import { generateImage } from './generate.js';

const status = document.getElementById('gatewayStatus');
const closeButton = document.getElementById('gatewayClose');

function setStatus(message, state = '') {
  status.textContent = message;
  status.dataset.state = state;
}

closeButton.addEventListener('click', () => window.close());

window.addEventListener('message', async (event) => {
  if (event.origin !== window.location.origin || event.source !== window.opener) return;
  const message = event.data;
  if (!message || message.type !== 'still-scenes-generation-request') return;
  const config = { ...message.config };
  let host = 'the configured endpoint';
  try {
    host = new URL(config.endpoint).host || host;
  } catch {
    // The shared validator will return the actionable endpoint error.
  }
  setStatus('Sending the compiled prompt' + (config.sourceImage ? ' and source image' : '') + ' to ' + host + '…', 'working');
  try {
    const result = await generateImage(config, { fetchImpl: window.fetch.bind(window) });
    window.opener.postMessage({
      type: 'still-scenes-generation-result',
      requestId: message.requestId,
      result
    }, window.location.origin);
    setStatus('Generation returned successfully. The image was sent back to the Studio for local verification.', 'success');
  } catch (error) {
    window.opener.postMessage({
      type: 'still-scenes-generation-error',
      requestId: message.requestId,
      message: error.message
    }, window.location.origin);
    setStatus('Generation failed: ' + error.message, 'error');
  } finally {
    config.apiKey = '';
    if (config.sourceImage) config.sourceImage.base64 = '';
  }
});

if (!window.opener) setStatus('Open this gateway from Still Scenes Studio. It does not accept standalone generation requests.', 'error');
