'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('const STUDIO_SKIN_SWATCH_NAMES='),end=ui.indexOf('\nlet studioDirection=',start);
assert(start>=0&&end>start,'Player Studio color controls exist');
const block=ui.slice(start,end)+'\nthis.colorOptions=studioColorOptions;this.colorField=studioColorField;this.safeColor=studioSafeColor;this.previewState=studioColorPreviewState;this.updatePreview=studioUpdateColorPreview;';
const skin=[['#f4d3bf','Porcelain'],['#efc4a7','Fair Beige'],['#e6b394','Warm Peach'],['#dca27f','Golden Tan'],['#cf916d','Honey Brown'],['#bd815b','Warm Bronze'],['#ab7458','Medium Brown'],['#996345','Deep Brown'],['#8c593f','Rich Umber'],['#7a4d38','Espresso']];
const hair=[['#141b27','Blue Black'],['#202125','Natural Black']];
function api(extra={}){const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const ctx={studioOptionTags:(items,selected)=>items.map(([value,label])=>`<option value=\"${escapeHTML(value)}\" ${String(selected)===String(value)?'selected':''}>${escapeHTML(label)}</option>`).join(''),escapeHTML,CSS:{supports:(_kind,value)=>/^#[0-9a-f]{3,8}$/i.test(value)||/^rgba?\(/i.test(value)},tokenWallet:{owns:()=>true},...extra};vm.runInNewContext(block,ctx);return ctx;}
test('skin palette uses inclusive descriptive choices while keeping natural range and values',()=>{
 const f=api(),html=f.colorOptions(skin,'#996345','skin');
 for(const label of ['Soft Peach','Golden Sand','Warm Apricot','Copper Bronze','Deep Umber','Roasted Umber'])assert(html.includes(label),label);
 assert(html.includes('value="#f4d3bf"')&&html.includes('value="#7a4d38"'));
 assert(html.includes('value="#996345"')&&html.includes('selected'),'existing selected value remains exact');
 assert(!html.includes('Fair Beige')&&!html.includes('Medium Brown'));
});
test('arbitrary legacy custom CSS colors remain selected without migration',()=>{
 const f=api(),value='rgba(18, 80, 140, .4)',html=f.colorOptions(hair,value,'hair');
 assert(html.includes(`value="${value}" selected`));assert(html.includes(`Saved custom color · ${value}`));
 assert.equal(f.safeColor(value),value);
});
test('unsafe legacy values remain selected but cannot inject markup or CSS',()=>{
 const f=api(),value='red\" autofocus=\"true';const html=f.colorField('face_hair','HAIR COLOR',hair,value,'hair');
 assert(html.includes('value=\"red&quot; autofocus=&quot;true\" selected'));assert.match(html,/preview unavailable/);assert.equal(f.safeColor(value),'');
});
test('unpreviewable legacy values stay intact and are announced as unavailable',()=>{
 const select={value:'legacy-shade-token',options:[{value:'legacy-shade-token',textContent:'Saved custom color · legacy-shade-token'}]};
 const swatch={style:{},classList:{toggle:(name,on)=>{swatch[name]=on;}},setAttribute:(name,value)=>{swatch[name]=value;}};
 const text={textContent:''},f=api({$:id=>id==='face_skin'?select:id==='studioSkinSwatch'?swatch:text});
 const preview=f.previewState('face_skin');assert.equal(preview.safe,'');assert.match(preview.text,/saved value kept; preview unavailable/);
 assert.equal(f.updatePreview('face_skin').text,preview.text);assert.equal(select.value,'legacy-shade-token');
 assert.match(swatch['aria-label'],/preview unavailable/);assert.equal(swatch.previewUnavailable,true);assert.match(text.textContent,/preview unavailable/);
});
test('color fields expose labelled swatches and live accessible preview text',()=>{
 const f=api(),html=f.colorField('face_skin','SKIN TONE',skin,'#f4d3bf','skin');
 assert.match(html,/aria-label="SKIN TONE color"/);assert.match(html,/aria-describedby="studioSkinPreviewText studioSkinColorHelp"/);
 assert.match(html,/id="studioSkinSwatch" role="img" aria-label="Soft Peach color preview"/);
 assert.match(html,/id="studioSkinPreviewText" role="status" aria-live="polite">Soft Peach — #f4d3bf/);
 assert.match(html,/Existing custom saved colors remain selected until you choose a replacement/);
});
test('Studio preview updates when color fields change and edits remain unsaved',()=>{
 assert.ok(ui.includes("if(['face_skin','face_hair'].includes(e.target.id)){studioUpdateColorPreview(e.target.id);drawCustomizer();return;}"));
 assert.match(ui,/function saveAppearance\(\)[\s\S]*const appearance=getAppearance\(\)/);
 assert.match(ui,/function getAppearance\(\)[\s\S]*return Object\.fromEntries/);
 assert.match(ui,/aria-label="\$\{title\} color"/);
});

