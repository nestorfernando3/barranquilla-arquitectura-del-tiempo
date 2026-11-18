import {teatroRex} from './teatro-rex.mjs';
import {estacionMontoya} from './estacion-montoya.mjs';
/** Idempotent refinements; baseline scenes are immutable inputs. */
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const base=new URL('../baselines/2026-09-09/',import.meta.url),out=new URL('../scenes/',import.meta.url);
const cream='#eee7d6',metal='#394648',glass='#42565b';
let scene,parts;
function add(type,name,p,s,material,extra={}){const q={type,name,p,...(s?{s}:{}),material,role:'building',evidence:'inferred',...extra};parts.push(q);return q;}
const box=(n,p,s,c=cream,r)=>add('box',n,p,s,c,r?{r}:{});
function face(n,x,y,z,w,h,a=0,c=cream){
 const sn=Math.sin(a),cs=Math.cos(a);return (label,dx,dy,dz,sw,sh,sd,mat=c)=>box(n+' · '+label,[x+dx*cs+dz*sn,y+dy,z-dx*sn+dz*cs],[sw,sh,sd],mat,[0,a,0]);
}
function frame(n,x,y,z,w,h,a=0,c=cream,filled=false){const f=face(n,x,y,z,w,h,a,c),t=Math.min(.09,w*.09);
 if(filled)f('vidrio',0,0,0,w,h,.08,glass);
 for(const dx of [-w/2,w/2])f('jamba',dx,0,.055,t,h+.12,.1);
 for(const dy of [-h/2,h/2])f('dintel',0,dy,.055,w+.12,t,.1);
 f('montante',0,0,.06,t*.7,h,.07);f('travesaño',0,h*.1,.06,w,t*.7,.07);
 f('alféizar',0,Math.max(-h/2-.1,.065-y),.09,w+.28,.13,.28);
}
function rail(n,x,y,z,w,a=0,c=metal,h=.75){const f=face(n,x,y,z,w,h,a,c);f('pasamanos',0,h/2,0,w,.065,.08);f('travesaño inferior',0,-h/2,0,w,.05,.06);const count=Math.ceil(w/.22);for(let i=0;i<=count;i++)f('barrote',-w/2+w*i/count,0,0,.035,h,.045);}
function gridCells(q,fn){const [w,h,d]=q.cell,[nx,ny]=q.count,[gx,gy]=q.gap??[0,0];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const u=(i-(nx-1)/2)*(w+gx),v=(j-(ny-1)/2)*(h+gy);fn(q.axis==='z'?q.p[0]+d/2:q.p[0]+u,q.p[1]+v,q.axis==='z'?q.p[2]+u:q.p[2]+d/2,w,h,q.axis==='z'?Math.PI/2:0);}}
function edging(q){const [x,y,z]=q.p,[w,h,d]=q.s;for(let side of [-1,1]){box(q.name+' · perfil frontal',[x,y+h/2+.045,z+side*d/2],[w+.08,.09,.1],cream);box(q.name+' · perfil lateral',[x+side*w/2,y+h/2+.045,z],[.1,.09,d],cream);}}
function openParapet(q){const [x,y,z]=q.p,[w,h,d]=q.s;q.s=[w,.12,d];q.p[1]=y-h/2+.06;q.material='#a79f8e';for(let side of [-1,1]){box('Muro de '+q.name,[x,y,z+side*(d/2-.09)],[w,h,.18],q._oldMaterial??cream);box('Muro de '+q.name,[x+side*(w/2-.09),y,z],[.18,h,d],q._oldMaterial??cream);}}
function arches(n,x,y,z,count,step,w,h,a=0){for(let i=0;i<count;i++){let u=(i-(count-1)/2)*step;add('arch',n,[x+u*Math.cos(a),y,z-u*Math.sin(a)],[w,h,.1],glass,{r:[0,a,0],arch:'round',seg:24});const f=face(n,x+u*Math.cos(a),y,z-u*Math.sin(a),w,h,a);f('montante',0,-h*.12,.08,.06,h*.68,.06);f('división',0,-h*.05,.08,w,.06,.06);}}
function tileHipRoof(q){const [x,y,z]=q.p,[w,h,d]=q.s,az=q.axis==='z';const len=(az?d:w)*(q.ridge??0),cross=az?w:d;
 box('Cumbrera de '+q.name,[x,y+h/2+.055,z],az?[.18,.13,len]:[len,.13,.18],'#984d3a');
 // Terracotta courses follow the long slopes of each hipped roof.
 for(let k=1;k<=9;k++){const t=k/10,span=(az?d:w)*(1-t)+len*t;for(const sign of [-1,1]){const off=sign*cross/2*(1-t);box('Hilada de teja',[x+(az?off:0),y-h/2+h*t+.035,z+(az?0:off)],az?[.075,.055,span]:[span,.055,.075],k%2?'#b66449':'#a25640');}}
}
const report=[];
for(const file of readdirSync(base).filter(x=>x.endsWith('.json')).sort()){
 scene=JSON.parse(readFileSync(new URL(file,base),'utf8'));parts=scene.parts;const originalCount=parts.length;
 // Refine existing apertures, without assigning new openings to hidden façades.
 for(const q of [...parts]){
  if(['arcWall','curvedSlab','arch','arcade','dome','classicalColumn'].includes(q.type))q.seg=Math.max(q.seg??14,28);
  if(q.type==='dome')q.rings=10;
  if(q.type==='windowGrid'){
   const n=q.name.toLowerCase();
   if(/ventana|ventanal|carpinter|huecos altos|retícula densa|accesos oscuros|puertas de madera|paño vertical acristalado/.test(n)&&!/marco|recerc|remate|bloques/.test(n))gridCells(q,(x,y,z,w,h,a)=>frame(q.name,x,y,z+.002*(a===0),w,h,a,scene.slug==='estacion-montoya'?'#87b4a0':cream));
   if(/persianas/.test(n))gridCells(q,(x,y,z,w,h,a)=>{const f=face(q.name,x,y,z,w,h,a,metal);for(let v=-h/2+.12;v<h/2;v+=.16)f('lama horizontal',0,v,.025,w,.026,.035);});
   if(/balcon/.test(n))gridCells(q,(x,y,z,w,h,a)=>rail('Baranda de '+q.name,x,y+h/2+.38,z+.17,w,a));
  }
  if(q.type==='hipRoof'&&q.s[1]>1)tileHipRoof(q);
 }
 switch(scene.slug){
 case 'estacion-montoya':{parts=estacionMontoya();break;}
 case 'antigua-aduana':{
  const parapet=parts.find(q=>q.name==='Parapeto continuo');parapet._oldMaterial=parapet.material;openParapet(parapet);delete parapet._oldMaterial;
  const top=parts.find(q=>q.name==='Remate claro del parapeto');parts.splice(parts.indexOf(top),1);for(const sign of [-1,1]){box('Albardilla longitudinal',[0,10.58,sign*6.1],[48.8,.2,.35]);box('Albardilla transversal',[sign*24.1,10.58,0],[.35,.2,12.2]);}
  // Window axes come from the baseline grids: x = ±15.2 + (i-1.5)·3.2.
  const axes=[-20,-16.8,-13.6,-10.4,10.4,13.6,16.8,20];
  // Photos 1-4: saturated ochre-yellow walls with white trim.
  for(const q of parts)if(q.material==='#d6a63d')q.material='#e6b52c';
  for(const x of [-21.6,-18.4,-15.2,-12,-8.8,8.8,12,15.2,18.4])box('Pilastrilla del ala',[x,4.5,6.14],[.24,8.3,.23]);
  // Dark sloping hoods over every upper window (photos 1-4).
  for(const x of axes){box('Guardapolvo de ventana',[x,8.15,6.55],[2.2,.08,.95],'#3a2e27',[.38,0,0]);for(const dx of [-.95,.95])box('Tornapuntas del guardapolvo',[x+dx,7.82,6.5],[.05,.6,.05],'#3a2e27',[.6,0,0]);}
  box('Imposta continua de entrepiso',[0,4.7,6.25],[48,.21,.3]);
  for(let x=-23;x<24;x+=.68)box('Dentículo de cornisa',[x,8.92,6.34],[.26,.24,.28]);
  const med=parts.find(q=>q.name.includes('Medallones'));parts.splice(parts.indexOf(med),1);gridCells(med,(x,y,z)=>add('cyl','Medallón circular',[x,y,z],[1,.14,1],cream,{rad:[.24,.24],seg:24,r:[Math.PI/2,0,0]}));
  for(const x of [-15.2,15.2])for(let i=0;i<4;i++)rail('Balaustrilla de ventana',x+(i-1.5)*3.2,6.05,6.84,1.75,0,cream,.55);
  break;}
 case 'banco-dugand':{
  parts=parts.filter(q=>q.name!=='Frontón del templo');scene.parts=parts;
  const attic=parts.find(q=>q.name==='Ático posterior');attic.p[1]=13.7;attic.s[1]=1.2;
  const corn=parts.find(q=>q.name==='Cornisa del ático');corn.p[1]=14.38;
  box('Friso superior horizontal',[0,13.6,7.33],[24.4,.52,1.3]);box('Cornisa saliente superior',[0,14.02,7.35],[25,.24,1.6]);
  for(const q of parts.filter(q=>q.type==='classicalColumn')){for(let k=0;k<16;k++){const a=k*Math.PI/8;add('cyl','Estría del fuste',[q.p[0]+.475*Math.cos(a),6.7,q.p[2]+.475*Math.sin(a)],[1,7.2,1],'#c5beb0',{rad:[.022,.022],seg:6});}for(const dx of [-.48,.48])add('cyl','Voluta del capitel',[q.p[0]+dx,11.3,7.72],[1,.15,1],cream,{rad:[.19,.19],seg:16,r:[Math.PI/2,0,0]});}
  for(let x=-11.5;x<12;x+=.55)box('Ovas del friso',[x,13.65,8.02],[.16,.19,.11],'#c5beb0');
  box('Dintel ornamental del portal',[0,6.2,6.55],[3.9,.3,.42]);
  for(const x of [-14,14])for(const y of [2.8,6.5])frame('Vano lateral del frente',x,y,4.71,1.35,2.5,0,cream,true);
  break;}
 case 'intendencia-fluvial':{
  const q=parts.find(q=>q.name==='Parapeto continuo bajo');q._oldMaterial=q.material;openParapet(q);delete q._oldMaterial;
  const top=parts.find(q=>q.name==='Remate blanco del parapeto continuo');parts.splice(parts.indexOf(top),1);for(const sign of [-1,1]){box('Albardilla longitudinal',[0,10.07,sign*6.6],[20.7,.16,.3]);box('Albardilla transversal',[sign*10.1,10.07,0],[.3,.16,13.2]);}
  const roof=parts.find(q=>q.name==='Cubierta oculta a cuatro aguas');roof.name='Cubierta de teja a cuatro aguas';roof.p=[0,10.25,-.1];roof.s=[18.6,2.5,11.6];roof.ridge=.5;roof.material='#a24a3a';tileHipRoof(roof);
  rail('Balaustrada del pórtico',0,5.73,7.57,4.5,0,cream,.77);for(const x of [-2.22,2.22])rail('Retorno balaustrada',x,5.73,6.96,1.2,Math.PI/2,cream,.77);
  rail('Balaustrada del costado',10.66,6.15,2.8,3,Math.PI/2,cream,.7);
  box('Cinturón blanco de entrepiso',[0,4.6,6.6],[20.3,.2,.28]);box('Cinturón lateral de entrepiso',[10.1,4.6,0],[.28,.2,13]);
  break;}
 case 'edificio-scadta':{
  add('curvedSlab','Losa de cubierta de la esquina',[5,12.11,2],[8,.12,8],'#b8b4a7',{innerRadius:.001,start:0,sweep:Math.PI/2,seg:40});
  // Hollow roof edges replace solid roof blocks.
  for(const q of parts.filter(q=>q.name.startsWith('Parapeto bajo'))){q.p[1]=12.11;q.s[1]=.12;q.material='#b8b4a7';}
  for(const [x,z,w,d] of [[-4,6,18,.18],[9,-7,.18,18],[5,-16,8,.18],[1,-11,.18,10],[-6,-6,14,.18],[-13,0,.18,12]]){box('Pretil exterior de azotea',[x,12.55,z],[w,1,d],cream);box('Remate de pretil exterior',[x,13.08,z],[w+.04,.08,d+.04],cream);}
  for(const q of parts.filter(q=>q.name.startsWith('Ventana curva'))){for(let k=0;k<=10;k++){const a=k*Math.PI/20;box('Montante curvo',[5+4.13*Math.cos(a),q.p[1],2+4.13*Math.sin(a)],[.055,1.38,.09],cream,[0,Math.PI/2-a,0]);}add('arcWall','Travesaño curvo',[5,q.p[1]+.05,2],[8.28,.06,8.28],cream,{innerRadius:.99,start:0,sweep:Math.PI/2,seg:40});}
  for(const y of [6.65,9.65])add('arcWall','Antepecho balcón de esquina',[5,y,2],[8.88,.63,8.88],cream,{innerRadius:.965,start:0,sweep:Math.PI/2,seg:40});
  for(const y of [1.5])for(let k=0;k<5;k++){let a=(k+.5)*Math.PI/10;frame('Acceso esquinero',5+4.06*Math.cos(a),y,2+4.06*Math.sin(a),.88,2.6,Math.PI/2-a,cream,true);}
  break;}
 case 'cine-rex':{parts=teatroRex();break;}
 case 'teatro-colon':{
  const blocks=parts.find(q=>q.name==='Retícula modular de bloques de vidrio');gridCells(blocks,(x,y,z,w,h)=>{box('Reflejo del bloque de vidrio',[x-w*.25,y+h*.25,z+.02],[w*.34,.035,.03],'#c2d7d1');});
  rail('Baranda de marquesina',-2,5.71,7.55,10.7,0,'#438d87',.75);
  for(const x of [-6,-4,-2,0,2])box('División de puerta del vestíbulo',[x,2.1,4.25],[.07,3.7,.06],cream);
  for(const q of parts.filter(q=>q.name.includes('Marco ')&&q.type==='box'))edging(q);
  break;}
 case 'hotel-el-prado':{
  for(const x of [-9.25,9.25]){for(let z=-4;z<12;z+=2.45){frame('Ventana exterior de habitación',x+(x<0?-2.29:2.29),4.8,z,1.08,1.5,x<0?-Math.PI/2:Math.PI/2,cream,true);}}
  for(const a of [-Math.PI/2,Math.PI/2])arches('Puerta de galería',a<0?7.03:-7.03,2.5,2.5,8,2.25,1.2,3,a);
  arches('Ventanas de la torre',0,7.8,-1.98,3,2.15,1.15,1.6);
  for(const x of [-6.3,6.3])rail('Balaustrada de galería',x,1,2.5,17.8,Math.PI/2,cream,.8);
  box('Borde de piscina',[0,.15,5.2],[11.1,.2,7.1],'#f0e4ce');
  // Move coping below the existing water plane; leave the pool surface visible.
  parts.at(-1).p[1]=.1;parts.at(-1).role='context';
  for(const x of [-6.2,6.2])box('Sendero del patio',[x,.06,5],[1,.12,12],'#c6bda9');
  break;}
 case 'bellas-artes':{
  arches('Puertas bajo el pórtico',0,2.1,3.29,5,1.8,1.2,3.8);
  for(const x of [-8,8]){for(let i=0;i<3;i++)frame('Ventana inferior de galería',x+(i-1)*2,2.15,3.3,1.15,2.9,0,cream,true);rail('Balaustrada de loggia',x,4.92,5.04,5.8,0,cream,.72);}
  for(const q of parts.filter(q=>q.type==='arch'&&q.name.startsWith('Vano superior'))){const f=face(q.name,...q.p,q.s[0],q.s[1]);f('carpintería central',0,-.2,.12,.065,1.85,.08);f('travesaño',0,-.1,.12,1.45,.07,.08);}
  box('Ático central de inscripción',[0,8.3,3.45],[10.7,1.05,.42],'#eadfca');box('Remate del ático',[0,8.87,3.48],[11.1,.14,.58]);
  break;}
 case 'caja-agraria':{
  // Keep the blind wall blind. Detail only the photographed concrete flank.
  for(let y=2.85;y<17;y+=1.8){box('Sombra entre losas laterales',[6.64,y,-1.6],[.08,1.18,8.1],'#4e595c');for(let z=-5.4;z<2;z+=1.3)box('Montante lateral',[6.72,y,z],[.12,1.2,.09],'#a9adab');}
  box('Remate del muro de piedra',[.4,17.65,3.1],[12.7,.16,.42],'#bbb9b0');
  box('Encuentro inferior del relieve',[.4,.7,3.1],[12.7,.35,.42],'#aaa9a2');
  for(const x of [-6.6,6.6])box('Albardilla longitudinal de cubierta',[x,18.1,-2.25],[.18,.25,7.5]);
  for(const z of [-6,1.5])box('Albardilla transversal de cubierta',[0,18.1,z],[13.2,.25,.18]);
  break;}
 case 'estadio-romelio-martinez':{
  box('Paño ocre de la tribuna',[-3.3,4.2,4.75],[28.6,3.7,.22],'#cfb071');
  for(let x=-16.8;x<11;x+=3.35)box('Pilastra exterior de tribuna',[x,4.8,4.95],[.26,5.9,.32]);
  add('arcade','Arcada exterior de tribuna',[-3.3,.25,4.95],null,cream,{len:28.6,n:9,h:2.3,dep:.35,pw:.3,seg:24});
  add('lattice','Celosía continua de tribuna',[-3.3,6.65,5.02],[28.6,.7,.18],cream,{count:[64,2],bar:.05});
  box('Cornisa exterior de tribuna',[-3.3,6.15,5],[28.8,.2,.42]);
  rail('Protección de grada superior',-2,7.1,-2.1,33,0,metal,.85);
  for(const y of [9.5,10.45,11.7,12.85])box('Perfil de coronamiento déco',[14.2,y,5.35],[y>12?2.4:y>11?5:6.3,.12,.2]);
  for(let x=13;x<15.5;x+=.22)box('Reja del acceso',[x,2.4,6.07],[.045,4.5,.06],metal);
  break;}
 case 'iglesia-san-nicolas':{
  // Distinct stacked tower stages, slender openings and cornices.
  for(const x of [-4.45,4.45]){
   for(const y of [8.9,12,14.2]){box('Cornisa de torre',[x,y,2.8],[3.08,.22,3.48],'#c96862');box('Perfil claro de torre',[x,y+.16,2.8],[3.16,.07,3.56],cream);}
   for(const y of [12.9])for(const a of [0,Math.PI/2,-Math.PI/2]){const xx=x+1.44*Math.sin(a),zz=2.8+1.64*Math.cos(a);add('arch','Vano alto de torre',[xx,y,zz],[.72,1.45,.12],glass,{arch:'pointed',seg:24,r:[0,a,0]});}
   for(const dx of [-1.22,1.22])box('Lesena frontal de torre',[x+dx,11.8,4.45],[.16,4.55,.14],cream);
   add('cyl','Linterna sobre cupulín',[x,18.1,2.8],[1,.9,1],cream,{rad:[.32,.4],seg:8});add('dome','Cúpula de linterna',[x,18.55,2.8],[.83,.46,.83],'#c96862',{seg:24,rings:8});
   box('Cruz vertical',[x,19.27,2.8],[.065,.6,.065],metal);box('Cruz horizontal',[x,19.34,2.8],[.36,.065,.065],metal);
  }
  for(const x of [-5.5,5.5])for(let z=-6.3;z<2;z+=2.2){box('Contrafuerte lateral',[x,3.8,z],[.38,7.6,.48],cream);add('arch','Vano apuntado lateral',[x+(x<0?-.02:.02),4.2,z+1.02],[1.02,3.7,.14],glass,{arch:'pointed',seg:24,r:[0,x<0?-Math.PI/2:Math.PI/2,0]});}
  for(const q of parts.filter(q=>q.type==='arch'&&q.name.includes('exterior'))){const f=face(q.name,...q.p,q.s[0],q.s[1]);for(const dx of [-.38,0,.38])f('tracería vertical',dx,-.35,.12,.045,4.4,.045,cream);}
  box('Cruz del hastial',[0,12.75,2.8],[.085,1,.085],metal);box('Brazo de cruz del hastial',[0,12.95,2.8],[.55,.085,.085],metal);
  // Photo-2: below the main cornice the towers belong to the white façade; only pilasters are salmon.
  const salmon='#d98274',white='#f0e7d7';
  for(const t of parts.filter(q=>/^Torre (izquierda|derecha)$/.test(q.name))){const [x,,z]=t.p;t.p=[x,4.45,z];t.s=[t.s[0],8.9,t.s[2]];t.material=white;box(t.name+' · cuerpo alto',[x,11.65,z],[t.s[0],5.5,t.s[2]],salmon);}
  for(const q of parts.filter(q=>/Contrafuertes frontales|Pináculos de fachada/.test(q.name)))q.material=salmon;
  // Slender lanterns: the photographed cupolines are small, not full-width domes.
  for(const q of parts.filter(q=>/^Cupulín/.test(q.name))){q.s=[1.55,1.05,1.55];add('cyl','Tambor octogonal del cupulín',[q.p[0],q.p[1]-.35,q.p[2]],[1,.7,1],salmon,{rad:[.82,.95],seg:8});}
  // Corner pinnacles on each tower stage (photo-2).
  for(const x of [-4.45,4.45])for(const [dx,dz] of [[-1.38,-1.58],[1.38,-1.58],[-1.38,1.58],[1.38,1.58]]){
   add('cyl','Pináculo de esquina de torre',[x+dx,15.0,2.8+dz],[1,1.1,1],salmon,{rad:[.015,.15],seg:8});
   add('cyl','Pináculo de esquina de torre',[x+dx,9.65,2.8+dz],[1,1.3,1],salmon,{rad:[.015,.15],seg:8});}
  break;}
 }
 scene.parts=parts;writeFileSync(new URL(file,out),JSON.stringify(scene,null,2)+'\n');report.push({slug:scene.slug,before:originalCount,after:parts.length});
}
console.log(JSON.stringify(report,null,2));
