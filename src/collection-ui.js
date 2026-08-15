function itemSubtitle(item) {
  const role = item.narrativeRole || 'unplanned';
  const route = item.state.route || 'front';
  return route + ' · ' + role + ' · ' + item.qualityStatus;
}

function drawThumbnail(canvas, item) {
  const image = item.state.imageResource?.image;
  if (!image) return;
  const context = canvas.getContext('2d');
  const width = item.state.imageResource.width || image.width;
  const height = item.state.imageResource.height || image.height;
  const scale = Math.max(canvas.width / width, canvas.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
}

export function createCollectionUI(elements, callbacks) {
  function render(workspace, active) {
    elements.controlGroup.hidden = !active;
    elements.strip.hidden = !active;
    elements.singleUpload.hidden = active;
    elements.singleUploadStatus.hidden = active;
    elements.demoSelector.hidden = active;
    elements.exportArtwork.hidden = active && !workspace?.items.length;
    elements.exportContactSheet.hidden = !active || !workspace?.items.length;
    elements.exportManifest.hidden = !active || !workspace?.items.length;
    elements.itemCount.textContent = (workspace?.items.length || 0) + ' artwork' + (workspace?.items.length === 1 ? '' : 's');
    elements.items.replaceChildren();
    if (!active || !workspace) return;

    workspace.items.forEach((item, index) => {
      const wrapper = document.createElement('article');
      wrapper.className = 'collection-item' + (item.id === workspace.selectedItemId ? ' is-selected' : '');
      wrapper.setAttribute('role', 'listitem');

      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'collection-item-select';
      select.setAttribute('aria-pressed', String(item.id === workspace.selectedItemId));
      select.setAttribute('aria-label', 'Edit artwork ' + (index + 1) + ': ' + item.label);
      const thumbnail = document.createElement('canvas');
      thumbnail.width = 120;
      thumbnail.height = 64;
      thumbnail.className = 'collection-item-thumbnail';
      thumbnail.setAttribute('aria-hidden', 'true');
      drawThumbnail(thumbnail, item);
      const title = document.createElement('strong');
      title.textContent = String(index + 1).padStart(2, '0') + ' · ' + item.label;
      const subtitle = document.createElement('span');
      subtitle.textContent = itemSubtitle(item);
      select.append(thumbnail, title, subtitle);
      select.addEventListener('click', () => callbacks.onSelect(item.id));

      const moves = document.createElement('div');
      moves.className = 'collection-item-moves';
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.className = 'collection-move-btn';
      previous.textContent = '←';
      previous.disabled = index === 0;
      previous.setAttribute('aria-label', 'Move ' + item.label + ' earlier');
      previous.addEventListener('click', () => callbacks.onMove(item.id, -1));
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'collection-move-btn';
      next.textContent = '→';
      next.disabled = index === workspace.items.length - 1;
      next.setAttribute('aria-label', 'Move ' + item.label + ' later');
      next.addEventListener('click', () => callbacks.onMove(item.id, 1));
      moves.append(previous, next);
      wrapper.append(select, moves);
      elements.items.append(wrapper);
    });
  }

  elements.fileInput.addEventListener('change', (event) => {
    const files = [...(event.target.files || [])];
    if (files.length) callbacks.onFiles(files);
    event.target.value = '';
  });
  elements.planButton.addEventListener('click', callbacks.onPlan);
  [elements.name, elements.surface, elements.paper, elements.typography, elements.captionVoice, elements.accentLogic]
    .forEach((element) => element.addEventListener('change', callbacks.onIdentityChange));

  return { render };
}
