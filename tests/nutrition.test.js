import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize,scale,parseMeal} from '../src/nutrition.js';
test('weight scaling preserves unknowns',()=>assert.deepEqual(scale({energy:200,calcium:null},150),{energy:300,calcium:null}));
test('reject invalid weight',()=>assert.throws(()=>scale({energy:1},-2)));
test('date filter and incomplete coverage',()=>{const s=summarize([{date:'2026-10-23',grams:150,nutrients:{energy:200,protein:null}},{date:'2026-10-22',grams:100,nutrients:{energy:90,protein:2}}],'2026-10-23');assert.equal(s.energy.value,300);assert.equal(s.protein.value,null);assert.equal(s.protein.known,0)});
test('explicit grams and unknown food',()=>{assert.equal(parseMeal('米饭 180克',[{name:'米饭',id:'rice'}]).grams,180);assert.equal(parseMeal('未知食材',[]).food,null)});
test('ambiguous portion requires confirmation',()=>assert.equal(parseMeal('一碗米饭',[{name:'米饭'}]).grams,null));
