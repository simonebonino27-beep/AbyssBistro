'use strict';
/* ===== Abyss Bistro: disegni dei personaggi nuovi (stesso stile: contorni spessi, occhi stralunati) ===== */
function chefHat(c,x,y,s=1){E(c,x-4*s,y-3*s,4.5*s,4*s);FS(c,'#f4f0e6',1.4);E(c,x+4*s,y-3*s,4.5*s,4*s);FS(c,'#f4f0e6',1.4);E(c,x,y-6*s,5*s,4.5*s);FS(c,'#f4f0e6',1.4);c.beginPath();c.rect(x-6*s,y-1*s,12*s,4*s);FS(c,'#f4f0e6',1.4)}

/* ---------- dipendenti ---------- */
function drawPiranha(c,x,y,s,f,t,a=0){c.save();c.translate(x+f*a*4,y);c.scale(s*f,s);c.rotate(Math.sin(t*9)*.05);
  P(c,[-12,0,-21,-8,-18,0,-21,8]);FS(c,'#8a2a2a',1.6);
  P(c,[-3,-10,3,-17,7,-9]);FS(c,'#6f7c86',1.4);
  body(c,0,0,14,11,'#8f9ca6','#66727c',2.2);
  c.save();E(c,0,0,14,11);c.clip();E(c,2,8,13,7);c.fillStyle='#d8452b';c.fill();c.restore();E(c,0,0,14,11);c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.moveTo(4,2);c.quadraticCurveTo(12,9,16,1);c.lineTo(16,-1);c.closePath();FS(c,'#3b0d16',1.4);
  for(let k=0;k<4;k++){P(c,[6+k*2.6,2.5,7.3+k*2.6,-1.5,8.6+k*2.6,2.5]);FS(c,'#efe7c6',.7);P(c,[7+k*2.4,5.5,8.2+k*2.4,8.6,9.4+k*2.4,5.2]);FS(c,'#efe7c6',.7)}
  c.beginPath();c.rect(-9,2,10,6);FS(c,'#f1ead2',1.1);L(c,-9,4,1,4,'#c9bfa0',.8);
  madEye(c,5,-5,4.2,{p:.2,vein:1,lx:.7});L(c,1,-10,9,-8,INK,2.2);c.restore()}
function drawPizzaiola(c,x,y,s,f,t,a=0){c.save();c.translate(x,y);c.scale(s*f,s);
  for(const i of[-1,1])for(let k=0;k<2;k++)limb(c,[i*7,4+k*3,i*12,8+k*3,i*14,12+k*3],'#c25a24',1.6);
  P(c,[-6,8,-12,14,-4,12,0,16,4,12,12,14,6,8]);FS(c,'#d8682c',1.4);
  body(c,0,0,10,10,'#e87a3a','#b8562a',2);
  c.beginPath();c.rect(-7,0,14,8);FS(c,'#f4f0e6',1.1);
  limb(c,[8,-2,15,-8],'#e87a3a',2.4);c.save();c.translate(16,-11+Math.sin(t*4)*1.5);c.rotate(-.3);L(c,-6,6,6,-4,'#8f5f3d',2.2);E(c,7,-6,8,4,-.3);FS(c,'#e8b54a',1.4);
  for(const[px,py]of[[5,-6],[9,-7],[7,-4]]){E(c,px,py,1.4,1.2);c.fillStyle='#c41e2a';c.fill()}c.restore();
  limb(c,[-8,-2,-13,-6],'#e87a3a',2.2);limb(c,[-3,-8,-6,-15],'#c25a24',1.2);limb(c,[3,-8,6,-15],'#c25a24',1.2);
  madEye(c,-3.5,-4,3.2,{lid:.4,skin:'#e87a3a',lx:.4,vein:1});madEye(c,3.5,-4.5,3.6,{p:.24,lx:.2,ly:.3});
  grin(c,0,2,8,2.6,{n:4});chefHat(c,0,-12,.9);c.restore()}
function drawIceFish(c,x,y,s,f,t){c.save();c.translate(x,y+Math.sin(t*2)*1);c.scale(s*f,s);
  P(c,[-12,0,-21,-8,-18,0,-21,8]);FS(c,'#8fc6ea',1.6);
  body(c,0,0,14,10,'#c6e6f5','#8fbcd6',2.1);
  for(let k=0;k<3;k++){E(c,-6+k*5,-2+(k%2)*4,1.6,1.2);c.fillStyle='rgba(255,255,255,.7)';c.fill()}
  P(c,[6,-7,14,-26,20,-7]);FS(c,'#d9a85a',1.6);for(let k=0;k<3;k++)L(c,8+k*3,-9,12+k*2,-20+k*3,'rgba(90,50,20,.6)',.8);
  E(c,13,-27,7,5.5);FS(c,'#f3a6c4',1.6);E(c,10,-31,5,4);FS(c,'#f4f0e6',1.4);E(c,15,-33,2,2);c.fillStyle='#c41e2a';c.fill();
  madEye(c,5,-3,3.8,{lid:.5,tilt:-1,skin:'#c6e6f5',lx:.5});E(c,9,4,2.6,1.4);FS(c,'#3b0d16',1);
  for(let k=0;k<3;k++){const a=t*1.5+k*2.1;E(c,-14+Math.cos(a)*16,-12+Math.sin(a)*6,1.2,1.2);c.fillStyle='rgba(220,245,255,.8)';c.fill()}c.restore()}
function drawSawfish(c,x,y,s,f,t,a=0){c.save();c.translate(x+f*a*6,y);c.scale(s*f,s);
  P(c,[-14,0,-23,-8,-20,0,-23,8]);FS(c,'#5f6a70',1.6);
  c.beginPath();c.rect(12,-3,22,5);FS(c,'#8a949a',1.4);for(let k=0;k<6;k++){P(c,[14+k*3.6,-3,15.8+k*3.6,-6.5,17.6+k*3.6,-3]);FS(c,'#efe7c6',.6);P(c,[14+k*3.6,2,15.8+k*3.6,5.5,17.6+k*3.6,2]);FS(c,'#efe7c6',.6)}
  body(c,0,0,16,10,'#7d878d','#5a6368',2.2);
  c.beginPath();c.rect(-8,-1,12,9);FS(c,'#f1ead2',1.2);for(const[bx,by]of[[-5,3],[0,6],[-2,1]]){E(c,bx,by,1.4,1);c.fillStyle='#b01e2a';c.fill()}
  madEye(c,6,-4,3.8,{lid:.55,tilt:2,skin:'#7d878d',lx:.6,vein:1});L(c,2,-9,10,-7.5,INK,2.4);
  L(c,-4,-10,-1,-14,INK,1.4);c.restore()}
function drawScorpion(c,x,y,s,f,t,a=0){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let k=0;k<7;k++){const ax=-10+k*3.4;limb(c,[ax,-6,ax-2,-15-Math.sin(t*3+k)*1.2],'#f1ead2',1.1);L(c,ax,-6,ax-2,-15,'#b8321d',.6)}
  P(c,[-12,0,-20,-7,-18,0,-20,7]);FS(c,'#b8321d',1.6);
  body(c,0,0,14,10,'#d8452b','#a82e1a',2.2);
  c.save();E(c,0,0,14,10);c.clip();for(const bx of[-7,-1,5]){c.beginPath();c.rect(bx,-10,2.6,20);c.fillStyle='#f4e6d0';c.fill()}c.restore();E(c,0,0,14,10);c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.arc(2,-8,8,Math.PI,0);FS(c,'#5c6b3a',1.6);L(c,-7,-8,11,-8,INK,2);
  madEye(c,6,-2,3.6,{p:.18,vein:1,lx:.6});madEye(c,0,-1,2.8,{p:.3,lx:.6,ly:.3});
  limb(c,[8,4,15,2],'#d8452b',2);E(c,18,0,4.6,4.6);FS(c,'#20262b',1.4);L(c,20,-4,23,-8+Math.sin(t*20),'#e8c14a',1.4);glowAt(c,23,-8,6,'rgba(255,200,80,A)',.7+.3*Math.sin(t*20));c.restore()}
function drawDolphin(c,x,y,s,f,t,a=0){c.save();c.translate(x,y+Math.sin(t*2.4)*1.2);c.scale(s*f,s);
  P(c,[-15,-2,-24,-10,-21,-1,-24,7]);FS(c,'#5f86a6',1.6);
  P(c,[-3,-9,2,-19,6,-9]);FS(c,'#5f86a6',1.4);
  body(c,0,0,17,10,'#7aa4c4','#56809f',2.2);
  c.save();E(c,0,0,17,10);c.clip();E(c,3,7,15,5);c.fillStyle='#e6ecef';c.fill();c.restore();E(c,0,0,17,10);c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.moveTo(14,-1);c.quadraticCurveTo(22,0,23,3);c.quadraticCurveTo(19,5,14,4);c.closePath();FS(c,'#7aa4c4',1.6);
  P(c,[3,5,-1,2,-1,8]);FS(c,'#20262b',1.2);P(c,[3,5,7,2,7,8]);FS(c,'#20262b',1.2);E(c,3,5,1.4,1.4);c.fillStyle='#c41e2a';c.fill();
  madEye(c,9,-3,3.4,{lid:.5,tilt:-1.5,skin:'#7aa4c4',lx:.4});L(c,6,-7.5,12,-7,INK,1.6);
  limb(c,[-6,6,-11,12],'#7aa4c4',2.2);c.save();c.translate(-12,13);c.rotate(-.2);c.beginPath();c.rect(-5,-4,9,8);FS(c,'#7a1e24',1.2);L(c,-3,-1,2,-1,'#e8c14a',.8);L(c,-3,1.5,2,1.5,'#e8c14a',.8);c.restore();c.restore()}
function drawJuggler(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);
  for(let k=0;k<6;k++){const a=Math.PI*.2+k*Math.PI*.12;limb(c,[Math.cos(a)*6,6,Math.cos(a)*14+Math.sin(t*6+k)*2,14],'#6a5aa8',2.2)}
  body(c,0,-2,12,11,'#8a78c8','#6a5aa8',2.2);
  for(let k=0;k<5;k++){E(c,-6+hash2(k,4)*12,-6+hash2(k,5)*9,1.5,1.2);c.fillStyle='#5a4a98';c.fill()}
  for(const i of[-1,1])limb(c,[i*9,0,i*16,-8,i*13,-16],'#8a78c8',2.4);
  for(let k=0;k<3;k++){const a=t*4+k*TAU/3,nx=Math.cos(a)*11,ny=-24+Math.sin(a)*6;drawNigiri(c,nx,ny,.75)}
  madEye(c,-4,-4,3.8,{p:.22,lx:.2,ly:-.9,vein:1});madEye(c,4.5,-4.5,3.8,{p:.22,lx:-.2,ly:-.9,vein:1});
  grin(c,0,3,9,3,{n:5,gold:2});c.beginPath();c.moveTo(-9,-11);c.lineTo(-3,-14);c.lineTo(0,-11);c.lineTo(3,-14);c.lineTo(9,-11);c.lineTo(6,-8);c.lineTo(-6,-8);c.closePath();FS(c,'#e8c14a',1.3);c.restore()}

/* ---------- incantesimi ---------- */
function drawNet(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-14,-10);c.quadraticCurveTo(0,-16,14,-10);c.quadraticCurveTo(18,4,10,14);c.quadraticCurveTo(0,18,-10,14);c.quadraticCurveTo(-18,4,-14,-10);c.closePath();c.fillStyle='rgba(241,220,162,.25)';c.fill();
  c.save();c.clip();for(let k=-4;k<=4;k++){L(c,k*4-8,-18,k*4+8,18,'#c9b98a',1.2);L(c,k*4+8,-18,k*4-8,18,'#c9b98a',1.2)}c.restore();
  c.strokeStyle=INK;c.lineWidth=2;c.stroke();for(const[a,b]of[[-14,-10],[14,-10],[10,14],[-10,14]]){E(c,a,b,2.6,2.6);FS(c,'#e8c14a',1.2)}
  L(c,-14,-10,-20,-18,'#8f5f3d',2.4);c.restore()}
function drawCoffee(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  for(let k=0;k<3;k++){c.beginPath();c.moveTo(-5+k*5,-10);c.bezierCurveTo(-8+k*5,-15,-2+k*5,-17,-5+k*5,-22-Math.sin((t||0)*3+k)*1.5);c.strokeStyle='rgba(240,240,230,.7)';c.lineWidth=1.6;c.stroke()}
  c.beginPath();c.moveTo(-11,-8);c.lineTo(11,-8);c.lineTo(8,10);c.lineTo(-8,10);c.closePath();FS(c,'#f4f0e6',2);E(c,0,-8,11,3);FS(c,'#5a3a22',1.4);
  c.beginPath();c.arc(12,0,4.5,-Math.PI/2,Math.PI/2);c.strokeStyle=INK;c.lineWidth=4.2;c.stroke();c.strokeStyle='#f4f0e6';c.lineWidth=2.2;c.stroke();
  E(c,0,12,15,3.4);FS(c,'#d9d2bc',1.6);madEye(c,-3.5,0,2.4,{p:.3,vein:1});madEye(c,3.5,0,2.4,{p:.3,vein:1,lx:.5});c.restore()}

/* ---------- mostri ---------- */
function drawCleaner(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s*f,s);c.rotate(Math.sin(t*8)*.06);
  P(c,[-11,0,-19,-7,-17,0,-19,7]);FS(c,'#2f6fb0',1.6);
  body(c,0,0,13,8,'#4f98d8','#2f6fb0',2);
  c.save();E(c,0,0,13,8);c.clip();c.beginPath();c.rect(-14,-1.6,30,3.2);c.fillStyle='#14202a';c.fill();c.restore();E(c,0,0,13,8);c.lineWidth=2;c.strokeStyle=INK;c.stroke();
  limb(c,[4,5,9,11],'#4f98d8',1.8);c.beginPath();c.roundRect(7,9,8,6,2);FS(c,'#e8d84a',1.2);for(let k=0;k<3;k++){E(c,9+k*2.3,11+(k%2)*2,.8,.8);c.fillStyle='#b8a82a';c.fill()}
  for(let k=0;k<3;k++){const a=t*2+k*2.1;E(c,-3+Math.cos(a)*9,-12+Math.sin(a)*3,1.6,1.6);c.strokeStyle='rgba(220,245,255,.8)';c.lineWidth=.9;c.stroke()}
  madEye(c,6,-3,3.4,{lid:.35,skin:'#4f98d8',lx:.5});grin(c,9,2,5,1.6,{n:3});c.restore()}
function drawKamikaze(c,x,y,s,f,t){c.save();c.translate(x,y);c.scale(s,s);const r=10+Math.sin(t*10)*.6;
  for(let k=0;k<12;k++){const a=k/12*TAU;P(c,[Math.cos(a-.15)*r,Math.sin(a-.15)*r,Math.cos(a)*(r+5),Math.sin(a)*(r+5),Math.cos(a+.15)*r,Math.sin(a+.15)*r]);FS(c,'#8a2a1a',1.2)}
  body(c,0,0,r,r,'#d8452b','#a82e1a',2.2);
  c.beginPath();c.rect(-11,-4,22,4);FS(c,'#f4f0e6',1);L(c,-11,-2,11,-2,'#c41e2a',1);
  madEye(c,-4,-1,3.6,{p:.16,vein:1,lx:.5});madEye(c,4,-1.5,3.2,{p:.3,vein:1,lx:-.4,ly:.4});
  E(c,0,5,3,2);FS(c,'#3b0d16',1.2);
  L(c,0,-r,4,-r-8,'#5a3a22',1.6);const g=.6+.4*Math.sin(t*25);glowAt(c,5,-r-9,7,'rgba(255,200,60,A)',g);E(c,5,-r-9,1.8,1.8);c.fillStyle='#ffd84a';c.fill();c.restore()}

/* ---------- gestori ---------- */
function drawCountess(c,x,y,s,t){c.save();c.translate(x,y+Math.sin(t*2)*1.5);c.scale(s,s);
  for(let k=0;k<6;k++){c.beginPath();const bx=-9+k*3.6;c.moveTo(bx,4);c.quadraticCurveTo(bx+Math.sin(t*3+k)*4,12,bx+Math.sin(t*2+k)*2,20);c.strokeStyle='#c99ad8';c.lineWidth=1.8;c.stroke()}
  c.beginPath();c.moveTo(-14,5);c.quadraticCurveTo(-15,-14,0,-15);c.quadraticCurveTo(15,-14,14,5);c.quadraticCurveTo(0,1,-14,5);c.closePath();c.fillStyle='rgba(210,160,230,.9)';c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();
  for(let k=0;k<4;k++){E(c,-8+k*5.3,-6,1.4,1.4);c.fillStyle='rgba(255,255,255,.6)';c.fill()}
  madEye(c,-4,-6,3,{lid:.55,skin:'#d2a0e6'});madEye(c,4.5,-6,3.4,{lid:.45,tilt:1,skin:'#d2a0e6',lx:.3});c.beginPath();c.arc(4.5,-6,4.6,0,TAU);c.strokeStyle='#e8c14a';c.lineWidth=1.2;c.stroke();L(c,9,-5,11,4,'#e8c14a',.8);
  c.beginPath();c.moveTo(-8,-14);c.lineTo(-5,-20);c.lineTo(-2,-15);c.lineTo(0,-22);c.lineTo(2,-15);c.lineTo(5,-20);c.lineTo(8,-14);c.closePath();FS(c,'#e8c14a',1.3);E(c,0,-19,1.4,1.4);c.fillStyle='#46aee8';c.fill();
  c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(0,-1.5,3,0);c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();c.restore()}
function drawBanker(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  for(const i of[-1,1])for(let k=0;k<3;k++)limb(c,[i*9,4+k*3,i*14,7+k*3,i*17,11+k*3],'#8a4a2a',1.6);
  body(c,0,2,13,9,'#c86a3a','#94482a',2.1);
  c.beginPath();c.moveTo(-9,4);c.lineTo(0,10);c.lineTo(9,4);c.lineTo(9,10);c.lineTo(-9,10);c.closePath();FS(c,'#20262b',1.2);P(c,[0,4,-2,8,0,11,2,8]);FS(c,'#c41e2a',.8);
  limb(c,[11,-1,18,-7],'#c86a3a',2.6);E(c,20,-10,5,5);FS(c,'#e8c14a',1.4);c.font='bold 7px sans-serif';c.textAlign='center';c.fillStyle='#8a6a1a';c.fillText('€',20,-7.5);
  limb(c,[-11,-1,-15,-5],'#c86a3a',2.6);
  madEye(c,-4,-6,3,{lid:.5,skin:'#c86a3a'});madEye(c,4,-6,3.2,{p:.2,lx:.3});c.beginPath();c.arc(4,-6,4.4,0,TAU);c.strokeStyle='#e8c14a';c.lineWidth=1.1;c.stroke();
  c.beginPath();c.rect(-6,-22,12,11);FS(c,'#20262b',1.6);E(c,0,-11,10,2.4);FS(c,'#20262b',1.6);c.beginPath();c.rect(-6,-15,12,2.4);c.fillStyle='#c41e2a';c.fill();
  L(c,-4,2,4,2,INK,1.4);c.restore()}
function drawSeppia(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  for(let k=0;k<6;k++)limb(c,[-6+k*2.6,8,-8+k*3.2+Math.sin(t*5+k)*1.5,16],'#c08a6a',1.6);
  c.beginPath();c.ellipse(0,0,13,10,0,0,TAU);c.fillStyle='#d9a080';c.fill();c.save();c.clip();for(let k=0;k<6;k++){E(c,-10+k*4,-6+(k%2)*5,2,1.4);c.fillStyle='#b87a5a';c.fill()}c.restore();c.lineWidth=2.1;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.moveTo(-13,0);c.quadraticCurveTo(-16,8,-11,8);c.moveTo(13,0);c.quadraticCurveTo(16,8,11,8);c.strokeStyle='#c08a6a';c.lineWidth=2;c.stroke();
  for(const cx of[-7,-1,5]){E(c,cx,-10,3,2.4);FS(c,'#f3a6c4',1.1)}
  madEye(c,-4,-2,3.2,{lid:.5,tilt:-1.5,skin:'#d9a080',lx:.4});madEye(c,4,-2,3.2,{lid:.5,tilt:1.5,skin:'#d9a080',lx:-.4});
  c.beginPath();c.moveTo(-3,4);c.quadraticCurveTo(0,2.5,3,4);c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();
  limb(c,[10,2,17,-6],'#d9a080',2.2);c.save();c.translate(18,-9);c.rotate(-.6+Math.sin(t*4)*.2);c.beginPath();c.roundRect(-2.5,-10,5,18,2);FS(c,'#c99a5a',1.3);c.restore();c.restore()}
function drawTsunami(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);
  c.beginPath();c.moveTo(-18,10);c.quadraticCurveTo(-20,-6,-6,-12);c.quadraticCurveTo(4,-16,10,-8);c.quadraticCurveTo(4,-10,2,-4);c.quadraticCurveTo(10,-2,16,6);c.lineTo(16,10);c.closePath();c.fillStyle='rgba(70,174,232,.85)';c.fill();c.strokeStyle=INK;c.lineWidth=1.8;c.stroke();
  for(let k=0;k<4;k++){E(c,-14+k*7,-8+Math.sin(t*3+k)*1.5,1.6,1.2);c.fillStyle='#e6f6ff';c.fill()}
  P(c,[-12,4,-20,-2,-18,5,-20,10]);FS(c,'#20262b',1.4);
  body(c,0,4,14,8,'#2a3038','#151a20',2);c.save();E(c,0,4,14,8);c.clip();E(c,4,10,12,5);c.fillStyle='#f4f0e6';c.fill();E(c,6,1,3,2);c.fill();c.restore();E(c,0,4,14,8);c.lineWidth=2;c.strokeStyle=INK;c.stroke();
  madEye(c,5,1,2.8,{p:.24,lx:.5,vein:1});grin(c,9,6,6,2,{n:4});chefHat(c,0,-12,.9);c.restore()}

/* registrazione */
Object.assign(DRAW_T,{piranha:(c,x,y,s,f,t,a)=>drawPiranha(c,x,y,s,f,t,a),aragostina:(c,x,y,s,f,t)=>drawPizzaiola(c,x,y,s,f,t),gelataio:(c,x,y,s,f,t)=>drawIceFish(c,x,y,s,f,t),
  macellaio:(c,x,y,s,f,t,a)=>drawSawfish(c,x,y,s,f,t,a),artificiere:(c,x,y,s,f,t,a)=>drawScorpion(c,x,y,s,f,t,a),delfino:(c,x,y,s,f,t,a)=>drawDolphin(c,x,y,s,f,t,a),giocoliere:(c,x,y,s,f,t)=>drawJuggler(c,x,y,s,f,t),
  wasabi:(c,x,y,s)=>drawWasabi(c,x,y+6,s*1.6),rete:(c,x,y,s)=>drawNet(c,x,y+6,s),onda:(c,x,y,s)=>drawSorbet(c,x,y+2,s*1.6),caffe:(c,x,y,s,f,t)=>drawCoffee(c,x,y+6,s,t)});
Object.assign(DRAW_E,{pulitore:drawCleaner,kamikaze:drawKamikaze});
Object.assign(DRAW_M,{contessa:(c,x,y,s,t)=>drawCountess(c,x,y,s*1.15,t),banchiere:(c,x,y,s,t)=>drawBanker(c,x,y,s*1.1,t),seppia:(c,x,y,s,t)=>drawSeppia(c,x,y,s*1.15,t),tsunami:(c,x,y,s,t)=>drawTsunami(c,x,y,s*1.05,t)});
Object.assign(ICON_SCALE,{giocoliere:.9,macellaio:.68,delfino:.9,wasabi:1,onda:1});
