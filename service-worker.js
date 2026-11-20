const VERSION='32';
const CACHE='grevingshop-shell-v32';
const CONTROL='grevingshop-update-control';
const ASSETS=['./','./index.html','./styles.css?v=32','./app.js?v=32','./icon.svg?v=31','./icon-180.png?v=31','./icon-192.png?v=31','./icon-512.png?v=31','./manifest.webmanifest','./supabase.js','./auth-session.js?v=28'];
const approvedKey=()=>new URL('./__approved_app_cache__',self.registration.scope).href;
async function approvedCache(){const state=await caches.open(CONTROL),saved=await state.match(approvedKey());return saved?await saved.text():CACHE}
async function setApproved(name){const state=await caches.open(CONTROL);await state.put(approvedKey(),new Response(name))}
function appClient(source){if(!source?.url)return false;const url=new URL(source.url),scope=new URL(self.registration.scope);return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)}
async function updateStatus(source){if(appClient(source)){const state=await caches.open(CONTROL);source.postMessage({type:'UPDATE_STATUS',version:VERSION,approvedCache:await approvedCache(),hasApproved:Boolean(await state.match(approvedKey()))})}}
self.addEventListener('install',event=>{
 // Download a complete bundle, but never activate it here without approval.
 const requests=ASSETS.map(asset=>new Request(new URL(asset,self.registration.scope).href,{cache:'reload'}));
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(requests)));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const state=await caches.open(CONTROL);
  // First release with controlled updates establishes the initial approved bundle.
  if(!await state.match(approvedKey()))await setApproved(CACHE);
  // A worker may activate after all tabs close. Its fetch handler still serves
  // the previously approved cache until the user explicitly accepts this version.
  await self.clients.claim();
  for(const client of await self.clients.matchAll({type:'window'}))await updateStatus(client);
 })());
});
self.addEventListener('message',event=>{
 if(!appClient(event.source))return;
 if(event.data?.type==='GET_UPDATE_STATUS'){event.waitUntil(updateStatus(event.source));return}
 const initialize=event.data?.type==='INITIALIZE_CURRENT_VERSION';
 if((!initialize&&event.data?.type!=='APPROVE_UPDATE')||event.data.version!==VERSION)return;
 event.waitUntil((async()=>{
  try{
   const state=await caches.open(CONTROL);
   if(initialize&&await state.match(approvedKey()))return;
   const bundle=await caches.open(CACHE);
   for(const asset of ASSETS)if(!await bundle.match(new URL(asset,self.registration.scope).href))throw Error('Incomplete app bundle');
   await setApproved(CACHE);
   await self.skipWaiting();
   if(!initialize)event.source.postMessage({type:'UPDATE_APPLIED',version:VERSION});
  }catch{event.source.postMessage({type:'UPDATE_FAILED',version:VERSION})}
 })());
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin)return;
 const asset=ASSETS.find(path=>new URL(path,scope).pathname===url.pathname);
 if(!asset)return; // Supabase requests and unrelated resources are never cached.
 event.respondWith((async()=>{
  const name=await approvedCache(),bundle=await caches.open(name);
  // Ignore cache-busting parameters: changing the URL must not bypass consent.
  const canonical=new URL(asset==='./'?'./index.html':asset,scope).href;
  const cached=await bundle.match(canonical,{ignoreSearch:true});
  if(cached)return cached;
  // Do not silently fall back to newer network assets in an approved bundle.
  return new Response('Die gespeicherte App-Version ist nicht vollständig verfügbar. Bitte die App erneut öffnen und das Update bestätigen.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
});
