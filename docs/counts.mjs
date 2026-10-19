export function workTitles(characters){
 return [...new Set(characters.map(x=>(x.work||'').normalize('NFC').trim().replace(/\s+/g,' ')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
}
export const workCount=snapshot=>workTitles(snapshot.characters).length;
