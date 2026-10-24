import {nutrients} from './nutrition.js';
import {validateMetric} from './dishes.js';
const cleanString=(v,max)=>typeof v==='string'&&v.length<=max;
function dateValid(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v}
export function validateBackup(input){
 if(!input||input.version!==1||!Array.isArray(input.entries)||input.entries.length>20000)throw Error('不是有效的食衡备份，或记录数量过多');
 const seen=new Set();
 const entries=input.entries.map(e=>{
  if(!e||!cleanString(e.id,120)||!e.id||seen.has(e.id)||!cleanString(e.name,120)||!e.name.trim()||!Number.isFinite(e.grams)||e.grams<=0||e.grams>120000||!dateValid(e.date)||!['早餐','午餐','下午茶','晚餐','加餐'].includes(e.meal)||!e.nutrients||typeof e.nutrients!=='object')throw Error('备份包含无效饮食记录');
  seen.add(e.id);
  const values=Object.fromEntries(Object.keys(nutrients).map(k=>{const v=e.nutrients[k];if(v!=null&&(!Number.isFinite(v)||v<0||v>100000))throw Error('备份营养值无效');return [k,v??null]}));
  // Restore canonical totals only; untrusted nested model/recipe metadata is not rehydrated.
  return {id:e.id,name:e.name,grams:e.grams,date:e.date,meal:e.meal,nutrients:values,source:cleanString(e.source,1000)?e.source:'从备份恢复',emoji:'🍽️',color:'#edf0e5',weightEstimated:!!e.weightEstimated,portionLabel:cleanString(e.portionLabel,20)?e.portionLabel:undefined};
 });
 const metrics=(input.metrics||[]);if(!Array.isArray(metrics)||metrics.length>20000)throw Error('指标数量无效');
 return {entries,metrics:metrics.map(validateMetric)};
}
export function mergeBackup(state,backup){
 const ids=new Set(state.entries.map(e=>e.id));
 const entries=[...state.entries,...backup.entries.filter(e=>!ids.has(e.id))];
 const key=m=>JSON.stringify([m.name,m.value,m.unit,m.date,m.low,m.high]);
 const metricKeys=new Set((state.metrics||[]).map(key));
 const metrics=[...(state.metrics||[]),...backup.metrics.filter(m=>!metricKeys.has(key(m)))];
 return {...state,entries,metrics};
}
