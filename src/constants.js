export const ROUTES = Object.freeze(['split', 'front', 'back', 'duplex', 'zine']);

export const TRANSFORMATION_PATHS = Object.freeze(['preserve', 'reduce', 'hybrid', 'distill']);

export const VIEW_COMPATIBILITY = Object.freeze({
  split: ['composite', 'base'],
  front: ['composite', 'base'],
  back: ['back'],
  duplex: ['front', 'back'],
  zine: ['composite', 'base']
});

export const CANVAS_PROFILES = Object.freeze({
  '3:2': { width: 1536, height: 1024, label: '3:2 landscape' },
  '2:3': { width: 1024, height: 1536, label: '2:3 portrait' },
  '4:5': { width: 1200, height: 1500, label: '4:5 portrait' },
  '3:5': { width: 972, height: 1620, label: '3:5 zine' },
  'A6-land': {
    width: 1748,
    height: 1240,
    label: 'A6 landscape',
    physical: { widthMm: 148, heightMm: 105, ppi: 300 }
  }
});

export const PAPER_PALETTES = Object.freeze({
  'warm-archive': { name: 'Warm Archive', color: '#f4eddf', ink: '#24201d' },
  'clean-natural': { name: 'Clean Natural', color: '#faf8f3', ink: '#252321' },
  'dusk-gray': { name: 'Dusk Gray', color: '#e4e2df', ink: '#29282a' },
  flax: { name: 'Flax', color: '#e7dcc3', ink: '#302b23' },
  'sun-aged': { name: 'Sun-aged', color: '#efe1b8', ink: '#302718' },
  charcoal: { name: 'Charcoal Presentation', color: '#292a2d', ink: '#f0eadf' }
});

export const UPLOAD_LIMITS = Object.freeze({
  maxBytes: 25 * 1024 * 1024,
  maxPixels: 40_000_000,
  maxWidth: 12_000,
  maxHeight: 12_000,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
});

export const QUALITY_STATUS = Object.freeze({
  VERIFIED: 'verified',
  DECLARED: 'declared',
  WARNING: 'warning',
  FAILED: 'failed',
  NOT_APPLICABLE: 'not-applicable'
});

export const COPY_FIELDS = Object.freeze(['location', 'date', 'caption']);

export const PRESETS = Object.freeze({
  demo1: {
    route: 'split',
    aspectRatio: '3:2',
    splitRatio: 0.46,
    marginSize: 0.04,
    preservationLevel: 'high',
    transformationPath: 'preserve',
    reductionLevel: 'none',
    subjectCategory: 'foliage',
    photoTreatment: 'framed',
    location: 'PONTIAN, JOHOR, MALAYSIA',
    date: 'APR 23, 2026',
    caption: 'A SMALL BLOOM, HELD FOR LATER.',
    writingRulesCount: 7,
    fontPairing: 'editorial',
    paperTone: 'warm-archive',
    accentColor: '#e05a36',
    accentReason: 'source resonance',
    postalMark: 'camera',
    printTexture: 'subtle',
    imagePath: 'demos/generated/demo-01-lantana-split-postcard.png',
    sceneAnchor: 'pink and yellow lantana on a quiet paper field',
    sceneDNA: 'clustered flowers against deep green leaves\nimage-left and writing-field-right relation',
    description: 'a generated lantana photograph in a split postcard'
  },
  demo2: {
    route: 'front',
    aspectRatio: '3:2',
    splitRatio: 0.46,
    marginSize: 0.04,
    preservationLevel: 'medium',
    transformationPath: 'preserve',
    reductionLevel: 'restrained',
    subjectCategory: 'city',
    photoTreatment: 'film',
    location: '',
    date: '',
    caption: 'THE RAIN LEFT FIRST.',
    writingRulesCount: 0,
    fontPairing: 'editorial',
    paperTone: 'warm-archive',
    accentColor: '#b94d3f',
    accentReason: 'subject emphasis',
    postalMark: 'dot',
    printTexture: 'film',
    imagePath: 'demos/generated/demo-02-rainy-bus-stop-front.png',
    sceneAnchor: 'empty red bus shelter after rain',
    sceneDNA: 'red shelter slightly right of center\nquiet wet street at blue hour',
    description: 'an empty red bus shelter after rain at blue hour'
  },
  demo3: {
    route: 'zine',
    aspectRatio: '3:5',
    splitRatio: 0.46,
    marginSize: 0.05,
    preservationLevel: 'low',
    transformationPath: 'distill',
    reductionLevel: 'distilled',
    subjectCategory: 'landscape',
    photoTreatment: 'silhouette',
    location: '',
    date: '',
    caption: 'BETWEEN TIDE AND MORNING.',
    writingRulesCount: 0,
    fontPairing: 'newsreader',
    paperTone: 'clean-natural',
    accentColor: '#e05a36',
    accentReason: 'temperature counterpoint',
    postalMark: 'none',
    printTexture: 'risograph',
    imagePath: 'demos/generated/demo-03-coastal-scene-zine.png',
    sceneAnchor: 'a small boat held between water and morning light',
    sceneDNA: 'one tiny boat\ncalm horizontal water\npalm gesture meeting a warm sun block',
    description: 'a source-free coastal relation with a boat, palm gesture, and sun block'
  }
});
