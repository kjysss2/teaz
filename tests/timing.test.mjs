import {test} from 'node:test';import assert from 'node:assert/strict';
import {onTime,isMidnight,nextTarget} from '../docs/timing.mjs';
test('자정 2분 미만만 유효하고 5시 지연 기록을 거부한다',()=>{assert(onTime('2026-10-19T15:00:00Z'));assert(onTime('2026-10-19T15:01:59Z'));assert(!onTime('2026-10-19T15:02:00Z'));assert(!onTime('2026-10-19T20:27:52Z'));assert(!isMidnight({kind:'reference',capturedAt:'2026-10-19T15:00:00Z'}));});
test('미리 시작하면 다음 자정, 늦으면 지난 자정을 대상으로 검사한다',()=>{assert.equal(nextTarget('2026-10-19T09:17:00Z').toISOString(),'2026-10-19T15:00:00.000Z');assert.equal(nextTarget('2026-10-19T20:27:52Z').toISOString(),'2026-10-19T15:00:00.000Z');});
