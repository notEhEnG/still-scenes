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

const BUILT_IN_PRESETS = {
  demo1: {
    route: 'split',
    aspectRatio: '3:2',
    splitRatio: 0.46,
    marginSize: 0.04,
    preservationLevel: 'native',
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
    preservationLevel: 'native',
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
    label: 'Demo 03: Coastal Scene Zine',
    route: 'zine',
    aspectRatio: '3:5',
    splitRatio: 0.46,
    marginSize: 0.05,
    preservationLevel: 'native',
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
  },
  demo4: {
    label: 'Demo 04: Tea Window Split',
    route: 'split', aspectRatio: '3:2', splitRatio: 0.45, marginSize: 0.04,
    preservationLevel: 'native', transformationPath: 'preserve', reductionLevel: 'restrained', subjectCategory: 'general', photoTreatment: 'film',
    location: '', date: '', caption: 'A QUIET HOUR, POURED SLOWLY.', writingRulesCount: 5,
    fontPairing: 'editorial', paperTone: 'warm-archive', accentColor: '#a44f3b', accentReason: 'source resonance', postalMark: 'dot', printTexture: 'film',
    imagePath: 'demos/generated/demo-04-tea-window-split.png', sceneAnchor: 'one amber cup beside a rain-speckled window',
    sceneDNA: 'one cup remains the anchor\nrain and tropical greenery stay secondary', description: 'an original tea-window split-card artwork'
  },
  demo5: {
    label: 'Demo 05: Tropical Laundry Front',
    route: 'front', aspectRatio: '2:3', splitRatio: 0.46, marginSize: 0.04,
    preservationLevel: 'native', transformationPath: 'preserve', reductionLevel: 'restrained', subjectCategory: 'general', photoTreatment: 'film',
    location: '', date: '', caption: 'AFTERNOON MOVES IN WHITE SHEETS.', writingRulesCount: 0,
    fontPairing: 'editorial', paperTone: 'clean-natural', accentColor: '#c99b32', accentReason: 'subject emphasis', postalMark: 'none', printTexture: 'film',
    imagePath: 'demos/generated/demo-05-tropical-laundry-front.png', sceneAnchor: 'three white sheets moving in a tropical courtyard',
    sceneDNA: 'three sheets remain visible\none yellow clothespin stays the color anchor', description: 'an original tropical-laundry postcard artwork'
  },
  demo6: {
    label: 'Demo 06: Night Shophouse Zine',
    route: 'zine', aspectRatio: '3:5', splitRatio: 0.46, marginSize: 0.05,
    preservationLevel: 'native', transformationPath: 'distill', reductionLevel: 'distilled', subjectCategory: 'city', photoTreatment: 'silhouette',
    location: '', date: '', caption: 'ONE LIGHT STAYED ON.', writingRulesCount: 0,
    fontPairing: 'newsreader', paperTone: 'dusk-gray', accentColor: '#d4a62a', accentReason: 'subject emphasis', postalMark: 'none', printTexture: 'risograph',
    imagePath: 'demos/generated/demo-06-night-shophouse-zine.png', sceneAnchor: 'one lit shophouse window at night',
    sceneDNA: 'one warm window inside a simplified facade\nmost of the paper remains quiet', description: 'an original source-free night-shophouse zine artwork'
  },
  demo7: {
    label: 'Demo 07: Monsoon Writing Back',
    route: 'back', aspectRatio: '3:2', splitRatio: 0.46, marginSize: 0.04,
    preservationLevel: 'native', transformationPath: 'preserve', reductionLevel: 'none', subjectCategory: 'general', photoTreatment: 'framed',
    location: '', date: '', caption: 'FROM THE RAINY SIDE OF TOWN.', writingRulesCount: 7,
    fontPairing: 'editorial', paperTone: 'clean-natural', accentColor: '#3d5f98', accentReason: 'directional cue', postalMark: 'stamp', printTexture: 'subtle',
    imagePath: 'demos/generated/demo-07-monsoon-writing-back.png', sceneAnchor: 'a writable monsoon-themed postcard back',
    sceneDNA: 'message field remains usable\nrecipient field and empty stamp frame stay separate', description: 'an original monsoon writing-back artwork'
  }
};

BUILT_IN_PRESETS.demo1.label = 'Demo 01: Lantana Split';
BUILT_IN_PRESETS.demo2.label = 'Demo 02: Rainy Bus Stop';

export const USER_PHOTO_MANIFEST_ROWS = Object.freeze([
  ['U01', '20250817_194352.jpg', 'c075f9952153b4fedc1db6a8fd85a219a479d967013d81be44905f2dadee1b0f', 'demo-u01-wires-split-postcard.png', '0d2da4ca9fcfd0421791d0065ed9044e11df471384ccd9428fc6ebe9d5458f55', '1536x1024', 'split writable postcard', 'THE WIRES HELD THE LAST LIGHT.'],
  ['U02', '20250916_192311.jpg', 'b547042e46b875009d22dfd6a179d5049369810972048cfae95fe9e380a74ba0', 'demo-u02-sea-full-bleed.png', '3f0d613c9de6708fbb321d6efaa1502ceb506245362ad0b910282646cadc433a', '1536x1024', 'full-bleed photo postcard', 'THE SEA KEPT THE COLOR.'],
  ['U03', '20250916_193430.jpg', 'b6c6ae49aa2d247b4f2754613faf01ffb7e7c0e4b76f4ae96e898a7b47639f48', 'demo-u03-evening-triptych.png', '4612c4e028227c0fd88e0fc5237b601dc9de77aefba49c79eb9ed836e919faab', '1536x1024', 'archival triptych', 'EVENING, LAYER BY LAYER.'],
  ['U04', '20250925_192842.jpg', 'f1eb862b8929733eadd0f55e92e4319261fa7cdf7044d4136319006c18349896', 'demo-u04-small-moon-risograph.png', '29309f290bdc90b64b6b26c8c91eb1b569ae384720b7e5c34c90ae057ec0d045', '1024x1536', 'two-color risograph', 'A SMALL MOON, ENOUGH.'],
  ['U05', '20250927_174531.jpg', '8d84f38578fd69df887aa80a7c2c1218ee1e92531aac1a9eb176725fd8cfe523', 'demo-u05-green-field-note.png', '6983aacaa6458fa525f738762b0e1b5ac11895f1361e657b8c79c407fd05df74', '1536x1024', 'botanical field note', 'GREEN HAS MANY DISTANCES.'],
  ['U06', '20250927_175045.jpg', '2fb47bc2b43a3b84b32337cf367b9b5bac66ac60aa50febd6e1f9ce3e2e9136e', 'demo-u06-blue-house-collage.png', '25ec486ff79fa8ba87725d2a254b67d2ddddbd3297cded082d002346e514b735', '1024x1536', 'architectural paper collage', 'THE BLUE HOUSE BELOW.'],
  ['U07', '20250927_182437.jpg', '9d32eb3ebbfcb5775603db92f1f89ed9a962ff4e4ca1ccf8bece2f4d67a7706f', 'demo-u07-weather-swiss.png', '3be00472d8fe37d499819e63b443bff56dd0abcd0563509f67580326b4d8c22e', '1024x1536', 'Swiss editorial poster', 'WEATHER BUILDS A CATHEDRAL.'],
  ['U08', '20250927_182447.jpg', '4d9ffe98906ac15b07da95f83103651e24aa898af366cca10142337f110612b5', 'demo-u08-cloud-cyanotype.png', '2436d808a5c7b9cb4466440fff26df5594521f37f7ed9e3a22e9eb310fb5780f', '1024x1536', 'cyanotype artist page', 'UPWARD, WITHOUT HURRY.'],
  ['U09', '20250927_190614.jpg', '2d998a3f6457a241591474b496e7a899fbcf459e694fb582fb9b33ab08704fcd', 'demo-u09-cloud-vintage-duotone.png', 'd33a06f8b42bed740fc1e0e7f4ebc1b45b6b57132a7d9ac42bffcc92da3ab53c', '1536x1024', 'vintage offset duotone', 'THE CLOUD KEPT THE FIRE.'],
  ['U10', '20250817_194352.jpg', 'c075f9952153b4fedc1db6a8fd85a219a479d967013d81be44905f2dadee1b0f', 'demo-u10-wires-newsprint.png', 'ba910f42775b162b97a01691f4b22dc2d183b191ef89f89c5d7e1fa0f344d058', '1536x1024', 'documentary newsprint', 'DUSK FOUND THE GRID.'],
  ['U11', '20250817_194352.jpg', 'c075f9952153b4fedc1db6a8fd85a219a479d967013d81be44905f2dadee1b0f', 'demo-u11-wires-geometric.png', '6b5968a0258014ee674da0bd730dd61c115ec2437ed3538628d7eabd776eb6f0', '1536x1024', 'geometric photo collage', 'LINES CROSSING THE EVENING.'],
  ['U12', '20250916_192311.jpg', 'b547042e46b875009d22dfd6a179d5049369810972048cfae95fe9e380a74ba0', 'demo-u12-sea-watercolor.png', '658d207d897d23df8b0d9231a09a279fe0714dae3661ac112a2d5b25e713acfa', '1536x1024', 'watercolor travel diary', 'THE HORIZON KEPT OPENING.'],
  ['U13', '20250916_192311.jpg', 'b547042e46b875009d22dfd6a179d5049369810972048cfae95fe9e380a74ba0', 'demo-u13-sea-darkroom.png', '60e9862a0ca86d6b762ef72754a9d7c970cbe8cb3fa60a9c3b75328e356e5bbd', '1536x1024', 'analog darkroom contact print', 'LAST LIGHT ACROSS THE WATER.'],
  ['U14', '20250916_193430.jpg', 'b6c6ae49aa2d247b4f2754613faf01ffb7e7c0e4b76f4ae96e898a7b47639f48', 'demo-u14-evening-strips.png', '895eaf687abb5517235a80e6143c312a17277d7726d85332606546b60b453f50', '1536x1024', 'accordion strip study', 'THE SKY ARRIVED IN BANDS.'],
  ['U15', '20250916_193430.jpg', 'b6c6ae49aa2d247b4f2754613faf01ffb7e7c0e4b76f4ae96e898a7b47639f48', 'demo-u15-evening-monoprint.png', '9d81ce0cc8f799c0f02557ec28ff7d7349c5cf5b95ab1310576f72b035a25a59', '1536x1024', 'reduction monoprint', 'A THIN FIRE AT THE EDGE.'],
  ['U16', '20250925_192842.jpg', 'f1eb862b8929733eadd0f55e92e4319261fa7cdf7044d4136319006c18349896', 'demo-u16-moon-silver-gelatin.png', '456aab10f8bafd2b7afb4e28fdeb28b1508f268939a7c9e97639fcc25fbac927', '1024x1536', 'silver-gelatin nocturne', 'THE NIGHT HELD ONE CURVE.'],
  ['U17', '20250925_192842.jpg', 'f1eb862b8929733eadd0f55e92e4319261fa7cdf7044d4136319006c18349896', 'demo-u17-moon-field-note.png', '398bbebf14bd7561d1ee63aa2fd32d704943270333d49f01f192eb7dccc5229b', '1024x1536', 'celestial field note', 'MEASURED BY A SLIVER.'],
  ['U18', '20250927_174531.jpg', '8d84f38578fd69df887aa80a7c2c1218ee1e92531aac1a9eb176725fd8cfe523', 'demo-u18-garden-jacquard.png', 'deda71252fc4f27a73ea93f488fef0fff093e55d4b472123a45235095e15cdd4', '1536x1024', 'woven jacquard textile', 'THE HILLSIDE WOVE ITSELF.'],
  ['U19', '20250927_174531.jpg', '8d84f38578fd69df887aa80a7c2c1218ee1e92531aac1a9eb176725fd8cfe523', 'demo-u19-garden-mapfold.png', 'b1b4f4c1a863d67f72432c45f43819b40784379139026e2e6975863a48151780', '1536x1024', 'topographic map fold', 'PATHS INSIDE THE GREEN.'],
  ['U20', '20250927_175045.jpg', '2fb47bc2b43a3b84b32337cf367b9b5bac66ac60aa50febd6e1f9ce3e2e9136e', 'demo-u20-house-blueprint.png', '9e2ab04b692fcffdd830a181fb691151b349e136d15af3fe2e9bbfa031e94119', '1024x1536', 'photographic blueprint', 'A HOUSE DRAWN IN BLUE.'],
  ['U21', '20250927_175045.jpg', '2fb47bc2b43a3b84b32337cf367b9b5bac66ac60aa50febd6e1f9ce3e2e9136e', 'demo-u21-house-colored-pencil.png', '0e931154f735b6840fd0215709a601ce140831515c81e6dc6e0f50028ddb0908', '1024x1536', 'colored-pencil diary', 'SHELTER UNDER A GREEN HORIZON.'],
  ['U22', '20250927_182437.jpg', '9d32eb3ebbfcb5775603db92f1f89ed9a962ff4e4ca1ccf8bece2f4d67a7706f', 'demo-u22-cloud-lithograph.png', '36ee772a2897344f3af5ce0a188c8d170c2d703ca8c142d7efb264268ff2a030', '1024x1536', 'monochrome lithographic broadsheet', 'A WEATHER FRONT, HELD STILL.'],
  ['U23', '20250927_182437.jpg', '9d32eb3ebbfcb5775603db92f1f89ed9a962ff4e4ca1ccf8bece2f4d67a7706f', 'demo-u23-cloud-paper-relief.png', '9f8a1be33db5b35f880df81502961169e4f74a83dbe701da2e0a80f43e7b4954', '1024x1536', 'embossed paper relief', 'FORM RISING INTO BLUE.'],
  ['U24', '20250927_182447.jpg', '4d9ffe98906ac15b07da95f83103651e24aa898af366cca10142337f110612b5', 'demo-u24-cloud-screenprint.png', '42acd6763639249c51d521aa51239fbcec8a64b4b9b2aaf32d8e610f92cfa206', '1024x1536', 'four-ink screenprint', 'BLUE ABOVE, WHITE BELOW.'],
  ['U25', '20250927_182447.jpg', '4d9ffe98906ac15b07da95f83103651e24aa898af366cca10142337f110612b5', 'demo-u25-cloud-pastel.png', '0d78444576a4562cfc71a58114023f60534e336994560754e4632eb8946b5c9a', '1024x1536', 'dry-pastel sky study', 'ONE BIRD CROSSED THE WEATHER.'],
  ['U26', '20250927_190614.jpg', '2d998a3f6457a241591474b496e7a899fbcf459e694fb582fb9b33ab08704fcd', 'demo-u26-cloud-stained-glass.png', '69fc66cf6e96549581bac9bdd71fa7bac454a685fae3b7475a246defa642ab7d', '1536x1024', 'stained-glass interpretation', 'LIGHT GATHERED IN THE CLOUD.'],
  ['U27', '20250927_190614.jpg', '2d998a3f6457a241591474b496e7a899fbcf459e694fb582fb9b33ab08704fcd', 'demo-u27-cloud-encaustic.png', 'f08b6e5a92812a2dfdc16d2ce2a47de00d76a387dac5c16b254323d6cfc8eb86', '1536x1024', 'encaustic photo transfer', 'EMBER WEATHER, GOING DARK.']
]);

function subjectForSource(sourceFile) {
  if (sourceFile === '20250817_194352.jpg') return 'city';
  if (['20250916_192311.jpg', '20250916_193430.jpg', '20250927_174531.jpg', '20250927_175045.jpg'].includes(sourceFile)) return 'landscape';
  return 'clouds';
}

function userPhotoPreset(row) {
  const [manifestId, sourceFile, sourceSha256, outputFile, outputSha256, outputDimensions, style, caption] = row;
  const portrait = outputDimensions === '1024x1536';
  return {
    label: manifestId + ': ' + style,
    route: 'front', aspectRatio: portrait ? '2:3' : '3:2', splitRatio: 0.46, marginSize: 0.035,
    preservationLevel: 'native', transformationPath: 'preserve', reductionLevel: 'none', subjectCategory: subjectForSource(sourceFile), photoTreatment: 'framed',
    location: '', date: '', caption, writingRulesCount: 0,
    fontPairing: 'editorial', paperTone: portrait ? 'clean-natural' : 'warm-archive', accentColor: '#e05a36', accentReason: 'source resonance', postalMark: 'none', printTexture: 'subtle',
    imagePath: 'demos/user-photo-styles/generated/' + outputFile,
    sceneAnchor: manifestId + ' owner-photo transformation in ' + style,
    sceneDNA: 'preserve the source scene relation\nretain the documented palette and defining geometry',
    description: 'the ' + manifestId + ' ' + style + ' owner-photo artwork',
    manifestId, sourceFile, sourceSha256, outputFile, outputSha256, outputDimensions, style
  };
}

export const USER_PHOTO_PRESET_IDS = Object.freeze(USER_PHOTO_MANIFEST_ROWS.map((row) => row[0].toLowerCase()));
const USER_PHOTO_PRESETS = Object.fromEntries(USER_PHOTO_MANIFEST_ROWS.map((row) => [row[0].toLowerCase(), userPhotoPreset(row)]));

export const PRESETS = Object.freeze({ ...BUILT_IN_PRESETS, ...USER_PHOTO_PRESETS });
