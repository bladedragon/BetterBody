import test from 'node:test';
import assert from 'node:assert/strict';
import {portionFor,prepareDish,setDishPortion} from '../src/portions.js';
import {suggestDish} from '../src/dishes.js';
test('portion defaults are explicitly estimates; exact existing weights survive',()=>{
 assert.equal(portionFor('鸡蛋').grams,50);
 assert.equal(portionFor('不认识的食物').estimated,true);
 const d=prepareDish({components:[{name:'米饭',grams:123,nutrients:{}}]});
 assert.equal(d.components[0].grams,123);
});
test('a dish can be saved without weight input and scaling does not drift',()=>{
 const d=prepareDish(suggestDish('牛肉盖饭'));assert.ok(d.components.every(c=>c.grams>0));
 const start=d.components.map(c=>c.grams);setDishPortion(d,1.5);setDishPortion(d,1);
 assert.deepEqual(d.components.map(c=>c.grams),start);assert.equal(d.portionEstimated,true);
});
