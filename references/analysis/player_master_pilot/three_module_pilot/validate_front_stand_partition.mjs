import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG} from '../../../../../SuperMagicAssetStudio/src/cli/agent-raster.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const source=readPNG(fs.readFileSync(path.join(here,'source/alex_front_stand_source.png')));
const rendered=readPNG(fs.readFileSync(path.join(here,'exports/front_stand_three_module.png')));
const project=JSON.parse(fs.readFileSync(path.join(here,'alex_front_stand_three_module_pilot.json'),'utf8'));
const layers=project.scenes.front.stand.stand_1;
assert.equal(layers.length,3,'front stand frame must contain exactly three modules');
assert.deepEqual(layers.map(layer=>layer.category).sort(),['body','hairFront','head']);
assert(layers.every(layer=>JSON.stringify(layer.transform)===JSON.stringify(layers[0].transform)),'all modules must share one transform');
assert.equal(source.width,rendered.width);assert.equal(source.height,rendered.height);
let changedChannels=0,firstChangedPixel=-1;
for(let i=0;i<source.data.length;i++)if(source.data[i]!==rendered.data[i]){changedChannels++;if(firstChangedPixel<0)firstChangedPixel=Math.floor(i/4);}
assert.equal(changedChannels,0,`assembled render differs from source in ${changedChannels} channels; first pixel ${firstChangedPixel}`);
console.log(JSON.stringify({ok:true,view:'front',animation:'stand',frame:'stand_1',modules:layers.length,width:source.width,height:source.height,changedChannels,visualQuality:'requires human review of module boundaries'},null,2));
