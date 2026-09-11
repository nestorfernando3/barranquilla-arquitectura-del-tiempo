# Investigación de referencias para modelos — V2

**Fecha de consulta:** 2026-08-23  
**Alcance:** recorrido *Barranquilla · Arquitectura del tiempo* (13 edificios).  
**Método:** se revisaron `assets/reference-images/`, sus `credits.json`, `docs/MODELOS-3D-FUENTES.md` y las doce escenas de `tools/modelgen/scenes/` (no existe escena procedural para García). Las fuentes prioritarias son fichas de archivo de Wikimedia Commons: cada enlace lleva a la **página de descripción de la fuente**, donde constan autoría y licencia. La licencia indicada es la de la foto, no de una reconstrucción 3D derivada.

Las recomendaciones de modelado se limitan deliberadamente a lo que las vistas citadas permiten ver. “No comprobable” significa que no debe modelarse como hecho, aunque una interpretación L1 pueda mantenerlo como volumen neutro.

## 1. Estación Montoya (`estacion-montoya`)

**Referencia principal nueva/mejor.** [Estación Montoya Barranquilla](https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_Montoya_Barranquilla.jpg) — Jdvillalobos, obra propia (2024), **CC BY-SA 4.0**. Complemento ya descargado: [Barranquilla Estación Montoya](https://commons.wikimedia.org/wiki/File:Barranquilla_Estaci%C3%B3n_Montoya.jpg) — Jdvillalobos, **CC BY 3.0**.

**Evidencia visible.** Volumen compacto de dos niveles en ladrillo claro/ocre; frente con hastial triangular, cubiertas inclinadas oscuras y marquesinas metálicas rojizas de andén. Se leen carpinterías turquesa-verdosas, balcones de hierro negro, quicios claros y un cuerpo/esquina facetada.

**Vistas prioritarias.** Frontal bajo y tres cuartos desde la esquina para fijar simetría, hastial, altura relativa de las alas y relación de las marquesinas con puertas y balcones. Un detalle del alero y baranda sirve para L2.

**Cambios de modelado sustentados.** Confrontar el `Mirador octogonal esquinero` actual con la foto 2024: debe leerse como un volumen facetado integrado al cuerpo de ladrillo, no como torre cilíndrica aislada. Mantener cubiertas inclinadas, quicios claros y marquesina corrida; no extenderlo a una nave ferroviaria larga ni inventar plataforma, interior o fachada posterior.

## 2. Iglesia de San Nicolás (`iglesia-san-nicolas`)

**Referencia principal.** [Iglesia de San Nicolás de Tolentino, Barranquilla](https://commons.wikimedia.org/wiki/File:2020_Barranquilla_-_Iglesia_de_San_Nicolas_de_Tolentino_(Barranquilla).jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**. Alterna de lectura frontal: [Iglesia de San Nicolás de Tolentino](https://commons.wikimedia.org/wiki/File:Iglesia_de_San_Nicolas_de_Tolentino_(Barranquilla).jpg) — Jdvillalobos, obra propia, **CC BY 3.0**.

**Evidencia visible.** Fachada simétrica neogótica en estuco/revestimiento pintado rosa salmón y crema: dos torres altas, cuerpos de campanas abiertos, cupulines y pináculos; rosetones circulares con tracería; arcos apuntados; tres accesos principales de madera y una secuencia de figuras y relieves sobre ellos. No hay evidencia de piedra vista.

**Vistas prioritarias.** Frontal centrado, ligeramente contrapicado para controlar anchura de torres y cinco ritmos verticales; oblicua desde la plaza para comprobar laterales, contrafuertes y cubierta.

**Cambios de modelado sustentados.** Conservar las dos torres y sus cupulines. Convertir los elementos denominados `Reloj` en discos/rosetones de tracería radial si hoy tienen manecillas: la foto muestra ventanas circulares, no relojes. Refinar la lectura de cinco paños apuntados, la hornacina central y los pináculos; no afirmar vitrales, retablos ni planta interior.

## 3. Antigua Aduana (`antigua-aduana`)

**Referencia principal.** [Fachada antigua Aduana, carrera 50](https://commons.wikimedia.org/wiki/File:Fachada_antigua_Aduana_cra_50_Barranquilla.jpg) — Jdvillalobos, obra propia, **CC BY-SA 4.0**. Complemento para el pabellón de esquina: [2020 Barranquilla — Antigua Aduana](https://commons.wikimedia.org/wiki/File:2020_Barranquilla_-_Antigua_Aduana.jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**.

**Evidencia visible.** Edificio ocre amarillo de dos plantas; pórtico central clásico de columnas estriadas y frontón con la inscripción “ADMINISTRACIÓN DE LA ADUANA”; molduras, medallones y recercos blancos; vanos verticales altos con balconcillos/rejas y toldos oscuros. En el extremo se confirma un pabellón con cúpula, tambor y linterna; el coronamiento del frente es parapeto, no torre de reloj.

**Vistas prioritarias.** Frontal amplio para el ritmo completo de vanos y pórtico; tres cuartos hacia el extremo cupulado para la masa lateral y la cúpula.

**Cambios de modelado sustentados.** La escena ya contiene pórtico, frontón y pabellón cupulado: priorizar proporción de dos niveles, frontón bajo y parapeto continuo. Añadir solo si falta la repetición visible de medallones circulares, molduras blancas y balconcillos. No añadir una torre central, un reloj ni interiores: no están sostenidos por estas vistas.

## 4. Banco Dugand (`banco-dugand`)

**Referencia principal nueva/mejor.** [Antiguo Banco Dugand, Barranquilla (2026)](https://commons.wikimedia.org/wiki/File:Antiguo_Banco_Dugand_Barranquilla_2026-02-18.jpg) — Jdvillalobos, obra propia, **CC BY-SA 4.0**. Complemento histórico: [Bquilla — 17 ago 2007 200](https://commons.wikimedia.org/wiki/File:Bquilla_-_17_ago_2007_200.jpg) — Jdvillalobos, obra propia, **CC BY 3.0**.

**Evidencia visible.** Frente monumental blanco, tratado como templo clásico: escalera/estilóbato, ocho columnas de orden gigante, entablamento con dentículos y friso, frontón y balaustrada/ático. Los huecos son altos y oscuros; la fachada no se comporta como una esquina residencial de ventanas repetidas. La lectura de capiteles en la foto es muy elaborada; el orden exacto debe dejarse en “clásico/corintizante” si no se dispone de foto de detalle rectificada.

**Vistas prioritarias.** Frontal tres cuartos bajo para contar las ocho columnas, medir el frontón y leer la escalinata; primer plano del capitel y entablamento para una eventual versión L2.

**Cambios de modelado sustentados.** Validar que se mantengan **ocho** columnas y la composición estrictamente simétrica de templo. Evitar cilindros lisos como solución final: hacer legibles basa, fuste acanalado y un capitel simplificado, además de dentículos/relieves del entablamento. No modelar el interior ni extrapolar los murales como decoración de fachada.

## 5. Hotel El Prado (`hotel-el-prado`)

**Referencia principal.** [Hotel El Prado, Barranquilla, 28 feb 2008](https://commons.wikimedia.org/wiki/File:Hotel_El_Prado,_Barranquilla_28_feb_08_075.jpg) — Jdvillalobos, obra propia, **dominio público (PD-self)**. Complementos ya descargados: [Hotel El Prado Barranquilla-2](https://commons.wikimedia.org/wiki/File:Hotel_El_Prado_Barranquilla-2.jpg) y [Hotel El Prado Barranquilla-5](https://commons.wikimedia.org/wiki/File:Hotel_El_Prado_Barranquilla-5.jpg) — Jdvillalobos, **CC BY-SA 4.0**.

**Evidencia visible.** Conjunto crema/beige estucado de alas bajas alrededor de jardín/piscina, arcadas profundas y loggias, cubierta de teja roja y torre/mirador central. El acceso incorpora arcos y molduras blancas; se ven toldos azules y vegetación tropical. La foto junto a la piscina confirma el carácter de patio, no una torre aislada.

**Vistas prioritarias.** Panorámica desde la piscina para la U de alas, arcadas y torre; tres cuartos desde la entrada para portal, teja y relación con palmeras. Para interiores, la ficha [Hotel El Prado Barranquilla-1](https://commons.wikimedia.org/wiki/File:Hotel_El_Prado_Barranquilla-1.jpg) (Jdvillalobos, CC BY-SA 4.0) es complemento visual, no base para el exterior.

**Cambios de modelado sustentados.** Mantener la piscina y las tres loggias como organización principal. Asegurar que la torre central sobresalga sólo una planta sobre las alas y tenga cubierta inclinada; marcar arcadas profundas y teja roja. No incorporar salones, ampliaciones no visibles ni escudos/toldos como geometría permanente.

## 6. Estadio Romelio Martínez (`estadio-romelio-martinez`)

**Referencia principal.** [Estadio Romelio Martínez](https://commons.wikimedia.org/wiki/File:BquillaRomelio.jpg) — José David Villalobos, obra propia, **dominio público (PD-self)**. Complementos: [Detalle déco Romelio Martínez](https://commons.wikimedia.org/wiki/File:Barranquilla_-_Detalle_d%C3%A9co_Romelio_Mart%C3%ADnez.jpg) y [Interior Romelio Martínez](https://commons.wikimedia.org/wiki/File:Barranquilla_Interior_Romelio_Mart%C3%ADnez.jpg) — Jdvillalobos, **CC BY 3.0**; [muro exterior con murales](https://commons.wikimedia.org/wiki/File:EstadioRomelioMatrinez.jpg) — Hdedea, **CC BY-SA 3.0**.

**Evidencia visible.** Pabellón de acceso art déco escalonado, torre lateral, aletas, celosías y balcón; cubierta de tribuna larga y curvada sobre estructura repetida; graderías de hormigón. El interior citado conserva el estado previo a remodelaciones recientes. Los murales de Carnaval están en el muro perimetral y son superficie pictórica, no relieve arquitectónico probado.

**Vistas prioritarias.** Exterior oblicuo para pabellón + vuelo de cubierta; detalle frontal del pabellón para celosía y coronamiento; interior histórico para perfil de tribuna.

**Cambios de modelado sustentados.** Dar prioridad a una cubierta de tribuna continua de perfil curvo y al pórtico déco, evitando una “taza” moderna genérica. Mantener las celosías como patrón perforado y dejar los murales como textura opcional. El anillo completo, aforo y estado posterior a obra deben permanecer inferidos hasta tener una fuente equivalente.

## 7. Cine Rex (`cine-rex`)

**Referencia principal.** [2020 Barranquilla — Teatro Rex](https://commons.wikimedia.org/wiki/File:2020_Barranquilla_(Colombia)_-_Teatro_Rex.jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**. Complementos: [Bquilla — 17 ago 2007 046](https://commons.wikimedia.org/wiki/File:Bquilla_-_17_ago_2007_046.jpg) — Jdvillalobos, **dominio público**; [vista lateral 2019](https://commons.wikimedia.org/wiki/File:Ex-teatro_Rex_-_Wikipaseo_fotogr%C3%A1fico_Concepci%C3%B3n_2019_-_(28).jpg) — LuisCG11, **CC BY-SA 4.0**.

**Evidencia visible.** Teatro/comercio de dos niveles con chaflán/esquina redondeada, gran emblema circular sobre el rótulo “RX”, pilonos déco con ranuras verticales, franjas crema, coral y turquesa, y vanos comerciales con persianas en planta baja. La esquina es un frente curvo muy dominante; no se observa una sala desde el exterior.

**Vistas prioritarias.** Frontal diagonal desde la intersección para chaflán, emblema y los dos brazos; lateral para longitudes, ritmo de pilonos y huecos.

**Cambios de modelado sustentados.** Conservar el cuerpo curvo, el emblema RX, pilonos y bandas de color. Añadir los paneles perforados/reticulados que enmarcan el ventanal curvo si aún no son legibles, y asegurar dos niveles visibles en los brazos. No deducir marquesina de cine, platea ni volumen de auditorio a partir de estos frentes comerciales.

## 8. Edificio Scadta (`edificio-scadta`)

**Referencia principal nueva/mejor.** [Antiguo edificio Scadta, Barranquilla (2026)](https://commons.wikimedia.org/wiki/File:Antiguo_edificio_Scadta_Barranquilla_2026-01-22.jpg) — Jdvillalobos, obra propia, **CC BY-SA 4.0**. Complemento ya descargado: [Bquilla — 18 ago 2007 133](https://commons.wikimedia.org/wiki/File:Bquilla_-_18_ago_2007_133.jpg) — Jdvillalobos, **dominio público**.

**Evidencia visible.** Masa `streamline` crema de tres niveles sobre basamento comercial, esquina redondeada y dos balcones curvos apilados; bandas horizontales blancas, ventanales metálicos segmentados, parapeto redondeado y textura de estuco envejecido. La cubierta visible es un parapeto plano con instalaciones menores; la foto no confirma un mirador independiente de azotea.

**Vistas prioritarias.** Esquina frontal a altura de peatón para contar niveles y balcones; lateral largo para el ritmo de ventanas y bandas horizontales.

**Cambios de modelado sustentados.** Modelar los **dos** balcones curvos apilados y las bandas de losas continuas de esquina, no sólo uno. Revisar `Caseta de azotea` y `Mirador curvo de azotea`: dejarlos bajos/neutros o retirarlos si son visibles desde la cámara, porque la fuente sólo acredita parapeto y equipos menores. No reconstruir la cubierta posterior ni el interior.

## 9. Intendencia Fluvial (`intendencia-fluvial`)

**Referencia principal.** [2019 Barranquilla — Edificio Intendencia Fluvial](https://commons.wikimedia.org/wiki/File:2019_Barranquilla_(Colombia)_-_Edificio_Intendencia_Fluvial.jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**. **Complemento nuevo/reutilizable:** [Barranquilla Intendencia Fluvial](https://commons.wikimedia.org/wiki/File:Barranquilla_Intendencia_Fluvial.jpg) — Jdvillalobos, obra propia, **dominio público (PD-self)**.

**Evidencia visible.** Dos plantas de estuco azul claro con molduras, cornisas y esquineros blancos; parapeto plano dentado, vanos verticales con rejas, dinteles y pequeños aleros; balcón con balaustrada y pórtico de acceso de columnas. La composición es de bloque republicano regular, no una torre-campanario.

**Vistas prioritarias.** Tres cuartos de esquina para ambos frentes y el pórtico; fotografía del Malecón para posición en el borde fluvial; detalle del balcón para balaustrada y modulación de la ventana.

**Cambios de modelado sustentados.** La escena debe priorizar esquineros blancos, balcones en más de un frente, parapeto escalonado y repetición de vanos altos. Mantener cubierta a cuatro aguas sólo si queda completamente tras el parapeto y no altera la silueta documentada; no añadir campanario, cúpula, escultura ni interiores.

## 10. Teatro Colón (`teatro-colon`)

**Referencia principal.** [Fachada del Teatro Colón](https://commons.wikimedia.org/wiki/File:2019_Barranquilla_(Colombia)_-_Fachada_del_Teatro_Col%C3%B3n.jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**. **Complemento nuevo:** [Forms del Teatro Colón](https://commons.wikimedia.org/wiki/File:2019_Barranquilla_(Colombia)_-_Forms_del_Teatro_Col%C3%B3n.jpg) — Felipe Restrepo Acosta (Pedro Felipe), obra propia, **CC BY-SA 4.0**. Alterna: [BqTeatroColon](https://commons.wikimedia.org/wiki/File:BqTeatroColon.jpg) — José David Villalobos, **CC BY 3.0**.

**Evidencia visible.** Fachada art déco asimétrica amarilla con remates turquesa: torre lateral cilíndrica/vertical, pared rectangular de bloques de vidrio, ventana corrida alta, ventanas enmarcadas y marquesina turquesa curva y volada sobre accesos. El acabado parece estuco pintado; los bloques de vidrio son un plano modular transparente, no ventana lisa.

**Vistas prioritarias.** Frontal cercano para contar el módulo del vidrio, grosor de la marquesina y accesos; tres cuartos que incluya torre y volumen lateral. La categoría [Teatro Colón (Barranquilla)](https://commons.wikimedia.org/wiki/Category:Teatro_Col%C3%B3n_(Barranquilla)) reúne las cuatro fotografías comprobadas.

**Cambios de modelado sustentados.** Mantener torre lateral y marquesina, sin cúpula. Hacer el muro de bloques de vidrio como retícula con juntas profundas y rematarlo con su marco turquesa; conservar bordes redondeados de la marquesina. No inventar sala, cubierta posterior o composición simétrica tras la fachada.

## 11. Edificio García (`edificio-garcia`)

**Referencia principal.** [Barranquilla Edificio García](https://commons.wikimedia.org/wiki/File:Barranquilla_Edificio_Garc%C3%ADa.jpg) — Jdvillalobos, obra propia (2008), **dominio público (PD-self)**. Referencia alternativa de la misma colección: [BqEdGarcia](https://commons.wikimedia.org/wiki/File:BqEdGarcia.jpg) — Jdvillalobos, obra propia, **dominio público (PD-self)**.

**Evidencia visible.** Edificio art déco/`streamline` de varias terrazas escalonadas: basamento comercial oscuro con persianas, dos largas losas/balcones curvos superpuestos, ventana corrida de esquina, torre posterior más alta con ventanas pequeñas, balcones laterales rectos y bloques de vidrio. Material dominante: estuco gris claro de grano grueso, con marcos crema; no es una caja lisa.

**Vistas prioritarias.** Esquina baja frontal para leer la secuencia de voladizos curvos y el escalonamiento; lateral para los balcones rectos y la torre. Esta es la referencia de mayor peso para sustituir inferencias de la malla asistida por IA.

**Cambios de modelado sustentados.** No hay `tools/modelgen/scenes/edificio-garcia.json`; el GLB Hunyuan3D debe contrastarse contra esta foto antes de cualquier reemplazo. Si se re-modela, fijar: basamento comercial, dos bandas curvas horizontales, torre escalonada, ventanas corridas y bloques de vidrio. No reconstruir fachadas ocultas, planta, cubierta ni colores originales fuera de la toma.

## 12. Bellas Artes (`bellas-artes`)

**Referencia principal.** [Bellas Artes Universidad del Atlántico, 13-jul-2025](https://commons.wikimedia.org/wiki/File:Bellas_Artes_Universidad_del_Atl%C3%A1ntico_13-jul-2025.jpg) — Jdvillalobos, obra propia, **CC BY-SA 4.0**. Complemento: [Facultad de Bellas Artes, Universidad del Atlántico](https://commons.wikimedia.org/wiki/File:Bquilla_-_BellasArtes.jpg) — José David Villalobos, **CC BY 3.0**.

**Evidencia visible.** Fachada de dos plantas de lenguaje neocolonial/revival: estuco claro, pórtico central de columnas, balconada con balaustrada, vanos superiores arqueados, galería lateral de arcos y cubiertas inclinadas de teja. La inscripción institucional identifica la sede fotografiada. No hay evidencia visual de un edificio moderno de hormigón.

**Vistas prioritarias.** Frontal desde el jardín para eje de pórtico, balcón y arcos; oblicua histórica para loggia lateral y faldones de teja.

**Cambios de modelado sustentados.** La escena existente va en la dirección correcta: conservar pórtico, balcón, arcos y teja; mejorar la profundidad de la loggia lateral y los arcos superiores si aún son planos. No cambiarla a masa moderna ni mezclarla con la foto rechazada de otra casa republicana. Siguen sin comprobarse cronología, autoría y laterales/fondo: no completarlos con detalle histórico.

## 13. Caja Agraria (`caja-agraria`)

**Referencia principal.** [Barranquilla — Detrás de la Caja Agraria](https://commons.wikimedia.org/wiki/File:Barranquilla_-_Detr%C3%A1s_de_la_Caja_Agraria.jpg) — Jdvillalobos, obra propia (2008), **dominio público (PD-self)**. Complemento: [CajaAgrariaAtravesada](https://commons.wikimedia.org/wiki/File:CajaAgrariaAtravesada.jpg) — Jdvillalobos, obra propia, **dominio público (PD-self)**.

**Evidencia visible.** Vista trasera/lateral de torre moderna: gran paño ciego blanco de placas/relieve abstracto rectangular irregular, costado de losas horizontales nervadas, azotea técnica con antenas y plaza pavimentada con luminarias. La fachada principal y acceso de Paseo de Bolívar no están documentados en estas fotos.

**Vistas prioritarias.** Frontal de la plaza para escala del paño ciego y su campo de placas; tres cuartos que incluya la arista de losas/nervaduras. No usar fotos tomadas desde la azotea como referencia de su propia fachada.

**Cambios de modelado sustentados.** Sustituir relieves de pocas barras abstractas por un mosaico denso de placas rectangulares desfasadas y extenderlo sobre el paño ciego documentado. Mantener las bandas laterales de losas y remate técnico como masas simples. No añadir quiebrasoles, ingreso principal, ventanas del frente o programa interior: siguen fuera de evidencia; el estatus `evocativo` es correcto.

## Síntesis de prioridad

1. **Alta prioridad de ajuste visual:** Scadta (dos balcones curvos y azotea), San Nicolás (rosetones, no relojes), Caja Agraria (muro de placas), García (malla IA contra única toma canónica) e Intendencia (no torre/campanario).
2. **Referencias nuevas o más útiles sin descarga automática:** Estación Montoya 2024, San Nicolás 2012, Dugand 2007, Intendencia PD 2008 y la toma *Forms* del Colón. Son candidatas para futuras actualizaciones de `assets/reference-images/`, pero esta investigación no altera esos assets.
3. **Límite común:** las fachadas posteriores, plantas, interiores y cubiertas ocultas sólo pueden quedar como masa L1/inferida; no deben presentarse como levantamiento arquitectónico.
