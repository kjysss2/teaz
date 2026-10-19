export const kstDay=d=>new Date(+new Date(d)+9*3600000).toISOString().slice(0,10);
export const boundary=d=>new Date(kstDay(d)+'T00:00:00+09:00');
export const onTime=d=>{const delay=+new Date(d)-+boundary(d);return delay>=0&&delay<120000;};
export const isMidnight=s=>s.kind==='midnight'&&onTime(s.capturedAt);
export function nextTarget(now){const d=new Date(now),hour=new Date(+d+9*3600000).getUTCHours();return new Date(+boundary(d)+(hour>=18?86400000:0));}
