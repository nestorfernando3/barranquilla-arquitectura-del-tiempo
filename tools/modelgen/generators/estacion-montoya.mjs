/**
 * Estación Montoya: reconstrucción L2 desde assets/reference-images/estacion-montoya.
 * photo-1: costado corto (+x) con tres vanos altos, marquesina baja y esquina ochavada.
 * photo-2: fachada larga (+z) con rótulo, balcón corrido, marquesinas rojas y hastial con balcón.
 * Las fachadas -x y -z no tienen vista: quedan lisas, con esquinas y alero, como inferidas.
 */
export function estacionMontoya(){
 const parts=[];
 const brick='#957659',quoin='#dbbb68',green='#0d7a5f',greenDark='#0a4f3e',awning='#b33a2c',
  roof='#8a3328',eave='#2b2d2e',iron='#1f2324',sign='#4b3426',letter='#efe2bf',pave='#b98f78';
 const add=(type,name,p,s,material,evidence='documented',extra={})=>{const q={type,name,p,...(s?{s}:{}),material,role:'building',evidence,...extra};parts.push(q);return q;};
 const box=(n,p,s,c,ev,r)=>add('box',n,p,s,c,ev,r?{r}:{});
 // Placement on a façade plane: u along the façade, d outward, a = rotation about Y.
 const face=(name,x,z,a,ev='documented')=>(n,u,y,d,s,c,extra={})=>{
  const {rx=0,type='box',...rest}=extra;
  return add(type,name+' · '+n,[x+u*Math.cos(a)+d*Math.sin(a),y,z-u*Math.sin(a)+d*Math.cos(a)],s,c,ev,{r:[rx,a,0],...rest});
 };
 const H=7.8,F=3.9; // two storeys of 3.9 m
 const X0=-7,X1=7,Z0=-4,Z1=4,CH=2; // chamfer of 2 m at the +x/+z corner

 // Mass: two boxes plus a 45° block whose outer face is the chamfer.
 box('Cuerpo principal de ladrillo',[(X0+X1-CH)/2,H/2,0],[X1-X0-CH,H,Z1-Z0],brick);
 box('Cuerpo del costado corto',[X1-CH/2,H/2,(Z0+Z1-CH)/2],[CH,H,Z1-Z0-CH],brick);
 box('Esquina ochavada',[X1-CH,H/2,Z1-CH],[CH*Math.SQRT2,H,CH*Math.SQRT2],brick,'documented',[0,Math.PI/4,0]);
 box('Zócalo claro',[(X0+X1)/2-0.0,.22,(Z0+Z1)/2],[X1-X0+.06,.44,Z1-Z0+.06],quoin,'inferred');

 // Quoins: alternating long and short ashlars at every visible corner.
 // (x,z) is the corner on the wall plane; (ax,az) points along the façade, away from the corner.
 const quoins=(x,z,ax,az,label,ev='documented')=>{for(let y=.68;y<H-.2;y+=.5){const L=Math.round((y-.68)/.5)%2?.38:.66;box(label,[x+ax*L/2,y,z+az*L/2],ax?[L,.42,.24]:[.24,.42,L],quoin,ev);}};
 quoins(X0+.0,Z1+.06,1,0,'Sillar de esquina');
 quoins(X1-CH,Z1+.06,-1,0,'Sillar de esquina');
 quoins(X1+.06,Z1-CH,0,-1,'Sillar de esquina');
 quoins(X1+.06,Z0,0,1,'Sillar de esquina','inferred');
 quoins(X0-.06,Z0,0,1,'Sillar de esquina','inferred');

 // Hip roof with deep dark eaves.
 add('hipRoof','Cubierta principal a cuatro aguas',[0,H+1.2,0],[X1-X0+1.9,2.4,Z1-Z0+1.9],roof,'documented',{ridge:.45});
 for(const z of [Z0-.95,Z1+.95])box('Alero oscuro',[0,H+.08,z],[X1-X0+1.95,.36,.12],eave);
 for(const x of [X0-.95,X1+.95])box('Alero oscuro',[x,H+.08,0],[.12,.36,Z1-Z0+1.95],eave);
 box('Plafón del alero',[0,H-.05,0],[X1-X0+1.9,.1,Z1-Z0+1.9],eave);
 // Railing on the flat crest (photo-1).
 const crest=(X1-X0+1.9)*.45;
 for(const z of [-.18,.18])box('Baranda de cumbrera · pasamanos',[0,H+2.75,z],[crest,.05,.05],iron);
 const posts=Math.round(crest/.22);for(const z of [-.18,.18])for(let i=0;i<=posts;i++)box('Baranda de cumbrera · barrote',[-crest/2+i*crest/posts,H+2.55,z],[.035,.4,.035],iron);

 // Cross gable over the long façade, with door and small balcony (photo-2).
 const gx=-1.3,gw=6.2,gh=2.7;
 add('gable','Hastial del frente',[gx,H-.05,Z1-.55],[gw,gh,1.1],brick,'documented',{axis:'z'});
 add('gable','Cubierta del hastial',[gx,H+.1,Z1-1.9],[gw+.9,gh+.25,2.6],roof,'documented',{axis:'z'});
 const rake=Math.atan2(gh,gw/2);
 for(const s of [-1,1])box('Tapajuntas del hastial',[gx+s*(gw/4+.12),H+gh/2+.05,Z1+.12],[Math.hypot(gw/2,gh)+.5,.26,.14],eave,'documented',[0,0,-s*rake]);
 const g=face('Mirador del hastial',gx,Z1,0);
 g('quicio',0,H+.95,.06,[1.35,1.75,.1],quoin);g('puerta',0,H+.9,.12,[1.0,1.55,.08],green);
 g('balcón · losa',0,H+.12,.42,[1.7,.1,.8],iron);g('balcón · pasamanos',0,H+.95,.8,[1.7,.05,.05],iron);
 for(const u of [-.85,.85])g('balcón · retorno',u,H+.95,.42,[.05,.05,.8],iron);
 for(let i=0;i<=8;i++)g('balcón · barrote',-.85+i*.2125,H+.55,.8,[.03,.8,.03],iron);

 // Openings: French doors with green shutters and a light surround.
 const door=(f,u,y,w,h,arched=false)=>{
  f('quicio',u,y,.04,[w+.42,h+.36,.08],quoin);
  if(arched){f('vano en arco',u,y,.1,[w,h,.08],green,{type:'arch',arch:'round',seg:20});}
  else f('hoja verde',u,y,.1,[w,h,.08],green);
  f('junta de hojas',u,y,.15,[.04,h-.1,.03],greenDark);
  for(const v of [-.3,.3])f('lamas',u,y+v*h,.15,[w-.12,.04,.03],greenDark);
 };
 const awn=(f,u,y,w,d=.85)=>{f('marquesina roja',u,y,d/2,[w,.06,d],awning,{rx:.28});for(const s of [-1,1])f('ménsula de hierro',u+s*(w/2-.15),y-.32,.28,[.04,.5,.5],iron,{rx:.8});};
 const balcony=(f,u,y,w,d=.7)=>{f('losa de balcón',u,y,d/2,[w,.12,d],iron);f('pasamanos',u,y+.9,d,[w,.05,.05],iron);
  for(const s of [-1,1])f('retorno',u+s*w/2,y+.9,d/2,[.05,.05,d],iron);
  const n=Math.round(w/.18);for(let i=0;i<=n;i++)f('barrote',u-w/2+i*w/n,y+.47,d,[.03,.86,.03],iron);
  for(const s of [-1,1])f('ménsula',u+s*(w/2-.2),y-.25,.25,[.05,.4,.45],iron,{rx:-.7});};
 const yU=F+1.95,yL=1.75;

 // Long façade (+z), photo-2.
 const front=face('Fachada larga',0,Z1,0);
 for(const u of [-5.8,-3.3,-1.3,.7,3.4]){door(front,u,yU,1.05,2.3);awn(front,u,yU+1.55,1.75);}
 balcony(front,-1.3,F+.72,5.9);for(const u of [-5.8,3.4])balcony(front,u,F+.72,1.7);
 for(const u of [-6.2,-4.4,-2.3,-.3,1.7,3.6])door(front,u,yL,1.15,2.75);
 front('rótulo',-1.3,F+.12,.1,[5.2,.62,.1],sign);
 // Lettering is suggested, not spelled: sixteen blocks with the word gap of "ESTACION MONTOYA".
 for(let i=0;i<16;i++)if(i!==8)front('letra del rótulo',-1.3-2.3+i*.3067,F+.12,.17,[.17,.32,.03],letter);
 parts.filter(q=>q.name.endsWith('letra del rótulo')).forEach(q=>q.evidence='evocative');
 front('marquesina corrida',-1,F-.15,.95,[X1-X0-CH-.2,.07,1.9],awning,{rx:.2});
 for(let u=-6.5;u<5;u+=2.4)front('ménsula de marquesina',u,F-.6,.5,[.05,.75,.85],iron,{rx:.75});
 for(const u of [-4.55,1.95])front('bajante',u,H/2,.12,[.12,H,.12],iron);
 for(const u of [-4.55,1.95])box('Pilastra clara',[u,H/2,Z1+.03],[.5,H,.06],quoin);

 // Chamfer, photo-1 (right edge): arched window above, arched door below.
 const ch=face('Esquina ochavada',X1-CH/2,Z1-CH/2,Math.PI/4);
 door(ch,0,yU,1.0,2.2,true);balcony(ch,0,F+.72,1.6,.55);awn(ch,0,yU+1.55,1.6,.7);
 door(ch,0,yL,1.1,2.8,true);

 // Short façade (+x), photo-1: three upper openings and a lower marquee.
 const side=face('Costado corto',X1,(Z0+Z1-CH)/2,Math.PI/2);
 // u runs toward -z on this face (rotation +90°), so negate the local layout.
 for(const u of [2.15,-.15,-2.1]){door(side,u,yU,1.05,2.3);awn(side,u,yU+1.55,1.75);}
 balcony(side,2.15,F+.72,1.6);balcony(side,-1.1,F+.72,3.6);
 for(const u of [2.3,.6,-1.1,-2.6])door(side,u,yL,1.1,2.75);
 side('marquesina corrida',0,F-.15,.95,[Z1-Z0-CH-.2,.07,1.9],awning,{rx:.2});
 side('bajante',-.95,H/2,.12,[.12,H,.12],iron);

 // Brick coursing on the photographed façades, very fine.
 for(let y=.62;y<H-.1;y+=.36){box('Junta de ladrillo',[-1,y,Z1+.008],[X1-X0-CH,.012,.012],'#8e735a','inferred');box('Junta de ladrillo',[X1+.008,y,-1],[.012,.012,Z1-Z0-CH],'#8e735a','inferred');}

 // Paved forecourt with light joints (context).
 const plaza=add('box','Plaza de ladrillo',[0,.04,1.6],[19,.08,13],pave,'inferred');plaza.role='context';
 for(let x=-9;x<=9;x+=3){const j=add('box','Junta de plaza',[x,.085,1.6],[.08,.01,13],'#e8dcc4','inferred');j.role='context';}
 for(let z=-4.9;z<=8;z+=3){const j=add('box','Junta de plaza',[0,.085,z],[19,.01,.08],'#e8dcc4','inferred');j.role='context';}
 return parts;
}
