import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {isDisplayPoint,isEstimate,isMidnight,isMissing,isObservation,recordTime} from '../docs/timing.mjs';import {workCount,workTitles} from '../docs/counts.mjs';

function screen(){
 let src=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');src=src.slice(0,src.indexOf('async function refresh'));
 const els={};const context=vm.createContext({isDisplayPoint,isEstimate,isMidnight,isMissing,isObservation,recordTime,workCount,workTitles,document:{getElementById:id=>els[id]??=({value:id==='metric'?'total':id==='period'?'day':'',textContent:'',innerHTML:''})}});
 vm.runInContext(src,context);return{els,context};
}

test('참고값은 통합 그래프에 표시하고 요약 순증은 자정 기준을 유지한다',()=>{
 const {els,context}=screen();
 vm.runInContext(`records=data=[{date:'2026-10-19',capturedAt:'2026-10-19T13:49:26Z',kind:'reference',total:8915,characters:[]},{date:'2026-10-20',capturedAt:'2026-10-19T20:27:52Z',kind:'reference',total:12017,characters:[]}];series=data.slice();render()`,context);
 assert.equal(els.delta.textContent,'—');assert(els.chart.innerHTML.includes('+3,102'));assert(els.chart.innerHTML.includes('+34.8%'));assert(els.history.innerHTML.includes('+3,102'));assert(els.history.innerHTML.includes('+34.8%'));assert(els.history.innerHTML.includes('참고 기록'));
 vm.runInContext(`data.push({date:'2026-10-21',capturedAt:'2026-10-20T15:00:01Z',kind:'midnight',total:14000,characters:[]});records=data.concat({date:'2026-10-22',kind:'missing',targetAt:'2026-10-22T00:00:00+09:00'});series=records.filter(isDisplayPoint);render()`,context);assert(els.chart.innerHTML.includes('<rect'));assert(!els.chart.innerHTML.includes('NaN'));assert.equal(els.delta.textContent,'—');assert(els.history.innerHTML.includes('미수집 · 자정 원본 없음'));
});

test('10월 27일 추정값이 표와 일별 그래프의 증가분을 절반으로 나눈다',()=>{
 const {els,context}=screen();
 vm.runInContext(`records=[
  {date:'2026-10-26',capturedAt:'2026-10-25T15:00:00Z',completedAt:'2026-10-25T15:00:01Z',kind:'midnight',total:46431,characters:Array.from({length:17},(_,i)=>({id:String(i),name:'캐릭터 '+i,count:0,work:'작품',url:'#'}))},
  {date:'2026-10-27',targetAt:'2026-10-27T00:00:00+09:00',kind:'estimate',total:51821,characterCount:17,workCount:6},
  {date:'2026-10-28',capturedAt:'2026-10-28T00:35:19Z',kind:'reference',total:57210,characters:Array.from({length:17},(_,i)=>({id:String(i),name:'캐릭터 '+i,count:0,work:'작품',url:'#'}))}
 ];data=records.filter(isObservation);series=records.filter(isDisplayPoint);render()`,context);
 assert(els.history.innerHTML.includes('51,821'));assert(els.history.innerHTML.includes('+5,390'));assert(els.history.innerHTML.includes('+11.6%'));
 assert(els.history.innerHTML.includes('57,210'));assert(els.history.innerHTML.includes('+5,389'));assert(els.history.innerHTML.includes('+10.4%'));
 assert(els.history.innerHTML.includes('추정값 · 인접일 증가분 1/2'));assert(els.history.innerHTML.includes('실제 수집 없음'));
 assert(els.chart.innerHTML.includes('2026-10-27 메시지 누적: 51,821'));assert(els.chart.innerHTML.includes('>추정<'));assert(els.chart.innerHTML.includes('+5,390'));assert(els.chart.innerHTML.includes('+5,389'));
 els.metric.value='delta';vm.runInContext(`chart()`,context);assert(els.chart.innerHTML.includes('2026-10-27 메시지 순증: 5,390'));assert(els.chart.innerHTML.includes('2026-10-28 메시지 순증: 5,389'));
 assert(els.days.textContent.includes('원본 미수집 1일 (추정 보정 1건)'));
 const csv=vm.runInContext(`historyCsv()`,context);assert(csv.includes('2026-10-27,51821,5390,17,6,추정값,"실제 수집 없음"'));assert(csv.includes('2026-10-28,57210,5389,17,1,참고 기록'));
 assert(!els.chart.innerHTML.includes('NaN'));assert(!els.history.innerHTML.includes('Invalid Date'));
});

test('주별·월별 그래프는 지연 참고 기록의 최신 실제 관측을 자동 반영하고 추정값은 제외한다',()=>{
 const {els,context}=screen();
 vm.runInContext(`records=[
  {date:'2026-10-31',capturedAt:'2026-10-31T02:00:00Z',kind:'reference',total:1000,characters:[]},
  {date:'2026-11-08',capturedAt:'2026-11-08T03:00:00Z',kind:'reference',total:1800,characters:[]},
  {date:'2026-11-09',targetAt:'2026-11-09T00:00:00+09:00',kind:'estimate',total:9999,characterCount:0,workCount:0},
  {date:'2026-11-10',capturedAt:'2026-11-10T04:00:00Z',kind:'reference',total:2200,characters:[]}
 ];data=records.filter(isObservation);series=records.filter(isDisplayPoint);`,context);
 vm.runInContext(`$('period').value='week';chart()`,context);
 assert(els.chart.innerHTML.includes('2026-11-09 메시지 누적: 2,200, 전주 대비 +400'));
 assert(els.chart.innerHTML.includes('주·월 그래프는 추정값을 제외'));
 assert(!els.chart.innerHTML.includes('9,999'));
 vm.runInContext(`$('period').value='month';chart()`,context);
 assert(els.chart.innerHTML.includes('2026-11 메시지 누적: 2,200, 전월 대비 +1,200'));
 assert(els.chart.innerHTML.includes('>참고<'));
 assert(!els.chart.innerHTML.includes('9,999'));
});

test('변경된 모듈과 화면 자산은 캐시 키가 함께 갱신된다',()=>{const app=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');assert.match(app,/timing\.mjs\?v=3/);assert.match(html,/app\.js\?v=18/);assert.match(html,/style\.css\?v=7/);});
