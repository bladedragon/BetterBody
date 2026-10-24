import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=['server.mjs','sw.js'];
for(const dir of ['src','backend','scripts'])for(const f of await readdir(dir))if(/\.(js|mjs)$/.test(f))files.push(dir+'/'+f);
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
console.log('Syntax checked: '+files.length+' modules');
