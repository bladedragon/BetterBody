/**
 * Server-side adapter example for a recognition service that implements the
 * contract in docs/integrations.md. Not connected to the demo UI.
 * No nutrition facts from the model are accepted as authoritative.
 */
export async function recognizeFood(imageBase64, {endpoint,apiKey,consent=false}) {
  if(!consent) throw new Error('Image upload consent required');
  if(!endpoint||!apiKey) throw new Error('Recognition service not configured');
  if(new URL(endpoint).protocol!=='https:') throw new Error('HTTPS required');
  if(typeof imageBase64!=='string'||imageBase64.length>11000000) throw new Error('Invalid image size');
  const r=await fetch(endpoint,{
    method:'POST',
    headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
    body:JSON.stringify({imageBase64,task:'food_candidates',instructions:'Return candidates only. Never infer exact nutrients. Uncertain/non-food must be rejected.'}),
    signal:AbortSignal.timeout(20000)
  });
  if(!r.ok) throw new Error('Recognition service unavailable');
  const result=await r.json();
  if(!['food','not_food','uncertain'].includes(result.status)) throw new Error('Invalid recognition status');
  if(result.status!=='food')return {status:result.status,candidates:[]};
  if(!Array.isArray(result.candidates)||result.candidates.length>20)throw new Error('Invalid candidates');
  const candidates=result.candidates.map(c=>{
    if(typeof c.name!=='string'||!c.name.trim()||c.name.length>100)throw new Error('Invalid food name');
    if(!Array.isArray(c.gramsRange)||c.gramsRange.length!==2||c.gramsRange.some(v=>!Number.isFinite(v)||v<=0||v>10000)||c.gramsRange[0]>c.gramsRange[1])throw new Error('Invalid estimated weight');
    return {name:c.name,gramsRange:c.gramsRange,needsConfirmation:true};
  });
  return {status:'food',candidates};
}
