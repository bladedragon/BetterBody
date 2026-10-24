// Explicit opt-in UI integration fixture. Never imported by production server.
// No live provider requests: fetcher fails on all unexpected URLs.
import {createAppServer} from '../backend/http.mjs';
const candidate={status:'food',name:'测试牛肉盖饭（固定响应）',notes:['这是接口测试结果，不是对照片的真实识别。'],components:[{name:'熟米饭',query:'rice white cooked',grams:180,gramsMin:120,gramsMax:240,evidence:'visible'}]};
const fetcher=async url=>{
 if(String(url)==='https://api.openai.com/v1/responses')return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(candidate)}]}]}));
 if(String(url).startsWith('https://api.nal.usda.gov/fdc/v1/foods/search'))return new Response(JSON.stringify({foods:[{fdcId:123,description:'Rice white cooked TEST FIXTURE',foodNutrients:[{nutrientId:1008,value:130,unitName:'KCAL'},{nutrientId:1003,value:3,unitName:'G'}]}]}));
 throw Error('Unexpected test URL');
};
const server=createAppServer({live:true,openaiKey:'TEST_ONLY',fdcKey:'TEST_ONLY',model:'fixture',provider:'测试替身'}, {fetcher,testOnly:true});
server.listen(4180,'127.0.0.1',()=>console.log('UI TEST FIXTURE ONLY http://localhost:4180 — no real recognition'));
