import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer,configFromEnv} from '../backend/http.mjs';
async function withServer(config,fn,dependencies={}){const s=createAppServer(config,dependencies);await new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',resolve)});try{await fn('http://127.0.0.1:'+s.address().port)}finally{await new Promise(r=>s.close(r))}}
test('public binding requires HTTPS origin and strong password',()=>assert.throws(()=>configFromEnv({HOST:'0.0.0.0'})));
test('health, private file protection, live disabled and cross-origin rejection',async()=>withServer({live:false},async base=>{
 assert.equal((await fetch(base+'/api/health')).status,200);
 assert.equal((await fetch(base+'/.env')).status,404);
 const r=await fetch(base+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503);assert.equal((await r.json()).code,'LIVE_DISABLED');
 assert.equal((await fetch(base+'/api/analyze',{method:'POST',headers:{Origin:'https://evil.example'}})).status,403);
}));
test('authenticated request reaches analysis without disclosing password',async()=>withServer({live:true,password:'test-only-password'},async base=>{
 assert.equal((await fetch(base+'/api/status')).status,401);
 const headers={'Content-Type':'application/json',Authorization:'Basic '+Buffer.from('shiheng:test-only-password').toString('base64')};
 const r=await fetch(base+'/api/analyze',{method:'POST',headers,body:JSON.stringify({image:'fixture',consent:true})});assert.equal(r.status,200);assert.equal((await r.json()).status,'food');
},{analyze:async body=>{assert.equal(body.consent,true);return {status:'food',dish:{name:'仅测试'}}}}));
