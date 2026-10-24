import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestDish,calculateDish,validateMetric} from '../src/dishes.js';
test('mixed dishes produce editable candidates without invented weight',()=>{
 for(const name of ['牛肉盖饭','大盘鸡','椰子鸡']){const d=suggestDish(name);assert.ok(d.components.length>2);assert.ok(d.components.every(c=>c.grams===null));}
 assert.equal(suggestDish('陌生菜'),null);
});
test('recipe totals use consumed component weight; incomplete nutrients remain unknown',()=>{
 const r=calculateDish([{name:'a',grams:50,nutrients:{protein:20,iron:2}},{name:'b',grams:100,nutrients:{protein:10}}]);
 assert.equal(r.protein.value,20);assert.equal(r.iron.value,null);assert.equal(r.iron.knownValue,1);assert.equal(r.iron.known,1);
});
test('unknown weight does not silently disappear',()=>{
 const r=calculateDish([{grams:null,nutrients:{protein:20}}]);assert.equal(r.protein.value,null);
});
test('body metrics require a date, unit and consistent ranges',()=>{
 assert.throws(()=>validateMetric({name:'铁蛋白',value:10,date:'2026-10-23'}));
 assert.throws(()=>validateMetric({name:'铁蛋白',value:10,date:'2026-10-23',unit:'ng/mL',low:50,high:20}));
 assert.equal(validateMetric({name:'铁蛋白',value:10,date:'2026-10-23',unit:'ng/mL',low:20,high:100}).flag,'低于报告范围');
});
