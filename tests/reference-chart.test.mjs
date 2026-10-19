import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {isMidnight} from '../docs/timing.mjs';import {workCount,workTitles} from '../docs/counts.mjs';
test('5시 참고값은 자정 그래프·요약 순증에서 제외한다',()=>{
 let src=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');src=src.slice(0,src.indexOf('async function refresh'));
 const els={};const c=vm.createContext({isMidnight,workCount,workTitles,document:{getElementById:id=>els[id]??=( {value:id==='metric'?'total':id==='period'?'day':'',textContent:'',innerHTML:''})}});
 vm.runInContext(src,c);vm.runInContext(`data=[{date:'2026-10-19',capturedAt:'2026-10-19T13:49:26Z',kind:'reference',total:8915,characters:[]},{date:'2026-10-20',capturedAt:'2026-10-19T20:27:52Z',kind:'reference',total:12017,characters:[]}];render()`,c);
 assert.equal(els.delta.textContent,'—');assert(els.chart.innerHTML.includes('유효한 자정 기록 없음'));assert(!els.history.innerHTML.includes('+3,102'));assert(els.history.innerHTML.includes('참고 기록'));
 vm.runInContext(`data.push({date:'2026-10-21',capturedAt:'2026-10-20T15:00:01Z',kind:'midnight',total:14000,characters:[]});render()`,c);assert(els.chart.innerHTML.includes('<rect'));assert(!els.chart.innerHTML.includes('NaN'));assert.equal(els.delta.textContent,'—');
});
