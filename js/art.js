'use strict';
/* ===== Abyss Bistro: disegni dei personaggi (contorni spessi, occhi stralunati) ===== */
function E(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot,0,TAU)}
function FS(c,fill,lw=2){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.lineJoin='round';c.stroke()}
function P(c,pts){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath()}
function L(c,x1,y1,x2,y2,col,w){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke()}
function limb(c,pts,col,w){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.lineCap='round';c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=w+2.6;c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function body(c,x,y,rx,ry,base,dark,lw=2){E(c,x,y,rx,ry);c.fillStyle=base;c.fill();c.save();E(c,x,y,rx,ry);c.clip();E(c,x+rx*.3,y+ry*.6,rx,ry);c.fillStyle=dark;c.fill();E(c,x-rx*.38,y-ry*.48,rx*.32,ry*.2);c.fillStyle='rgba(255,255,255,.2)';c.fill();c.restore();E(c,x,y,rx,ry);c.lineWidth=lw;c.strokeStyle=INK;c.stroke()}
function madEye(c,x,y,r,o={}){
  E(c,x,y,r,r*1.06);c.fillStyle='#f0ebcb';c.fill();
  c.save();E(c,x,y,r,r*1.06);c.clip();
  if(o.vein){c.strokeStyle='rgba(200,40,50,.75)';c.lineWidth=.7;for(const a of[.4,2.6,3.6,5.5]){c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a+.3)*r*.55,y+Math.sin(a+.3)*r*.55);c.stroke()}}
  const px=x+(o.lx||0)*r*.38,py=y+(o.ly||0)*r*.38,pr=r*(o.p||.38);
  E(c,px,py,pr,pr);c.fillStyle=o.glow||'#120b0e';c.fill();E(c,px-pr*.35,py-pr*.4,pr*.3,pr*.3);c.fillStyle='#fff';c.fill();
  if(o.lid){const yy=y-r*1.06+o.lid*2*r,tl=o.tilt||0;c.beginPath();c.moveTo(x-r-2,yy+tl);c.lineTo(x+r+2,yy-tl);c.lineTo(x+r+2,y-r-3);c.lineTo(x-r-2,y-r-3);c.closePath();c.fillStyle=o.skin;c.fill();
    c.beginPath();c.moveTo(x-r-2,yy+tl);c.lineTo(x+r+2,yy-tl);c.strokeStyle=INK;c.lineWidth=1.8;c.stroke()}
  c.restore();E(c,x,y,r,r*1.06);c.lineWidth=1.6;c.strokeStyle=INK;c.stroke()}
function bag(c,x,y,r,col){c.beginPath();c.arc(x,y+r*.3,r*1.05,.15*Math.PI,.85*Math.PI);c.strokeStyle=col;c.lineWidth=1.3;c.stroke()}
function grin(c,x,y,w,h,o={}){
  const x0=x-w/2,x1=x+w/2,y1=y-h*.25,cx=x,cy=y+h*.4;
  c.beginPath();c.moveTo(x0,y);c.quadraticCurveTo(x,y+h*2,x1,y1);c.quadraticCurveTo(cx,cy,x0,y);c.closePath();FS(c,'#3b0d16',1.6);
  const n=o.n||5;
  for(let k=1;k<n;k++){const t=k/n,px=(1-t)*(1-t)*x0+2*(1-t)*t*cx+t*t*x1,py=(1-t)*(1-t)*y+2*(1-t)*t*cy+t*t*y1,hw=w/n*.42;
    P(c,[px-hw,py-.5,px+hw,py-.5,px+(k%2?.6:-.4),py+h*(k%2?.75:.6)]);FS(c,k===o.gold?'#e8c14a':'#efe7c6',1)}}
function glowAt(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));c.fillStyle=g;E(c,x,y,r,r);c.fill();c.restore()}

/* ---------- dipendenti ---------- */
function drawCrab(c,x,y,s,face,t){c.save();c.translate(x,y);c.scale(s*face,s);
  for(const i of[-1,1])for(let k=0;k<3;k++)limb(c,[i*9,3+k*3,i*15,6+k*4,i*19,11+k*4+Math.sin(t*8+k*2)*1.2],'#b3321d',1.8);
  limb(c,[-10,-2,-16,-8],'#c23c24',3.2);limb(c,[10,-2,16,-8],'#c23c24',3.2);
  body(c,-17,-12,6.5,5.6,'#d8452b','#a82e1a',1.8);P(c,[-17,-12,-25,-16,-24,-9]);c.fillStyle='#21302c';c.fill();
  P(c,[13,-15,29,-26,31,-22,16,-11]);FS(c,'#cfd6d8',1.6);L(c,17,-15,27,-23,'#fff',.8);
  body(c,16,-12,6.5,5.6,'#d8452b','#a82e1a',1.8);
  body(c,0,2,15,11,'#d8452b','#a82e1a',2.2);
  L(c,-10,3,-4,8,INK,1.4);L(c,-9,6.5,-7,4,INK,1);L(c,-6.5,7.5,-5,5.5,INK,1);
  c.beginPath();c.moveTo(-13,-3);c.quadraticCurveTo(0,-9,13,-3);c.lineTo(13,.5);c.quadraticCurveTo(0,-5.5,-13,.5);c.closePath();FS(c,'#ebe2c8',1.5);
  E(c,0,-4.5,2,2);c.fillStyle='#c41e2a';c.fill();
  limb(c,[-13,-1.5,-20,-5+Math.sin(t*9)*1.5],'#ebe2c8',2);
  limb(c,[-5,-5,-7,-12],'#c23c24',2.2);limb(c,[5,-5,7,-14],'#c23c24',2.2);
  madEye(c,-7,-15,4.6,{lid:.48,tilt:2.6,skin:'#d8452b',lx:.6,vein:1});madEye(c,7.5,-17,3.5,{p:.24,lx:-.3,ly:.2,vein:1});
  L(c,-12,-21.5,-2.5,-18,INK,2.6);grin(c,1,4.5,12,4,{n:5});c.restore()}
function drawShark(c,x,y,s,face,t,lunge=0){c.save();c.translate(x+face*lunge*8,y);c.scale(s*face,s);
  const sw=Math.sin(t*5)*1.5;
  P(c,[-14,0,-27,-11+sw,-23,0,-27,11+sw]);FS(c,'#55707f',1.8);
  P(c,[-6,-9,1,-24,4,-21,3,-17,7,-16.5,9,-9]);FS(c,'#55707f',1.8);
  body(c,0,0,18,11.5,'#6b8798','#4c6474',2.2);
  c.save();E(c,0,0,18,11.5);c.clip();E(c,4,7,14,6);c.fillStyle='#d6cfb8';c.fill();c.restore();E(c,0,0,18,11.5);c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  for(let k=0;k<3;k++)L(c,-5+k*2.6,-3,-6+k*2.6,2.5,INK,1.3);
  L(c,-9,-6,-1,-9,INK,1.2);for(let k=0;k<4;k++)L(c,-8+k*2.3,-8.6+k*.7,-7.2+k*2.3,-5.6+k*.7,INK,.9);
  c.beginPath();c.roundRect(1,-7.5,14.5,5.8,2);FS(c,'#0e1114',1.4);L(c,-2,-5.5,1,-5,INK,1.6);
  c.fillStyle='rgba(255,255,255,.3)';c.fillRect(3,-6.6,2.5,1.4);
  grin(c,9.5,3.8,14,4.2,{n:6,gold:3});c.restore()}
function drawJelly(c,x,y,s,t){c.save();c.translate(x,y+Math.sin(t*2.5)*1.5);c.scale(s,s);
  for(const x0 of[-8,-3,3,8]){const pts=[x0,3];for(let j=1;j<=4;j++)pts.push(x0+Math.sin(t*4+j+x0)*2.6,3+j*4.2);limb(c,pts,'#d79ac6',2)}
  c.beginPath();c.arc(0,3,14,Math.PI,0);for(let k=0;k<4;k++){const a=14-k*7;c.quadraticCurveTo(a-3.5,7.5,a-7,3)}c.closePath();
  c.fillStyle='#c98ab8';c.fill();c.save();c.clip();E(c,5,8,15,10);c.fillStyle='#9c5f8f';c.fill();E(c,-5,-6,6,3);c.fillStyle='rgba(255,255,255,.25)';c.fill();c.restore();
  c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  madEye(c,-5,-1.5,3.7,{lid:.58,tilt:-1,skin:'#c98ab8'});madEye(c,5,-1.5,3.7,{lid:.62,tilt:1.2,skin:'#c98ab8',lx:.4});
  bag(c,-5,-1.5,3.7,'#6e3561');bag(c,5,-1.5,3.7,'#6e3561');L(c,-3,5.5,3,5,INK,1.6);
  P(c,[0,8.5,-4.5,6.3,-4.5,10.7]);FS(c,'#1d1d1d',1);P(c,[0,8.5,4.5,6.3,4.5,10.7]);FS(c,'#1d1d1d',1);
  c.strokeStyle='#f7e35a';c.lineWidth=1.5;for(let k=0;k<3;k++){if(Math.sin(t*9+k*2.1)>.2){const a=t*1.5+k*2.1,r=17;c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r-4);c.lineTo(Math.cos(a)*(r+3)+2,Math.sin(a)*(r+3)-4);c.lineTo(Math.cos(a)*(r+5)-1,Math.sin(a)*(r+5)-3);c.stroke()}}
  c.restore()}
function drawPuffer(c,x,y,s,t,inf=0){c.save();c.translate(x,y);c.scale(s,s);const r=11*(1+.5*inf);
  for(let k=0;k<12;k++){const a=k/12*TAU+.2;P(c,[Math.cos(a-.15)*r,Math.sin(a-.15)*r,Math.cos(a)*(r+5+inf*2),Math.sin(a)*(r+5+inf*2),Math.cos(a+.15)*r,Math.sin(a+.15)*r]);FS(c,'#c9992a',1.3)}
  E(c,-r-3,3,4.5,5);FS(c,'#f2d54a',1.6);E(c,r+3,3,4.5,5);FS(c,'#f2d54a',1.6);
  body(c,0,0,r,r,'#d9b33a','#a88022',2.2);
  madEye(c,-r*.38,-r*.25,4.9+inf*1.2,{p:.2,vein:1,lx:.3});madEye(c,r*.42,-r*.3,3.6+inf*.7,{p:.32,vein:1,lx:-.5,ly:.5});
  E(c,0,r*.4,2.4+inf*1.6,3+inf*2.2);FS(c,'#3b0d16',1.4);E(c,r*.8,-r*.75,1.8,2.6);FS(c,'#bfe6ef',1);c.restore()}
function drawSwordfish(c,x,y,s,f,t,a=0){c.save();c.translate(x+f*a*6,y);c.scale(s*f,s);
  P(c,[-14,0,-24,-9,-21,0,-24,9]);FS(c,'#3d5d86',1.8);
  c.beginPath();c.moveTo(-9,-7);c.quadraticCurveTo(-3,-27,9,-8);c.closePath();FS(c,'#6a4d9c',1.8);
  L(c,13,-1,36,-3,INK,3.6);L(c,13,-1,36,-3,'#c9d3dc',1.8);
  body(c,0,0,16,8.5,'#4f78a8','#365a85',2.1);
  c.save();E(c,0,0,16,8.5);c.clip();E(c,2,6,13,4);c.fillStyle='#d9d4c2';c.fill();c.restore();
  c.beginPath();c.moveTo(2,-8);c.lineTo(15,-6);c.lineTo(11,-3.3);c.lineTo(2,-4.5);c.closePath();FS(c,'#3fae6a',1.3);
  madEye(c,8,-1.5,3.3,{lid:.45,tilt:-1.2,skin:'#4f78a8',lx:.6,vein:1});L(c,6,4,13,3,INK,1.4);c.restore()}
function drawShrimp(c,x,y,s,f,t,a=0){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let k=0;k<4;k++)limb(c,[-6+k*3,5,-7+k*3,10+Math.sin(t*9+k)],'#c4566a',1.3);
  c.strokeStyle=INK;c.lineWidth=1.1;c.beginPath();c.moveTo(6,-6);c.quadraticCurveTo(14,-22,24,-20+Math.sin(t*2)*2);c.stroke();
  for(const[sx,sy,r]of[[-15,4,4.5],[-10,1.5,5.5],[-4,0,6.5],[3,0,7]])body(c,sx,sy,r,r*.85,'#e07a8c','#b8566a',1.6);
  P(c,[-18,4,-25,-1,-25,9]);FS(c,'#c4566a',1.4);
  limb(c,[7,2,13,4],'#c4566a',3);body(c,19,2,8+a*2,5.5+a,'#e8a14a','#b8792a',1.8);P(c,[21,0,29,-3,28,3]);FS(c,'#e8a14a',1.2);
  limb(c,[5,-4,6,-10],'#c4566a',1.6);madEye(c,6,-11,3,{p:.25,vein:1});c.restore()}
function drawSquid(c,x,y,s,f,t){c.save();c.translate(x,y+Math.sin(t*2)*1);c.scale(s*f,s);
  for(let k=0;k<5;k++)limb(c,[-6+k*3,6,-8+k*4+Math.sin(t*4+k)*2,15,-9+k*4.5,19],'#c27a8a',1.8);
  limb(c,[7,4,14,2],'#c27a8a',2);c.beginPath();c.rect(13,-3,6,7);FS(c,'#efe9d6',1.2);E(c,16,-3,3,1);c.fillStyle='#5a3a22';c.fill();
  c.beginPath();c.moveTo(-9,6);c.quadraticCurveTo(-11,-14,0,-24);c.quadraticCurveTo(11,-14,9,6);c.closePath();FS(c,'#d98a96',2);
  P(c,[0,-24,-11,-15,-6,-12]);FS(c,'#c27a8a',1.4);P(c,[0,-24,11,-15,6,-12]);FS(c,'#c27a8a',1.4);
  c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.lineTo(7,7);c.lineTo(-7,7);c.closePath();FS(c,'#6b4a2e',1.2);
  madEye(c,-4,-6,3.6,{lid:.55,skin:'#d98a96'});madEye(c,4,-6,3.6,{lid:.6,tilt:1,skin:'#d98a96',lx:.4});bag(c,-4,-6,3.6,'#8a4a5a');bag(c,4,-6,3.6,'#8a4a5a');c.restore()}
function drawTurtle(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  limb(c,[-10,6,-14,11],'#7a8f4a',3.5);limb(c,[10,6,14,11],'#7a8f4a',3.5);limb(c,[14,-2,20,-6],'#7a8f4a',3);
  c.beginPath();c.moveTo(19,-15);c.lineTo(25,-15);c.lineTo(22,-9);c.closePath();FS(c,'rgba(150,20,45,.9)',1.1);L(c,22,-9,22,-5,INK,1.2);
  body(c,0,0,15,10,'#4d6b3a','#344a28',2.2);c.save();E(c,0,0,15,10);c.clip();c.strokeStyle='rgba(20,30,10,.7)';c.lineWidth=1.1;for(const[a,b]of[[-7,-3],[0,-5],[7,-3],[-4,3],[4,3]]){c.beginPath();for(let k=0;k<6;k++){const an=k/6*TAU;c.lineTo(a+Math.cos(an)*3.6,b+Math.sin(an)*3)}c.closePath();c.stroke()}c.restore();
  body(c,15,-5,6,5,'#8aa055','#6a7f3e',1.8);madEye(c,17,-6.5,2.6,{lid:.5,skin:'#8aa055',lx:.5});
  P(c,[13,-1,10,-3,10,1]);FS(c,'#1d1d1d',.8);P(c,[13,-1,16,-3,16,1]);FS(c,'#1d1d1d',.8);c.restore()}
function drawAngler(c,x,y,s,f,t,glow=1){c.save();c.translate(x,y);c.scale(s*f,s);
  const lx=14+Math.sin(t*2)*2,ly=-22+Math.cos(t*2.3)*1.5;c.strokeStyle=INK;c.lineWidth=1.6;c.beginPath();c.moveTo(2,-9);c.quadraticCurveTo(10,-26,lx,ly);c.stroke();
  if(glow)glowAt(c,lx,ly,14,'rgba(255,230,140,A)',.9);
  E(c,lx,ly,3.2,3.2);FS(c,glow?'#fff3a0':'#6a6a50',1.2);
  P(c,[-12,0,-22,-8,-20,0,-22,8]);FS(c,'#5c4a36',1.6);
  body(c,0,0,14,11,'#7a6247','#54412d',2.2);
  c.beginPath();c.moveTo(3,1);c.quadraticCurveTo(14,11,15,-2);c.quadraticCurveTo(10,4,3,1);FS(c,'#2b0a10',1.3);
  for(let k=0;k<4;k++){P(c,[6+k*2.4,2+k*.8,7.2+k*2.4,6,8.4+k*2.4,2+k*.6]);FS(c,'#efe7c6',.7)}
  madEye(c,3,-6,3.6,{p:.2,vein:1,lx:.5});for(const[a,b]of[[-8,-6],[-4,6],[-10,4]]){E(c,a,b,1.4,1.4);c.fillStyle='#4a3a26';c.fill()}c.restore()}
function drawDJ(c,x,y,s,f,t){c.save();c.translate(x,y+Math.sin(t*6)*1.2);c.scale(s*f,s);
  P(c,[-11,0,-20,-8,-17,0,-20,8]);FS(c,'#2d3a6a',1.6);
  body(c,0,0,13,9,'#3e4f8f','#2a3566',2.1);
  for(let k=0;k<5;k++){E(c,-8+k*4,5,1.3,1.3);c.fillStyle=Math.sin(t*8+k)>0?'#9ef7ff':'#3fbcd6';c.fill()}
  c.beginPath();c.arc(2,-4,9,Math.PI*1.05,Math.PI*1.95);c.strokeStyle=INK;c.lineWidth=3.6;c.stroke();c.strokeStyle='#e04a7a';c.lineWidth=2;c.stroke();
  E(c,-6,-3,3,4);FS(c,'#e04a7a',1.4);E(c,10,-3,3,4);FS(c,'#e04a7a',1.4);
  madEye(c,4,-1,3.2,{lid:.5,tilt:-1,skin:'#3e4f8f',lx:.4});
  c.beginPath();c.moveTo(6,4);c.quadraticCurveTo(9,6.5,12,3.5);c.strokeStyle=INK;c.lineWidth=1.4;c.stroke();
  c.fillStyle='#f1dca2';c.font='10px Bangers,Impact,sans-serif';c.fillText('\u266A',14+Math.sin(t*3)*2,-12-((t*10)%8));c.restore()}
function drawSeahorse(c,x,y,s,f,t){c.save();c.translate(x,y+Math.sin(t*2.4)*1.5);c.scale(s*f,s);
  c.beginPath();c.moveTo(-2,4);c.quadraticCurveTo(-10,14,-4,18);c.quadraticCurveTo(2,20,0,14);c.strokeStyle=INK;c.lineWidth=5;c.lineCap='round';c.stroke();c.strokeStyle='#d9a23a';c.lineWidth=3;c.stroke();
  c.beginPath();c.moveTo(-6,6);c.quadraticCurveTo(-9,-6,-2,-12);c.quadraticCurveTo(6,-8,4,6);c.closePath();FS(c,'#e6b44a',2);
  for(let k=0;k<4;k++)L(c,-6+k*.4,-6+k*4,-1+k*.6,-6+k*4.5,'rgba(120,70,10,.6)',1);
  E(c,0,-13,6,5.5);FS(c,'#e6b44a',1.8);c.beginPath();c.moveTo(5,-14);c.lineTo(13,-12);c.lineTo(13,-10);c.lineTo(5,-10);c.closePath();FS(c,'#e6b44a',1.6);
  madEye(c,1,-14,2.6,{lid:.4,skin:'#e6b44a',lx:.6});
  c.beginPath();c.rect(-5,-24,9,6);FS(c,'#ece7d8',1.4);E(c,-3,-25,3.5,3);FS(c,'#ece7d8',1.4);E(c,2,-25,3.5,3);FS(c,'#ece7d8',1.4);
  limb(c,[4,-2,10,2],'#e6b44a',1.8);L(c,10,2,10,-8,'#bfc6c8',1.4);E(c,10,3,3,2);FS(c,'#bfc6c8',1);c.restore()}
function drawOyster(c,x,y,s,f,t,open=.5){c.save();c.translate(x,y);c.scale(s,s);
  E(c,0,4,15,8);FS(c,'#7d7a6c',2);c.save();E(c,0,4,15,8);c.clip();for(let k=-12;k<=12;k+=4)L(c,k,-4,k*1.2,14,'rgba(30,25,20,.5)',1);c.restore();
  E(c,0,3,11,5);c.fillStyle='#d9a4b0';c.fill();E(c,0,1.5,4.2,4.2);FS(c,'#f4efe2',1.2);E(c,-1.2,.3,1.2,1.2);c.fillStyle='#fff';c.fill();
  c.save();c.translate(0,2);c.rotate(-.35-open*.4);E(c,0,-6,15,7.5);FS(c,'#8d8a7a',2);E(c,0,-7,4,4);FS(c,'#c9c2a8',1.2);for(let k=0;k<6;k++){const a=k/6*TAU+t;L(c,Math.cos(a)*2.8,-7+Math.sin(a)*2.8,Math.cos(a)*3.8,-7+Math.sin(a)*3.8,INK,.8)}
  madEye(c,-8,-5,2.6,{lid:.55,skin:'#8d8a7a',lx:.5});madEye(c,8,-5,2.6,{lid:.55,skin:'#8d8a7a',lx:.5});c.restore();c.restore()}
function drawMantaT(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);const fl=Math.sin(t*5)*3;
  L(c,-10,0,-24,2,INK,1.6);
  c.beginPath();c.moveTo(12,0);c.quadraticCurveTo(2,-16-fl,-12,-20-fl);c.quadraticCurveTo(-6,-6,-12,0);c.quadraticCurveTo(-6,6,-12,20+fl);c.quadraticCurveTo(2,16+fl,12,0);c.closePath();FS(c,'#3b4a5a',2.1);
  c.save();c.clip();E(c,2,0,10,14);c.fillStyle='#4f6276';c.fill();c.restore();
  c.beginPath();c.rect(-7,-5,9,10);FS(c,'#c9832e',1.4);L(c,-7,0,2,0,INK,.8);
  E(c,12,-4,2,3);FS(c,'#3b4a5a',1.2);E(c,12,4,2,3);FS(c,'#3b4a5a',1.2);
  madEye(c,7,-5,2.4,{lid:.35,skin:'#3b4a5a',lx:.7});madEye(c,7,5,2.4,{lid:.35,skin:'#3b4a5a',lx:.7});c.restore()}
function drawHermit(c,x,y,s,f,t,mode=0){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let k=0;k<3;k++)limb(c,[6,2+k*3,13,6+k*3,15,10+k*3+Math.sin(t*8+k)],'#c25a3a',1.7);
  limb(c,[8,-3,16,-8],'#c25a3a',2.8);E(c,17,-10,4.5,3.6);FS(c,'#d8452b',1.6);
  body(c,-4,-2,13,11,mode?'#5d7fa3':'#c9a36b',mode?'#3d5a7a':'#9a7a4a',2.2);
  c.beginPath();for(let a=0;a<4.3*Math.PI;a+=.2){const r=1+a*.7;c.lineTo(-5+Math.cos(a)*r,-2+Math.sin(a)*r)}c.strokeStyle=INK;c.lineWidth=1.5;c.stroke();
  limb(c,[9,-4,10,-12],'#c25a3a',1.6);limb(c,[11,-3,14,-11],'#c25a3a',1.6);madEye(c,10,-13,2.5,{p:.25});madEye(c,14.5,-12,2.5,{p:.3,lx:.5});c.restore()}
function drawSardine(c,x,y,a,s=1){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);P(c,[-6,0,-10,-3,-10,3]);FS(c,'#7f949c',.9);E(c,0,0,6.5,2.6);FS(c,'#c3d2d8',1);L(c,-4,-.6,4,-.6,'#4f6f80',.9);E(c,3.5,-.4,.9,.9);c.fillStyle=INK;c.fill();c.restore()}
function drawSchool(c,x,y,s,f,t){for(let k=0;k<6;k++){const a=t*1.5+k*1.05;drawSardine(c,x+Math.cos(a)*9*s,y+Math.sin(a)*6*s,a+Math.PI/2,s)}}
function drawWhale(c,x,y,s,f,t,a=0){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-20,-2,-32,-12+Math.sin(t*2)*2,-28,-2,-32,8+Math.sin(t*2)*2]);FS(c,'#2f4f78',2);
  body(c,0,0,24,15,'#3f6a9c','#2b4c74',2.4);c.save();E(c,0,0,24,15);c.clip();E(c,6,12,22,9);c.fillStyle='#cfd6d8';c.fill();for(let k=0;k<5;k++)L(c,-6+k*5,7,-4+k*5,14,'rgba(40,60,80,.6)',1);c.restore();E(c,0,0,24,15);c.strokeStyle=INK;c.lineWidth=2.4;c.stroke();
  c.beginPath();c.moveTo(8,4);c.quadraticCurveTo(17,10+a*10,24,2);c.strokeStyle=INK;c.lineWidth=1.8;c.stroke();if(a>.1){c.beginPath();c.moveTo(8,4);c.quadraticCurveTo(17,10+a*10,24,2);c.fillStyle='#3b0d16';c.fill()}
  madEye(c,12,-4,3.8,{lid:.4,tilt:-1,skin:'#3f6a9c',lx:.5});E(c,16,-1,2,1.4);c.fillStyle='#f4ead8';c.fill();
  c.beginPath();c.rect(-8,-30,13,16);FS(c,'#ece7d8',1.6);E(c,-6,-31,6,5);FS(c,'#ece7d8',1.6);E(c,3,-32,6,5.5);FS(c,'#ece7d8',1.6);E(c,-2,-35,5.5,5);FS(c,'#ece7d8',1.6);
  for(let k=0;k<3;k++){const b=((t*12+k*5)%14);E(c,-4+k*3,-16-b*1.3,1.5+b*.1,1.5+b*.1);c.strokeStyle='rgba(220,250,255,.6)';c.lineWidth=.8;c.stroke()}c.restore()}
function drawIntern(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let i=0;i<4;i++)limb(c,[-6+i*4,5,-8+i*5+Math.sin(t*7+i)*2,13],'#d9783a',2.6);
  body(c,0,-2,11,10,'#e88a45','#b8662e',2);
  c.beginPath();c.rect(-7,3,9,4);FS(c,'#f1ead2',1);L(c,-6,5,0,5,'#555',.8);
  madEye(c,-3.5,-4,3.3,{p:.18,vein:1,lx:.4});madEye(c,4,-4.5,3.6,{p:.22,vein:1,lx:-.2,ly:.4});
  c.beginPath();c.moveTo(-3,2);c.quadraticCurveTo(0,0,3,2);c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();
  E(c,9,-10,1.6,2.4);FS(c,'#bfe6ef',1);limb(c,[9,0,14,-2],'#e88a45',2);c.beginPath();c.rect(13,-6,5,6);FS(c,'#f1ead2',1.1);c.restore()}
function drawOcto(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  for(let i=0;i<5;i++){const x0=-14+i*6;limb(c,[x0,10,x0+Math.sin(t*3+i)*5,19,x0+(i<2?-6:6),25+Math.cos(t*3+i)*2],'#6e4a96',4.5)}
  const lift=Math.max(0,Math.sin(t*1.3))*4;limb(c,[14,4,24,-4,27,-14-lift],'#6e4a96',4.5);
  c.save();c.translate(27,-16-lift);c.rotate(-.5);P(c,[-3,-2,13,-6,14,4,-3,4]);FS(c,'#cfd6d8',1.6);L(c,0,-1,12,-4,'#fff',.8);c.beginPath();c.rect(-9,-1.5,7,4);FS(c,'#5a3a22',1.4);c.restore();
  body(c,0,-2,18,18,'#7d56a8','#5a3a82',2.4);
  c.fillStyle='#4a2f6e';for(const[a,b]of[[-6,9],[-3,11],[1,11.5],[4,10],[7,8.5],[-8,7],[9,6.5],[-1,9.5],[3,8]])c.fillRect(a,b,1,1);
  const tw=(Math.sin(t*7)>.85)?.85:.5;
  madEye(c,-7,-4,5,{lid:tw,tilt:1.6,skin:'#7d56a8',vein:1,lx:.3});madEye(c,7,-4.5,5.5,{p:.24,vein:1,lx:-.2});
  bag(c,-7,-4,5,'#4a2f6e');bag(c,7,-4.5,5.5,'#4a2f6e');L(c,-12,-11,-3,-9.5,INK,2.4);L(c,3,-12,12,-12.5,INK,2.4);
  grin(c,0,5.5,14,3.4,{n:6});E(c,16,-12,1.9,2.8);FS(c,'#bfe6ef',1);
  c.save();c.rotate(-.14);c.beginPath();c.rect(-11,-30,22,10);FS(c,'#ece7d8',1.8);
  E(c,-8,-32,7,6.5);FS(c,'#ece7d8',1.8);E(c,8,-32,7,6.5);FS(c,'#ece7d8',1.8);E(c,0,-36,8.5,8);FS(c,'#ece7d8',1.8);
  E(c,4,-34,2.4,1.6);c.fillStyle='#b08c3a';c.fill();c.restore();c.restore()}

/* ---------- nemici ---------- */
function drawGoby(c,x,y,s,face,t){c.save();c.translate(x,y);c.scale(s*face,s);c.rotate(Math.sin(t*10)*.08);
  P(c,[-9,0,-18,-7,-16,0,-18,7]);FS(c,'#6b5a33',1.6);body(c,0,0,12,8.5,'#8c7a4a','#5f4f2c',2);
  E(c,-4,2,1.6,1.3);c.fillStyle='#5f4f2c';c.fill();E(c,-7,-2,1.2,1);c.fill();
  P(c,[5,-1,15,-6,15,7]);FS(c,'#3b0d16',1.6);
  for(const[a,b,d]of[[8,-2.4,1],[11,-4,1],[8,3.4,-1],[11.5,5,-1]]){P(c,[a,b,a+2.2,b+(d>0?-.4:.6),a+1.4,b+2.2*d]);FS(c,'#efe7c6',.8)}
  E(c,12,2.5,3,1.5);c.fillStyle='#d4566a';c.fill();madEye(c,2,-4,4.3,{p:.22,lx:.9,ly:-.6,vein:1});c.restore()}
function drawHerring(c,x,y,s,face,t){c.save();c.translate(x,y);c.scale(s*face,s);c.rotate(Math.sin(t*14)*.1);
  c.strokeStyle='rgba(240,233,212,.35)';c.lineWidth=1.2;for(let k=0;k<3;k++){c.beginPath();c.moveTo(-17-k*2,-3+k*3);c.lineTo(-25-k*3,-3+k*3);c.stroke()}
  P(c,[-8,0,-16,-6,-14,0,-16,6]);FS(c,'#7f949c',1.4);body(c,0,0,11,5,'#b9c7cc','#8ea1a8',1.8);L(c,-6,-1.2,6,-1.2,'#6f8a96',1);
  madEye(c,5,-1.6,3.1,{p:.18,lx:.4});L(c,8,2,10.5,1.2,INK,1.2);c.restore()}
function drawSnail(c,x,y,s,face,t){c.save();c.translate(x,y);c.scale(s*face,s);
  E(c,0,11,18,2.6);c.fillStyle='rgba(170,230,190,.35)';c.fill();body(c,3,7,15,5.5,'#c9a27e','#9d7a58',1.8);
  limb(c,[12,4,15,-6],'#c9a27e',2);limb(c,[9,4,9,-7],'#c9a27e',2);
  madEye(c,15,-7,2.9,{lid:.5,skin:'#c9a27e',tilt:-.6});madEye(c,9,-8,2.6,{lid:.4,skin:'#c9a27e',lx:.6});
  body(c,-3,-2,11,11,'#7d5a8c','#55396a',2);c.beginPath();for(let a=0;a<4.3*Math.PI;a+=.2){const r=1+a*.6;c.lineTo(-3+Math.cos(a)*r,-2+Math.sin(a)*r)}c.strokeStyle=INK;c.lineWidth=1.5;c.stroke();c.restore()}
function drawIsopod(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let k=0;k<5;k++)limb(c,[-8+k*4,6,-9+k*4,10+Math.sin(t*12+k)*1.2],'#5a5f66',1.2);
  for(let k=0;k<5;k++)body(c,-10+k*5,0,4.8,8-Math.abs(k-2)*.6,'#8c939c','#5f666e',1.5);
  body(c,14,0,4.5,6,'#7a8189','#555c63',1.5);L(c,17,-3,24,-8,INK,1.1);L(c,17,3,24,8,INK,1.1);
  madEye(c,15,-2.4,1.9,{p:.35});madEye(c,15,2.4,1.9,{p:.35});c.restore()}
function drawFlyfish(c,x,y,s,f,t){c.save();c.translate(x,y-6);c.scale(s*f,s);const fl=Math.sin(t*16)*4;
  P(c,[-8,0,-15,-6,-13,0,-15,6]);FS(c,'#2f5f9a',1.4);c.beginPath();c.moveTo(-2,-2);c.lineTo(-10,-14-fl);c.lineTo(6,-4);c.closePath();FS(c,'#8fc6ea',1.4);
  body(c,0,0,10,5,'#3f7fc0','#2c5f94',1.8);c.beginPath();c.moveTo(-2,2);c.lineTo(-9,12+fl);c.lineTo(6,3);c.closePath();FS(c,'#8fc6ea',1.4);
  madEye(c,5,-1.2,2.5,{p:.2,lx:.6,vein:1});c.restore()}
function drawThief(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  for(const i of[-1,1])for(let k=0;k<3;k++)limb(c,[i*8,3+k*3,i*15,9+k*3+Math.sin(t*14+k)*1.5],'#5a6a3a',1.6);
  limb(c,[-9,-1,-14,-6],'#6f8448',2.6);E(c,-15,-8,4.5,3.8);FS(c,'#6f8448',1.5);
  limb(c,[9,-1,13,-8],'#6f8448',2.6);E(c,15,-12,7,6);FS(c,'#b39a6a',1.6);L(c,12,-17,17,-17,INK,1);E(c,15,-12,1.6,1.6);c.fillStyle='#e8c14a';c.fill();
  body(c,0,2,12,9,'#7f9450','#5a6a3a',2);c.beginPath();c.rect(-11,-6,22,5);FS(c,'#1b1b1b',1.2);L(c,-11,-3.5,-16,-2+Math.sin(t*10)*2,'#1b1b1b',1.6);
  madEye(c,-4.5,-3.6,2.4,{p:.3,lx:.6});madEye(c,4.5,-3.6,2.4,{p:.3,lx:.6});grin(c,0,4,9,3,{n:4});c.restore()}
function drawStarE(c,x,y,s,f,t,small){c.save();c.translate(x,y);c.scale(s,s);c.rotate(Math.sin(t*8)*.15);const r=small?6.5:13;
  c.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,rr=k%2?r*.45:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();FS(c,'#e07a3a',1.8);
  for(let k=0;k<5;k++){const a=k/5*TAU-Math.PI/2;E(c,Math.cos(a)*r*.6,Math.sin(a)*r*.6,.9,.9);c.fillStyle='#ffd8a0';c.fill()}
  madEye(c,-r*.22,-r*.1,small?1.7:2.8,{p:.3,vein:1});madEye(c,r*.22,-r*.12,small?1.5:2.4,{p:.25,lx:.4});if(!small)grin(c,0,r*.28,8,2.6,{n:4});c.restore()}
function drawEel(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  const pts=[];for(let k=0;k<=8;k++)pts.push(-22+k*4.4,Math.sin(t*7-k*.8)*3*(k/8+.3));
  limb(c,pts,'#4f7a3a',7);for(let k=0;k<8;k+=2){E(c,pts[k*2],pts[k*2+1],1.4,1);c.fillStyle='#e0d24a';c.fill()}
  const hx=pts[16],hy=pts[17];E(c,hx+3,hy,6.5,5);FS(c,'#5a8a42',1.8);
  c.beginPath();c.moveTo(hx+3,hy+1);c.lineTo(hx+11,hy-1);c.lineTo(hx+10,hy+5);c.closePath();FS(c,'#3b0d16',1.2);
  P(c,[hx+5,hy+1.5,hx+6,hy+4,hx+7,hy+1.6]);FS(c,'#efe7c6',.6);P(c,[hx+8,hy+1,hx+9,hy+3.6,hx+9.6,hy+.8]);FS(c,'#efe7c6',.6);
  madEye(c,hx+3,hy-2.6,2.2,{lid:.45,tilt:-1,skin:'#5a8a42',lx:.6});c.restore()}
function drawViper(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-10,0,-18,-7,-16,0,-18,7]);FS(c,'#1d1f2e',1.4);body(c,0,0,12,7,'#2b2e45','#191b2a',1.8);
  for(let k=0;k<4;k++){E(c,-7+k*4,4,1,1);c.fillStyle='#7af0ff';c.fill()}
  c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.moveTo(2,-6);c.quadraticCurveTo(4,-16,11,-14);c.stroke();E(c,11,-14,2,2);c.fillStyle='#7af0ff';c.fill();
  c.beginPath();c.moveTo(6,1);c.lineTo(15,-2);c.lineTo(15,4);c.closePath();FS(c,'#3b0d16',1);
  L(c,9,-1,8,7,'#efe7c6',1.4);L(c,13,-1,13,6,'#efe7c6',1.4);madEye(c,5,-2.5,2.6,{p:.18,vein:1,lx:.5});c.restore()}
function drawSurgeon(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-10,0,-17,-7,-15,0,-17,7]);FS(c,'#f2c21a',1.5);body(c,0,0,11,9,'#2f6fd0','#20509a',2);
  c.beginPath();c.moveTo(-8,-2);c.quadraticCurveTo(0,-8,6,-2);c.quadraticCurveTo(0,4,-8,6);c.strokeStyle='#0d1a3a';c.lineWidth=2;c.stroke();
  c.beginPath();c.rect(4,0,7,4);FS(c,'#9fd6d0',1);madEye(c,5,-3,2.6,{lid:.4,skin:'#2f6fd0',tilt:-1,lx:.5});
  limb(c,[2,4,8,10],'#2f6fd0',1.6);L(c,8,10,14,8,'#d9dde0',1.6);c.restore()}
function drawHammer(c,x,y,s,f,t,a=0){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-14,0,-25,-9,-21,0,-25,9]);FS(c,'#5d6f7d',1.6);P(c,[-4,-7,0,-18,5,-7]);FS(c,'#5d6f7d',1.6);
  body(c,0,0,15,8,'#7a8c9a','#566672',2);c.beginPath();c.roundRect(12,-11,6,22,3);FS(c,'#7a8c9a',1.8);
  madEye(c,15,-10,2.4,{p:.25,vein:1,lx:.5});madEye(c,15,10,2.4,{p:.25,vein:1,lx:.5});grin(c,9,3,8,2.6,{n:4});
  if(a)for(let k=0;k<3;k++)L(c,-28-k*5,-4+k*4,-36-k*5,-4+k*4,'rgba(240,233,212,.5)',1.4);c.restore()}
function drawRival(c,x,y,s,f,t,disg){
  if(disg){drawCrab(c,x,y,s*.9,f,t);c.save();c.translate(x,y);c.scale(s*.9,s*.9);c.strokeStyle=INK;c.lineWidth=2.4;for(const i of[-1,1]){c.beginPath();c.moveTo(0,1);c.quadraticCurveTo(i*5,-1,i*9,3);c.stroke()}c.restore();return}
  c.save();c.translate(x,y);c.scale(s*f,s);for(let i=0;i<5;i++)limb(c,[-10+i*5,6,-12+i*6+Math.sin(t*6+i)*3,16],'#9a2a2a',3.4);
  body(c,0,-2,13,12,'#c23a3a','#8a2424',2.2);madEye(c,-5,-4,3.6,{lid:.5,tilt:2,skin:'#c23a3a',lx:.5,vein:1});madEye(c,5,-4,3.6,{lid:.5,tilt:-2,skin:'#c23a3a',lx:.5,vein:1});
  c.strokeStyle=INK;c.lineWidth=2.6;for(const i of[-1,1]){c.beginPath();c.moveTo(0,3);c.quadraticCurveTo(i*6,0,i*11,5);c.stroke()}c.restore()}
function drawRolling(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s,s);c.save();c.rotate(t*4*f);
  for(let k=0;k<16;k++){const a=k/16*TAU;L(c,Math.cos(a)*9,Math.sin(a)*9,Math.cos(a)*16,Math.sin(a)*16,INK,2.2);L(c,Math.cos(a)*9,Math.sin(a)*9,Math.cos(a)*15,Math.sin(a)*15,'#4a2f6a',1.2)}c.restore();
  c.scale(f,1);c.beginPath();c.arc(0,0,12,-.8,.8);c.strokeStyle=INK;c.lineWidth=5;c.stroke();c.strokeStyle='#b8bcc4';c.lineWidth=3;c.stroke();
  body(c,0,0,10,10,'#5d3d82','#3e2858',2);madEye(c,1,-2,2.8,{lid:.5,tilt:-1.5,skin:'#5d3d82',lx:.8});madEye(c,7,-2,2.4,{lid:.5,tilt:1.2,skin:'#5d3d82',lx:.8});L(c,1,4,7,4,INK,1.4);c.restore()}
function drawNudi(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  body(c,0,2,14,6,'#8a3ad1','#5f2496',2);for(let k=0;k<6;k++){const px=-10+k*4;limb(c,[px,-2,px+Math.sin(t*5+k)*2,-9],k%2?'#ff9a2a':'#ffd23a',2.2)}
  E(c,0,4,12,1.8);c.fillStyle='#ffd23a';c.fill();limb(c,[11,0,14,-8],'#8a3ad1',1.6);limb(c,[9,0,10,-8],'#8a3ad1',1.6);
  madEye(c,12,-2,2.2,{lid:.55,skin:'#8a3ad1',lx:.5});c.restore()}

/* ---------- boss ---------- */
function drawLobster(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  c.strokeStyle=INK;c.lineWidth=1.6;for(const i of[-1,1]){c.beginPath();c.moveTo(i*4,-18);c.quadraticCurveTo(i*18,-42,i*31,-30+Math.sin(t*2+i)*3);c.stroke()}
  E(c,0,20,10,8);FS(c,'#a8341f',2);P(c,[-10,25,0,35,10,25]);FS(c,'#97301e',1.8);
  for(const i of[-1,1])for(let k=0;k<3;k++)limb(c,[i*12,2+k*5,i*22,6+k*6],'#97301e',2);
  limb(c,[-14,-4,-22,-10],'#b8392a',3.6);limb(c,[14,-4,22,-10],'#b8392a',3.6);
  body(c,-24,-16,9,11.5,'#c9412b','#97301e',2);P(c,[-24,-20,-33,-31,-29,-17]);c.fillStyle='#21302c';c.fill();
  c.beginPath();c.rect(16,-34,13,16);FS(c,'#efe9d6',1.5);for(let k=0;k<3;k++)L(c,18,-30+k*4,27,-30+k*4,'#8a8577',.9);
  body(c,24,-16,9,11.5,'#c9412b','#97301e',2);body(c,0,0,18,20,'#c9412b','#97301e',2.4);
  for(let k=0;k<3;k++){c.beginPath();c.arc(0,6+k*5,10-k*1.5,.15*Math.PI,.85*Math.PI);c.strokeStyle='#7d2416';c.lineWidth=1.2;c.stroke()}
  P(c,[-10,-17,-10,-28,-5,-22,0,-31,5,-22,10,-28,10,-17]);FS(c,'#e8c14a',1.8);E(c,0,-24,1.8,1.8);c.fillStyle='#46aee8';c.fill();
  madEye(c,-6,-9,4.6,{lid:.42,tilt:-2,skin:'#c9412b',lx:.4});madEye(c,6.5,-10,5.2,{p:.3,lx:-.2});
  c.beginPath();c.arc(6.5,-10,6.8,0,TAU);c.strokeStyle='#e8c14a';c.lineWidth=1.8;c.stroke();L(c,13,-8,15,6,'#e8c14a',1);
  L(c,1,-17,12,-21,INK,2.4);L(c,-11,-15,-2,-15.5,INK,2.4);
  c.strokeStyle=INK;c.lineWidth=2.6;c.lineCap='round';for(const i of[-1,1]){c.beginPath();c.moveTo(0,-1);c.quadraticCurveTo(i*6,-4,i*10,1);c.stroke()}
  c.beginPath();c.arc(0,8,4,1.15*Math.PI,1.85*Math.PI);c.lineWidth=1.8;c.stroke();c.restore()}
function drawKingCrab(c,x,y,s,t,grow=1){c.save();c.translate(x,y);c.scale(s*grow,s*grow);
  for(const i of[-1,1])for(let k=0;k<4;k++)limb(c,[i*14,k*5,i*26,-4+k*7,i*34,4+k*8+Math.sin(t*5+k)*2],'#7a2a4a',3);
  for(const i of[-1,1]){limb(c,[i*16,-8,i*24,-18],'#8a3050',4.5);body(c,i*28,-24,10,8,'#a33a5c','#7a2a4a',2.2);for(let k=0;k<4;k++){P(c,[i*(22+k*3),-31,i*(23+k*3),-36,i*(24.5+k*3),-30.5]);FS(c,'#e8d9c0',1)}}
  body(c,0,0,22,17,'#a33a5c','#7a2a4a',2.6);
  for(let k=0;k<14;k++){const a=k/14*TAU,px=Math.cos(a)*19,py=Math.sin(a)*14;P(c,[px-2,py,px+Math.cos(a)*6,py+Math.sin(a)*6,px+2,py]);FS(c,'#e8d9c0',1)}
  P(c,[-10,-14,-10,-24,-5,-19,0,-27,5,-19,10,-24,10,-14]);FS(c,'#e8c14a',1.8);
  madEye(c,-7,-6,4.6,{lid:.4,tilt:2,skin:'#a33a5c',vein:1});madEye(c,7,-6,4.6,{lid:.4,tilt:-2,skin:'#a33a5c',vein:1});grin(c,0,6,18,6,{n:7,gold:3});c.restore()}
function drawKraken(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  for(let i=0;i<8;i++){const a=i/8*TAU+.2;const pts=[0,6];for(let k=1;k<=5;k++){const r=k*7,aa=a+Math.sin(t*2+i+k*.5)*.4;pts.push(Math.cos(aa)*r*1.2,6+Math.sin(aa)*r*.8)}limb(c,pts,'#6a3a5a',5-i%2)}
  c.beginPath();c.moveTo(-18,6);c.quadraticCurveTo(-22,-26,0,-36);c.quadraticCurveTo(22,-26,18,6);c.closePath();FS(c,'#8a4a72',2.6);
  c.save();c.clip();for(let k=0;k<30;k++){E(c,-18+hash2(k,1)*36,-34+hash2(k,2)*40,1+hash2(k,3)*2.5,1+hash2(k,4)*2);c.fillStyle='rgba(60,20,50,.5)';c.fill()}c.restore();
  madEye(c,-8,-6,6,{p:.24,vein:1,lx:Math.sin(t)*.5});madEye(c,8,-6,6,{p:.24,vein:1,lx:Math.sin(t)*.5});L(c,-15,-15,-3,-12,INK,3);L(c,15,-15,3,-12,INK,3);c.restore()}
function drawTentacle(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);const pts=[0,10];for(let k=1;k<=6;k++)pts.push(Math.sin(t*4+k)*5*k/6,10-k*6);limb(c,pts,'#8a4a72',7);for(let k=1;k<6;k++){E(c,pts[k*2]+3,pts[k*2+1],1.5,1.5);c.fillStyle='#e6b3cf';c.fill()}c.restore()}
function drawLevi(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  const pts=[];for(let k=0;k<=12;k++)pts.push(-60+k*5.4,Math.sin(t*3-k*.6)*7*(1-k/14));
  limb(c,pts,'#2a6a6a',16);for(let k=0;k<12;k+=2){P(c,[pts[k*2]-3,pts[k*2+1]-7,pts[k*2],pts[k*2+1]-15,pts[k*2]+3,pts[k*2+1]-7]);FS(c,'#c94a3a',1.2)}
  const hx=pts[24],hy=pts[25];body(c,hx+8,hy,14,10,'#2f7a78','#1f5654',2.4);
  c.beginPath();c.moveTo(hx+10,hy+2);c.lineTo(hx+26,hy-3);c.lineTo(hx+24,hy+8);c.closePath();FS(c,'#3b0d16',1.6);
  for(let k=0;k<4;k++){P(c,[hx+12+k*3.5,hy+1,hx+13.5+k*3.5,hy+5,hx+15+k*3.5,hy+.6]);FS(c,'#efe7c6',.8)}
  P(c,[hx+2,hy-8,hx-6,hy-20,hx+8,hy-10]);FS(c,'#c94a3a',1.4);madEye(c,hx+12,hy-4,3.8,{p:.22,vein:1,lx:.5,glow:'#5a0a0a'});c.restore()}
function drawMega(c,x,y,s,f,t,rage){c.save();c.translate(x,y);c.scale(s*f,s);const sw=Math.sin(t*6)*2;
  P(c,[-22,0,-40,-16+sw,-34,0,-40,16+sw]);FS(c,'#3f4c58',2.2);P(c,[-8,-14,2,-36,10,-13]);FS(c,'#3f4c58',2.2);
  body(c,0,0,28,16,rage?'#6a4a50':'#56646f','#3a454e',2.8);
  c.save();E(c,0,0,28,16);c.clip();E(c,6,11,24,9);c.fillStyle='#cfc6b0';c.fill();c.restore();E(c,0,0,28,16);c.strokeStyle=INK;c.lineWidth=2.8;c.stroke();
  for(let k=0;k<4;k++)L(c,-8+k*3.4,-5,-10+k*3.4,4,INK,1.6);L(c,6,-12,14,-3,'#c9b9a0',1.6);L(c,-2,-10,4,-6,'#c9b9a0',1.4);
  madEye(c,15,-6,4,{lid:.35,tilt:-2.5,skin:rage?'#6a4a50':'#56646f',vein:1,p:.2,lx:.6,glow:rage?'#a01020':0});grin(c,17,5,20,7,{n:8});c.restore()}

/* ---------- gestori ---------- */
function drawClown(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-11,0,-19,-7,-17,0,-19,7]);FS(c,'#e86a1a',1.6);body(c,0,0,13,9,'#f07a22','#c25a10',2.1);
  c.save();E(c,0,0,13,9);c.clip();for(const bx of[-6,3]){c.beginPath();c.rect(bx,-10,3.6,20);c.fillStyle='#f4f0e6';c.fill();L(c,bx,-10,bx,10,INK,1);L(c,bx+3.6,-10,bx+3.6,10,INK,1)}c.restore();
  madEye(c,8,-2,3,{lid:.3,skin:'#f07a22',lx:.6});grin(c,10,3,6,2,{n:3});limb(c,[4,6,12,12],'#f07a22',2);c.beginPath();c.roundRect(11,6,7,11,1.5);FS(c,'#20262b',1.2);c.restore()}
function drawNarwhal(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  P(c,[-16,0,-26,-8,-22,0,-26,8]);FS(c,'#6d7a86',1.6);L(c,14,-3,36,-10,INK,3);L(c,14,-3,36,-10,'#efe7c6',1.6);
  body(c,0,0,17,10,'#8d9aa6','#66727e',2.2);for(let k=0;k<7;k++){E(c,-10+hash2(k,2)*18,-6+hash2(k,3)*8,1.4,1);c.fillStyle='#5a6672';c.fill()}
  madEye(c,9,-2,2.8,{lid:.4,skin:'#8d9aa6',lx:.5});c.beginPath();c.rect(3,-6,6,4.5);FS(c,'#111',1);L(c,0,-5,16,-8,'#111',.9);
  c.beginPath();c.moveTo(-8,-9);c.quadraticCurveTo(2,-24,14,-9);c.closePath();FS(c,'#1b1b1b',1.6);E(c,3,-14,2,2);c.fillStyle='#efe7c6';c.fill();c.restore()}
function drawSub(c,x,y,s,f,t){c.save();c.translate(x,y+Math.sin(t*1.5)*1.5);c.scale(s*f,s);
  L(c,-6,-12,-6,-20,INK,2.4);L(c,-6,-20,0,-20,INK,2.4);c.beginPath();c.roundRect(-10,-14,12,6,2);FS(c,'#d9a52a',1.6);
  body(c,0,0,20,10,'#e8b830','#b8881a',2.2);P(c,[-20,0,-27,-6,-27,6]);FS(c,'#b8881a',1.4);
  E(c,7,0,5.5,5.5);FS(c,'#9fd6e8',1.6);c.save();E(c,7,0,5.5,5.5);c.clip();E(c,7,2,4,4.5);c.fillStyle='#e8c4a0';c.fill();L(c,4,2.8,10,2.8,'#ece7d8',2);E(c,5.5,0,1.4,1.4);c.strokeStyle=INK;c.lineWidth=.8;c.stroke();E(c,8.5,0,1.4,1.4);c.stroke();c.restore();
  for(let k=0;k<3;k++){E(c,-12+k*6,5,1.2,1.2);c.fillStyle='#6a5010';c.fill()}c.restore()}
function drawKingShark(c,x,y,s,f,t){drawShark(c,x,y,s,f,t,0);c.save();c.translate(x,y);c.scale(s*f,s);P(c,[-6,-18,-6,-27,-1,-22,3,-30,7,-22,12,-27,12,-18]);FS(c,'#e8c14a',1.6);c.beginPath();c.arc(4,6,7,.1*Math.PI,.9*Math.PI);c.strokeStyle='#e8c14a';c.lineWidth=1.6;c.stroke();c.restore()}
function drawBros(c,x,y,s,f,t){drawShrimp(c,x-8*s,y+2*s,s*.8,1,t,0);drawShrimp(c,x+9*s,y-3*s,s*.8,-1,t+1,0)}

/* ---------- oggetti ---------- */
function drawNigiri(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.roundRect(-5,-2,10,5,2.5);FS(c,'#f3ecd8',1.1);c.beginPath();c.roundRect(-5.5,-4.6,11,3.6,2);FS(c,'#ff7a4f',1.1);c.restore()}
function drawPlate(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);E(c,0,1.5,13,7.5);FS(c,'#1f5a76',1.6);E(c,0,0,13,7.5);FS(c,'#e9e3d0',1.6);E(c,0,0,9.5,5.2);c.fillStyle='#d3dccf';c.fill();drawNigiri(c,-3.2,-.5,.75);drawNigiri(c,3.4,.6,.75);c.restore()}
function drawWasabi(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);E(c,0,3,10,7);FS(c,'#6ea83d',1.8);E(c,0,-2,6.5,6);FS(c,'#8fcf4f',1.8);E(c,-2,-4,1.8,1.4);c.fillStyle='#d8f7b8';c.fill();c.restore()}
function drawSorbet(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);P(c,[-6,0,6,0,0,12]);FS(c,'#c9a36b',1.6);E(c,0,-2,7,6);FS(c,'#bfe9ff',1.6);E(c,-2,-4,2,1.4);c.fillStyle='#fff';c.fill();c.restore()}
function drawTorpedo(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.roundRect(-8,-2.6,16,5.2,2.6);FS(c,'#9aa4a8',1.3);P(c,[-8,0,-12,-4,-12,4]);FS(c,'#c94a3a',1);c.restore()}

/* tabelle di disegno: (c,x,y,scala,verso,tempo,anim,oggetto) */
const DRAW_T={granchio:(c,x,y,s,f,t)=>drawCrab(c,x,y,s,f,t),squalo:(c,x,y,s,f,t,a)=>drawShark(c,x,y,s,f,t,a),rana:(c,x,y,s,f,t,a,o)=>drawAngler(c,x,y,s,f,t,!(o&&o.doused>0)),
  sardine:(c,x,y,s,f,t)=>drawSchool(c,x,y,s,f,t),polipetto:(c,x,y,s,f,t)=>drawIntern(c,x,y,s,f,t),spada:(c,x,y,s,f,t,a)=>drawSwordfish(c,x,y,s,f,t,a),
  medusa:(c,x,y,s,f,t)=>drawJelly(c,x,y,s,t),gamberetto:(c,x,y,s,f,t,a)=>drawShrimp(c,x,y,s,f,t,a),tartaruga:(c,x,y,s,f,t)=>drawTurtle(c,x,y,s,f,t),
  palla:(c,x,y,s,f,t,a)=>drawPuffer(c,x,y,s,t,a),calamaro:(c,x,y,s,f,t)=>drawSquid(c,x,y,s,f,t),lanterna:(c,x,y,s,f,t)=>drawDJ(c,x,y,s,f,t),
  cavalluccio:(c,x,y,s,f,t)=>drawSeahorse(c,x,y,s,f,t),ostrica:(c,x,y,s,f,t,a)=>drawOyster(c,x,y,s,f,t,a),manta:(c,x,y,s,f,t)=>drawMantaT(c,x,y,s,f,t),
  paguro:(c,x,y,s,f,t,a,o)=>drawHermit(c,x,y,s,f,t,o?o.mode:0),balena:(c,x,y,s,f,t,a)=>drawWhale(c,x,y,s,f,t,a)};
const DRAW_E={ghiozzo:drawGoby,aringa:drawHerring,lumaca:drawSnail,isopode:drawIsopod,volante:drawFlyfish,ladro:drawThief,
  stella:(c,x,y,s,f,t)=>drawStarE(c,x,y,s,f,t,0),stellina:(c,x,y,s,f,t)=>drawStarE(c,x,y,s,f,t,1),murena:drawEel,chirurgo:drawSurgeon,
  riccio:drawRolling,nudi:drawNudi,vipera:drawViper,martello:(c,x,y,s,f,t,e)=>drawHammer(c,x,y,s,f,t,e&&e.dash>0),
  rivale:(c,x,y,s,f,t,e)=>drawRival(c,x,y,s,f,t,e&&e.disg),
  reAragosta:(c,x,y,s,f,t)=>drawLobster(c,x,y,s,t),granchioReale:(c,x,y,s,f,t,e)=>drawKingCrab(c,x,y,s,t,e?e.grow||1:1),
  kraken:(c,x,y,s,f,t)=>drawKraken(c,x,y,s,t),lanternaGigante:(c,x,y,s,f,t,e)=>drawAngler(c,x,y,s*2.1,f,t,!(e&&e.lureOff)),
  leviatano:(c,x,y,s,f,t)=>drawLevi(c,x,y,s,f,t),megalodonte:(c,x,y,s,f,t,e)=>drawMega(c,x,y,s,f,t,e&&e.rage)};
const DRAW_M={polpo:(c,x,y,s,t)=>drawOcto(c,x,y,s,t),pagliaccio:(c,x,y,s,t)=>drawClown(c,x,y,s*1.4,1,t),narvalo:(c,x,y,s,t)=>drawNarwhal(c,x,y,s*1.2,1,t),
  gamberi:(c,x,y,s,t)=>drawBros(c,x,y,s*1.3,1,t),nonno:(c,x,y,s,t)=>drawSub(c,x,y,s*1.3,1,t),squalo:(c,x,y,s,t)=>drawKingShark(c,x,y,s*1.2,1,t)};

function icon(fn,w=48,h=48){const cc=document.createElement('canvas');cc.width=w*2;cc.height=h*2;const c=cc.getContext('2d');c.scale(2,2);fn(c);return cc.toDataURL()}
const ICON_SCALE={sardine:1.3,balena:.8,manta:.95,spada:.85,medusa:1,palla:1.05,rana:.95,paguro:.95};
const ESCALE={reAragosta:.75,granchioReale:.62,kraken:.7,lanternaGigante:.62,leviatano:.42,megalodonte:.6,isopode:1.05,murena:1,stella:1.2,lumaca:1.05,martello:1};
const ICONS={t:{},e:{},m:{}};
function buildIcons(){
  for(const k of TOWER_KEYS){const sc=ICON_SCALE[k]||1;ICONS.t[k]=icon(c=>DRAW_T[k](c,k==='spada'?20:24,k==='rana'||k==='cavalluccio'||k==='balena'?29:26,sc,1,.3,0,{}))}
  for(const k of MONSTER_KEYS.concat(['stellina'])){const sc=ESCALE[k]||1.15;ICONS.e[k]=icon(c=>DRAW_E[k](c,k==='leviatano'?36:24,k==='reAragosta'?28:k==='lanternaGigante'?30:26,sc,1,.3,{}))}
  for(const k of MANAGER_KEYS)ICONS.m[k]=icon(c=>DRAW_M[k](c,24,k==='polpo'?30:26,k==='polpo'?.85:.95,.4),48,48)}
