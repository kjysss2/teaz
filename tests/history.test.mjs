import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isEstimate,isMissing,isObservation,recordTime} from '../docs/timing.mjs';

const history=JSON.parse(fs.readFileSync(new URL('../docs/data/history.json',import.meta.url),'utf8'));

test('기록은 실제 관측값·명시적 추정값·미수집 표식이며 시간순이다',()=>{
 assert(history.every(s=>isObservation(s)||isEstimate(s)||isMissing(s)));
 assert.deepEqual(history.map(recordTime),history.map(recordTime).toSorted());
});

test('2026-10-27은 인접일 증가분을 절반으로 나눈 명시적 추정값이다',()=>{
 const estimate=history.find(s=>s.date==='2026-10-27');
 assert(isEstimate(estimate));
 assert.equal(estimate.capturedAt,undefined);
 assert.equal(estimate.total,51821);
 assert.equal(estimate.characterCount,17);
 assert.equal(estimate.workCount,6);
 assert.equal(estimate.estimate.method,'split-interval-increase-equally');
 assert.equal(estimate.estimate.intervalIncrease,10779);
 assert.equal(estimate.estimate.fromTotal,46431);
 assert.equal(estimate.estimate.toTotal,57210);
 assert.equal(estimate.estimate.rounding,'half-up');
 assert.equal(estimate.estimate.toTotal-estimate.estimate.fromTotal,estimate.estimate.intervalIncrease);
 assert.equal(estimate.total-estimate.estimate.fromTotal,5390);
 assert.equal(estimate.estimate.toTotal-estimate.total,5389);
 assert.equal(estimate.evidence.startedAt,'2026-10-26T16:09:00Z');
 assert.match(estimate.evidence.workflowRun,/40356291037$/);
});
