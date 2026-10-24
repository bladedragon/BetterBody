import {nutrients} from './nutrition.js';
const recipes={
 '牛肉盖饭':{items:['熟米饭','熟牛肉（部位待确认）','蔬菜配菜','烹调油','酱汁'],questions:['米饭和牛肉分别吃了多少？','牛肉是肥瘦相间还是较瘦？酱汁吃完了吗？'],focus:['蛋白质','铁','锌','维生素 B12','钠']},
 '大盘鸡':{items:['熟鸡肉（去骨可食部）','鸡皮','熟土豆','辣椒 / 洋葱','烹调油','酱汁','拌面（如有）'],questions:['多人分享时，你实际吃下了哪些部分？','有没有吃鸡皮、拌面和盘底汤汁？'],focus:['蛋白质','总脂肪','饱和脂肪','钾','钠']},
 '椰子鸡':{items:['熟鸡肉（去骨可食部）','鸡皮','椰子水 / 汤','椰肉（如有）','蘸料'],questions:['喝了多少汤？是否添加椰肉或其他配料？','鸡皮和蘸料分别吃了多少？'],focus:['蛋白质','总脂肪','饱和脂肪','钾','钠']}
};
export function suggestDish(text){
 const name=Object.keys(recipes).find(n=>text.includes(n));if(!name)return null;
 const r=recipes[name];return {name,questions:r.questions,focus:r.focus,oil:'未知',components:r.items.map(name=>({name,grams:null,nutrients:{},source:''}))};
}
export function calculateDish(components){
 return Object.fromEntries(Object.keys(nutrients).map(k=>{
  const known=components.filter(c=>Number.isFinite(c.grams)&&c.grams>0&&Number.isFinite(c.nutrients[k])&&c.nutrients[k]>=0);
  const knownValue=known.reduce((s,c)=>s+c.grams*c.nutrients[k]/100,0);
  return [k,{value:components.length&&known.length===components.length?knownValue:null,knownValue:known.length?knownValue:null,known:known.length,total:components.length}];
 }));
}
export function validateMetric(m){
 if(!m||typeof m.name!=='string'||!m.name.trim()||m.name.length>60||typeof m.unit!=='string'||!m.unit.trim()||m.unit.length>30||!Number.isFinite(m.value)||m.value<0)throw Error('指标名称、非负数值和单位必填');
 if(typeof m.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!Number.isFinite(Date.parse(m.date))||new Date(m.date).toISOString().slice(0,10)!==m.date)throw Error('请填写有效的检测日期');
 const low=m.low==null||m.low===''?null:Number(m.low),high=m.high==null||m.high===''?null:Number(m.high);
 if((low!==null&&!Number.isFinite(low))||(high!==null&&!Number.isFinite(high))||(low!==null&&high!==null&&low>high))throw Error('报告参考范围无效');
 return {name:m.name.trim(),value:m.value,unit:m.unit.trim(),date:m.date,low,high,flag:low!==null&&m.value<low?'低于报告范围':high!==null&&m.value>high?'高于报告范围':low!==null&&high!==null?'在报告范围内':'未提供完整范围'};
}
export function metricFocus(metrics){
 return [...new Set(metrics.map(m=>/铁蛋白|血红蛋白|血清铁/.test(m.name)?'铁、维生素 B12 和叶酸':/维生素\s*D|25.*D/i.test(m.name)?'维生素 D 与钙':/甘油三酯|胆固醇|LDL/i.test(m.name)?'总脂肪、饱和脂肪与膳食纤维':/血糖|糖化/.test(m.name)?'碳水化合物与膳食纤维':/体重|体脂/.test(m.name)?'能量与蛋白质':null).filter(Boolean))];
}
