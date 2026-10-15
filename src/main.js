import {loadAssets} from './assets.js';
try {
 await loadAssets();
 await import('./modules/ui.js');
} catch(error) {
 console.error('Supermagic Football modular loading failed:',error);
 const panel=document.getElementById('menu');
 if(panel){
  const detail=location.protocol==='file:'?'Open the complete game folder through a local web server.':'A game module or JSON database could not load. Check your connection or refresh this page.';
  panel.innerHTML='<div class="menubox" role="alert"><h1>GAME FILES UNAVAILABLE</h1><p>'+detail+'</p><button type="button" class="btn gold" id="retryLoad">RETRY LOADING</button><p class="muted">If playing locally: <code>python3 -m http.server 8000</code></p></div>';
  panel.querySelector('#retryLoad')?.addEventListener('click',()=>location.reload());
 }
}
