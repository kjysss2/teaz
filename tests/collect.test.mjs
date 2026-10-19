import {test} from 'node:test';
import assert from 'node:assert/strict';
import {kstDate,validate} from '../scripts/collect.mjs';
test('한국 날짜 자정 경계를 적용한다',()=>{assert.equal(kstDate(new Date('2026-10-18T15:00:00Z')),'2026-10-19');assert.equal(kstDate(new Date('2026-10-18T14:59:59Z')),'2026-10-18')});
test('실제 정수 카운터만 저장하며 0은 유효하다',()=>{assert.equal(validate([{id:'a',name:'테스트',message_count:0}])[0].count,0);for(const n of [null,undefined,-1,1.5,'608'])assert.throws(()=>validate([{id:'a',name:'test',message_count:n}]));assert.throws(()=>validate([]));assert.throws(()=>validate([{id:'a',name:'x',message_count:1},{id:'a',name:'x',message_count:2}]))});
