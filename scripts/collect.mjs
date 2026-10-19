import fs from 'node:fs';
import {workCount} from '../docs/counts.mjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const kstDate=d=>new Date(+d+9*3600000).toISOString().slice(0,10);
export function validate(items){
 if(!items.length)throw Error('빈 응답: 기존 기록을 유지합니다.');
 const ids=new Set();
 for(const x of items){if(!x.id||!x.name||!Number.isSafeInteger(x.message_count)||x.message_count<0||ids.has(x.id))throw Error('카운터 형식/중복 오류');ids.add(x.id);}
 return items.map(x=>({id:x.id,name:x.name,count:x.message_count,work:x.source_work_title||'',platform:x.source_platform||'',url:'https://myteaz.io/ko/chat/c/'+encodeURIComponent(x.public_id||x.id)})).sort((a,b)=>b.count-a.count);
}
export async function collect(){
 const file=new URL('../docs/data/history.json',import.meta.url);const history=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
 const now=new Date(),date=kstDate(now),prior=history.find(s=>s.date===date);
 if(!process.argv.includes('--force')&&prior&&new Date(prior.capturedAt)>=new Date(date+'T06:00:00+09:00')){console.log('오늘 아침 수집 완료');return;}
 let cursor=null,items=[],seen=new Set();
 do{
  const url=new URL('https://api.myteaz.io/chat/characters');if(cursor)url.searchParams.set('cursor',cursor);
  let data;
  for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{headers:{Accept:'application/json','Accept-Language':'ko'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('API HTTP '+r.status);data=await r.json();break;}catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,1000*(attempt+1)));}}
  if(!Array.isArray(data.items))throw Error('API items 누락');items.push(...data.items);cursor=data.next_cursor;
  if(cursor){if(seen.has(cursor)||seen.size>100)throw Error('페이지 반복 오류');seen.add(cursor);}
 }while(cursor);
 const characters=validate(items);
 const previous=history.filter(s=>s.date<date).at(-1);
 if(previous&&characters.length<previous.characters.length*.8)throw Error('작품 수가 20% 이상 감소: 부분 수집 여부를 확인하세요. 기존 기록 유지.');
 const snapshot={date,capturedAt:now.toISOString(),total:characters.reduce((n,x)=>n+x.count,0),characters};
 snapshot.characterCount=characters.length;snapshot.workCount=workCount(snapshot);
 const result=history.filter(s=>s.date!==date).concat(snapshot).sort((a,b)=>a.date.localeCompare(b.date));
 const target=fileURLToPath(file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target+'.tmp',JSON.stringify(result,null,2)+'\n');fs.renameSync(target+'.tmp',target);
 console.log(date,characters.length+'개',snapshot.total+' 메시지',characters.find(x=>x.name==='강혜영'));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))collect().catch(e=>{console.error(e);process.exitCode=1});
