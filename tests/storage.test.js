import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBackup,mergeBackup} from '../src/storage.js';
const entry={id:'1',name:'饭',grams:100,date:'2026-10-23',meal:'午餐',nutrients:{energy:100}};
test('backup import validates fields and retains unknowns',()=>{const b=validateBackup({version:1,entries:[entry]});assert.equal(b.entries[0].nutrients.iron,null);assert.throws(()=>validateBackup({version:1,entries:[{...entry,grams:-1}]}));assert.throws(()=>validateBackup({version:1,entries:[{...entry,date:'2026-02-30'}]}))});
test('restore merges without overwriting or duplicating existing entries',()=>{const b=validateBackup({version:1,entries:[entry]});const s={entries:[{...entry,name:'已有记录'}],metrics:[]};assert.equal(mergeBackup(s,b).entries.length,1);assert.equal(mergeBackup(s,b).entries[0].name,'已有记录')});
