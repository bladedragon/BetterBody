import test from 'node:test';
import assert from 'node:assert/strict';
import {validateImage,validateRecognition,mapNutrients,analyzePhoto} from '../backend/recognition.mjs';
const image='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==';
const candidate={status:'food',name:'牛肉盖饭',notes:['油量为估计'],components:[{name:'熟米饭',query:'rice white cooked',grams:180,gramsMin:120,gramsMax:240,evidence:'visible'}]};
test('reject disguised images and excessive payload',()=>{assert.throws(()=>validateImage('data:image/jpeg;base64,aGVsbG8='));assert.throws(()=>validateImage('https://example.com/photo.jpg'));assert.equal(validateImage(image),image)});
test('reject impossible model weights and non-food components',()=>{assert.throws(()=>validateRecognition({...candidate,components:[{...candidate.components[0],grams:-1}]}));assert.deepEqual(validateRecognition({status:'not_food',name:'',notes:[],components:[]}).components,[])});
test('FDC units are checked, unknowns stay unknown',()=>{const v=mapNutrients({foodNutrients:[{nutrientId:1003,value:4,unitName:'G'},{nutrientId:1008,value:130,unitName:'KCAL'},{nutrientId:1089,value:5,unitName:'G'}]});assert.equal(v.protein,4);assert.equal(v.energy,130);assert.equal(v.iron,null)});
test('vision output is enriched from FDC with explicit provisional match provenance',async()=>{
 let calls=0;const fetcher=async(url,options)=>{calls++;if(String(url).includes('openai.com')){const body=JSON.parse(options.body);assert.equal(body.store,false);return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(candidate)}]}]}))}return new Response(JSON.stringify({foods:[{fdcId:123,description:'Rice, white, cooked',foodNutrients:[{nutrientId:1008,value:130,unitName:'KCAL'}]}]}))};
 const result=await analyzePhoto({image,consent:true},{openaiKey:'test',fdcKey:'test',model:'test',fetcher});assert.equal(calls,2);assert.equal(result.dish.components[0].nutrients.energy,130);assert.equal(result.dish.components[0].fdcId,123);assert.equal(result.dish.components[0].needsMatchConfirmation,true);
});
test('missing keys and missing consent never call provider',async()=>{let called=false;await assert.rejects(()=>analyzePhoto({image,consent:true},{fetcher:()=>{called=true}}));assert.equal(called,false);await assert.rejects(()=>analyzePhoto({image,consent:false},{openaiKey:'x',fdcKey:'x'}));});
test('FDC outage preserves recognition but never invents nutrients',async()=>{const fetcher=async url=>String(url).includes('openai.com')?new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(candidate)}]}]})):new Response('',{status:503});const r=await analyzePhoto({image,consent:true},{openaiKey:'x',fdcKey:'x',model:'test',fetcher});assert.equal(r.dish.components[0].nutrients.energy,null);assert.ok(r.warnings.length>0)});
test('chat-compatible vision adapter uses configured endpoint and validates returned JSON',async()=>{
 const fetcher=async(url,options)=>{if(String(url)==='https://vision.example/chat/completions'){const b=JSON.parse(options.body);assert.equal(b.messages[1].content[1].type,'image_url');return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(candidate)}}]}))}return new Response(JSON.stringify({foods:[]}))};
 const r=await analyzePhoto({image,consent:true},{openaiKey:'x',fdcKey:'x',protocol:'chat',endpoint:'https://vision.example/chat/completions',fetcher});
 assert.equal(r.dish.name,'牛肉盖饭');assert.equal(r.dish.components[0].nutrients.energy,null);
});
test('model refusal and incomplete outputs fail rather than creating a meal',async()=>{
 for(const response of [{status:'incomplete'},{status:'completed',output:[{content:[{type:'refusal'}]}]}]){
  await assert.rejects(()=>analyzePhoto({image,consent:true},{openaiKey:'x',fdcKey:'x',fetcher:async()=>new Response(JSON.stringify(response))}));
 }
});
test('non-food short-circuits database queries',async()=>{
 let count=0;
 const r=await analyzePhoto({image,consent:true},{openaiKey:'x',fdcKey:'x',fetcher:async()=>{count++;return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({status:'not_food',name:'',notes:[],components:[]})}]}]}))}});
 assert.equal(count,1);assert.equal(r.status,'not_food');
});
