import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isMissing,isObservation,recordTime} from '../docs/timing.mjs';

const history=JSON.parse(fs.readFileSync(new URL('../docs/data/history.json',import.meta.url),'utf8'));

test('기록은 실제 관측값 또는 명시적 미수집 표식이며 시간순이다',()=>{
 assert(history.every(s=>isObservation(s)||isMissing(s)));
 assert.deepEqual(history.map(recordTime),history.map(recordTime).toSorted());
});

test('2026-10-27은 현재 값이 아닌 근거 있는 미수집 표식이다',()=>{
 const missing=history.find(s=>s.date==='2026-10-27');
 assert(isMissing(missing));
 assert.equal(missing.capturedAt,undefined);
 assert.equal(missing.total,undefined);
 assert.equal(missing.evidence.startedAt,'2026-10-26T16:09:00Z');
 assert.match(missing.evidence.workflowRun,/40356291037$/);
});
