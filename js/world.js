'use strict';
/* ===== Abyss Bistro: piani, percorsi, fondali, luce e buio ===== */
class Path{constructor(pts){this.pts=pts;this.segs=[];this.len=0;
    for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1];const len=Math.hypot(bx-ax,by-ay);this.segs.push({ax,ay,bx,by,dx:(bx-ax)/len,dy:(by-ay)/len,len});this.len+=len}}
  at(d){d=Math.max(0,d);for(const s of this.segs){if(d<=s.len)return{x:s.ax+s.dx*d,y:s.ay+s.dy*d,dx:s.dx,dy:s.dy};d-=s.len}const s=this.segs[this.segs.length-1];return{x:s.bx,y:s.by,dx:s.dx,dy:s.dy}}
  dist(x,y){let m=1e9;for(const s of this.segs){let t=(x-s.ax)*s.dx+(y-s.ay)*s.dy;t=Math.max(0,Math.min(s.len,t));m=Math.min(m,Math.hypot(x-(s.ax+s.dx*t),y-(s.ay+s.dy*t)))}return m}}

const THEMES={
  reef:{sand:[116,108,80],amp:[62,54,40],mud:[42,24,20],trail:[214,190,138],mul:[.7,.83,.86],add:[10,24,30],caust:.2,rays:1,rock:['#77857a','#4c5a52','#1f2925'],tint:'rgba(18,64,66,.14)',kelp:.6,
    decor:[['rock',9,14,24,1],['rock',55,22,62],['brain',6,8,12,1],['brain',28,10,18],['stag',6,9,13,1],['stag',28,12,20],['fan',4,9,12,1],['fan',22,12,22],['anem',7,7,10,1],['anem',28,8,13],['sponge',4,8,11,1],['sponge',22,9,14],['star',6,4,6,1],['urchin',7,4,6,1],['shell',10,3,5,1],['star',20,4,7],['urchin',26,4,7],['shell',40,3,5],['grass',40,6,10,1],['grass',110,6,12]],
    big:[['wreck',-300,340,150],['arch',600,250,95],['chest',480,540,20],['anchor',-140,640,30]]},
  kelp:{sand:[92,104,68],amp:[54,58,36],mud:[40,20,26],trail:[196,186,132],mul:[.62,.86,.7],add:[8,26,16],caust:.17,rays:.8,rock:['#6f8070','#47584a','#1c261e'],tint:'rgba(20,70,40,.16)',kelp:1,
    decor:[['rock',10,14,22,1],['rock',60,20,56],['grass',70,7,12,1],['grass',160,7,14],['anem',5,7,10,1],['anem',16,8,12],['shell',12,3,5,1],['star',6,4,6,1],['urchin',10,4,6],['sponge',3,8,11,1],['brain',10,9,15]],
    big:[['arch',-280,300,90],['anchor',520,520,30]]},
  wreck:{sand:[104,100,90],amp:[54,50,44],mud:[36,30,28],trail:[188,178,150],mul:[.68,.78,.84],add:[10,20,28],caust:.14,rays:.7,rock:['#6b6a64','#45443f','#1c1b18'],tint:'rgba(20,50,60,.18)',kelp:.35,
    decor:[['plank',10,10,16,1],['barrel',6,7,9,1],['cannon',3,10,12,1],['bones',6,6,9,1],['shell',8,3,5,1],['rock',6,14,22,1],['plank',40,12,20],['barrel',22,8,11],['cannon',10,12,15],['chest',4,14,18],['rock',40,20,50],['sponge',14,9,14],['bones',20,6,10],['grass',40,6,10]],
    big:[['wreck',-310,260,150],['wreck2',640,330,150],['anchor',-120,620,32],['chest',470,600,22]]},
  trench:{sand:[60,66,76],amp:[34,34,40],mud:[24,22,18],trail:[126,134,146],mul:[.62,.72,.88],add:[4,10,22],caust:.06,rays:.3,rock:['#4f5a6b','#2c3440','#10141a'],tint:'rgba(10,20,40,.2)',kelp:0,
    decor:[['rock',12,14,24,1],['rock',70,20,60],['glowanem',10,7,11,1],['glowanem',30,8,13],['skull',5,7,9,1],['skull',16,8,12],['urchin',10,4,6,1],['urchin',30,4,7],['bones',8,6,9,1],['grass',20,6,9,1]],
    big:[['ribs',-300,300,110],['ribs',640,420,100]]},
  vents:{sand:[50,42,40],amp:[30,24,22],mud:[18,10,8],trail:[122,108,100],mul:[.9,.74,.68],add:[14,4,2],caust:.05,rays:.15,rock:['#4f4444','#2a2424','#0e0a0a'],tint:'rgba(40,10,4,.16)',kelp:0,lava:1,
    decor:[['rock',12,14,24,1],['rock',60,22,60],['tubeworm',10,8,12,1],['tubeworm',34,9,15],['bones',6,6,9,1],['chimney',2,12,14,1],['chimney',14,16,26],['skull',8,8,12]],
    big:[['chimneyBig',-260,280,60],['chimneyBig',620,360,70]]},
  abyss:{sand:[36,38,48],amp:[22,22,28],mud:[14,12,10],trail:[96,98,116],mul:[.6,.66,.88],add:[2,4,12],caust:.02,rays:.06,rock:['#3e4150','#22242e','#0a0b10'],tint:'rgba(4,6,20,.24)',kelp:0,
    decor:[['rock',10,14,24,1],['rock',60,20,64],['bones',10,6,10,1],['bones',40,7,12],['skull',8,8,12,1],['skull',24,9,14],['glowanem',8,7,10,1],['glowanem',26,8,12],['urchin',20,4,7]],
    big:[['ribs',-280,240,130],['ribs',620,380,120],['ribs',180,-330,110]]}
};

/* stato del piano corrente */
const WORLD={fi:0,floor:null,theme:null,paths:[],slots:[],vents:[],kelp:[],decor:[],kelpPlants:[],glows:[],bg:document.createElement('canvas')};
function distToPaths(x,y){let m=1e9;for(const p of WORLD.paths)m=Math.min(m,p.dist(x,y));return m}

function slotOK(x,y){if(x<20||x>340||y<30||y>456)return false;
  for(let k=0;k<12;k++){const a=k/12*TAU;if(distToPaths(x+Math.cos(a)*19,y+Math.sin(a)*9)<22)return false}
  
  if(Math.hypot(x-180,y-490)<72)return false;if(WORLD.vents.some(v=>Math.hypot(v[0]-x,v[1]-y)<40))return false;
  if(WORLD.kelp.some(k=>Math.hypot(k[0]-x,k[1]-y)<k[2]+16))return false;
  for(const p of WORLD.paths){const s=p.pts[0];if(Math.hypot(x-s[0],y-s[1])<54)return false}return true}
/* piazzole in fila lungo il sentiero: passo regolare, centrate nei corridoi stretti */
function genSlots(){const cand=[],samples=[];
  for(const p of WORLD.paths)for(let d=0;d<p.len;d+=10){const q=p.at(d);if(q.x>0&&q.x<W&&q.y>0&&q.y<H)samples.push(q)}
  for(const p of WORLD.paths)for(const sg of p.segs){if(sg.len<40)continue;const nx=-sg.dy,ny=sg.dx;
    for(let d=22;d<=sg.len-16;d+=23)for(const side of[-1,1]){const bx=sg.ax+sg.dx*d,by=sg.ay+sg.dy*d;
      for(let t=28;t<=48;t+=2){const x=Math.round(bx+nx*side*t),y=Math.round(by+ny*side*t);if(slotOK(x,y)){cand.push({x,y,t});break}}}}
  for(const c of cand){let n=0;for(const q of samples)if(Math.hypot(q.x-c.x,q.y-c.y)<95)n++;c.n=n+hash2(c.x,c.y)-c.t*.15}
  cand.sort((a,b)=>b.n-a.n);const out=[];
  for(const c of cand){if(out.length>=18)break;if(out.every(o=>Math.hypot(o.x-c.x,o.y-c.y)>=46))out.push({x:c.x,y:c.y,tower:null})}
  out.sort((a,b)=>a.y-b.y||a.x-b.x);return out}
function freeAt(x,y,r){if(distToPaths(x,y)<r+22)return false;for(const s of WORLD.slots)if(Math.hypot(s.x-x,s.y-y)<r+20)return false;
  if(Math.hypot(x-180,y-500)<r+85)return false;for(const p of WORLD.paths){const s=p.pts[0];if(Math.hypot(x-s[0],y-s[1])<r+60)return false}
  for(const v of WORLD.vents)if(Math.hypot(x-v[0],y-v[1])<r+30)return false;
  for(const d of WORLD.decor)if(Math.hypot(d.x-x,d.y-y)<(d.r+r)*.85)return false;return true}
function clearLine(x,y1,y2){for(let y=y2;y<=y1;y+=6){if(distToPaths(x,y)<20)return false;for(const s of WORLD.slots)if(Math.hypot(s.x-x,s.y-y)<24)return false;if(Math.hypot(x-180,y-490)<70)return false}return true}

function loadFloor(fi){const F=FLOORS[fi],th=THEMES[F.id];
  WORLD.fi=fi;WORLD.floor=F;WORLD.theme=th;WORLD.paths=F.paths.map(p=>new Path(p));WORLD.vents=(F.vents||[]).map(v=>[v[0],v[1]]);WORLD.ventT=(F.vents||[]).map((v,i)=>4+i*2.5);
  WORLD.kelp=(F.kelp||[]).map(k=>k.slice());WORLD.slots=genSlots();WORLD.decor=[];WORLD.kelpPlants=[];WORLD.glows=[];
  const R=rng(42+fi*977);
  for(const b of th.big)WORLD.decor.push({type:b[0],x:b[1],y:b[2],r:b[3],seed:Math.floor(R()*1e6)});
  for(const[type,n,rmin,rmax,inWorld]of th.decor){const box=inWorld?[0,0,360,560]:[-560,-460,920,1040];let k=0;
    for(let i=0;i<4000&&k<n;i++){const x=box[0]+R()*(box[2]-box[0]),y=box[1]+R()*(box[3]-box[1]),r=rmin+R()*(rmax-rmin);if(freeAt(x,y,r)){WORLD.decor.push({type,x,y,r,seed:Math.floor(R()*1e6)});k++}}}
  for(const d of WORLD.decor){if(d.type==='glowanem')WORLD.glows.push({x:d.x,y:d.y,r:d.r*3,c:d.seed%2?'#5ff7e0':'#d97aff'});if(d.type==='chimney'||d.type==='chimneyBig')WORLD.glows.push({x:d.x,y:d.y-d.r*.8,r:d.r*2.5,c:'#ff6a2a'});
    if(d.type!=='rock'||hash2(d.seed,1)>th.kelp)continue;const n=1+Math.floor(hash2(d.seed,2)*(th.kelp>=1?4:3));
    for(let k=0;k<n;k++){const x=d.x+(hash2(d.seed,k+3)-.5)*d.r,y=d.y-d.r*.3;let h=d.r*1.3+30+hash2(d.seed,k+5)*(th.kelp>=1?90:50);
      while(h>24&&!clearLine(x,y,y-h))h-=8;if(h>24)WORLD.kelpPlants.push({x,y,h,ph:hash2(d.seed,k+7)*6,w:2.6+hash2(d.seed,k)*1.8})}}
  if(th.kelp>=1)for(let i=0;i<60;i++){const x=-500+R()*1360,y=-400+R()*1400;if(x>-20&&x<380&&y>-20&&y<580)continue;WORLD.kelpPlants.push({x,y,h:60+R()*120,ph:R()*6,w:3+R()*2})}
  WORLD.decor.sort((a,b)=>a.y-b.y);WORLD.kelpPlants.sort((a,b)=>a.y-b.y);
  if(VW>1)buildBG()}

/* ---------- oggetti del fondale ---------- */
function blob(c,x,y,r,seed,sy=.75){c.beginPath();const n=24;for(let i=0;i<=n;i++){const a=i/n*TAU,rr=r*(.76+.36*vnoise(seed%97+Math.cos(a)*1.4,seed%89+Math.sin(a)*1.4));const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*sy;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}
function soft(c,x,y,rx,ry,a=.4){for(let k=5;k>=1;k--){E(c,x,y,rx*(1+k*.1),ry*(1+k*.14));c.fillStyle='rgba(3,10,10,'+(a/6)+')';c.fill()}}
function drawRock(c,d){const{x,y,r,seed}=d,rc=WORLD.theme.rock;soft(c,x+r*.3,y+r*.38,r*1.05,r*.55,.6);
  blob(c,x,y,r,seed);const g=c.createLinearGradient(x-r*.7,y-r*.8,x+r*.6,y+r*.7);g.addColorStop(0,rc[0]);g.addColorStop(.45,rc[1]);g.addColorStop(1,rc[2]);c.fillStyle=g;c.fill();
  c.save();blob(c,x,y,r,seed);c.clip();blob(c,x-r*.12,y-r*.3,r*.66,seed+3,.55);c.fillStyle='rgba(180,200,170,.12)';c.fill();
  for(let k=0;k<r*4;k++){const px=x+(hash2(seed,k)-.5)*2*r,py=y+(hash2(k,seed)-.5)*1.5*r;E(c,px,py,.5+hash2(k,k+seed)*1.5,.4+hash2(k+1,seed)*1);c.fillStyle=hash2(seed+k,3)<.55?'rgba(10,15,12,.45)':'rgba(170,185,160,.2)';c.fill()}
  c.strokeStyle='rgba(8,12,10,.6)';c.lineWidth=.9;for(let k=0;k<3+r/14;k++){let px=x+(hash2(seed,k+50)-.5)*r*1.2,py=y+(hash2(seed,k+60)-.5)*r*.7;c.beginPath();c.moveTo(px,py);for(let j=0;j<5;j++){px+=(hash2(seed+j,k)-.5)*r*.45;py+=hash2(seed,j+k)*r*.2;c.lineTo(px,py)}c.stroke()}
  if(WORLD.theme.lava){c.strokeStyle='rgba(255,110,30,.75)';c.lineWidth=1.3;for(let k=0;k<2;k++){let px=x+(hash2(seed,k+70)-.5)*r,py=y+(hash2(seed,k+80)-.3)*r*.5;c.beginPath();c.moveTo(px,py);for(let j=0;j<4;j++){px+=(hash2(seed+j,k+9)-.5)*r*.5;py+=hash2(seed,j+k+9)*r*.2;c.lineTo(px,py)}c.stroke()}}
  else for(let k=0;k<r*2;k++){const a=Math.PI*(1.05+hash2(seed,k+90)*.9),rr=r*(.45+hash2(k,seed+90)*.45);E(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.75,1+hash2(k,9)*1.8,.9+hash2(k,4));c.fillStyle=hash2(k,seed)<.6?'rgba(85,135,60,.5)':'rgba(150,170,75,.4)';c.fill()}
  c.restore();blob(c,x,y,r,seed);c.strokeStyle='rgba(4,8,6,.85)';c.lineWidth=1.4;c.stroke();
  for(let k=0;k<Math.floor(r/7);k++){const a=hash2(seed,k+200)*TAU,rr=r*(.3+hash2(k,seed+7)*.4);const bx=x+Math.cos(a)*rr,by=y+Math.sin(a)*rr*.7;E(c,bx,by,1.9,1.5);c.fillStyle='#a8a390';c.fill();E(c,bx,by-.3,.8,.6);c.fillStyle='#2d2d26';c.fill()}}
function drawBrain(c,d){const{x,y,r,seed}=d;soft(c,x+r*.25,y+r*.45,r,r*.5);const g=c.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r*1.1);g.addColorStop(0,'#e2b585');g.addColorStop(1,'#7f5236');E(c,x,y,r,r*.82);c.fillStyle=g;c.fill();
  c.save();E(c,x,y,r,r*.82);c.clip();c.strokeStyle='rgba(70,38,20,.6)';c.lineWidth=1;c.lineCap='round';for(let k=0;k<r*1.4;k++){let px=x+(hash2(seed,k)-.5)*2*r,py=y+(hash2(k,seed)-.5)*1.7*r;c.beginPath();c.moveTo(px,py);let a=hash2(seed+k,1)*TAU;for(let j=0;j<6;j++){a+=(hash2(k,j+seed)-.5)*1.7;px+=Math.cos(a)*2.3;py+=Math.sin(a)*1.9;c.lineTo(px,py)}c.stroke()}c.restore();
  E(c,x,y,r,r*.82);c.strokeStyle='rgba(35,18,8,.8)';c.lineWidth=1.2;c.stroke()}
function branch(c,x,y,a,len,w,depth,seed,col,tip){const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len*.85;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.lineCap='round';c.strokeStyle='rgba(28,10,12,.7)';c.lineWidth=w+1.5;c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke();
  if(depth>0){for(const s of[-1,1])branch(c,x2,y2,a+s*(.32+hash2(seed,depth*3+s+2)*.42),len*.72,w*.74,depth-1,seed+depth*7+s,col,tip)}else{E(c,x2,y2,w*.55,w*.55);c.fillStyle=tip;c.fill()}}
function drawStag(c,d){const{x,y,r,seed}=d;soft(c,x+5,y+3,r*.9,r*.35);const cols=[['#bf6672','#f2b4b8'],['#a77fb8','#e8cdf0'],['#c98245','#f5c590']][seed%3];for(let k=0;k<3;k++)branch(c,x+(k-1)*r*.25,y,-Math.PI/2+(k-1)*.48,r*.5,3.4,3,seed+k*13,cols[0],cols[1])}
function drawFan(c,d){const{x,y,r,seed}=d;soft(c,x+8,y+4,r*.9,r*.28,.3);const col=['#a45596','#c9563f','#cfa13a'][seed%3];
  c.save();c.translate(x,y);c.globalAlpha=.9;c.strokeStyle=col;c.lineWidth=.9;
  for(let k=0;k<=16;k++){const a=-Math.PI*.9+k/16*Math.PI*.8,rr=r*1.6*(.85+.15*hash2(seed,k));c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*rr*.4,Math.sin(a)*rr*.5,Math.cos(a)*rr*.85,Math.sin(a)*rr);c.stroke()}
  for(let j=1;j<=6;j++){c.beginPath();c.ellipse(0,0,r*.23*j,r*.27*j,0,Math.PI*1.08,Math.PI*1.92);c.stroke()}c.globalAlpha=1;L(c,0,0,0,-r*.4,'#3a1a2a',2.2);c.restore()}
function drawAnem(c,d,glow){const{x,y,r,seed}=d;soft(c,x+3,y+4,r,r*.45);const cols=glow?[['#2a9a8a','#9ffcf0'],['#8a3aa8','#f0b8ff']][seed%2]:[['#e8933a','#ffd18a'],['#3fb8a5','#b6f5e6'],['#d9576e','#ffc2cf']][seed%3];
  E(c,x,y+r*.3,r*.55,r*.35);c.fillStyle='#4a2222';c.fill();
  for(let k=0;k<18;k++){const a=k/18*TAU,len=r*(.9+hash2(seed,k)*.45);const tx=x+Math.cos(a)*len,ty=y+Math.sin(a)*len*.6-r*.25;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*len*.5,y+Math.sin(a)*len*.3-r*.5,tx,ty);c.lineCap='round';c.strokeStyle='rgba(25,8,8,.55)';c.lineWidth=3.2;c.stroke();c.strokeStyle=cols[0];c.lineWidth=2.1;c.stroke();E(c,tx,ty,1.4,1.4);c.fillStyle=cols[1];c.fill()}
  E(c,x,y-r*.1,r*.3,r*.2);c.fillStyle='#2e1010';c.fill()}
function drawSponge(c,d){const{x,y,r,seed}=d;soft(c,x+5,y+3,r*.9,r*.35);const col=['#d0892c','#b9563a','#86669f'][seed%3];
  for(let k=0;k<3;k++){const tx=x+(k-1)*r*.55+(hash2(seed,k)-.5)*3,h=r*(1+hash2(seed,k+4)*.8),w=r*.32;const g=c.createLinearGradient(tx-w,0,tx+w,0);g.addColorStop(0,col);g.addColorStop(1,'#1c0e06');
    c.beginPath();c.moveTo(tx-w,y);c.lineTo(tx-w*.85,y-h);c.lineTo(tx+w*.85,y-h);c.lineTo(tx+w,y);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='rgba(20,10,5,.8)';c.lineWidth=1;c.stroke();
    E(c,tx,y-h,w*.85,w*.38);c.fillStyle=col;c.fill();c.stroke();E(c,tx,y-h,w*.55,w*.22);c.fillStyle='#140904';c.fill()}}
function drawGrass(c,d){const{x,y,r,seed}=d;const lava=WORLD.theme.lava;c.lineCap='round';for(let k=0;k<8;k++){const a=-Math.PI/2+(hash2(seed,k)-.5)*1.3,len=r*(1+hash2(k,seed)*1.3);c.beginPath();c.moveTo(x+(k-4)*1.1,y);c.quadraticCurveTo(x+Math.cos(a)*len*.5+(k-4),y+Math.sin(a)*len*.6,x+Math.cos(a)*len,y+Math.sin(a)*len);c.strokeStyle=lava?'#5a4a3a':k%2?'#4a7a3a':'#6a944a';c.lineWidth=1.3;c.stroke()}}
function drawStar(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,1)*TAU);c.scale(1,.78);c.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU,rr=k%2?r*.42:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fillStyle=['#cc6330','#a8403a','#d49a3a'][seed%3];c.fill();c.strokeStyle='rgba(40,10,5,.8)';c.lineWidth=.9;c.stroke();for(let k=0;k<5;k++){const a=k/5*TAU;E(c,Math.cos(a)*r*.5,Math.sin(a)*r*.5,.6,.6);c.fillStyle='#ffe0b0';c.fill()}c.restore()}
function drawUrchin(c,d){const{x,y,r}=d;soft(c,x+2,y+2,r*1.2,r*.6);for(let k=0;k<20;k++){const a=k/20*TAU;L(c,x,y,x+Math.cos(a)*r*1.8,y+Math.sin(a)*r*1.35,'#24192f',1)}E(c,x,y,r,r*.8);c.fillStyle='#35264a';c.fill();E(c,x-r*.3,y-r*.3,r*.3,r*.2);c.fillStyle='rgba(255,255,255,.15)';c.fill()}
function drawShell(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,3)*TAU);c.beginPath();c.moveTo(0,r);for(let k=0;k<=8;k++){const a=Math.PI*(1.1+k/8*.8);c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fillStyle='#ddd2b8';c.fill();c.strokeStyle='rgba(60,50,40,.7)';c.lineWidth=.6;c.stroke();c.restore()}
function hull(c,d,flip){const{x,y}=d;soft(c,x+40,y+50,190,70,.7);c.save();c.translate(x,y);c.rotate(flip?.25:-.2);c.scale(flip?-1:1,1);
  c.beginPath();c.moveTo(-170,-10);c.quadraticCurveTo(-60,-46,130,-34);c.lineTo(178,-70);c.lineTo(166,22);c.quadraticCurveTo(0,76,-160,44);c.closePath();
  const g=c.createLinearGradient(0,-70,0,70);g.addColorStop(0,'#5d4934');g.addColorStop(1,'#1e160f');c.fillStyle=g;c.fill();c.strokeStyle='rgba(8,5,3,.9)';c.lineWidth=2;c.stroke();
  c.save();c.clip();for(let k=-60;k<80;k+=9){c.beginPath();c.moveTo(-180,k);c.quadraticCurveTo(0,k+30,190,k-28);c.strokeStyle='rgba(12,8,5,.55)';c.lineWidth=1.2;c.stroke()}
  for(let k=0;k<4;k++){E(c,-90+k*48,0,6.5,6.5);c.fillStyle='#0b0805';c.fill();c.strokeStyle='#7a6a4a';c.lineWidth=1.6;c.stroke()}
  for(let k=0;k<260;k++){E(c,-170+hash2(k,1)*350,-60+hash2(k,2)*130,1+hash2(k,3)*2.4,1);c.fillStyle=hash2(k,5)<.5?'rgba(90,130,70,.35)':'rgba(160,150,110,.25)';c.fill()}c.restore();
  blob(c,40,14,22,7,.7);c.fillStyle='#080604';c.fill();
  c.save();c.translate(-20,-28);c.rotate(-1.15);c.fillStyle='#46351f';c.fillRect(-4,-160,8,160);c.strokeStyle='rgba(8,5,3,.9)';c.lineWidth=1.5;c.strokeRect(-4,-160,8,160);c.fillRect(-34,-110,68,5);c.restore();c.restore()}
function drawArch(c,d){drawRock(c,d);const{x,y,r}=d;const g=c.createRadialGradient(x,y,4,x,y,r*.5);g.addColorStop(0,'#020606');g.addColorStop(1,'#13201d');E(c,x+4,y+6,r*.45,r*.3);c.fillStyle=g;c.fill();c.strokeStyle='rgba(6,10,8,.9)';c.lineWidth=1.4;c.stroke()}
function drawChest(c,d){const{x,y}=d;soft(c,x+6,y+8,26,10);c.save();c.translate(x,y);c.rotate(.15);c.beginPath();c.rect(-20,-8,40,20);FS(c,'#5a3c22',1.8);c.beginPath();c.moveTo(-20,-8);c.quadraticCurveTo(0,-30,24,-22);c.lineTo(24,-14);c.quadraticCurveTo(2,-24,-20,-8);FS(c,'#6b4a2b',1.6);
  for(let k=0;k<7;k++){E(c,-12+k*4,-9-Math.sin(k)*2,2.6,1.8);FS(c,'#e8c14a',.8)}L(c,-20,2,20,2,'#2a1a0c',1);c.fillStyle='#b8933a';c.fillRect(-3,-6,6,7);c.restore()}
function drawAnchor(c,d){const{x,y}=d;c.save();c.translate(x,y);c.rotate(.6);soft(c,8,10,24,8,.4);const s='#4d5859';L(c,0,-26,0,18,INK,6);L(c,0,-26,0,18,s,4);c.beginPath();c.arc(0,6,14,.1*Math.PI,.9*Math.PI);c.strokeStyle=INK;c.lineWidth=6;c.stroke();c.strokeStyle=s;c.lineWidth=4;c.stroke();L(c,-9,-16,9,-16,INK,6);L(c,-9,-16,9,-16,s,4);E(c,0,-31,4.5,4.5);c.strokeStyle=s;c.lineWidth=2.6;c.stroke();c.restore()}
function drawPlank(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,1)*TAU);soft(c,3,4,r*1.6,4,.3);c.beginPath();c.rect(-r*1.5,-3.5,r*3,7);FS(c,hash2(seed,2)<.5?'#5a4632':'#4a3828',1.4);L(c,-r*1.4,0,r*1.4,0,'rgba(20,12,6,.5)',.8);E(c,-r*1.2,0,.8,.8);c.fillStyle='#8a8a80';c.fill();E(c,r*1.2,0,.8,.8);c.fill();c.restore()}
function drawBarrel(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,1)*1.4-.7);soft(c,3,r*.6,r*1.4,r*.6,.4);c.beginPath();c.roundRect(-r*1.2,-r,r*2.4,r*2,r*.5);FS(c,'#6b4a2b',1.6);for(const k of[-.6,.6])L(c,k*r*1.2,-r,k*r*1.2,r,'#3a3a36',2.2);E(c,r*1.2,0,r*.3,r);FS(c,'#4a321c',1.2);c.restore()}
function drawCannon(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,1)*TAU);soft(c,4,5,r*1.6,r*.5,.4);c.beginPath();c.moveTo(-r*1.4,-r*.45);c.lineTo(r*1.3,-r*.32);c.lineTo(r*1.3,r*.32);c.lineTo(-r*1.4,r*.45);c.closePath();FS(c,'#3a3e40',1.6);E(c,r*1.35,0,r*.22,r*.36);c.fillStyle='#0a0a0a';c.fill();E(c,-r*1.5,0,r*.3,r*.3);FS(c,'#3a3e40',1.2);c.restore()}
function drawBones(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,2)*TAU);for(const a of[0,1.2]){c.save();c.rotate(a);L(c,-r,0,r,0,'#2a2620',3.6);L(c,-r,0,r,0,'#d8d0b8',2.2);for(const s of[-1,1]){E(c,s*r,-1.4,1.8,1.8);c.fillStyle='#d8d0b8';c.fill();E(c,s*r,1.4,1.8,1.8);c.fill()}c.restore()}c.restore()}
function drawSkull(c,d){const{x,y,r,seed}=d;c.save();c.translate(x,y);c.rotate(hash2(seed,2)*.8-.4);c.scale(r/9,r/9);L(c,-14,0,14,0,'#d8d2bd',2);for(let k=-3;k<=3;k++)L(c,k*3.4,-5+Math.abs(k)*.8,k*3.4,5-Math.abs(k)*.8,'#d8d2bd',1.2);E(c,17,0,6,5);FS(c,'#d8d2bd',1.2);E(c,18.5,-1,1.6,1.6);c.fillStyle=INK;c.fill();P(c,[-14,0,-20,-5,-20,5]);FS(c,'#d8d2bd',1);c.restore()}
function drawRibs(c,d){const{x,y,r}=d;soft(c,x+20,y+20,r*1.4,r*.5,.5);c.save();c.translate(x,y);L(c,-r*1.3,0,r*1.3,0,'#1a1814',8);L(c,-r*1.3,0,r*1.3,0,'#b8b09a',5);
  for(let k=-5;k<=5;k++){const px=k*r*.22,h=r*(.9-Math.abs(k)*.08);for(const s of[-1,1]){c.beginPath();c.moveTo(px,0);c.quadraticCurveTo(px+s*8,s*h*.6,px+s*2,s*h);c.strokeStyle='#1a1814';c.lineWidth=5.5;c.stroke();c.strokeStyle='#c8c0a8';c.lineWidth=3.2;c.stroke()}}
  E(c,r*1.45,0,r*.35,r*.28);FS(c,'#c8c0a8',2);E(c,r*1.55,-r*.05,r*.08,r*.07);c.fillStyle=INK;c.fill();c.restore()}
function drawTubeworm(c,d){const{x,y,r,seed}=d;soft(c,x+3,y+3,r,r*.4);for(let k=0;k<5;k++){const tx=x+(hash2(seed,k)-.5)*r*1.4,h=r*(1+hash2(k,seed)*1.4);L(c,tx,y,tx+(hash2(k,1)-.5)*4,y-h,'#1a1410',4.4);L(c,tx,y,tx+(hash2(k,1)-.5)*4,y-h,'#e8e0cc',2.6);
  for(let j=0;j<6;j++){const a=j/6*TAU;E(c,tx+(hash2(k,1)-.5)*4+Math.cos(a)*2.4,y-h-1+Math.sin(a)*1.4,1.6,1.6);c.fillStyle='#d8322a';c.fill()}}}
function drawChimney(c,d){const{x,y,r,seed}=d;soft(c,x+6,y+6,r*1.2,r*.5,.6);c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.45,y-r*1.6);c.lineTo(x+r*.45,y-r*1.6);c.lineTo(x+r,y);c.closePath();
  const g=c.createLinearGradient(x-r,0,x+r,0);g.addColorStop(0,'#3a2e2a');g.addColorStop(1,'#0e0a08');c.fillStyle=g;c.fill();c.strokeStyle='#050302';c.lineWidth=1.6;c.stroke();
  E(c,x,y-r*1.6,r*.45,r*.18);c.fillStyle='#ff6a2a';c.fill();for(let k=0;k<4;k++)L(c,x-r*.6+hash2(seed,k)*r*1.2,y-hash2(k,seed)*r*1.4,x-r*.6+hash2(seed,k+9)*r*1.2,y-hash2(k+9,seed)*r*1.4,'rgba(255,110,30,.6)',1)}
const DRAWD={rock:drawRock,brain:drawBrain,stag:drawStag,fan:drawFan,anem:(c,d)=>drawAnem(c,d,0),glowanem:(c,d)=>drawAnem(c,d,1),sponge:drawSponge,grass:drawGrass,star:drawStar,urchin:drawUrchin,shell:drawShell,
  wreck:(c,d)=>hull(c,d,0),wreck2:(c,d)=>hull(c,d,1),arch:drawArch,chest:drawChest,anchor:drawAnchor,plank:drawPlank,barrel:drawBarrel,cannon:drawCannon,bones:drawBones,skull:drawSkull,ribs:drawRibs,
  tubeworm:drawTubeworm,chimney:drawChimney,chimneyBig:drawChimney};

function sandLayer(x0,y0,w,h,res){const th=WORLD.theme,cw=Math.ceil(w*res),ch=Math.ceil(h*res);const cc=document.createElement('canvas');cc.width=cw;cc.height=ch;const g=cc.getContext('2d');const img=g.createImageData(cw,ch),D=img.data;
  const[s0,s1,s2]=th.sand,[a0,a1,a2]=th.amp,[m0,m1,m2]=th.mud,[t0,t1,t2]=th.trail,[u0,u1,u2]=th.mul,[d0,d1,d2]=th.add;
  for(let j=0;j<ch;j++){const wy=y0+j/res;for(let i=0;i<cw;i++){const wx=x0+i/res;
    const n=fbm(wx*.011,wy*.011,4),m=fbm(wx*.045+50,wy*.045,3);const rip=Math.sin(wx*.2+wy*.085+n*9)*.5+.5;
    let r=s0+n*a0,gg=s1+n*a1,b=s2+n*a2;const sh=(rip-.5)*16*(.4+m);r+=sh;gg+=sh;b+=sh*.8;
    if(m<.4){const k=(.4-m)*2.4;r-=k*m0;gg-=k*m1;b-=k*m2}
    const gr=(hash2(i*7+j*3,j*13+i)-.5)*18;r+=gr;gg+=gr;b+=gr*.9;
    if(th.lava){const cr=Math.abs(fbm(wx*.03+9,wy*.03,3)-.5);if(cr<.012){const k=1-cr/.012;r+=k*200;gg+=k*70;b+=k*10}}
    const dp=distToPaths(wx,wy);
    if(dp<24){const t=dp<14?1:dp<19?(19-dp)/5:0;const rim=Math.max(0,1-Math.abs(dp-18.5)/4.5);
      r=r*(1-t)+(t0+m*24)*t;gg=gg*(1-t)+(t1+m*20)*t;b=b*(1-t)+(t2+m*16)*t;r-=rim*70;gg-=rim*64;b-=rim*52}
    const tw=dp<19?.5:1;r=r*(1-(1-u0)*tw)+d0*tw;gg=gg*(1-(1-u1)*tw)+d1*tw;b=b*(1-(1-u2)*tw)+d2*tw;
    const o=(j*cw+i)*4;D[o]=r;D[o+1]=gg;D[o+2]=b;D[o+3]=255}}
  g.putImageData(img,0,0);return cc}
function drawCaves(c){for(const p of WORLD.paths){const[sx,sy]=p.pts[0],s=p.segs[0],cx=sx-s.dx*44,cy=sy-s.dy*44;
  drawRock(c,{x:cx,y:cy-8*Math.abs(s.dx),r:66,seed:77+Math.round(sx)});
  const g=c.createRadialGradient(sx,sy,2,sx,sy,22);g.addColorStop(0,'#000');g.addColorStop(.7,'#060c0b');g.addColorStop(1,'#1a2622');
  blob(c,sx+s.dx*2,sy+s.dy*2,19,31,1.15);c.fillStyle=g;c.fill();c.strokeStyle='rgba(4,8,6,.9)';c.lineWidth=2;c.stroke()}}
function drawDeck(c){soft(c,186,520,96,30,.5);c.beginPath();c.roundRect(90,468,180,82,10);c.fillStyle='#4a3220';c.fill();c.save();c.clip();
  for(let k=0;k<10;k++){c.fillStyle=k%2?'#563a25':'#5f412a';c.fillRect(90+k*18,468,18,82);L(c,90+k*18,468,90+k*18,550,'rgba(15,8,4,.7)',1);for(let j=0;j<3;j++){E(c,99+k*18,480+j*28+hash2(k,j)*8,1.2,1.2);c.fillStyle='#2a1a0c';c.fill()}}
  for(let k=0;k<120;k++){E(c,90+hash2(k,11)*180,468+hash2(k,12)*82,1+hash2(k,13)*2,.8);c.fillStyle='rgba(90,130,70,.35)';c.fill()}c.restore();
  c.beginPath();c.roundRect(90,468,180,82,10);c.strokeStyle=INK;c.lineWidth=2.2;c.stroke()}
function buildBG(){const BG=WORLD.bg;BG.width=Math.max(1,Math.ceil(VW*DPR));BG.height=Math.max(1,Math.ceil(VH*DPR));const c=BG.getContext('2d');c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
  const pad=6,x0=V.x0-pad,y0=V.y0-pad,w=V.w+pad*2,h=V.h+pad*2;let res=Math.min(1.6,SC*DPR*.65);res=Math.min(res,Math.sqrt(650000/(w*h)));
  c.imageSmoothingEnabled=true;c.drawImage(sandLayer(x0,y0,w,h,res),x0,y0,w,h);
  for(const p of WORLD.paths)for(const s of p.segs){const nx=-s.dy,ny=s.dx;for(const side of[-1,1])for(let d=4;d<s.len;d+=7+hash2(d+s.ax,side+5)*6){const px=s.ax+s.dx*d+nx*side*(19+hash2(d,side)*4),py=s.ay+s.dy*d+ny*side*(19+hash2(d,side)*4);if(distToPaths(px,py)<16)continue;const rr=1.6+hash2(d,side+9)*2.4;
    E(c,px+.8,py+1,rr,rr*.7);c.fillStyle='rgba(5,10,8,.35)';c.fill();E(c,px,py,rr,rr*.72);c.fillStyle=hash2(d,side+2)<.5?'#77786a':'#8f8a74';c.fill();E(c,px-rr*.3,py-rr*.25,rr*.4,rr*.25);c.fillStyle='rgba(255,255,255,.16)';c.fill()}}
  drawDeck(c);
  const vis=d=>d.x+d.r*2.5>V.x0&&d.x-d.r*2.5<V.x1&&d.y+d.r*2.5>V.y0&&d.y-d.r*2.5<V.y1;
  for(const d of WORLD.decor)if(vis(d))DRAWD[d.type](c,d);
  drawCaves(c);
  c.fillStyle=WORLD.theme.tint;c.fillRect(V.x0,V.y0,V.w,V.h);
  const cx=V.x0+V.w/2,cy=V.y0+V.h/2;const vg=c.createRadialGradient(cx,cy,Math.min(V.w,V.h)*.38,cx,cy,Math.hypot(V.w,V.h)*.6);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(1,8,10,.62)');c.fillStyle=vg;c.fillRect(V.x0,V.y0,V.w,V.h)}

/* ---------- elementi animati ---------- */
function drawKelpPlant(c,k){const segs=9,pts=[];for(let i=0;i<=segs;i++){const t=i/segs;pts.push([k.x+Math.sin(T*1.1+k.ph+t*2.4)*t*t*9+Math.sin(k.ph)*t*7,k.y-t*k.h])}
  c.beginPath();pts.forEach(([x,y],i)=>{const t=i/segs,sx=x+16*t,sy=y+t*k.h*.42+5;i?c.lineTo(sx,sy):c.moveTo(sx,sy)});c.strokeStyle='rgba(3,12,10,.2)';c.lineWidth=k.w*1.7;c.lineCap='round';c.stroke();
  for(let i=1;i<segs;i+=2){const[x,y]=pts[i],s=i%4===1?1:-1;c.save();c.translate(x,y);E(c,s*6,-2,7,2.3,s*(.5+Math.sin(T*1.5+k.ph+i)*.15));FS(c,'#6f7a2c',.9);c.restore()}
  const lf=[],rt=[];for(let i=0;i<=segs;i++){const[x,y]=pts[i],w=k.w*(1-i/segs*.7)*(1+.2*Math.sin(i*1.7+k.ph));lf.push([x-w,y]);rt.push([x+w,y])}
  c.beginPath();lf.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));for(let i=rt.length-1;i>=0;i--)c.lineTo(rt[i][0],rt[i][1]);c.closePath();
  const g=c.createLinearGradient(0,k.y,0,k.y-k.h);g.addColorStop(0,'#3a4419');g.addColorStop(1,'#8d9038');c.fillStyle=g;c.fill();c.strokeStyle='rgba(12,16,6,.85)';c.lineWidth=1;c.stroke();
  const[tx,ty]=pts[segs];E(c,tx,ty,2.4,2.4);FS(c,'#9c9a46',.8);
  for(const s of[-1,1])L(c,k.x,k.y,k.x+s*5,k.y+3,'#2a2410',1.6);E(c,k.x,k.y,3.2,2);c.fillStyle='#2f2a14';c.fill()}
function drawKelpPatch(c,p){const[x,y,r]=p;for(let k=0;k<26;k++){const a=k/26*TAU+hash2(k,x)*.4,len=r*(.6+hash2(k,y)*.6),sw=Math.sin(T*1.3+k)*.12;
  c.save();c.translate(x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.15);c.rotate(a+sw);E(c,len*.5,0,len*.55,3.4+hash2(k,3)*2);c.fillStyle=k%3?'#4f6a26':'#6f8a34';c.fill();c.strokeStyle='rgba(12,20,6,.8)';c.lineWidth=1;c.stroke();c.restore()}
  E(c,x,y,r*.35,r*.3);c.fillStyle='#3a5020';c.fill()}
function drawVent(c,v,i){const[x,y]=v,t=WORLD.ventT[i],warn=t<2;
  E(c,x+3,y+4,20,9);c.fillStyle='rgba(0,0,0,.35)';c.fill();E(c,x,y,17,8);FS(c,'#2a2220',2);E(c,x,y,10,4.6);c.fillStyle=warn?'#ff8a2a':'#a83a10';c.fill();
  glowAt(c,x,y,warn?40:26,'rgba(255,110,30,A)',warn?.55+.3*Math.sin(T*20):.35);
  for(let k=0;k<4;k++){const b=((T*(warn?40:14)+k*9)%30);E(c,x+Math.sin(k*2+T*3)*4,y-b,1.5+b*.06,1.5+b*.06);c.strokeStyle='rgba(255,200,150,'+(.6-b/50)+')';c.lineWidth=.8;c.stroke()}
  if(t>8.4){const a=(t-8.4)/.6;c.save();c.globalAlpha=.8*(1-Math.abs(a-.5)*2);for(let k=0;k<7;k++){E(c,x+Math.sin(k*1.7)*8,y-10-k*9*a*1.6,10-k,8-k*.8);c.fillStyle=k<3?'#ff6a2a':'rgba(120,110,100,.8)';c.fill()}c.restore()}}
const CAU=document.createElement('canvas'),cauCtx=CAU.getContext('2d');let cauImg=null,cauTick=0;
function updateCaustics(){const cw=CAU.width,ch=CAU.height;if(!cw||!ch)return;if(!cauImg||cauImg.width!==cw||cauImg.height!==ch)cauImg=cauCtx.createImageData(cw,ch);const D=cauImg.data,t=T*.4+23,K=.034;
  for(let j=0;j<ch;j++){let wy=(V.y0+j/ch*V.h)*K;wy=wy-TAU*Math.floor(wy/TAU)-250;for(let i=0;i<cw;i++){let wx=(V.x0+i/cw*V.w)*K;wx=wx-TAU*Math.floor(wx/TAU)-250;
    let ix=wx,iy=wy,cc=1;for(let n=0;n<4;n++){const tt=t*(1-3.5/(n+1));const nx=wx+Math.cos(tt-ix)+Math.sin(tt+iy),ny=wy+Math.sin(tt-iy)+Math.cos(tt+ix);ix=nx;iy=ny;cc+=1/Math.hypot(wx/(Math.sin(ix+tt)/.005),wy/(Math.cos(iy+tt)/.005))}
    cc/=4;cc=1.17-Math.pow(cc,1.4);const v=Math.min(1,Math.pow(Math.abs(cc),8));const o=(j*cw+i)*4;D[o]=190;D[o+1]=255;D[o+2]=225;D[o+3]=v*255}}
  cauCtx.putImageData(cauImg,0,0)}
const SHADOW=document.createElement('canvas');
(function(){SHADOW.width=440;SHADOW.height=320;const c=SHADOW.getContext('2d');c.shadowColor='rgba(0,8,10,1)';c.shadowBlur=26;c.shadowOffsetX=2000;c.translate(220-2000,140);c.fillStyle='#000';
  c.beginPath();c.moveTo(0,-60);c.quadraticCurveTo(80,-52,180,6);c.quadraticCurveTo(90,22,32,58);c.lineTo(4,150);c.lineTo(-4,150);c.lineTo(-32,58);c.quadraticCurveTo(-90,22,-180,6);c.quadraticCurveTo(-80,-52,0,-60);c.fill();
  c.beginPath();c.ellipse(-16,-62,6,14,.3,0,TAU);c.ellipse(16,-62,6,14,-.3,0,TAU);c.fill()})();
function drawAmbient(c){const th=WORLD.theme;
  if(th.caust>.03){if(++cauTick%2===0)updateCaustics();c.save();c.globalCompositeOperation='lighter';c.globalAlpha=th.caust;c.imageSmoothingEnabled=true;c.drawImage(CAU,V.x0,V.y0,V.w,V.h);c.restore()}
  if(th.rays>.05){c.save();c.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=V.x0+V.w*(k+.2)/5+Math.sin(T*.22+k*1.7)*24,w=24+16*Math.sin(k*2.3+T*.3),g=c.createLinearGradient(0,V.y0,0,V.y0+V.h*.9);g.addColorStop(0,'rgba(180,255,225,'+(.09*th.rays)+')');g.addColorStop(1,'rgba(180,255,225,0)');c.fillStyle=g;c.beginPath();c.moveTo(x,V.y0);c.lineTo(x+w,V.y0);c.lineTo(x+w+V.h*.32,V.y0+V.h*.9);c.lineTo(x+V.h*.32-w*.4,V.y0+V.h*.9);c.closePath();c.fill()}c.restore()}
  for(const k of WORLD.kelpPlants)if(k.x>V.x0-20&&k.x<V.x1+20&&k.y-k.h<V.y1&&k.y>V.y0)drawKelpPlant(c,k);
  for(const gl of WORLD.glows){const f=.6+.4*Math.sin(T*2+gl.x);glowAt(c,gl.x,gl.y,gl.r,hexA(gl.c),.35*f)}
  WORLD.vents.forEach((v,i)=>drawVent(c,v,i))}
function hexA(h){const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+',A)'}
function drawManta(c){const p=(T%38)/16;if(p>=1)return;const x=V.x0-260+(V.w+520)*p,y=V.y0+V.h*(.2+.55*p)+Math.sin(p*7)*20;const fl=1+.1*Math.sin(T*1.8);
  c.save();c.globalAlpha=.24*Math.sin(p*Math.PI)*(1-WORLD.floor.dark*.6);c.translate(x,y);c.rotate(Math.atan2(V.h*.55,V.w+520)+Math.PI/2);c.scale(1.25*fl,1.25);c.drawImage(SHADOW,-220,-140);c.restore()}

/* ---------- buio ---------- */
const DK=document.createElement('canvas'),dkc=DK.getContext('2d');
function drawDarkness(c,dark,lights){if(dark<=.02)return;if(DK.width!==c.canvas.width||DK.height!==c.canvas.height){DK.width=c.canvas.width;DK.height=c.canvas.height}
  dkc.setTransform(1,0,0,1,0,0);dkc.globalCompositeOperation='source-over';dkc.clearRect(0,0,DK.width,DK.height);dkc.fillStyle='rgba(1,4,9,'+dark+')';dkc.fillRect(0,0,DK.width,DK.height);
  dkc.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);dkc.globalCompositeOperation='destination-out';
  for(const l of lights){const g=dkc.createRadialGradient(l.x,l.y,l.r*.15,l.x,l.y,l.r);g.addColorStop(0,'rgba(0,0,0,'+(l.a||1)+')');g.addColorStop(1,'rgba(0,0,0,0)');dkc.fillStyle=g;dkc.beginPath();dkc.arc(l.x,l.y,l.r,0,TAU);dkc.fill()}
  c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(DK,0,0);c.restore()}
