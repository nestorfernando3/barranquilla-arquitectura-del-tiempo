/** Reconstrucción paramétrica a partir de la lámina aportada el 2026-09-09. */
import {writeFileSync} from 'node:fs';
const parts=[];
const blue='#6b7f8f', cream='#ead9a6', white='#f2eedc', glass='#344952', dark='#4a4f56';
function box(name,p,s,material=blue,r){parts.push({type:'box',name,p,s,material,role:'building',evidence:'inferred',...(r?{r}: {})});}
function arc(name,cx,cz,rad,y,h,material,thickness){parts.push({type:'arcWall',name,p:[cx,y,cz],s:[rad*2,h,rad*2],material,role:'building',evidence:'inferred',innerRadius:thickness?1-thickness/rad:0.001,start:0,sweep:Math.PI/2,seg:40});}
// A rectangular footprint with its southeast corner rounded.
function floor(name,x0,x1,z0,z1,rad,y,h,mat){const cx=x1-rad,cz=z1-rad;box(name+' oeste',[(x0+cx)/2,y,(z0+z1)/2],[cx-x0,h,z1-z0],mat);box(name+' norte',[(cx+x1)/2,y,(z0+cz)/2],[rad,h,cz-z0],mat);arc(name+' esquina',cx,cz,rad,y,h,mat);}
function rim(name,x0,x1,z0,z1,rad,y,h,mat,t=.16){const cx=x1-rad,cz=z1-rad;box(name+' frente',[(x0+cx)/2,y,z1-t/2],[cx-x0,h,t],mat);box(name+' lateral',[x1-t/2,y,(z0+cz)/2],[t,h,cz-z0],mat);arc(name+' curva',cx,cz,rad,y,h,mat,t);box(name+' fondo',[(x0+x1)/2,y,z0+t/2],[x1-x0,h,t],mat);box(name+' oeste',[x0+t/2,y,(z0+z1)/2],[t,h,z1-z0],mat);}
function window(name,x,y,z,w=1.05,h=1.35,a=0){const sin=Math.sin(a),cos=Math.cos(a);function q(label,dx,dy,dz,s,mat){box(name+' '+label,[x+dx*cos+dz*sin,y+dy,z-dx*sin+dz*cos],s,mat,[0,a,0]);}q('marco',0,0,0,[w+.17,h+.17,.12],white);q('vidrio',0,0,.075,[w,h,.06],glass);q('parteluz',0,0,.12,[.055,h,.04],white);q('travesaño',0,0,.12,[w,.055,.04],white);q('alféizar',0,-h/2-.08,.1,[w+.25,.11,.27],cream);}
const tiers=[[-10,10,-9,9,5,0,3.2],[-10,9.7,-9,8.7,4.8,3.2,6.2],[-8.8,8.3,-8.4,7.3,4.3,6.2,9.2],[-7.4,6.8,-7.8,5.8,3.7,9.2,12.2]];
for(const [i,t] of tiers.entries()){
 const [x0,x1,z0,z1,rad,b,top]=t,cx=x1-rad,cz=z1-rad;
 floor('Cuerpo '+i,x0,x1,z0,z1,rad,(b+top)/2,top-b,i?blue:dark);
 floor('Losa terraza '+i,x0-.38,x1+.48,z0-.18,z1+.48,rad+.48,top,.2,cream);
 rim('Antepecho '+i,x0-.38,x1+.48,z0-.18,z1+.48,rad+.48,top+.46,.78,blue);
 rim('Pasamanos '+i,x0-.38,x1+.5,z0-.18,z1+.5,rad+.5,top+.88,.09,white,.21);
 if(i){
  for(let x=x0+1.1;x<cx-.35;x+=1.7)window('Ventana frontal '+i,x,b+1.65,z1+.035,1.15,1.2);
  for(let z=z0+1.1;z<cz-.35;z+=1.7)window('Ventana lateral '+i,x1+.035,b+1.65,z,1.15,1.2,Math.PI/2);
  for(let k=0;k<7;k++){let a=(k+.5)*Math.PI/14;window('Ventana curva '+i,cx+(rad+.035)*Math.cos(a),b+1.65,cz+(rad+.035)*Math.sin(a),.78,1.2,Math.PI/2-a);}
 } else {
  for(let x=x0+1.25;x<cx-.4;x+=2.6){box('Persiana comercial',[x,1.5,z1+.04],[2.05,2.65,.12],'#69757b');for(let y=.35;y<2.8;y+=.17)box('Lama persiana',[x,y,z1+.12],[2.02,.025,.025],dark);box('Pilar',[x+1.2,1.5,z1+.17],[.25,3,.32],cream);}
  for(let z=z0+1.3;z<cz-.3;z+=2.6){box('Persiana lateral',[x1+.04,1.5,z],[.12,2.65,2.05],'#69757b');for(let y=.35;y<2.8;y+=.17)box('Lama lateral',[x1+.12,y,z],[.025,.025,2.02],dark);}
  for(let k=0;k<7;k++){let a=(k+.5)*Math.PI/14;window('Acceso acristalado',cx+(rad+.04)*Math.cos(a),1.48,cz+(rad+.04)*Math.sin(a),.75,2.55,Math.PI/2-a);}
 }
 for(let x=x0+1.1;x<x1-.5;x+=2)window('Ventana posterior '+i,x,(b+top)/2,z0-.03,1,1.25,Math.PI);
 for(let z=z0+1.1;z<z1-.5;z+=2)window('Ventana oeste '+i,x0-.03,(b+top)/2,z,1,1.25,-Math.PI/2);
}
for(const [j,t] of [[-5.8,4.6,-7,2.4,12.2,14.6],[-3.8,3.2,-6.4,.4,14.6,17]].entries()){
 const [x0,x1,z0,z1,b,top]=t;
 box('Volumen superior '+j,[(x0+x1)/2,(b+top)/2,(z0+z1)/2],[x1-x0,top-b,z1-z0]);
 box('Cubierta superior '+j,[(x0+x1)/2,top,(z0+z1)/2],[x1-x0+.15,.14,z1-z0+.15],cream);
 for(const z of [z0,z1]){for(let x=x0+1.2;x<x1-.6;x+=2.15)window('Ventana torre '+j,x,b+1.2,z+(z===z0?-.04:.04),.92,1.15,z===z0?Math.PI:0);box('Parapeto torre',[(x0+x1)/2,top+.24,z],[x1-x0,.42,.15]);box('Remate torre',[(x0+x1)/2,top+.47,z],[x1-x0+.12,.08,.23],white);}
 for(const x of [x0,x1]){for(let z=z0+1.15;z<z1-.6;z+=2.1)window('Ventana torre lateral '+j,x+(x===x0?-.04:.04),b+1.2,z,.92,1.15,x===x0?-Math.PI/2:Math.PI/2);box('Parapeto lateral torre',[x,top+.24,(z0+z1)/2],[.15,.42,z1-z0]);box('Remate lateral torre',[x,top+.47,(z0+z1)/2],[.23,.08,z1-z0],white);}
}
box('Caseta de cubierta',[-.5,17.75,-3.5],[1.9,1,1.6]);box('Tapa caseta',[-.5,18.27,-3.5],[2,.12,1.7],white);
// Small terrace planters remain discrete, leaving the architecture readable.
for(const [x,y,z] of [[-8.9,3.55,7.8],[-8,6.55,6.3],[-6.5,9.55,4.8],[-4.9,12.55,1.5],[5.7,9.55,-5],[7.3,6.55,-6],[3.7,12.55,-5.7]]){
 box('Jardinera',[x,y,z],[1.15,.42,.65],cream);
 for(let k=0;k<3;k++)parts.push({type:'dome',name:'Vegetación de terraza',p:[x+(k-1)*.3,y+.34,z],s:[.52,.6+(k%2)*.25,.5],material:k%2?'#657449':'#465d3c',role:'building',evidence:'inferred',seg:8,rings:4});
}
const scene={slug:'edificio-garcia',name:'Edificio García',frontAxis:'+z',parts};
writeFileSync(new URL('../scenes/edificio-garcia.json',import.meta.url),JSON.stringify(scene,null,2)+'\n');
console.log(`Edificio García: ${parts.length} componentes`);
