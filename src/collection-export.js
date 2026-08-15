export function contactSheetGeometry(items, options = {}) {
  const count = Math.max(1, items.length);
  const width = options.width || 2048;
  const columns = count <= 2 ? count : count <= 6 ? 2 : count <= 9 ? 3 : 4;
  const padding = options.padding || 64;
  const gap = options.gap || 36;
  const headerHeight = options.headerHeight || 150;
  const cellWidth = (width - padding * 2 - gap * (columns - 1)) / columns;
  const cellHeight = Math.round(cellWidth * 0.82);
  const rows = Math.ceil(count / columns);
  const height = padding + headerHeight + rows * cellHeight + Math.max(0, rows - 1) * gap + padding;
  return { width, height, columns, rows, padding, gap, headerHeight, cellWidth, cellHeight };
}

function contain(sourceWidth, sourceHeight, target) {
  const scale = Math.min(target.width / sourceWidth, target.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: target.x + (target.width - width) / 2,
    y: target.y + (target.height - height) / 2,
    width,
    height
  };
}

export function renderCollectionContactSheet(items, options = {}) {
  const geometry = contactSheetGeometry(items, options);
  const canvas = document.createElement('canvas');
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#121316';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f0f2f5';
  context.font = '600 42px system-ui, sans-serif';
  context.fillText(options.title || 'Still Scenes Collection', geometry.padding, geometry.padding + 44);
  context.fillStyle = '#b7bdca';
  context.font = '24px system-ui, sans-serif';
  context.fillText(items.length + ' artworks · upload order preserved', geometry.padding, geometry.padding + 88);

  items.forEach((item, index) => {
    const column = index % geometry.columns;
    const row = Math.floor(index / geometry.columns);
    const x = geometry.padding + column * (geometry.cellWidth + geometry.gap);
    const y = geometry.padding + geometry.headerHeight + row * (geometry.cellHeight + geometry.gap);
    const imageArea = { x, y, width: geometry.cellWidth, height: geometry.cellHeight - 64 };
    context.fillStyle = '#222530';
    context.fillRect(x, y, geometry.cellWidth, geometry.cellHeight);
    const target = contain(item.canvas.width, item.canvas.height, imageArea);
    context.drawImage(item.canvas, target.x, target.y, target.width, target.height);
    context.fillStyle = '#f0f2f5';
    context.font = '600 22px system-ui, sans-serif';
    context.fillText(String(index + 1).padStart(2, '0') + ' · ' + (item.route || 'front'), x + 16, y + geometry.cellHeight - 31);
    context.fillStyle = '#b7bdca';
    context.font = '18px system-ui, sans-serif';
    const label = String(item.caption || item.label || 'Untitled').slice(0, 44);
    context.fillText(label, x + 112, y + geometry.cellHeight - 31);
  });
  return canvas;
}

export function createCollectionManifest(workspace, itemRecords) {
  return {
    schema: 'still-scenes/collection-manifest/v1',
    exportedAt: new Date().toISOString(),
    collection: {
      name: workspace.name,
      orderPolicy: workspace.orderPolicy,
      defaultRoute: workspace.defaultRoute,
      collectionDNA: workspace.collectionDNA,
      sequencePlan: workspace.sequencePlan,
      variationLedger: workspace.variationSet ? {
        schema: workspace.variationSet.schema,
        guard: workspace.variationSet.guard,
        renderedGuard: workspace.variationSet.renderedGuard
      } : null
    },
    items: itemRecords.map((record, index) => ({
      order: index + 1,
      id: record.id,
      label: record.label,
      route: record.route,
      caption: record.caption,
      narrativeRole: record.narrativeRole,
      pace: record.pace,
      recipe: record.recipe,
      resolvedRecipe: record.resolvedRecipe,
      brief: record.brief ? {
        ...record.brief,
        source: record.brief.source ? { ...record.brief.source, filename: null } : null
      } : null,
      prompt: record.prompt,
      qualityStatus: record.qualityStatus,
      source: record.source ? {
        sha256: record.source.sha256,
        mimeType: record.source.mimeType,
        width: record.source.width,
        height: record.source.height
      } : null,
      artifact: record.artifact,
      provenance: record.provenance
    })),
    privacy: {
      rawSourceBytesIncluded: false,
      exifIncluded: false,
      credentialsIncluded: false,
      inferredLocationIncluded: false,
      userAuthoredMemoryEvidenceIncluded: true,
      reviewBeforeSharing: true
    }
  };
}
