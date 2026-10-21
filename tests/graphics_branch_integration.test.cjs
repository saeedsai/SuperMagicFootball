const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../tests/.generated/game.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../tests/.generated/play.html'),'utf8');
test('integrated renderer uses the premium articulated body and authored directional head',()=>{
 for(const name of ['function drawPremiumCharacter(', 'function artHead(', 'function studioEye(', 'function studioBrow(', 'function studioHair(', 'function studioProfileHair('])assert.ok(src.includes(name),name);
 assert.match(src,/drawPremiumCharacter\(ctx,p,av,team,view/);
});
test('curated natural skin and hair palettes are exported for the player studio',()=>{
 assert.match(src,/const NATURAL_SKIN_TONES=/);
 assert.match(src,/const NATURAL_HAIR_COLORS=/);
 assert.match(src,/installExpansion,NATURAL_SKIN_TONES,NATURAL_HAIR_COLORS,STUDIO_ASSET_LABELS/);
 assert.match(src,/function studioColorOptions\(/);
});
test('all 8 directional studio views include front/back and both sides/quarters',()=>{
 const arr=src.slice(src.indexOf('const STUDIO_DIRS='),src.indexOf('const STUDIO_ACTIONS='));
 assert.equal((arr.match(/label:/g)||[]).length,8);
 for(const kind of ['front','back','quarterFront','quarterBack','side']) assert.ok(arr.includes(`kind:'${kind}'`),kind);
});
test('beard renderer has distinct branches for every requested major viewpoint',()=>{
 const f=src.slice(src.indexOf('function drawBeardByView('),src.indexOf('function artHead('));
 for(const kind of ['front','quarterFront','side','quarterBack','back'])assert.ok(f.includes(`viewKind==='${kind}'`),kind);
 assert.match(src,/drawBeardByView\(ctx,/);
});
test('tattoos are backed by rendered marks on arms and player-studio controls',()=>{
 assert.match(src,/function drawTattooMark\(/);assert.match(src,/drawTattooMark\(ctx,av\.tattoo/);
 assert.match(src,/\['tattoo','TATTOOS'\]/);
});
test('fixed Player Studio selectors are in menu module and no duplicate declaration remains',()=>{
 assert.equal((src.match(/function drawCustomizer\(/g)||[]).length,1);
 assert.equal((src.match(/function studioNumberOptions\(/g)||[]).length,1);
 assert.equal((src.match(/function studioColorOptions\(/g)||[]).length,1);
 assert.ok(src.indexOf('function studioColorOptions(')>src.indexOf('const STUDIO_DIRS='));
});
test('merged build keeps bundle identity, clean menus, and About release notes',()=>{
 assert.match(src,/version:RELEASE\.version,game/); assert.match(src,/const RELEASE=Object\.freeze/);
 assert.doesNotMatch(src,/DEV → ABOUT|DEV VERSION IN ABOUT/);
 assert.match(src,/CREDITS \/ ABOUT/);
 assert.doesNotMatch(src,/aboutDevRevision/);
 assert.match(src,/aboutBundleVersion/); assert.match(src,/aboutReleaseNotes/);
 assert.ok(!src.includes('GRAPHICS 0.8.25.19'));
 assert.ok(!src.includes('VERSION 0.8.25.14'));
 assert.ok(html.includes("version:'0.9.0.0'"));
});
test('build remains single-file/offline compatible with embedded styling',()=>{
 assert.ok(html.includes('<style>')&&html.includes('<script type="module">'));
 assert.ok(html.includes('data:image/png;base64,'));
 assert.ok(css.includes('characterStage'));
});