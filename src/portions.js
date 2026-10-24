// Product portion assumptions, not measured weights or dietary recommendations.
export function portionFor(name=''){
 const rules=[[/米饭|拌面/,180],[/牛奶|酸奶|椰子水|汤/,250],[/鸡蛋/,50],[/燕麦/,40],[/鸡皮/,15],[/油/,8],[/酱汁|蘸料/,15],[/鸡肉|牛肉|鱼/,120],[/土豆/,100],[/配菜|辣椒|洋葱/,60],[/椰肉/,30]];
 return {grams:rules.find(([r])=>r.test(name))?.[1]??100,estimated:true,source:'产品预设份量假设，未经称量，不代表标准份量'};
}
export function prepareDish(dish){
 const d=structuredClone(dish);d.portionFactor??=1;d.portionEstimated??=d.components.some(c=>c.grams==null);
 d.components=d.components.map(c=>{const grams=c.grams??portionFor(c.name).grams;return {...c,grams,baseGrams:c.baseGrams??grams/d.portionFactor,weightEstimated:c.weightEstimated??c.grams==null};});
 return d;
}
export function setDishPortion(dish,factor){
 if(!Number.isFinite(factor)||factor<0.25||factor>2)throw Error('份量比例无效');
 dish.portionFactor=factor;dish.portionEstimated=true;
 dish.components.forEach(c=>{c.grams=Math.round(c.baseGrams*factor*10)/10;c.weightEstimated=true});
}
export const portionLabel=f=>f<0.85?'小份':f>1.15?'大份':'标准份';
export function portionControl(factor=1){
 return '<div class="portion-panel"><div class="portion-heading"><span>这次吃了多少？</span><output id="portion-label">'+portionLabel(factor)+'</output></div><div class="portion-choices">'+[[0.65,'小份','轻轻吃一点'],[1,'标准份','平时的饭量'],[1.4,'大份','今天胃口不错']].map(([v,t,s])=>'<button type="button" data-portion="'+v+'" aria-pressed="'+(portionLabel(factor)===t)+'" class="'+(portionLabel(factor)===t?'selected':'')+'"><span class="bowl" style="--bowl-scale:'+(.7+v*.2)+'">◡</span><b>'+t+'</b><small>'+s+'</small></button>').join('')+'</div><input id="portion-slider" aria-label="调整食用份量" type="range" min="0.25" max="2" step="0.05" value="'+factor+'"><div class="range-labels"><span>少一点</span><span>多一点</span></div><p class="sub">无需称重，先记下来。份量按预设估算，可在精细设置中修正。</p></div>';
}
export function bindPortion(onChange){
 const slider=document.querySelector('#portion-slider');
 const update=v=>{slider.value=v;document.querySelector('#portion-label').textContent=portionLabel(v);slider.setAttribute('aria-valuetext',portionLabel(v)+'，'+v+' 倍预设份量');document.querySelectorAll('[data-portion]').forEach(b=>{b.classList.toggle('selected',portionLabel(Number(b.dataset.portion))===portionLabel(v));b.setAttribute('aria-pressed',String(portionLabel(Number(b.dataset.portion))===portionLabel(v)))});onChange(v)};
 document.querySelectorAll('[data-portion]').forEach(b=>b.onclick=()=>update(Number(b.dataset.portion)));
 slider.oninput=()=>update(Number(slider.value));
}
