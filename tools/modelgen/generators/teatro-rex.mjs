/** Reference-board reconstruction. Dimensions and hidden elevations are interpretative. */
export function teatroRex(){
 const parts=[],wall='#ded2b9',trim='#e9dec8',coral='#b97c59',dark='#354e50',glass='#486165';
 const add=(type,name,p,s,material=wall,extra={})=>{const q={type,name,p,s,material,role:'building',evidence:'inferred',...extra};parts.push(q);return q;};
 const box=(n,p,s,c=wall,r)=>add('box',n,p,s,c,r?{r}:{});
 const arc=(n,y,h,rad,c=wall,inner=.95,start=0,sweep=Math.PI/2)=>add('arcWall',n,[0,y,0],[rad*2,h,rad*2],c,{innerRadius:inner,start,sweep,seg:Math.max(1,Math.ceil(sweep*40))});
 const face=(name,x,y,z,a=0)=> (n,u,v,d,w,h,t,c=trim,rz=0)=>box(name+' · '+n,[x+u*Math.cos(a)+d*Math.sin(a),y+v,z-u*Math.sin(a)+d*Math.cos(a)],[w,h,t],c,[0,a,rz]);
 // A deep auditorium block and a shorter cross-street frontage, with one rounded corner.
 box('Cuerpo longitudinal de sala',[-4.7,4.6,-13],[18.6,9.2,26]);
 box('Frente corto Calle 37',[-7,4.6,2.3],[14,9.2,4.6]);
 arc('Esquina sobre el vestíbulo',6.8,4.8,4.6,wall,.001);
 for(const y of [4.3,4.58,4.86]){
  arc('Cornisa curva de marquesina',y,.16,4.97,trim,.94);
  box('Cornisa Calle 37',[-7,y,4.77],[14,.16,.4],trim);
  box('Cornisa Carrera 45',[4.77,y,-13],[.4,.16,26],trim);
 }
 for(const y of [8.35,9.45]){
  box('Imposta Calle 37',[-7,y,4.67],[14,.09,.16],trim);
  box('Imposta Carrera 45',[4.67,y,-13],[.16,.09,26],trim);
 }
 // Windows use thin dark mullions, wide wall piers and unequal bay sizes.
 function window(n,x,y,z,w,h,a=0){const f=face(n,x,y,z,a);
  f('sombra del hueco',0,0,0,w+.13,h+.13,.055,dark);
  f('vidrio',0,0,.035,w,h,.055,glass);
  for(const u of [-w/2,w/2])f('jamba',u,0,.07,.045,h,.055,dark);
  for(const v of [-h/2,h/2])f('marco',0,v,.07,w,.045,.055,dark);
  const count=Math.ceil(w/.45);for(let k=1;k<count;k++)f('montante',-w/2+k*w/count,0,.08,.035,h,.065,dark);
  f('travesaño',0,.18,.08,w,.045,.065,dark);f('alféizar',0,-h/2-.1,.03,w+.22,.12,.2,trim);
 }
 for(const [x,w] of [[-12.3,1.25],[-9.2,1.7],[-5.65,2.45],[-1.75,2.8]])window('Ventana Calle 37',x,6.55,4.66,w,1.65);
 for(const [z,w] of [[-2.1,2.8],[-6.2,2.15],[-9.7,1.15],[-12.5,1.15],[-15.5,1.15],[-18.5,1.15],[-22.8,1.9]])window('Ventana Carrera 45',4.66,6.55,z,w,1.65,Math.PI/2);
 arc('Ventanales curvos',6.62,1.95,4.65,glass,.988);
 for(let k=0;k<=18;k++){const a=k*Math.PI/36;const f=face('Carpintería curva',4.69*Math.cos(a),6.62,4.69*Math.sin(a),Math.PI/2-a);f('montante',0,0,0,.04,1.97,.075,dark);}
 for(const y of [5.65,6.35,7.59])arc('Travesaño curvo',y,.045,4.70,dark,.993);
 function shop(n,x,z,w,a){const f=face(n,x,2.18,z,a);f('persiana',0,0,0,w,3.45,.1,dark);
  for(let y=-1.65;y<1.7;y+=.15)f('lama',0,y,.075,w,.025,.035,'#657570');
  for(const u of [-w/2-.13,w/2+.13]){f('pilar',u,0,.1,.23,3.75,.25,trim);f('zócalo',u,-1.55,.14,.28,.65,.3,'#938979');}
 }
 for(const [x,w] of [[-12.4,2.5],[-9.3,2.6],[-6.1,2.65],[-2.6,2.9]])shop('Local Calle 37',x,4.69,w,0);
 for(let k=0;k<8;k++)shop('Local Carrera 45',4.69,-1.8-k*3.15,2.65,Math.PI/2);
 // Main entrance sits in the curved corner, below the continuous canopy.
 for(let k=0;k<5;k++)add('curvedSlab','Escalinata de granito',[0,.08+k*.13,0],[11.3-k*.4,.16,11.3-k*.4],'#978f80',{innerRadius:.001,start:0,sweep:Math.PI/2,seg:64});
 arc('Puertas del vestíbulo',2.38,3.25,3.87,dark,.975);
 for(let k=0;k<=10;k++){const a=k*Math.PI/20;box('Montante de puerta',[3.93*Math.cos(a),2.38,3.93*Math.sin(a)],[.045,3.25,.07],trim,[0,Math.PI/2-a,0]);}
 for(const a of [.16,.58,.99,1.41]){const x=4.55*Math.cos(a),z=4.55*Math.sin(a);add('cyl','Columna de vestíbulo',[x,2.48,z],[1,3.4,1],trim,{rad:[.17,.2],seg:24});for(const y of [.78,4.15])add('cyl','Base y capitel',[x,y,z],[1,.14,1],'#a99c85',{rad:[.25,.25],seg:24});}
 // Continuous shaped crown: the circular oculus is inset into plaster, not a loose disk.
 const profile=t=>12.05+.48*Math.pow(Math.sin(t*Math.PI),2)+1.25*Math.exp(-Math.pow((t-.5)/.205,2));
 for(let k=0;k<96;k++){const t=(k+.5)/96,top=profile(t),a=k*Math.PI/192;
  arc('Paño continuo del coronamiento',(8.15+top)/2,top-8.15,4.6,wall,.945,a,Math.PI/192+.0001);
  arc('Borde moldeado del coronamiento',top,.105,4.67,trim,.971,a,Math.PI/192+.0001);
  arc('Segundo filete del coronamiento',top-.22,.055,4.67,'#b8aa90',.991,a,Math.PI/192+.0001);
 }
 // Tall terracotta bundles terminate in staggered caps at each end of the curved panel.
 for(const [x,z,a] of [[0,4.75,0],[4.75,0,Math.PI/2]]){const f=face('Pilastra Art Déco',x,8.5,z,a);
  f('fuste coral',0,0,0,.72,7.1,.3,coral);
  for(const u of [-.4,.4])f('borde crema',u,-.03,.02,.105,7.3,.34,trim);
  f('estría central',0,0,.18,.09,7.25,.055,trim);
  for(const [u,h] of [[-.25,7.55],[0,7.95],[.25,7.55]])f('remate',u,(h-7.1)/2,.01,.19,h,.32,coral);
 }
 const a=Math.PI/4,ox=3.29,oz=3.29;
 for(const [r,d,c] of [[.98,0,trim],[.85,.05,'#8d9587'],[.73,.10,dark],[.66,.14,'#76908b']])add('cyl','Óculo integrado',[ox+d/Math.sqrt(2),12.45,oz+d/Math.sqrt(2)],[1,.06,1],c,{rad:[r,r],seg:64,r:[Math.PI/2,a,0]});
 const o=face('Radios del óculo',ox,12.45,oz,a);
 for(let k=0;k<12;k++){const b=k*Math.PI/6;o('radio',.34*Math.sin(b),.34*Math.cos(b),.2,.027,.63,.035,dark,-b);}
 add('cyl','Centro del óculo',[ox+.15,12.45,oz+.15],[1,.03,1],dark,{rad:[.14,.14],seg:24,r:[Math.PI/2,a,0]});
 // Letters sit individually on the curved surface, without a rectangular signboard.
 const strokes={R:[[-.28,0,.08,.92,0],[0,.42,.56,.08,0],[0,.03,.56,.08,0],[.25,.24,.08,.43,0],[.05,-.24,.08,.57,.58]],E:[[-.27,0,.08,.92,0],[0,.42,.58,.08,0],[-.04,0,.50,.08,0],[0,-.42,.58,.08,0]],X:[[0,0,.08,1.06,.58],[0,0,.08,1.06,-.58]]};
 for(const [letter,t] of [['R',.28],['E',.50],['X',.72]]){const theta=(1-t)*Math.PI/2;const f=face('Letra '+letter,4.68*Math.cos(theta),9.49,4.68*Math.sin(theta),Math.PI/2-theta);for(const [u,v,w,h,rz] of strokes[letter])f('trazo',u,v,.025,w,h,.075,dark,rz);}
 const deco=face('Ornamento escalonado',ox,10.75,oz,a);
 deco('eje coral',0,0,.12,.17,1.15,.16,coral);
 for(const side of [-1,1]){deco('filete vertical',side*.22,-.08,.08,.075,.9,.10,trim);deco('hombro',side*.48,-.28,.07,.48,.075,.11,trim);deco('descenso',side*.7,-.43,.07,.075,.34,.11,trim);deco('pie',side*.97,-.58,.07,.6,.075,.11,trim);}
 // Setback masses and low tile roofs reproduce the stepped roofscape.
 function mass(n,x,z,w,d,base,top){box(n,[x,(base+top)/2,z],[w,top-base,d],wall);for(const side of [-1,1]){box(n+' cornisa',[x,top,z+side*d/2],[w+.1,.11,.18],trim);box(n+' cornisa lateral',[x+side*w/2,top,z],[.18,.11,d],trim);}}
 mass('Ático lateral largo',-3.0,-12.8,13.8,23.6,9.2,10.05);
 mass('Volumen alto del foyer',-2.4,-2.8,8.9,6.8,9.2,12.9);
 mass('Volumen posterior escalonado',-5.5,-8.6,8.5,5.4,10.05,13.8);
 mass('Torre de cubierta',-3.8,-5.8,2.8,2.8,12.9,15.1);
 function roof(n,x,z,w,d,y,h){add('hipRoof',n,[x,y+h/2,z],[w,h,d],'#9b684e',{ridge:.65});for(let k=1;k<8;k++){const t=k/8;for(const side of [-1,1])box('Hilada de teja',[x,y+h*t+.02,z+side*d/2*(1-t)],[w*(1-.35*t),.035,.05],'#bd8b69');}}
 roof('Tejado de sala',-3,-15,12.8,14.8,10.1,1.15);
 roof('Tejado del cuerpo alto',-5.5,-8.6,8.2,5.1,13.83,.66);
 roof('Tejado de torre',-3.8,-5.8,3.0,3.0,15.14,.55);
 for(const [x,z,w,h,a] of [[-.4,.64,.65,1.6,0],[-4.6,.64,.7,1.6,0],[2.1,-3.5,.65,1.6,Math.PI/2],[-1.2,-6.5,.65,1.4,Math.PI/2]])window('Vano de ático',x,11.65,z,w,h,a);
 for(const [x,z,len,a] of [[-7,4.64,14,0],[4.64,-13,26,Math.PI/2]]){const f=face('Parapeto lateral',x,9.2,z,a);f('pretil',0,.4,0,len,.95,.19,wall);for(let u=-len/2+.6;u<len/2;u+=2.5){f('pilastrilla',u,.35,.06,.12,1.5,.16,trim);f('recuadro',u+.55,.6,.1,.44,.32,.09,trim);f('centro de recuadro',u+.55,.6,.16,.25,.16,.025,'#b8ad94');}}
 return parts;
}
