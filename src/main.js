import {loadAssets} from './assets.js';
try {
 await loadAssets();
 await import('./modules/ui.js');
} catch(error) {
 console.error('Supermagic Football modular loading failed:',error);
 const panel=document.getElementById('menu');
 if(panel)panel.innerHTML='<div class="menubox"><h1>GAME FILES UNAVAILABLE</h1><p>Run this folder using a local HTTP server (e.g. <code>python3 -m http.server 8000</code>), not file://. Check JSON files and browser console.</p></div>';
}
