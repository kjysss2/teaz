import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workCount,workTitles} from '../docs/counts.mjs';
test('같은 원작의 여러 캐릭터와 공백을 중복 제거하고 미상은 제외한다',()=>{
 const characters=[{work:'손만 잡아'},{work:' 손만  잡아 '},{work:'뿌리 없는 나무'},{work:''},{}, {work:'   '}];
 assert.equal(workCount({characters}),2);assert.equal(workTitles(characters).length,2);
 assert.equal(workCount({characters:[...characters,{work:'대리 신부'}]}),3);
});
