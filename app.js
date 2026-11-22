'use strict';
const APP_VERSION='36';
const FAMILY={};
const catalogSelection=new Set();let catalogTarget='';
let updateRegistration=null,updateWorker=null,availableVersion='',updateApplying=false,updateReloaded=false;
const COLOR_SCHEMES=[["energy", "Energy"], ["lavender", "Lavender"], ["lagoon", "Lagoon"], ["apricot", "Apricot"], ["verdelia", "Verdelia"], ["noctara", "Noctara"], ["iriselle", "Iriselle"], ["marea", "Maréa"], ["rosavelle", "Rosavelle"]];
const CATEGORIES=['Obst & Gemüse','Brot & Backwaren','Vorrat','Kühlregal','Getränke','Haushalt','Sonstiges'];
// Übliche Laufrichtung; die konkrete Marktanordnung kann davon abweichen.
function suggestProductCategory(name){const n=String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();const rules=[
 ['Haushalt',/(?:^| )(?:spulmittel|spulmaschinen|geschirrspul|waschmittel|weichspuler|putzmittel|reiniger|seife|handseife|duschgel|shampoo|zahnpasta|zahnburste|toilettenpapier|klopapier|kuchenrolle|mullbeutel|windel|tampon|binden|katzenfutter|hundefutter|batterie|alufolie|backpapier)/],
 ['Vorrat',/(?:^| )(?:tomatenmark|tomatensauce|tomatensosse|passierte tomaten|gehackte tomaten|dosentomaten|kokosmilch|h milch|brotaufstrich|erdnussbutter|apfelmus|kartoffelpuree|kartoffelchips|zwiebelpulver|knoblauchpulver|paprikapulver|kakaopulver|gemusebruhe|orangemarmelade|orangenmarmelade|erdbeermarmelade|fruchtaufstrich)/],
 ['Getränke',/(?:^| )(?:mineralwasser|wasser|sprudel|saft|apfelsaft|orangensaft|multivitaminsaft|bier|wein|rotwein|weisswein|sekt|cola|limonade|limo|eistee|energy drink|tonic|schorle)/],
 ['Obst & Gemüse',/(?:^| )(?:apfel|apfel|banan|birne|orang|mandarin|clementin|zitrone|limette|beere|erdbeer|himbeer|blaubeer|heidelbeer|traube|melone|ananas|mango|kiwi|avocado|tomat|gurke|paprika|karott|mohre|kartoffel|zwiebel|knoblauch|salat|eisbergsalat|romanasalat|spinat|brokkoli|blumenkohl|kohl|zucchini|aubergin|pilz|champignon|lauch|porree|sellerie|radieschen|spargel|fenchel|susskartoffel|rucola|rosenkohl|wirsing|rote bete|kurbis|ingwer|basilikum|petersilie)/],
 ['Brot & Backwaren',/(?:^| )(?:brot|brotchen|broetchen|vollkornbrot|weissbrot|roggenbrot|toast|baguette|ciabatta|croissant|brezel|laugen|kuchen|muffin|berliner|donut)/],
 ['Kühlregal',/(?:^| )(?:milch|hafermilch|mandelmilch|sojamilch|butter|margarine|joghurt|jogurt|quark|skyr|sahne|schmand|creme fraiche|kase|frischkase|mozzarella|feta|gouda|emmentaler|parmesan|ei |eier|wurst|bratwurst|schinken|salami|fleisch|hackfleisch|rind|hahnchen|huhn|puten|schnitzel|steak|fisch|lachs|thunfischsteak|tofu|tempeh|hummus|gnocchi|tortellini|pommes|fischstabchen|gefroren|tiefkuhl|tk |eis |eiscreme)/],
 ['Vorrat',/(?:^| )(?:nudel|spaghetti|pasta|penne|fusilli|reis|mehl|zucker|salz|pfeffer|gewurz|curry|olivenol|sonnenblumenol|rapsol|ol |essig|kaffee|tee|kakao|musli|haferflocken|cornflakes|nutella|marmelade|honig|schokolade|keks|chips|nuss|nusse|mandel|linsen|kichererbsen|bohnen|mais|erbsen|konserve|dose|backpulver|hefe|ketchup|senf|mayonnaise|pesto|sauce|sosse|pizza)/]
 ];if(n==='ei'||n==='eis')return 'Kühlregal';if(n==='ol')return 'Vorrat';for(const [category,pattern] of rules)if(pattern.test(n))return category;return 'Sonstiges'}
function productCategory(item){if(item.category_mode==='manual')return CATEGORIES.includes(item.category)?item.category:'Sonstiges';const suggested=suggestProductCategory(item.name);return suggested==='Sonstiges'&&CATEGORIES.includes(item.category)?item.category:suggested}
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const client=window.supabase?.createClient('https://ydmkutpcrurzsypszrob.supabase.co','sb_publishable_bboirRaMhlGPM0eQ6TgYtg_mjHPdBqz',{auth:{storageKey:'grevingshop-auth-v1',storage:window.GrevingSession.createStorage(localStorage),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let authGeneration=0,sessionRestoring=Boolean(client),restoringUserId=null;
let realtimeChannel=null,realtimeReady=false,realtimeTimer=null,refreshPending=false;
let privateListsReady=false;
let catalog=[],catalogError='',catalogSearch='';
let user=null,lists=[],items=[],view='lists',selected=null,demo=false,loading=false,lastSync=null,cloudError='',search='',filter='all',shopping=false,wake=null,wakeWanted=false,wakeError='',busy=false,refreshing=false,toastTimer,installEvent;
function writeLocal(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function removeLocal(key){try{localStorage.removeItem(key)}catch{}}
const START_PAGES=[['lists','Meine Listen'],['catalog','Warenkatalog'],['archive','Archiv'],['family','Familie']];
const DEFAULT_PREFERENCES={startPage:'lists',theme:'light',scheme:'energy',font:'standard',density:'comfortable'};
function normalizePreferences(value={}){return {startPage:START_PAGES.some(([key])=>key===value?.startPage)?value.startPage:'lists',theme:value?.theme==='dark'?'dark':'light',scheme:COLOR_SCHEMES.some(([key])=>key===value?.scheme)?value.scheme:'energy',font:value?.font==='large'?'large':'standard',density:value?.density==='compact'?'compact':'comfortable'}}
function preferenceKey(owner=user){return owner&&!demo?'grevingshop-preferences:'+owner.id:'grevingshop-preferences'}
function cachedPreferences(owner){try{return normalizePreferences(JSON.parse(localStorage.getItem(preferenceKey(owner))||'{}'))}catch{return {...DEFAULT_PREFERENCES}}}
let preferences=cachedPreferences(null),preferenceWrites=Promise.resolve(),preferencesPending=0,preferencesRevision=0,preferencesDirty=false,preferencesStatus='';view=preferences.startPage;
function preferenceStatus(){return !user||demo?'Auf diesem Gerät gespeichert':preferencesPending?'Wird in Supabase gespeichert …':preferencesDirty?'Noch nicht synchronisiert · erneuter Versuch bei Internetverbindung':preferencesStatus||'Einstellungen werden aus Supabase geladen …'}
function updatePreferenceStatus(){const el=$('#preferenceStatus');if(el)el.textContent=preferenceStatus()}
function preferenceSaveError(error){return error?.code==='23514'&&String(error.message||'').includes('shopping_preferences')?'Einstellungen bleiben auf diesem Gerät vorgemerkt. Die Datenbank muss für den Startbereich aktualisiert werden.':'Einstellungen noch nicht gespeichert: '+errorMessage(error)}
function savePreferences(){preferences=normalizePreferences(preferences);const owner=user&&!demo?{id:user.id}:null,snapshot={...preferences},revision=++preferencesRevision;writeLocal(preferenceKey(owner),JSON.stringify(snapshot));theme();if(!owner){updatePreferenceStatus();return Promise.resolve()}writeLocal(preferenceKey(owner)+':pending','1');if(!navigator.onLine){preferencesDirty=true;updatePreferenceStatus();return Promise.resolve()}preferencesPending++;preferencesDirty=true;updatePreferenceStatus();const write=preferenceWrites.catch(()=>{}).then(async()=>{if(user?.id!==owner.id||demo)return;const {error}=await client.from('shopping_preferences').upsert({user_id:owner.id,preferences:snapshot,updated_at:new Date().toISOString()});if(error)throw error;if(user?.id===owner.id&&preferencesRevision===revision){preferencesDirty=false;removeLocal(preferenceKey(owner)+':pending');preferencesStatus='In Supabase gespeichert'}}).catch(error=>{if(user?.id===owner.id){preferencesDirty=true;preferencesStatus='';toast(preferenceSaveError(error))}}).finally(()=>{preferencesPending--;updatePreferenceStatus();if(!preferencesPending&&user&&!demo)scheduleRefresh()});preferenceWrites=write;return write}
function theme(){document.documentElement.dataset.theme=preferences.theme||'light';document.documentElement.dataset.scheme=preferences.scheme||'energy';document.documentElement.dataset.font=preferences.font||'standard';document.documentElement.dataset.density=preferences.density||'comfortable'}theme();
const profile=()=>Object.keys(FAMILY).find(n=>FAMILY[n]===user?.email?.toLowerCase());
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500)}
function status(){return !user&&!demo?'Nicht angemeldet':demo?'Vorschau · nur auf diesem Gerät':!navigator.onLine?'Offline · gespeicherter Stand':cloudError?'Synchronisierung fehlgeschlagen':loading?'Wird geladen …':lastSync?`${realtimeReady?'Live verbunden':'Live-Verbindung wird hergestellt'} · Stand ${lastSync.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'Mit Supabase verbunden'}
function render(){
 const focused=document.activeElement?.id,caret=['search','catalogSearch'].includes(focused)?document.activeElement.selectionStart:null;
 document.body.classList.toggle('shop-mode',shopping);$('#cloud-check').hidden=!user;$('#avatar').textContent=user&&!demo?(profile()||'').trim().charAt(0).toUpperCase()||'?':'?';$('#avatar').title=user?'Zum eingestellten Startbereich':'Anmelden';$('#avatar').setAttribute('aria-label',$('#avatar').title);
 document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 let html='';
 if(sessionRestoring&&!user&&!demo)html=`<div class="heading"><h1>GrevingShop.</h1></div><section class="card" role="status"><h2>Anmeldung wird wiederhergestellt</h2><p class="muted">${cloudError?esc(cloudError):'Deine gespeicherte Sitzung wird geladen.'}</p>${cloudError?'<button class="button" data-action="retry-session">Erneut versuchen</button>':''}</section>`;
 else if(view==='catalog'&&(user||demo))html=catalogView();
 else if(view==='settings')html=settings();
 else if(view==='family'&&!user)html=`<div class="heading"><h1>Familie</h1></div><section class="card empty"><p>Die freigegebenen Kontaktdaten sind nach der Anmeldung sichtbar.</p><button class="button" data-action="login">Anmelden</button></section>`;
 else if(view==='family'&&!navigator.onLine)html='<div class="heading"><h1>Familie</h1></div><section class="card"><p>Die freigegebenen Kontaktdaten werden zum Schutz deiner Daten nur online geladen.</p></section>';
 else if(view==='family')html=`<div class="eyebrow">ZUSAMMEN IST ES EINFACHER</div><div class="heading"><div><h1>Unsere Familie.</h1></div></div><section class="card">${Object.entries(FAMILY).map(([n,e])=>`<div class="person"><span class="avatar">${n.slice(0,2)}</span><div><strong>${n}${profile()===n?' · Du':''}</strong><small>${esc(e)}</small></div></div>`).join('')}</section><p class="muted small">Alle Listen werden automatisch mit diesen vier Greving.Fit-Konten geteilt. Jede Person meldet sich mit ihrem bestehenden Passwort an.</p>`;
 else if(!user&&!demo)html=welcome();
 else if(selected&&lists.some(l=>l.id===selected))html=shopping?shoppingDetail():detail();
 else html=overview();
 $('#app').innerHTML=`<div class="page">${user&&!navigator.onLine?'<div class="notice" role="status"><strong>Offline-Modus</strong><p>Gespeicherter Stand. Listen und Produkte können erst mit Internetverbindung geändert werden.</p></div>':''}${html}</div>`;bindSettingsForms();
 if(user&&!navigator.onLine)document.querySelectorAll('[data-action="new-list"],[data-action="new-item"],[data-action="new-catalog-product"],[data-action="archive"],[data-action="reset"],[data-action="edit-list"],[data-action="catalog-bulk-add"],[data-check],[data-edit-item],[data-catalog-remove],[data-delete-list]').forEach(button=>{button.disabled=true;button.title='Internetverbindung zum Ändern erforderlich'});
 if(['search','catalogSearch'].includes(focused)&&$('#'+focused)){$('#'+focused).focus();$('#'+focused).setSelectionRange(caret,caret)}else if(focused==='filter')$('#filter')?.focus();
}
function welcome(){return `<div class="eyebrow">EINKAUFSLISTEN</div><div class="heading"><div><h1>Alles auf einer Liste.</h1></div></div><div class="card-stack"><section class="card login-card"><h2>Gemeinsam einkaufen.</h2><p class="muted">Melde dich mit deinem Greving.Fit-Konto an.</p><button class="button" data-action="login">Anmelden</button></section><div class="cards"><section class="card"><h3>Gemeinsam aktuell</h3><p class="muted small">Neue Produkte und Häkchen werden automatisch auf allen Geräten aktualisiert.</p></section><section class="card"><h3>Für deinen Einkauf gemacht</h3><p class="muted small">Große Häkchen, Mengen und Notizen. Der Einkaufsmodus hält den Bildschirm wach.</p></section></div></div><p class="install">Als App installieren: Im Smartphone-Browser „Zum Home-Bildschirm“ oder „App installieren“ wählen.</p>`}
function preferenceOptions(options,value){return options.map(([key,label])=>`<option value="${esc(key)}" ${key===value?'selected':''}>${esc(label)}</option>`).join('')}
function settings(){return `<div class="eyebrow">APP EINRICHTEN</div><div class="heading"><h1>Settings</h1></div><div class="settings-grid fit-settings"><section class="card personalization-card"><div class="card-head"><div><h2>Personalisierung</h2><p class="tiny muted">Passe GrevingShop an dein Profil und deine Nutzung an.</p></div></div><form id="personalizationForm"><div class="form-grid personalization-grid"><div class="field"><label for="startPage">Startbereich</label><select id="startPage" name="startPage">${preferenceOptions(START_PAGES,preferences.startPage)}</select></div><div class="field"><label for="scheme">Farbschema</label><select id="scheme" name="scheme">${preferenceOptions(COLOR_SCHEMES,preferences.scheme)}</select><span class="tiny muted">Ändert Hauptfarbe, Akzent, Hintergründe und Flächen.</span></div><div class="field"><label for="fontSize">Schriftgröße</label><select id="fontSize" name="fontSize">${preferenceOptions([['standard','Standard'],['large','Größer']],preferences.font)}</select></div><div class="field"><label for="density">Darstellungsdichte</label><select id="density" name="density">${preferenceOptions([['comfortable','Komfortabel'],['compact','Kompakt']],preferences.density)}</select></div></div><div class="split settings-actions personalization-actions"><button class="button" type="submit">Einstellungen übernehmen</button><button class="button secondary" type="button" data-action="settings-theme">${preferences.theme==='dark'?'☀️ Helles Design':'🌙 Dunkles Design'}</button></div><p class="tiny muted" id="preferenceStatus" role="status">${esc(preferenceStatus())}</p></form></section><section class="card account-card"><div class="card-head"><h2>Login & Cloud-Synchronisierung</h2><span class="pill">${user?'Verbunden':'Nicht verbunden'}</span></div>${user?`<div class="settings-account"><div><span class="tiny muted">Profil</span><strong>${esc(profile()||'GrevingShop')}</strong></div><div><span class="tiny muted">E-Mail</span><strong>${esc(user.email||'')}</strong></div></div><p class="tiny muted">${cloudError?esc(cloudError):!navigator.onLine?'Offline · gespeicherter Stand':loading?'Cloud-Konto verbunden; Synchronisierung wird vorbereitet.':'Cloud-Synchronisierung aktiv. Änderungen werden automatisch gesichert.'}</p><div class="split settings-actions"><button class="button" type="button" data-action="settings-sync">Jetzt synchronisieren</button><button class="button secondary" type="button" data-action="logout">Abmelden</button></div><details class="settings-password"><summary>Passwort ändern</summary><form id="accountPasswordForm"><p class="tiny muted">Das neue Passwort gilt für GrevingFit und GrevingShop.</p><div class="field"><label for="settingsCurrentPassword">Aktuelles Passwort</label><input id="settingsCurrentPassword" name="current" type="password" autocomplete="current-password" required></div><div class="field"><label for="newPassword">Neues Passwort</label><input id="newPassword" name="password" type="password" minlength="8" autocomplete="new-password" required></div><div class="field"><label for="confirmPassword">Neues Passwort wiederholen</label><input id="confirmPassword" name="confirmPassword" type="password" minlength="8" autocomplete="new-password" required></div><button class="button secondary" type="submit">Passwort aktualisieren</button><p id="passwordStatus" class="tiny muted" role="status"></p></form></details>`:`<p class="muted tiny">Melde dich mit deinem bestehenden Greving.Fit-Konto an.</p><button class="button" type="button" data-action="settings-account">Anmelden</button>`}</section><section class="card"><h2>Beim Einkauf</h2><p class="muted small">Im Einkaufsmodus wird automatisch das Wachhalten des Bildschirms angefordert. Du siehst ausschließlich die aktive Liste, große Häkchen, den Fortschritt und „Einkauf beenden“.</p><p class="pill">☀ Wachhalten wird automatisch angefordert</p><p class="muted small">Benötigt einen unterstützten Browser. Das Smartphone kann die Funktion bei niedrigem Akku beenden.</p></section><section class="card"><h2>Auf dem Smartphone</h2><p class="muted small">Im Browser-Menü „App installieren“ oder unter „Teilen“ → „Zum Home-Bildschirm“ wählen.</p><p class="muted small">Ohne Internet siehst du den zuletzt geladenen Stand. Zum Speichern von Änderungen brauchst du eine Verbindung.</p>${installEvent?'<button class="button" data-action="install">App installieren</button>':''}</section><p class="muted small wide">${user&&!demo?'Deine Darstellung wird deinem Supabase-Konto zugeordnet und auf deinen Geräten übernommen.':'Ohne Anmeldung wird die Darstellung nur auf diesem Gerät gespeichert.'} Einkaufslisten und Warenkatalog werden gemeinsam genutzt.</p><p class="small muted app-version">App-Version ${APP_VERSION}</p></div>`}
function bindSettingsForms(){
 if(view!=='settings')return;
 const personalization=$('#personalizationForm');
 if(personalization)personalization.onsubmit=async event=>{
  event.preventDefault();const fields=new FormData(event.currentTarget);
  preferences=normalizePreferences({...preferences,startPage:fields.get('startPage'),scheme:fields.get('scheme'),font:fields.get('fontSize'),density:fields.get('density')});
  await savePreferences();render();toast('Darstellung angepasst');
 };
 const password=user?$('#accountPasswordForm'):null;
 if(password){let pending=false;password.onsubmit=async event=>{
  event.preventDefault();if(pending)return;pending=true;event.submitter.disabled=true;
  const fields=new FormData(password),status=$('#passwordStatus');status.textContent='';
  try{await changeAccountPassword(fields.get('current'),fields.get('password'),fields.get('confirmPassword'));password.reset();status.textContent='Passwort für beide Apps geändert.'}
  catch(error){status.textContent=errorMessage(error)}finally{pending=false;event.submitter.disabled=false}
 }}
}
function listVisibility(list){return list.visibility==='private'?'private':'shared'}
function canViewList(list,owner=user){return listVisibility(list)==='shared'||Boolean(owner?.id&&list.created_by===owner.id)}
function scopeBadge(list){return `<span class="list-scope ${listVisibility(list)}">${listVisibility(list)==='private'?'<svg class="privacy-lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Privat · nur für dich':'Gemeinsam'}</span>`}
function cachedListData(cached,owner){const visible=(cached?.lists||[]).filter(l=>canViewList(l,owner)),ids=new Set(visible.map(l=>l.id));return {lists:visible,items:(cached?.items||[]).filter(i=>ids.has(i.list_id)),catalog:cached?.catalog||[]}}
function overviewCards(group,archived){return group.map(l=>{const all=items.filter(i=>i.list_id===l.id),done=all.filter(i=>i.checked).length;const content=`<div class="card-top"><h3>${esc(l.name)}</h3><span class="pill">${all.length&&done===all.length?'✓ Erledigt':`${all.length-done} offen`}</span></div>${scopeBadge(l)}${l.note?`<p class="muted small list-note">${esc(l.note)}</p>`:''}<div class="progress"><span style="width:${all.length?done/all.length*100:0}%"></span></div><span class="muted small">${done} von ${all.length} besorgt</span>`;return archived?`<article class="card archived-list-card"><button class="list-card archive-open" data-list="${esc(l.id)}">${content}</button><div class="archive-card-actions"><button class="button danger" data-delete-list="${esc(l.id)}" aria-label="Liste ${esc(l.name)} endgültig löschen" ${busy?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>Löschen</button></div></article>`:`<button class="card list-card" data-list="${esc(l.id)}">${content}</button>`}).join('')}
function overview(){
 const archived=view==='archive',shown=lists.filter(l=>Boolean(l.archived)===archived&&canViewList(l));
 const groups=[{key:'private',title:'Meine privaten Listen',empty:'Noch keine privaten Listen.'},{key:'shared',title:'Gemeinsame Listen',empty:'Noch keine gemeinsamen Listen.'}];
 return `<div class="heading compact-heading"><h1>${archived?'Archiv':'Meine Listen'} <span class="muted small">${shown.length}</span></h1>${!archived?'<button class="button" data-action="new-list">＋ Neue Liste</button>':''}</div>${demo?'<div class="demo-line">Lokale Vorschau <button class="back" data-action="leave-demo">Anmelden</button></div>':''}<div class="section-title compact-status"><span class="status-line"><span class="status-dot"></span>${esc(status())}</span><button class="back" data-action="refresh">↻ Aktualisieren</button></div>${cloudError?`<p class="error" role="alert">${esc(cloudError)}</p>`:''}${shown.length?groups.map(section=>{const group=shown.filter(l=>listVisibility(l)===section.key);return `<section class="list-group" aria-labelledby="${section.key}-lists-heading"><div class="list-group-heading"><h2 id="${section.key}-lists-heading">${section.title}</h2><span class="list-group-count" aria-label="${group.length} ${group.length===1?'Liste':'Listen'}">${group.length}</span></div>${group.length?`<div class="cards list-cards">${overviewCards(group,archived)}</div>`:`<p class="muted small list-group-empty">${section.empty}</p>`}</section>`}).join(''):''}${!shown.length?`<section class="card empty"><h2>${archived?'Noch keine archivierten Listen':'Deine erste Liste wartet.'}</h2><p class="muted">${archived?'Archivierte Listen kannst du hier wieder öffnen.':'Lege eine Liste für den nächsten Einkauf an.'}</p>${!archived?'<button class="button" data-action="new-list">＋ Liste anlegen</button>':''}</section>`:''}`;
}
function itemRow(i){return `<div class="item ${i.checked?'checked':''} ${String(i.quantity||'').length>14?'long-quantity':''}"><button role="checkbox" aria-checked="${i.checked}" aria-label="${esc(i.name)} ${i.checked?'wieder öffnen':'abhaken'}" class="check" data-check="${i.id}" ${busy?'disabled':''}>${i.checked?'✓':''}</button><div class="item-info"><strong>${esc(i.name)}</strong>${i.note?`<p>${esc(i.note)}</p>`:''}</div><span class="quantity">${esc(i.quantity)}</span>${shopping?'':`<button class="edit edit-item-button" data-edit-item="${i.id}" aria-label="${esc(i.name)} bearbeiten" title="Produkt bearbeiten"><svg class="more-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button>`}</div>`}
function shoppingDetail(){
 const list=lists.find(l=>l.id===selected),all=items.filter(i=>i.list_id===selected),open=all.filter(i=>!i.checked),done=all.filter(i=>i.checked);
 return `<header class="shopping-header"><div class="shopping-top"><h1>${esc(list.name)}</h1><button class="button secondary" data-action="shopping" aria-label="Einkauf beenden">Beenden</button></div><div class="shopping-state">${scopeBadge(list)}<span>${done.length}/${all.length} besorgt</span></div><div class="progress"><span style="width:${all.length?done.length/all.length*100:0}%"></span></div></header>${wakeError?`<div class="notice" role="status">${esc(wakeError)}<button class="button secondary" data-action="retry-wake">Erneut aktivieren</button></div>`:''}${cloudError?`<p class="error" role="alert">${esc(cloudError)}</p>`:''}<section class="card shopping-items">${groupedItems(open)}${!open.length?`<div class="empty"><h2>${all.length?'✓ Alles besorgt!':'Noch keine Produkte'}</h2><p class="muted">${all.length?'Du kannst den Einkauf jetzt beenden.':'Beende den Einkaufsmodus, um Produkte hinzuzufügen.'}</p></div>`:''}${done.length?`<details><summary>✓ Besorgt · ${done.length}</summary>${done.map(itemRow).join('')}</details>`:''}</section><footer class="shopping-footer">${listUpdated(list)}<span class="status-line">${esc(status())}</span></footer>`;
}
function detail(){
 const list=lists.find(l=>l.id===selected),all=items.filter(i=>i.list_id===selected),done=all.filter(i=>i.checked).length;
 const visible=all.filter(i=>(filter!=='open'||!i.checked)&&(filter!=='done'||i.checked)&&`${i.name} ${i.note}`.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de'))),open=visible.filter(i=>!i.checked),checked=visible.filter(i=>i.checked);
 return `<button class="back" data-action="back">← Listen</button><div class="heading list-heading"><h1>${esc(list.name)}</h1><button class="icon-button" data-action="edit-list" aria-label="Liste bearbeiten" title="Liste bearbeiten"><svg class="more-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button></div>${scopeBadge(list)}${list.note?`<p class="muted small list-note">${esc(list.note)}</p>`:''}${listUpdated(list)}<div class="list-primary-actions"><button class="button add-product-main" data-action="new-item">＋ Produkt hinzufügen</button><button class="button secondary" data-action="shopping">Einkauf starten</button></div><div class="list-summary"><span>${done}/${all.length} besorgt</span></div><div class="progress"><span style="width:${all.length?done/all.length*100:0}%"></span></div><div class="tools compact-tools"><input id="search" class="search" type="search" placeholder="Produkte suchen …" aria-label="Produkte suchen" value="${esc(search)}"><select id="filter" aria-label="Produkte filtern"><option value="all" ${filter==='all'?'selected':''}>Alle</option><option value="open" ${filter==='open'?'selected':''}>Offen</option><option value="done" ${filter==='done'?'selected':''}>Besorgt</option></select></div>${cloudError?`<p class="error" role="alert">${esc(cloudError)}</p>`:''}<section class="card products-card">${groupedItems(open)}${!visible.length?`<div class="empty"><h2>${all.length?'Keine Treffer':'Was fehlt noch?'}</h2><p class="muted">${all.length?'Ändere die Suche oder den Filter.':'Füge das erste Produkt hinzu.'}</p></div>`:''}${checked.length?`<details><summary>✓ Besorgt · ${checked.length}</summary>${checked.map(itemRow).join('')}</details>`:''}</section><div class="actions list-actions"><button class="button secondary" data-action="reset">Häkchen zurücksetzen</button><button class="button secondary" data-action="archive">${list.archived?'Wiederherstellen':'Archivieren'}</button></div><p class="status-line">${esc(status())}</p>`;
}
function dialog(title,body){$('#modal').innerHTML=`<div class="dialog-head"><h2>${title}</h2><button class="close" data-action="close" aria-label="Dialog schließen">×</button></div>${body}`;if(!$('#modal').open)$('#modal').showModal()}
function errorMessage(e){if(e?.code==='PGRST204'||e?.code==='42703')return 'Bitte zuerst die Supabase-Erweiterung supabase-private-lists.sql einspielen.';if(e?.code==='PGRST205'||e?.code==='42P01')return 'Die Einkaufslisten-Tabellen sind noch nicht eingerichtet.';if(!navigator.onLine)return 'Du bist offline. Du kannst den gespeicherten Stand lesen. Änderungen sind wieder mit Internet möglich.';return e?.message||'Die Verbindung zu Supabase ist fehlgeschlagen.'}
function fetchShopData(uid){return Promise.all([client.from('shopping_lists').select('*').order('created_at',{ascending:false}),client.from('shopping_items').select('*').order('created_at'),client.from('shopping_preferences').select('preferences').eq('user_id',uid),client.from('shopping_catalog').select('*').order('name')])}
async function refresh(silent=false,preloaded=null){if(demo||!user)return;if(!navigator.onLine){loading=false;render();return;}if(refreshing||busy){refreshPending=true;return}refreshing=true;const uid=user.id,preferenceVersion=preferencesRevision;try{const [a,b,pref,goods]=(preloaded?await preloaded:null)||await fetchShopData(uid);if(a.error)throw a.error;if(b.error)throw b.error;if(user?.id!==uid)return;const catalogChanged=!goods.error&&JSON.stringify(catalog)!==JSON.stringify(goods.data);catalogError=goods.error?'Der Warenkatalog konnte nicht geladen werden. Prüfe die Supabase-Erweiterung.':'';if(!goods.error)catalog=goods.data;let preferencesChanged=false;if(pref.error){preferencesStatus='Einstellungen konnten nicht geladen werden';updatePreferenceStatus()}else if(!preferencesPending&&!preferencesDirty&&preferenceVersion===preferencesRevision){const remote=normalizePreferences(pref.data?.[0]?.preferences);preferencesChanged=JSON.stringify(remote)!==JSON.stringify(preferences);preferences=remote;preferencesStatus='Aus Supabase geladen';writeLocal(preferenceKey(),JSON.stringify(preferences));theme()}const changed=catalogChanged||preferencesChanged||JSON.stringify(lists)!==JSON.stringify(a.data)||JSON.stringify(items)!==JSON.stringify(b.data)||Boolean(cloudError);lists=(a.data||[]).filter(l=>canViewList(l));items=(b.data||[]).filter(i=>lists.some(l=>l.id===i.list_id));cloudError='';loading=false;lastSync=new Date();try{writeLocal(`grevingshop-cache:${uid}`,JSON.stringify({lists,items,catalog,at:lastSync.toISOString()}))}catch{}if(!silent||(changed&&!$('#modal').open))render()}catch(e){cloudError=errorMessage(e);if(!silent)render()}finally{refreshing=false;loading=false;if(refreshPending){refreshPending=false;scheduleRefresh()}if(cloudError){try{const cached=JSON.parse(localStorage.getItem(`grevingshop-cache:${uid}`)||'null');if(cached&&!lists.length&&user?.id===uid){({lists,items,catalog}=cachedListData(cached,user));lastSync=new Date(cached.at);render()}}catch{}}}}
async function mutate(table,action,payload,id){if(busy)throw Error('Bitte warte, bis die vorige Änderung gespeichert ist.');if(!demo&&!navigator.onLine)throw Error('Du bist offline. Bitte verbinde dich zum Speichern mit dem Internet.');busy=true;try{if(demo){const data=table==='shopping_lists'?lists:table==='shopping_catalog'?catalog:items;if(action==='insert')data.push({...payload,id:crypto.randomUUID(),created_at:new Date().toISOString(),archived:false,checked:false});else if(action==='delete'){const index=data.findIndex(i=>i.id===id);if(index>=0)data.splice(index,1)}else Object.assign(data.find(i=>i.id===id),payload);if(table==='shopping_items')touchDemoList(payload.list_id||items.find(i=>i.id===id)?.list_id||selected);if(table==='shopping_lists')touchDemoList(id);persistDemo();}else{let query=client.from(table);query=action==='insert'?query.insert(payload):action==='delete'?query.delete().eq('id',id):query.update(payload).eq('id',id);const result=await query.select('id');if(result.error)throw result.error;if(!result.data?.length)throw Error('Die Änderung konnte nicht gespeichert werden. Bitte aktualisiere die Liste.')} }finally{busy=false}await refresh(true);render()}
function formDialog(kind,id,seed={}){
 const isList=kind==='list',isCatalog=kind==='catalog',data=(isList?lists:isCatalog?catalog:items).find(i=>i.id===id)||seed;
 const listOptions=lists.filter(l=>!l.archived);
 if(!isList&&!isCatalog&&!id&&!listOptions.length){toast('Lege zuerst eine Einkaufsliste an.');return}
 dialog(isCatalog?'Neues Katalogprodukt':isList?(id?'Liste bearbeiten':'Neue Liste'):(id?'Produkt bearbeiten':'Produkt hinzufügen'),`<form id="editForm">${!isList&&!isCatalog&&!id?`<div class="field"><label for="targetList">Einkaufsliste</label><select id="targetList" name="list_id">${listOptions.map(l=>`<option value="${l.id}" ${l.id===selected?'selected':''}>${esc(l.name)}</option>`).join('')}</select></div>`:''}${isList?(!id?`<div class="field"><label class="privacy-option" for="privateList"><input type="checkbox" id="privateList" name="privateList" ${privateListsReady?'':'disabled'}><span>Privat</span></label><p class="tiny muted">${privateListsReady?'Nur für dich. Ohne Häkchen ist die Liste gemeinsam.':'Private Listen benötigen zuerst die Supabase-Erweiterung supabase-private-lists.sql.'}</p></div>`:`<p>${scopeBadge(data)}<span class="tiny muted"> Die Sichtbarkeit bleibt erhalten.</span></p>`):''}<div class="field"><label for="name">${isList?'Listenname':'Produktname'}</label><input id="name" name="name" maxlength="${isList?100:150}" required value="${esc(data.name)}" ${!isList&&!isCatalog&&!id?'aria-controls="catalogSuggestions"':''} placeholder="${isList?'z. B. Wocheneinkauf':'z. B. Milch'}" autocomplete="off">${!isList&&!isCatalog&&!id?'<section id="catalogSuggestions" class="catalog-suggestions" aria-label="Vorschläge aus dem Warenkatalog" hidden></section>':''}</div>${!isList?`<div class="field-row"><div class="field"><label for="quantity">Menge</label><input id="quantity" name="quantity" maxlength="60" value="${esc(data.quantity||'1')}" placeholder="z. B. 2 Liter"></div><div class="field"><label for="category">Kategorie</label><select id="category" name="category"><option value="auto" ${data.category_mode!=='manual'?'selected':''}>Automatisch: ${esc(suggestProductCategory(data.name))}</option>${CATEGORIES.map(c=>`<option ${data.category_mode==='manual'&&c===data.category?'selected':''}>${esc(c)}</option>`).join('')}</select></div></div>`:''}<div class="field"><label for="note">Notiz (optional)</label><textarea id="note" name="note" maxlength="1000">${esc(data.note)}</textarea></div>${!isList&&!isCatalog&&!id?'<label class="catalog-optin"><input type="checkbox" name="saveToCatalog" id="saveToCatalog"><span>Im gemeinsamen Warenkatalog speichern (für alle sichtbar)</span></label>':''}<p class="error" id="formError" role="alert"></p><div class="actions">${!isList&&id?'<button type="button" class="button danger" id="deleteItem">Entfernen</button>':''}<button type="button" class="button secondary" data-action="close">Abbrechen</button><button class="button" type="submit">${isCatalog?'Im Katalog speichern':id?'Speichern':'Hinzufügen'}</button></div></form>`);
 $('#editForm').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),name=String(f.get('name')).trim();if(!name){$('#formError').textContent='Bitte gib einen Namen ein.';return}
  const payload={name,note:String(f.get('note')).trim(),...(!isList?{quantity:String(f.get('quantity')).trim()||'1',category:f.get('category')==='auto'?suggestProductCategory(name):f.get('category'),category_mode:f.get('category')==='auto'?'auto':'manual'}:{})};
  if(isList&&!id){const visibility=f.get('privateList')==='on'?'private':'shared';if(!['shared','private'].includes(visibility)){ $('#formError').textContent='Bitte wähle eine gültige Sichtbarkeit.';return }if(visibility==='private'&&!privateListsReady){$('#formError').textContent='Private Listen sind noch nicht serverseitig eingerichtet.';return}if(privateListsReady)payload.visibility=visibility;}
  const b=e.submitter;b.disabled=true;try{if(isCatalog){await createCatalogProduct(payload);catalogSearch='';render()}else if(!isList&&!id)await createShoppingItem({...payload,list_id:f.get('list_id')},f.get('saveToCatalog')==='on');else await mutate(isList?'shopping_lists':'shopping_items',id?'update':'insert',payload,id);$('#modal').close();toast(id?'Änderung gespeichert':'Hinzugefügt')}catch(err){$('#formError').textContent=errorMessage(err)}finally{b.disabled=false}
 };
 if(!isList&&!isCatalog&&!id){$('#name').oninput=()=>showCatalogSuggestions($('#name').value);$('#name').onkeydown=event=>{if(event.key==='Escape'&&!$('#catalogSuggestions').hidden){event.preventDefault();event.stopPropagation();$('#catalogSuggestions').hidden=true}};$('#catalogSuggestions').onclick=event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.catalogChoice)chooseCatalogSuggestion(button.dataset.catalogChoice);else if(button.dataset.dismissSuggestions)$('#catalogSuggestions').hidden=true};}
 if($('#deleteItem'))$('#deleteItem').onclick=async()=>{if(!confirm('Dieses Produkt aus der Liste entfernen?'))return;try{await mutate('shopping_items','delete',{},id);$('#modal').close();toast('Produkt entfernt')}catch(e){$('#formError').textContent=errorMessage(e)}};
}
function catalogMatches(query){const value=normalizedProductName(query);if(!value)return [];return catalog.filter(i=>normalizedProductName(i.name).includes(value)).sort((a,b)=>Number(normalizedProductName(b.name).startsWith(value))-Number(normalizedProductName(a.name).startsWith(value))||a.name.localeCompare(b.name,'de'))}
function showCatalogSuggestions(query){
 const region=$('#catalogSuggestions');if(!region)return;
 const matches=catalogMatches(query);region.hidden=!matches.length;
 region.innerHTML=matches.length?`<div class="suggestions-heading"><span>${matches.length} Katalogtreffer</span><button type="button" class="back" data-dismiss-suggestions="true" aria-label="Vorschläge ausblenden">Ausblenden</button></div><div class="suggestions-scroll">${matches.slice(0,40).map(i=>`<button type="button" class="catalog-suggestion" data-catalog-choice="${esc(i.id)}"><strong>${esc(i.name)}</strong><span>${esc(i.quantity||'1')}${i.note?' · '+esc(i.note):''}</span></button>`).join('')}</div>${matches.length>40?'<p class="tiny muted">Bitte genauer suchen, um weitere Treffer anzuzeigen.</p>':''}`:'';
}
function chooseCatalogSuggestion(id){
 const product=catalog.find(i=>i.id===id);if(!product||!$('#editForm')||!$('#catalogSuggestions'))return;
 $('#name').value=product.name;$('#quantity').value=product.quantity||'1';$('#note').value=product.note||'';
 $('#category').value=product.category_mode==='manual'&&CATEGORIES.includes(product.category)?product.category:'auto';
 const option=$('#category').querySelector('[value=auto]');if(option)option.textContent='Automatisch: '+suggestProductCategory(product.name);
 $('#catalogSuggestions').hidden=true;$('#name').blur?.();
}
function updateDialogViewport(){const height=window.visualViewport?.height;if(height)document.documentElement.style.setProperty('--dialog-visible-height',Math.max(160,height-24)+'px')}
window.visualViewport?.addEventListener('resize',updateDialogViewport);updateDialogViewport();
async function deleteArchivedList(id){
 if(!user)throw Error('Bitte melde dich an.');
 if(busy)throw Error('Bitte warte, bis die vorige Änderung gespeichert ist.');
 if(!navigator.onLine)throw Error('Du bist offline. Zum Löschen brauchst du eine Verbindung.');
 const list=lists.find(l=>l.id===id);
 if(!list||!list.archived)throw Error('Nur archivierte Listen können hier gelöscht werden.');
 if(!confirm(`Liste „${list.name}“ mit allen Produkten ${listVisibility(list)==='private'?'aus deinen privaten Listen':'für alle Nutzer'} endgültig löschen? Das kann nicht rückgängig gemacht werden.`))return false;
 busy=true;
 try{
  const {data,error}=await client.from('shopping_lists').delete().eq('id',id).eq('archived',true).select('id');
  if(error)throw error;
  if(!data?.length)throw Error('Die Liste wurde zwischenzeitlich geändert. Bitte aktualisiere das Archiv.');
  if(selected===id)selected=null;
  toast('Liste gelöscht');return true;
 }finally{busy=false;await refresh(true);render()}
}
async function goToStartPage(){
 setMenu(false);
 if(!user){account();return}
 selected=null;search='';filter='all';view=normalizePreferences(preferences).startPage;
 await stopShopping();render();
}
function account(){if(demo){toast('Du bist in der lokalen Vorschau.');return}if(user){dialog('Dein Konto',`<p>Du bist angemeldet.</p><p class="muted">${esc(user.email)}</p><p class="small muted">Gleiches Supabase-Konto wie bei Greving.Fit.</p><div class="actions"><button class="button secondary" data-action="change-password">Passwort ändern</button><button class="button secondary" data-action="logout">Abmelden</button><button class="button" data-action="close">Fertig</button></div>`);return}dialog('Willkommen zurück.',`<p class="muted">Melde dich mit deinen Greving.Fit-Zugangsdaten an.</p><form id="loginForm"><div class="field"><label for="email">E-Mail-Adresse</label><input id="email" name="email" type="email" autocomplete="username" required></div><div class="field"><label for="password">Passwort</label><input id="password" name="password" type="password" autocomplete="current-password" required></div><p id="loginError" class="error" role="alert"></p><div class="actions"><button class="button secondary" type="button" data-action="close">Abbrechen</button><button class="button" type="submit">Anmelden</button></div></form>`);$('#loginForm').onsubmit=async e=>{e.preventDefault();if(!client){$('#loginError').textContent='Die Supabase-Bibliothek konnte nicht geladen werden.';return}const f=new FormData(e.currentTarget);e.submitter.disabled=true;try{const {data,error}=await client.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)throw error;await setUser(data.user);$('#modal').close();toast('Angemeldet')}catch(err){$('#loginError').textContent=err.message==='Invalid login credentials'?'E-Mail oder Passwort stimmen nicht. Verwende dein Greving.Fit-Passwort.':errorMessage(err)}finally{e.submitter.disabled=false}}}
async function changeAccountPassword(current,password,repeated){
 const owner=user,auth=client?.auth;
 if(!owner||!auth)throw Error('Bitte melde dich zuerst an.');
 if(!navigator.onLine)throw Error('Du bist offline. Zum Ändern des Passworts brauchst du eine Verbindung.');
 if(!current)throw Error('Bitte gib dein aktuelles Passwort ein.');
 if(typeof password!=='string'||password.length<8)throw Error('Verwende mindestens 8 Zeichen für das neue Passwort.');
 if(password!==repeated)throw Error('Die neuen Passwörter stimmen nicht überein.');
 const {data,error}=await auth.signInWithPassword({email:owner.email,password:current});
 if(error)throw Error(error.message==='Invalid login credentials'?'Das aktuelle Passwort stimmt nicht.':error.message||'Anmeldung fehlgeschlagen.');
 if(user?.id!==owner.id||data.user?.id!==owner.id)throw Error('Das aktive Konto hat sich geändert. Bitte erneut anmelden.');
 const result=await auth.updateUser({password});if(result.error)throw result.error;
}
function passwordDialog(){
 if(!user||demo){account();return}
 dialog('Passwort ändern',`<p class="muted small">Das neue Passwort gilt für GrevingShop und GrevingFit.</p><form id="passwordForm"><div class="field"><label for="currentPassword">Aktuelles Passwort</label><input id="currentPassword" name="current" type="password" autocomplete="current-password" required></div><div class="field"><label for="newPassword">Neues Passwort</label><input id="newPassword" name="password" type="password" autocomplete="new-password" minlength="8" required><small class="muted">Mindestens 8 Zeichen</small></div><div class="field"><label for="repeatPassword">Neues Passwort wiederholen</label><input id="repeatPassword" name="repeat" type="password" autocomplete="new-password" minlength="8" required></div><p class="error" id="passwordError" role="alert"></p><div class="actions"><button type="button" class="button secondary" data-action="close">Abbrechen</button><button class="button" type="submit">Passwort speichern</button></div></form>`);
 let pending=false;
 $('#passwordForm').onsubmit=async event=>{
  event.preventDefault();if(pending)return;pending=true;event.submitter.disabled=true;$('#passwordError').textContent='';
  const form=event.currentTarget,fields=new FormData(form);
  try{await changeAccountPassword(fields.get('current'),fields.get('password'),fields.get('repeat'));form.reset();$('#modal').close();toast('Passwort für beide Apps geändert')}
  catch(error){$('#passwordError').textContent=errorMessage(error)}
  finally{pending=false;event.submitter.disabled=false}
 };
}
function stopRealtime(){realtimeReady=false;clearTimeout(realtimeTimer);if(realtimeChannel){client.removeChannel(realtimeChannel);realtimeChannel=null}}
function startRealtime(){stopRealtime();if(!client||!user||demo)return;realtimeChannel=client.channel('shopping-family-'+user.id).on('postgres_changes',{event:'*',schema:'public',table:'shopping_lists'},()=>scheduleRefresh()).on('postgres_changes',{event:'*',schema:'public',table:'shopping_items'},()=>scheduleRefresh()).on('postgres_changes',{event:'*',schema:'public',table:'shopping_catalog'},()=>scheduleRefresh()).on('postgres_changes',{event:'*',schema:'public',table:'shopping_preferences',filter:'user_id=eq.'+user.id},()=>scheduleRefresh()).subscribe(state=>{realtimeReady=state==='SUBSCRIBED';if(realtimeReady)refresh();else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state)){if(view!=='settings')toast('Live-Verbindung unterbrochen. Automatischer Abgleich bleibt aktiv.');render()}})}
function scheduleRefresh(){clearTimeout(realtimeTimer);realtimeTimer=setTimeout(()=>refresh(true),100)}
async function setUser(next){
 const generation=++authGeneration;
 restoringUserId=next?.id||null;
 const previousUserId=user?.id,changed=previousUserId!==next?.id;
 let preloaded=null;
 if(next&&!demo){
  let own=null;
  if(!navigator.onLine){
   try{own=JSON.parse(localStorage.getItem('grevingshop-profile:'+next.id)||'null')}catch{}
   if(!own||own.id!==next.id||own.email!==next.email?.toLowerCase())throw Error('Bitte verbinde dich für die erste Anmeldung auf diesem Gerät mit dem Internet.');
   for(const key of Object.keys(FAMILY))delete FAMILY[key];FAMILY[own.name]=own.email;
  }else{
   preloaded=fetchShopData(next.id).catch(()=>null);
   const privacyCheck=Promise.resolve().then(()=>client.rpc('shopping_privacy_version')).catch(()=>null);
   const {data,error}=await client.rpc('shopping_family_profiles');
   if(generation!==authGeneration)return;
   if(error)throw Error('Die Kontoprüfung konnte nicht abgeschlossen werden. Bitte Verbindung prüfen und erneut versuchen.');
   privateListsReady=(await privacyCheck)?.data===1;
   if(generation!==authGeneration)return;
   own=data?.find(row=>row.email.toLowerCase()===next.email?.toLowerCase());
   if(!own){await client.auth.signOut({scope:'local'});throw Error('Dieses Konto ist nicht freigegeben.')}
   for(const key of Object.keys(FAMILY))delete FAMILY[key];
   for(const row of data)FAMILY[row.display_name]=row.email;
   writeLocal('grevingshop-profile:'+next.id,JSON.stringify({id:next.id,name:own.display_name,email:own.email.toLowerCase()}));
  }
 }
 if(generation!==authGeneration)return;
 if(!next){privateListsReady=false;for(const key of Object.keys(FAMILY))delete FAMILY[key];}
 if(changed&&previousUserId){removeLocal('grevingshop-cache:'+previousUserId);removeLocal('grevingshop-profile:'+previousUserId)}
 user=next;sessionRestoring=false;restoringUserId=null;
 if(changed){catalogSelection.clear();catalogTarget='';preferencesRevision++;preferencesDirty=Boolean(next&&localStorage.getItem(preferenceKey(next)+':pending'));preferencesStatus='';preferences=cachedPreferences(next);view=preferences.startPage;theme()}
 if(!next){stopRealtime();lists=[];items=[];catalog=[];catalogError='';selected=null;lastSync=null;cloudError='';await stopShopping()}
 else if(changed){
  lists=[];items=[];catalog=[];catalogError='';selected=null;
  try{const cached=JSON.parse(localStorage.getItem('grevingshop-cache:'+next.id)||'null');if(cached){({lists,items,catalog}=cachedListData(cached,user));lastSync=new Date(cached.at)}}catch{}
 }
 loading=Boolean(next&&navigator.onLine);render();
 if(next){
  if(navigator.onLine){startRealtime();await refresh(false,preloaded);if(generation!==authGeneration)return;if(changed){view=preferences.startPage;render()}if(preferencesDirty)await savePreferences()}
  else{stopRealtime();loading=false;render()}
 }
}

async function requestWake(){if(!wakeWanted||document.visibilityState!=='visible'||wake)return;if(!('wakeLock'in navigator)){wakeError='Dieser Browser unterstützt das Wachhalten nicht. Stelle die automatische Bildschirmsperre am Smartphone für den Einkauf länger ein.';render();return}try{wake=await navigator.wakeLock.request('screen');wakeError='';wake.addEventListener('release',()=>{wake=null;if(wakeWanted&&document.visibilityState==='visible'){wakeError='Das System hat das Wachhalten beendet. Tippe auf „Bildschirm-Sperre prüfen“, um es erneut zu aktivieren.';render()}})}catch{wakeError='Der Bildschirm konnte nicht wach gehalten werden. Prüfe Energiesparmodus und Browser-Berechtigung und tippe zum erneuten Versuch auf die Bildschirm-Taste.'}render()}
async function releaseWake(){wakeWanted=false;const current=wake;wake=null;wakeError='';if(current)await current.release();render()}
async function stopShopping(){shopping=false;await releaseWake()}
function appearance(){dialog('Deine Darstellung',`<div class="field"><label for="scheme">Farbschema wie in Greving.Fit</label><select id="scheme">${COLOR_SCHEMES.map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div><div class="field"><label for="mode">Darstellung</label><select id="mode"><option value="light">Hell</option><option value="dark">Dunkel</option></select></div><div class="actions"><button class="button" data-action="close">Fertig</button></div>`);$('#scheme').value=preferences.scheme||'energy';$('#mode').value=preferences.theme||'light';for(const id of ['scheme','mode'])$('#'+id).onchange=()=>{preferences={...preferences,scheme:$('#scheme').value,theme:$('#mode').value};savePreferences();if(view==='settings')render()}}
document.addEventListener('click',async event=>{const b=event.target.closest('button,a.brand-name');if(!b)return;try{if(b.matches('a.brand-name')){event.preventDefault();selected=null;view='lists';await stopShopping();render();return}if(b.dataset.view){setMenu(false);selected=null;view=b.dataset.view;await stopShopping();render();return}if(b.dataset.catalogRemove){if(confirm('Dieses Produkt aus dem Warenkatalog entfernen?'))await mutate('shopping_catalog','delete',{},b.dataset.catalogRemove);return}if(b.dataset.deleteList){await deleteArchivedList(b.dataset.deleteList);return}if(b.dataset.list){selected=b.dataset.list;search='';filter='all';render();return}if(b.dataset.check){const i=items.find(i=>i.id===b.dataset.check);b.disabled=true;try{await mutate('shopping_items','update',{checked:!i.checked},i.id)}catch(e){b.disabled=false;throw e}return}if(b.dataset.editItem){formDialog('item',b.dataset.editItem);return}switch(b.dataset.action){case'new-catalog-product':formDialog('catalog');break;case'catalog-bulk-add':await addCatalogSelection();break;case'catalog-clear':catalogSelection.clear();render();break;case'close':$('#modal').close();break;case'login':account();break;case'retry-session':await resumeShopSession();break;case'change-password':passwordDialog();break;case'leave-demo':demo=false;lists=[];items=[];catalog=[];selected=null;view='lists';await stopShopping();await setUser(user);break;case'logout':{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;$('#modal').close();await setUser(null);break}case'new-list':formDialog('list');break;case'edit-list':formDialog('list',selected);break;case'new-item':formDialog('item');break;case'back':selected=null;await stopShopping();render();break;case'refresh':await refresh();break;case'shopping':setMenu(false);shopping=!shopping;if(shopping){wakeWanted=true;await requestWake()}else await releaseWake();render();break;case'retry-wake':wakeWanted=true;await requestWake();break;case'wake':if(wake)await releaseWake();else{wakeWanted=true;await requestWake()}break;case'archive':{const l=lists.find(l=>l.id===selected),wasArchived=l.archived;await mutate('shopping_lists','update',{archived:!wasArchived},l.id);selected=null;await stopShopping();render();toast(wasArchived?'Liste wiederhergestellt':'Liste archiviert');break}case'reset':if(confirm('Alle Häkchen dieser Liste zurücksetzen?')){const targets=items.filter(i=>i.list_id===selected&&i.checked);for(const i of targets)await mutate('shopping_items','update',{checked:false},i.id);toast('Alle Produkte sind wieder offen')}break;case'appearance':appearance();break;case'settings-account':account();break;case'settings-theme':preferences={...preferences,theme:preferences.theme==='dark'?'light':'dark'};await savePreferences();render();break;case'settings-sync':if(user)await refresh();else account();break;case'settings-wake':preferences.keepAwake=preferences.keepAwake===false;writeLocal('grevingshop-preferences',JSON.stringify(preferences));if(!preferences.keepAwake)await releaseWake();render();break;case'install':await installApp();break}}catch(e){toast(errorMessage(e))}});
function setMenu(open,restoreFocus=false){const panel=$('#appMenu'),toggle=$('#menuToggle'),wasHidden=panel.hidden;panel.hidden=!open;if(open&&wasHidden){const button=toggle.getBoundingClientRect(),bounds=panel.getBoundingClientRect(),x=button.left+button.width/2-bounds.left,y=button.top+button.height/2-bounds.top,radius=Math.hypot(Math.max(Math.abs(x),Math.abs(bounds.width-x)),Math.max(Math.abs(y),Math.abs(bounds.height-y)))+60;panel.style.setProperty('--menu-origin-x',`${x}px`);panel.style.setProperty('--menu-origin-y',`${y}px`);panel.style.setProperty('--menu-reveal-radius',`${radius}px`)}toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');if(open)panel.querySelector('.active')?.focus({preventScroll:true});else if(restoreFocus)toggle.focus({preventScroll:true})}
$('#menuToggle').onclick=()=>setMenu($('#appMenu').hidden);
document.addEventListener('click',event=>{if(!$('#appMenu').hidden&&!event.target.closest('#appMenu,#menuToggle'))setMenu(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#appMenu').hidden){event.preventDefault();setMenu(false,true)}});
document.addEventListener('focusin',event=>{if(!$('#appMenu').hidden&&!event.target.closest('#appMenu,#menuToggle'))setMenu(false)});
$('#modal').addEventListener('close',render);
$('#avatar').onclick=goToStartPage;$('#account').onclick=async()=>{if(user){await refresh();toast(cloudError||'Listen aktualisiert')}else account()};
document.addEventListener('input',e=>{if(e.target.id==='name'&&$('#category')){const option=$('#category').querySelector('[value=auto]');if(option)option.textContent='Automatisch: '+suggestProductCategory(e.target.value)}if(e.target.id==='catalogSearch'){catalogSearch=e.target.value;render()}if(e.target.id==='search'){const position=e.target.selectionStart;search=e.target.value;render();$('#search').focus();$('#search').setSelectionRange(position,position)}});
document.addEventListener('change',e=>{if(e.target.dataset.preference){preferences[e.target.dataset.preference]=e.target.value;savePreferences();render()}if(e.target.id==='filter'){filter=e.target.value;render()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){requestWake();refresh(true)}});window.addEventListener('online',async()=>{if(user&&!demo){if(preferencesDirty)await savePreferences();startRealtime()}refresh()});window.addEventListener('offline',render);
setInterval(()=>{if(document.visibilityState==='visible'&&!realtimeReady)refresh(true)},5000);
let sessionResume=null;
function resumeShopSession(){
 if(!client||demo||sessionResume)return sessionResume;
 const generation=authGeneration;
 sessionResume=(async()=>{const {data,error}=await client.auth.getSession();if(error)throw error;if(generation!==authGeneration)return;if(data.session?.user&&data.session.user.id!==user?.id)await setUser(data.session.user);else if(!data.session){sessionRestoring=false;restoringUserId=null;render()}})().catch(e=>{cloudError=errorMessage(e);render()}).finally(()=>{sessionResume=null});
 return sessionResume;
}
window.addEventListener('pageshow',()=>resumeShopSession());
window.addEventListener('online',()=>user?setUser(user).catch(e=>toast(errorMessage(e))):resumeShopSession());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')resumeShopSession()});
render();if(client){resumeShopSession();client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')setTimeout(()=>setUser(null),0);else if(event==='SIGNED_IN'&&session.user.id!==user?.id&&session.user.id!==restoringUserId&&!demo)setTimeout(()=>setUser(session.user).catch(e=>toast(errorMessage(e))),0)})}
setupAppUpdates();setupInstallButton();
function standaloneApp(){return Boolean(navigator.standalone||window.matchMedia?.('(display-mode: standalone)').matches)}
function iphoneInstall(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function updateInstallButton(){const button=$('#installApp');if(button)button.hidden=standaloneApp()}
async function installApp(){
 if(standaloneApp())return;
 if(installEvent){const prompt=installEvent;installEvent=null;await prompt.prompt();const choice=await prompt.userChoice;if(choice?.outcome==='accepted')$('#installApp').hidden=true;return}
 if(iphoneInstall()){
  dialog('Auf dem iPhone installieren',`<ol class="install-steps"><li>Öffne GrevingShop in <strong>Safari</strong>.</li><li>Tippe auf <strong>Teilen</strong> – je nach Safari-Ansicht zuerst auf das Menü <strong>…</strong>.</li><li>Wähle <strong>Zum Home-Bildschirm</strong> bzw. <strong>Zu Home-Bildschirm hinzufügen</strong>. Falls der Eintrag fehlt: <strong>Aktionen bearbeiten</strong>.</li><li>Falls angezeigt, aktiviere <strong>Als Web-App öffnen</strong> und tippe auf <strong>Hinzufügen</strong>.</li></ol><p class="muted small">Danach öffnest du GrevingShop über das Symbol auf deinem Home-Bildschirm.</p><button class="button" data-action="close">Verstanden</button>`);
 }else dialog('GrevingShop installieren',`<p>Öffne das Browser-Menü und wähle <strong>App installieren</strong> oder <strong>Zum Startbildschirm hinzufügen</strong>.</p><p class="muted small">Falls der Browser eine direkte Installation anbietet, öffnet dieser Button den Installationsdialog.</p><button class="button" data-action="close">Verstanden</button>`);
}
function setupInstallButton(){
 updateInstallButton();$('#installApp').onclick=()=>installApp().catch(error=>toast(errorMessage(error)));
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;updateInstallButton()});
 window.addEventListener('appinstalled',()=>{$('#installApp').hidden=true;installEvent=null});
 window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change',updateInstallButton);
 window.addEventListener('pageshow',updateInstallButton);window.addEventListener('focus',updateInstallButton);document.addEventListener('visibilitychange',updateInstallButton);
}
function offerUpdate(worker,version){
 if(!worker||!version||version===APP_VERSION||(availableVersion&&Number(version)<Number(availableVersion)))return;
 updateWorker=worker;availableVersion=version;document.body.classList.add('app-update-ready');$('#updateApp').hidden=false;$('#updateNotice').hidden=false;
}
function requestUpdateStatus(worker){worker?.postMessage({type:'GET_UPDATE_STATUS'})}
function reloadApprovedUpdate(){if(updateApplying&&!updateReloaded){updateReloaded=true;window.location.reload()}}
async function acceptAppUpdate(){
 if(!updateWorker||updateApplying)return;
 if(busy||preferencesPending||shopping||$('#modal').open||document.querySelector('#app form[data-dirty="true"]')){toast('Beende zuerst den Einkauf oder speichere und schließe die offene Bearbeitung.');return}
 updateApplying=true;$('#applyUpdate').disabled=true;$('#applyUpdate').textContent='Wird aktualisiert …';
 try{updateWorker.postMessage({type:'APPROVE_UPDATE',version:availableVersion})}catch{updateApplying=false;$('#applyUpdate').disabled=false;$('#applyUpdate').textContent='Jetzt aktualisieren';toast('Update derzeit nicht erreichbar. Bitte später erneut versuchen.')} 
}
function setupAppUpdates(){
 $('#applyUpdate').onclick=acceptAppUpdate;
 $('#deferUpdate').onclick=()=>{$('#updateNotice').hidden=true};
 $('#updateApp').onclick=()=>{$('#updateNotice').hidden=false};
 for(const type of ['input','change'])document.addEventListener(type,event=>{const form=event.target.closest?.('form');if(form)form.dataset.dirty='true'});
 if(!('serviceWorker'in navigator))return;
 navigator.serviceWorker.addEventListener('message',event=>{
  const message=event.data;
  if(message?.type==='UPDATE_STATUS'){const worker=event.source||updateRegistration?.waiting||updateRegistration?.active;if(message.version===APP_VERSION&&!message.hasApproved)worker?.postMessage({type:'INITIALIZE_CURRENT_VERSION',version:APP_VERSION});else offerUpdate(worker,message.version)}
  if(message?.type==='UPDATE_APPLIED'&&message.version===availableVersion)reloadApprovedUpdate();
  if(message?.type==='UPDATE_FAILED'&&message.version===availableVersion){updateApplying=false;$('#applyUpdate').disabled=false;$('#applyUpdate').textContent='Jetzt aktualisieren';toast('Das Update ist noch nicht vollständig bereit. Bitte später erneut versuchen.')}
 });
 navigator.serviceWorker.addEventListener('controllerchange',reloadApprovedUpdate);
 navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(registration=>{
  updateRegistration=registration;
  requestUpdateStatus(registration.waiting||registration.active);
  registration.addEventListener('updatefound',()=>{const installing=registration.installing;if(installing)installing.addEventListener('statechange',()=>{if(installing.state==='installed')requestUpdateStatus(registration.waiting||installing)})});
  const check=()=>{if(document.visibilityState==='visible'){registration.update().catch(()=>{});requestUpdateStatus(registration.waiting||registration.active)}};
  document.addEventListener('visibilitychange',check);check();setInterval(check,60*60*1000);
 }).catch(()=>{});
}
function listUpdated(list){
 const raw=list.updated_at||list.created_at,date=new Date(raw);
 if(!raw||!Number.isFinite(date.getTime()))return '<span class="muted small">Noch keine Änderung erfasst</span>';
 const formatted=date.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 return `<p class="updated-line">${list.updated_by_name?`Zuletzt geändert von <strong>${esc(list.updated_by_name)}</strong>`:'Letzter erfasster Stand'} · <time datetime="${esc(date.toISOString())}">${esc(formatted)}</time></p>`;
}
function groupedItems(open){return CATEGORIES.map(category=>{const group=open.filter(i=>productCategory(i)===category);return group.length?`<h2 class="item-group">${esc(category)} <span>${group.length}</span></h2>${group.map(itemRow).join('')}`:''}).join('')}
function catalogView(){
 for(const id of catalogSelection)if(!catalog.some(i=>i.id===id))catalogSelection.delete(id);
 const query=catalogSearch.trim().toLocaleLowerCase('de'),shown=catalog.filter(i=>(i.name+' '+i.note).toLocaleLowerCase('de').includes(query)),targets=lists.filter(l=>!l.archived);
 if(!targets.some(l=>l.id===catalogTarget))catalogTarget=targets[0]?.id||'';
 return `<div class="heading compact-heading catalog-heading"><h1>Warenkatalog <span class="muted small">${catalog.length}</span></h1><button class="button" data-action="new-catalog-product" ${busy?'disabled':''}>＋ Neues Produkt</button></div><input id="catalogSearch" type="search" placeholder="Im Katalog suchen …" aria-label="Warenkatalog durchsuchen" value="${esc(catalogSearch)}"><p class="muted small">Produkte markieren und gesammelt übernehmen.</p>${catalog.length?`<section class="card catalog-bulk" aria-label="Auswahl übernehmen"><div class="row"><strong>${catalogSelection.size} ausgewählt</strong><button class="back" data-action="catalog-clear" ${busy||!catalogSelection.size?'disabled':''}>Zurücksetzen</button></div>${targets.length?`<div class="catalog-transfer"><select id="catalogTarget" aria-label="Zielliste" ${busy?'disabled':''}>${targets.map(l=>`<option value="${esc(l.id)}" ${l.id===catalogTarget?'selected':''}>${esc(l.name)}</option>`).join('')}</select><button class="button" data-action="catalog-bulk-add" ${busy||!catalogSelection.size?'disabled':''}>${busy?'Speichert …':`Übernehmen${catalogSelection.size?' ('+catalogSelection.size+')':''}`}</button></div>`:'<p class="muted small">Lege zuerst eine aktive Einkaufsliste an.</p>'}</section>`:''}${catalogError?`<p class="error" role="alert">${esc(catalogError)}</p>`:''}<section class="card catalog-card">${CATEGORIES.map(category=>{const group=shown.filter(i=>productCategory(i)===category);return group.length?`<h2 class="item-group">${esc(category)}</h2>${group.map(i=>`<div class="catalog-row"><label class="catalog-pick"><input type="checkbox" data-catalog-select="${esc(i.id)}" aria-label="${esc(i.name)} auswählen" ${catalogSelection.has(i.id)?'checked':''} ${busy?'disabled':''}><span class="item-info"><span class="catalog-product-line"><strong>${esc(i.name)}</strong><span class="quantity">${esc(i.quantity)}</span></span>${i.note?`<span class="muted small">${esc(i.note)}</span>`:''}</span></label><button class="edit" data-catalog-remove="${esc(i.id)}" aria-label="${esc(i.name)} aus dem Warenkatalog entfernen" ${busy?'disabled':''}>×</button></div>`).join('')}`:''}).join('')}${!shown.length?`<div class="empty"><h2>${catalog.length?'Keine Treffer':'Noch keine Produkte'}</h2><p class="muted">${catalog.length?'Ändere deine Suche.':'Lege über „Neues Produkt“ deinen ersten Katalogeintrag an.'}</p></div>`:''}</section>`;
}
async function createCatalogProduct(data){
 if(!user)throw Error('Bitte melde dich an.');
 const name=String(data.name||'').trim(),quantity=String(data.quantity||'').trim()||'1',note=String(data.note||'').trim();
 if(!name||name.length>150||quantity.length>60||note.length>1000)throw Error('Bitte prüfe Name, Menge und Notiz.');
 if(catalog.some(i=>normalizedProductName(i.name)===normalizedProductName(name)))throw Error('Dieses Produkt ist bereits im Warenkatalog.');
 const mode=data.category_mode==='manual'?'manual':'auto',category=mode==='manual'?data.category:suggestProductCategory(name);
 if(!CATEGORIES.includes(category))throw Error('Bitte wähle eine gültige Kategorie.');
 try{await mutate('shopping_catalog','insert',{name,quantity,note,category,category_mode:mode})}
 catch(error){if(error.code==='23505')throw Error('Dieses Produkt ist bereits im Warenkatalog.');throw error}
}
async function addCatalogSelection(){
 if(busy)throw Error('Bitte warte, bis die vorige Änderung gespeichert ist.');
 if(!user)throw Error('Bitte melde dich an.');
 if(!navigator.onLine)throw Error('Du bist offline. Zum Speichern brauchst du eine Verbindung.');
 if(!lists.some(l=>l.id===catalogTarget&&!l.archived))throw Error('Wähle eine aktive Einkaufsliste.');
 const products=catalog.filter(i=>catalogSelection.has(i.id));
 if(!products.length)throw Error('Wähle mindestens ein Produkt.');
 const payload=products.map(i=>({list_id:catalogTarget,name:i.name,quantity:i.quantity,note:i.note,category:i.category,category_mode:i.category_mode||'auto',checked:false}));
 busy=true;render();
 try{
  const {error}=await client.from('shopping_items').insert(payload);if(error)throw error;
  catalogSelection.clear();toast(`${products.length} Produkte übernommen`);
 }finally{busy=false;await refresh(true);render()}
}
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.dataset.catalogSelect){if(busy)return;if(el.checked)catalogSelection.add(el.dataset.catalogSelect);else catalogSelection.delete(el.dataset.catalogSelect);render()}
 if(el.id==='catalogTarget')catalogTarget=el.value;
});
async function createShoppingItem(payload,saveToCatalog=false){
 if(busy)throw Error('Bitte warte, bis die vorige Änderung gespeichert ist.');if(!demo&&!navigator.onLine)throw Error('Du bist offline. Zum Speichern brauchst du eine Verbindung.');
 busy=true;
 try{
  if(demo){const id=crypto.randomUUID();items.push({...payload,id,checked:false,created_at:new Date().toISOString()});touchDemoList(payload.list_id);if(saveToCatalog){const key=normalizedProductName(payload.name),existing=catalog.find(i=>normalizedProductName(i.name)===key);if(existing)Object.assign(existing,{...payload,id:existing.id});else catalog.push({...payload,id:crypto.randomUUID()})}persistDemo()}
  else{const {error}=await client.rpc('shopping_add_item',{p_list_id:payload.list_id,p_name:payload.name,p_quantity:payload.quantity,p_note:payload.note,p_category:payload.category,p_category_mode:payload.category_mode,p_save_to_catalog:saveToCatalog===true});if(error)throw error}
 }finally{busy=false}
 await refresh(true);render();
}
function normalizedProductName(name){return String(name||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('de')}
function touchDemoList(id){const list=lists.find(l=>l.id===id);if(list){list.updated_at=new Date().toISOString();list.updated_by_name='Vorschau'}}
function persistDemo(){writeLocal('grevingshop-demo',JSON.stringify({lists,items,catalog}))}
