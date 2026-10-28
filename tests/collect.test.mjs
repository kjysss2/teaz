import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captureMetadata,kstDate,validate} from '../scripts/collect.mjs';
test('한국 날짜 자정 경계를 적용한다',()=>{assert.equal(kstDate(new Date('2026-10-18T15:00:00Z')),'2026-10-19');assert.equal(kstDate(new Date('2026-10-18T14:59:59Z')),'2026-10-18')});
test('실제 정수 카운터만 저장하며 0은 유효하다',()=>{assert.equal(validate([{id:'a',name:'테스트',message_count:0}])[0].count,0);for(const n of [null,undefined,-1,1.5,'608'])assert.throws(()=>validate([{id:'a',name:'test',message_count:n}]));assert.throws(()=>validate([]));assert.throws(()=>validate([{id:'a',name:'x',message_count:1},{id:'a',name:'x',message_count:2}]))});
test('예약 지연은 실패나 자정 기록이 아니라 참고 기록으로 분류한다',()=>{assert.deepEqual(captureMetadata({capturedAt:new Date('2026-10-26T16:09:00Z'),completedAt:new Date('2026-10-26T16:09:01Z')}),{kind:'reference',reference:'delayed-schedule',note:'예약 지연 참고 기록: 실제 수집 시각 기준이며 자정 데이터로 사용하지 않음'});assert.deepEqual(captureMetadata({capturedAt:new Date('2026-10-26T15:00:00Z'),completedAt:new Date('2026-10-26T15:00:30Z')}),{kind:'midnight'});});
