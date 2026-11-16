/* Session tokens stay in the existing per-app Supabase storage key. No passwords. */
(function(root){
 'use strict';
 const RETENTION_MS=30*24*60*60*1000;
 function createStorage(storage,now=Date.now){
  const activityKey=key=>key+':last-active';
  return {
   getItem(key){
    const value=storage.getItem(key);if(value===null)return null;
    const last=Number(storage.getItem(activityKey(key)));
    if(last>0&&now()-last>=RETENTION_MS){storage.removeItem(key);storage.removeItem(activityKey(key));return null}
    // Existing sessions migrate without forcing another login.
    storage.setItem(activityKey(key),String(now()));return value;
   },
   setItem(key,value){storage.setItem(key,value);storage.setItem(activityKey(key),String(now()))},
   removeItem(key){storage.removeItem(key);storage.removeItem(activityKey(key))}
  };
 }
 root.GrevingSession={createStorage,RETENTION_MS};
})(window);
