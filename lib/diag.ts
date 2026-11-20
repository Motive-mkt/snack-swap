/**
 * TEMPORARY phone-crash diagnostics. Injected only into the /d/<mode> test pages (never the real page).
 * Sends small text beacons to /api/diag so the last thing a crashed phone reported shows up in the server logs.
 */
export const DIAG_JS = `(function(){try{
var mode=(location.pathname.match(/^\\/d\\/([\\w-]+)/)||[])[1]||'page';
var id=Math.random().toString(36).slice(2,8),buf=[],t0=Date.now(),n=0;
function mem(){try{var p=performance.memory;return p?Math.round(p.usedJSHeapSize/1048576):-1}catch(e){return -1}}
function log(k,v){try{buf.push((Date.now()-t0)+'|'+k+'|'+(v==null?'':String(v).replace(/[;\\n\\r]/g,' ').slice(0,220)))}catch(e){}}
function flush(){if(!buf.length)return;var b=id+'~'+mode+'~'+buf.join(';');buf=[];try{if(!(navigator.sendBeacon&&navigator.sendBeacon('/api/diag',b))){var x=new XMLHttpRequest();x.open('POST','/api/diag',true);x.setRequestHeader('Content-Type','text/plain');x.send(b)}}catch(e){}}
window.__d={log:function(k,v){log(k,v);flush()},flush:flush,id:id,mode:mode};
var nv=navigator,c=nv.connection||{};
log('head','ua='+nv.userAgent+' dpr='+devicePixelRatio+' scr='+screen.width+'x'+screen.height+' vp='+innerWidth+'x'+innerHeight+' mem='+(nv.deviceMemory||'?')+'GB cpu='+(nv.hardwareConcurrency||'?')+' net='+(c.effectiveType||'?')+' save='+(c.saveData?1:0));
flush();
try{if(nv.userAgentData&&nv.userAgentData.getHighEntropyValues)nv.userAgentData.getHighEntropyValues(['model','platformVersion','fullVersionList']).then(function(h){log('uach',JSON.stringify({m:h.model,pv:h.platformVersion,v:(h.fullVersionList||[]).map(function(b){return b.brand+' '+b.version}).join(',')}));flush()})}catch(e){}
document.addEventListener('readystatechange',function(){log('rs',document.readyState);flush()});
document.addEventListener('DOMContentLoaded',function(){log('dcl');flush()});
window.addEventListener('load',function(){log('load','res='+performance.getEntriesByType('resource').length);flush()});
window.addEventListener('pagehide',function(e){log('pagehide',e.persisted?'bfcache':'gone');flush()});
document.addEventListener('visibilitychange',function(){log('vis',document.visibilityState);flush()});
document.addEventListener('freeze',function(){log('freeze');flush()});
window.addEventListener('error',function(e){var t=e.target;log('err',(t&&t!==window&&(t.src||t.href))?'res:'+(t.src||t.href):(e.message+' @'+String(e.filename||'').split('/').pop()+':'+e.lineno));flush()},true);
window.addEventListener('unhandledrejection',function(e){log('rej',e.reason&&(e.reason.message||e.reason));flush()});
try{
new PerformanceObserver(function(l){l.getEntries().forEach(function(e){log('paint',e.name+'@'+Math.round(e.startTime))});flush()}).observe({type:'paint',buffered:true});
new PerformanceObserver(function(l){l.getEntries().forEach(function(e){log('lcp',Math.round(e.startTime)+' '+(e.element?e.element.tagName:'')+' '+String(e.url||'').slice(-60))});flush()}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(function(l){l.getEntries().forEach(function(e){log('long',Math.round(e.duration)+'ms@'+Math.round(e.startTime))});flush()}).observe({type:'longtask',buffered:true});
}catch(e){}
var hb=setInterval(function(){n++;var im=document.images,d=0;for(var i=0;i<im.length;i++)if(im[i].complete)d++;
log('hb','rs='+document.readyState+' js='+mem()+'MB res='+performance.getEntriesByType('resource').length+' img='+d+'/'+im.length+' y='+Math.round(scrollY)+' vis='+document.visibilityState);flush();if(n>100)clearInterval(hb)},400);
}catch(e){}})();`;
