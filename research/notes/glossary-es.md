# DriveReady English → Spanish traffic glossary

_Built 2026-10-14. Use it for every Spanish string in the app: questions, explanations, lessons, signs and UI._

## Sources

Official Spanish-language handbooks, extracted to page-marked text in `research/handbooks/es/` (raw PDFs deleted).
**Page numbers below are the physical PDF page indexes (`=== PAGE n ===` in the .txt), not the printed folio numbers.**

| Code | Handbook | Agency / URL | Edition |
|---|---|---|---|
| CA | *Manual del Automovilista de California* (DL 600 SP) | CA DMV, https://www.dmv.ca.gov/portal/file/california-driver-handbook-spanish-pdf | Rev. 6/2025, 92 pp. |
| TX | *Manual del Conductor de Texas* | TX DPS, https://www.dps.texas.gov/internetforms/Forms/DL-7S.pdf | Rev. Sept 2017 (old: use it for terminology only, never for current numbers), 96 pp. |
| FL | *Manual Oficial de Licencias de Conducir de Florida* | FLHSMV, https://www.flhsmv.gov/pdf/handbooks/spanishdriverhandbook.pdf | Rev. 08/2023, 104 pp. |
| NY | *Manual del conductor* (MV-21S) | NY DMV, https://dmv.ny.gov/brochure/mv21s.pdf | Current download (Oct 2026), 81 pp. |

Search helpers: `grep -n` the .txt files. CA's extraction drops the "fi"/"fl" ligatures (e.g. "tráfco", "signifca"), so search CA with `f[il]?`.

---

## 1. Register and style

**Formal *usted*, always** (for content: questions, explanations, lessons, state facts, signs. The app's own UI copy, such as buttons, menus and settings, uses *tú*; see `app/docs/TRANSLATION.md`). All four handbooks address the reader as *usted*, using formal imperatives: *Deténgase*, *Ceda el paso*, *Fíjese*, *Mire sobre su hombro*, *Reduzca la velocidad*, *Ponga la luz direccional* (CA p24–25, TX p35, NY p29). Never use *tú*. FL slips into *tú* a few times ("Vas en la dirección equivocada", FL p55; "aparques", FL p72). Treat those as errors.

**Neutral US Spanish, leaning Mexican-American.** CA reads most like Mexican-American Spanish (*manejar, dar vuelta, rebasar, llantas, defensa, cajuela, acotamiento*). TX is neutral Latin American (*conducir, doblar/cruzar, adelantar, neumáticos, letrero*). FL has many Spain-flavoured terms (*aparcar, arcén, luces de cruce, hora punta, colegio, motorista*). NY is neutral (*conducir, girar/viraje, rebasar, llantas, bordillo, orilla del camino*). The app uses the **neutral term that appears in the most handbooks**. Where only one region's word is clearest, the app glosses it once in parentheses, e.g. *arcén (acotamiento)*.

**How the handbooks phrase rules**
- They use plain imperatives for actions: *"Deténgase antes de la línea de alto."* (NY p29) and *"No cruce líneas amarillas dobles y continuas."* (CA p19).
- They use *debe* + infinitive for legal duties: *"Usted debe ceder el paso a los autobuses escolares."* (TX p33).
- Prohibitions are written as *No* + subjunctive (*No rebase*, *No se estacione*) or *Está prohibido* + infinitive (TX p40). Use *Es ilegal / Es contra la ley* (CA p23) for law statements.
- Definitions use *significa* or *indica*: *"Una luz roja intermitente significa lo mismo que una señal de alto"* (NY p31).
- Distances keep US units: *pies*, *millas*, *mph*, sometimes followed by metric (*25 mph (40 km/h)*, NY p30). The app keeps feet/miles/mph and writes numbers as digits.

**How questions are phrased** (FL p99–101 study guide; NY chapter review questions)
- *¿Qué debe hacer si/cuando…?* is the dominant stem. Example: *"¿Qué debe hacer cuando ve a un peatón con un bastón blanco…?"* (FL p101).
- Other stems: *¿Qué significa…?*, *¿Cuál es…?*, *¿Cuándo puede…?*, *¿A cuántos pies de distancia debe…?*, *¿Dónde está prohibido estacionarse?*
- Questions open with **¿** and use *usted* forms (*debe, puede, su vehículo*). Answer options are short infinitives or noun phrases with no final period. Explanations use the imperative style.

**Signs keep their English legend.** Real US signs are in English, so all handbooks quote the legend in English capitals and explain it in Spanish: *señal de alto (STOP)*, *ceder el paso (YIELD)*, *"DO NOT ENTER"*, *"WRONG WAY"*, *"NO TURN ON RED" (prohibido dar vuelta en rojo)*, *"WALK" (camine)* (CA p39–44, NY p29–31). App pattern: **Spanish name + legend in English capitals in parentheses**, e.g. *Señal de ALTO (STOP)*. Sign images stay as they are.

**False friends and ambiguities to avoid**
- **matrícula**: means *vehicle registration* in CA ("matrícula vehicular") and FL, but *license plate* in TX (p25) and NY (p24). The app uses **registro del vehículo** for registration and **placa(s)** for plates. Do not use *matrícula* on its own.
- **luces de cruce**: means *turn signals* in TX (p48) but *low beams* in FL (p80, the Spain usage). Never use it. Say *luces direccionales* or *luces bajas*.
- **prohibido el paso**: TX labels the no-passing pennant as "prohibido el paso" (p36), but in CA that phrase means *do not enter* (p44). For "no passing" use **prohibido rebasar / zona de no rebasar**. For "do not enter" use **No entre**.
- **cruzar (a la izquierda)**: TX uses it for *turn* (p35). The app uses **girar** and keeps *cruzar* for "to cross".
- **intermitentes**: the plain noun is ambiguous (flashing signals or hazard lights). Say **luces de emergencia** for hazard lights and *luz … intermitente* for flashing signals.
- **registro**: can mean registration, registry or record. Write *registro del vehículo* for registration and *expediente de manejo* for driving record.

**Verbs to use:** *conducir* (TX, FL, NY; CA uses *manejar*). *girar / giro* (all four; CA *dar vuelta*, TX *doblar*, NY *virar/viraje*). *rebasar* (CA, FL, NY; TX/FL *adelantar*). *detenerse* (all; CA also *parar*). *estacionar(se)* (all; FL also *aparcar*). *ceder el paso* (all four).

---

## 2. Glossary (358 terms)

Columns: **English | Spanish (app standard) | Handbook evidence (state pPDF) | Notes / alternatives**

### 2.1 General and road

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| driver | conductor / conductora | CA p5, TX p1, FL p6, NY p3 | CA also uses *automovilista* (p1) |
| motorist | automovilista | CA p1, FL p8, NY p58 | |
| passenger | pasajero | CA p59, TX p9, NY p13 | |
| vehicle | vehículo | all | |
| passenger vehicle | vehículo de pasajeros | CA p48 | |
| to drive | conducir | TX, FL, NY (passim) | CA *manejar* |
| road / roadway | vía; camino | CA p19, TX p30, NY p28 | *calzada* (TX p53, FL p35) for the travelled surface |
| street | calle | CA p22, TX p30, NY p34 | |
| highway | carretera | CA p18, FL p6, NY p4 | TX uses *autopista* for most highways |
| freeway / expressway | autopista | CA p29, TX p31, FL p71, NY p61 | NY also *vía rápida* (p61) |
| interstate | autopista interestatal | TX p42, FL p54 | |
| controlled/limited-access highway | autopista de acceso limitado | FL p71, NY p37 | TX/NY *acceso controlado* (TX p31, NY p35) |
| divided highway | carretera dividida | CA p43, FL p57, NY p40 | TX *autopista dividida* (p37) |
| frontage road / service road | calle lateral | TX p31 | |
| intersection | intersección | CA p45, TX p30, FL p55, NY p29 | |
| uncontrolled intersection | intersección no controlada | CA p45, NY p34 | TX *intersección sin controles* (p33) |
| T-intersection | intersección en T | TX p30, p38; CA p28 ("en forma de T") | |
| roundabout | rotonda | TX p60, FL p57, NY p35 | CA *glorieta* (p46) |
| block (city) | cuadra | CA p30, TX p34, NY p44 | |
| alley | callejón | CA p57, TX p30, FL p70, NY p68 | |
| driveway | entrada de autos | NY p43 | CA *entrada particular* (p33); TX *camino de acceso privado* (p30) |
| sidewalk | acera | CA p34, TX p30, FL p56, NY p43 | |
| curb | bordillo | TX p52, FL p29, NY p36 | CA *borde de acera* (p24, p33) |
| shoulder | arcén | CA p21, TX p39, p41, FL p72, p81 | **Choice: arcén** (3 of 4 handbooks). Alternatives: *acotamiento* (CA p21, p33, written "acotamiento/arcén"), *orilla del camino* (NY p38), *hombrillo* (TX p76, once). Gloss once in lessons as *arcén (acotamiento)*. |
| median | mediana | TX p33, p37, FL p57, p97 | CA *divisor central* (p21, p25); NY *camellón* (p61) |
| bridge | puente | TX p38, FL p58, NY p39 | |
| tunnel | túnel | CA p30, TX p48, NY p39 | |
| curve | curva | CA p30, TX p37, FL p57 | |
| hill / grade | cuesta; pendiente | CA p30, FL p29; TX p54, NY p43 | NY *colina* (p39) |
| uphill / downhill | cuesta arriba / cuesta abajo | CA p33, FL p29, p101 | |
| traffic (flow) | tráfico | CA p19, TX p31, FL p51 | *tránsito* (NY, TX) in set phrases: *señal de tránsito, ley de tránsito* |
| toll | peaje | CA p59, TX p57, FL p71 | |
| rest area | área de descanso | CA p42; NY p30 ("áreas de descanso") | |
| mile marker | marcador de millas | FL p54 | TX *hito* (p42) |
| safety zone (transit) | zona de seguridad | CA p34, p49, TX p52 | |
| residential district | zona residencial | CA p26, TX p52, FL p100 | |
| business district | distrito comercial | TX p72 | CA *zona comercial* (p26) |

### 2.2 Signs

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| traffic sign | señal de tránsito | NY p29, FL p54 (*señal de tráfico*) | TX *letrero* (p35); the app uses *señal* |
| stop sign | señal de ALTO (STOP) | CA p41, NY p29 | FL *señal de pare* (p55); TX *letrero de alto* (p40) |
| yield sign | señal de CEDA EL PASO (YIELD) | CA p44, NY p29 | FL *Ceda el Paso* (p55) |
| do not enter | NO ENTRE (DO NOT ENTER) | CA p44, FL p55, TX p59 | **not** *prohibido el paso* (see §1) |
| wrong way | SENTIDO CONTRARIO (WRONG WAY) | CA p44 | FL *Dirección incorrecta* (p55); TX p40 *dirección incorrecta* |
| one way | UN SOLO SENTIDO (ONE WAY) | CA p42, TX p43 | FL *Una vía* (p56); NY *una sola vía* (p31) |
| two-way traffic | tráfico de doble sentido | CA p42–43, FL p57 | |
| no passing zone | zona de no rebasar | TX p48 (*zona de no adelantar*), FL p75 (*zonas de No Adelantar*) | CA sign label *Prohibido rebasar* (p42). Avoid *prohibido el paso*. |
| no-passing pennant sign | señal de banderín (zona de no rebasar) | TX p36 ("Banderín") | |
| school zone | zona escolar | TX p41, FL p37, NY p37 | |
| school crossing | cruce escolar | FL p38, p97, TX p36 | |
| pentagon (school sign) | pentágono / señal de 5 lados | TX p36, CA p44 | |
| railroad crossing sign | señal de cruce de ferrocarril | FL p64, NY p60 | |
| crossbuck | señal en forma de X (cruz de ferrocarril) | CA p44 ("en forma de X"); TX p32, p42 ("cruz de ferrocarril") | Use *crossbuck* in parentheses on first mention |
| railroad advance warning sign (round) | señal circular amarilla de cruce de ferrocarril | CA p44, TX p36 ("Circular") | |
| warning sign | señal de advertencia | CA p43, FL p57, NY p30 | TX *letrero de advertencia* (p36) |
| regulatory sign | señal reglamentaria | FL p55 | NY *señal de reglamentación* (p29); CA *señal regulatoria* (p42) |
| guide sign | señal de guía | CA p42, FL p54 | NY *señal de destino* (p30) |
| service sign | señal de servicios | NY p29–30, FL p54 | |
| route marker | señal de ruta | NY p30 | |
| work zone | zona de trabajo | FL p38, NY p30, p49 | CA *zona de obras* (p55) |
| construction / maintenance sign (orange) | señal de construcción y mantenimiento (anaranjada) | CA p42, NY p30 | FL/TX *naranja* |
| flagger | persona con banderas (abanderado) | NY p30 | CA *obreros con banderines* (p42); TX *trabajador con una bandera* (p31) |
| detour | desvío | FL p47, NY p49 | TX *desviación* (p41) |
| road closed ahead | vía cerrada más adelante | CA p42, TX p41 | |
| lane ends | fin de carril | CA p20, p43 | TX p39 ("El carril termina más adelante") |
| merging traffic | incorporación de tráfico | CA p43 | |
| added lane | carril adicional | CA p43, TX p37 | |
| end divided highway | fin de carretera dividida | CA p43 | |
| signal ahead | semáforo más adelante | CA p43 | |
| stop ahead | alto más adelante | CA p43, TX p39 | |
| sharp curve | curva cerrada | FL p60 | TX *curva brusca* (p37) |
| winding road | camino sinuoso | TX p37 | CA *vía sinuosa* (p43) |
| crossroad | cruce de vías | CA p43, TX p37 | |
| slippery when wet | resbaladizo cuando está mojado | CA p43 | TX *resbaloso* (p39) |
| narrow bridge | puente angosto | TX p88 | FL *puente estrecho* (p58) |
| deer crossing | cruce de venados | NY p63–64 (venado) | FL *cruce de animales / ciervo* (p58, p79) |
| pedestrian crossing (sign) | cruce de peatones | TX p33, NY p32 | |
| low clearance | altura libre (paso a desnivel) | TX p37 | |
| downgrade | bajada pronunciada | TX p39, FL p63 | |
| loose gravel | gravilla suelta | TX p38 | |
| speed limit sign | señal de límite de velocidad | FL p55, NY p30 | |
| advisory speed sign | señal de velocidad recomendada | NY p30 | TX *letrero de advertencia de velocidad* (p40) |
| keep right | manténgase a la derecha | FL p56, NY p34 | CA *conserve su derecha* (p42) |
| slower traffic keep right | tráfico lento, manténgase a la derecha | FL p56, CA p42 | |
| no U-turn | prohibido dar vuelta en U (NO U-TURN) | CA p26, p42, TX p40 | FL *Sin Vuelta en U* (p56) |
| no turn on red | prohibido girar en rojo (NO TURN ON RED) | CA p24, NY p31 | FL *No Girar en Rojo* (p56) |
| no left turn | prohibido girar a la izquierda | CA p42 | |
| no parking | prohibido estacionarse (NO PARKING) | CA p34, p42 | |
| octagon / triangle / diamond | octágono / triángulo / rombo | TX p36; CA p44 (*rombo*) | TX/NY/FL also *diamante* |
| red circle with slash | círculo rojo con una línea diagonal | CA p44, NY p29, FL p55 | |
| slow-moving vehicle emblem | emblema de vehículo de marcha lenta | CA p43, p51 (triángulo anaranjado) | FL *Vehículos Lentos* (p97) |
| hazardous materials placard | cartel de cargas peligrosas | CA p43 | |

### 2.3 Signals

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| traffic light / signal | semáforo | CA p39, TX p35, FL p59, NY p30 | |
| steady red light | luz roja fija | CA p39, TX p35, NY p31 | |
| flashing red light | luz roja intermitente | CA p39, TX p35, FL p60, NY p31 | |
| steady yellow light | luz amarilla fija | CA p39, TX p35, FL p63, NY p31 | |
| flashing yellow light | luz amarilla intermitente | CA p40, TX p35, FL p60, NY p33 | |
| steady green light | luz verde fija | CA p40, TX p35 | NY *verde fija* (p31) |
| green arrow | flecha verde | CA p40, TX p35, FL p60, NY p31 | |
| yellow arrow | flecha amarilla | CA p39, TX p35, FL p60, NY p31 | |
| flashing yellow arrow | flecha amarilla intermitente | CA p40, TX p35 | |
| red arrow | flecha roja | CA p39, TX p35, FL p60, NY p31 | |
| protected turn | giro protegido | TX p41 | CA *vuelta amparada* (p40) |
| signal out of order / dark | semáforo apagado (que no funciona) | CA p40, NY p30 | Treat as an all-way stop |
| pedestrian signal | semáforo peatonal | CA p41 | FL *señales para peatones* (p63) |
| WALK / DON'T WALK | CAMINE (WALK) / NO CAMINE (DON'T WALK) | CA p41, TX p33, FL p63 | |
| countdown (pedestrian) | cuenta regresiva | CA p41 | |
| pedestrian push button | botón de activación peatonal | CA p41 | |
| pedestrian hybrid beacon | señal híbrida de advertencia para peatones | TX p34 | |
| lane-use control signals | señales de control de uso del carril | TX p42; NY p31 (*luces de control para uso de los carriles*) | red X = no conduzca en este carril |
| ramp meter | semáforo de la rampa | TX p39 | |
| red-light camera | cámara de luz roja | TX p41 (describes the sign: "Se toma una fotografía del conductor…") | The term itself is not in the handbooks. Use a descriptive phrase. |
| flashing lights (railroad) | luces intermitentes | TX p43 | |
| crossing gate (railroad) | barrera | TX p31, p43, FL p64 | |

### 2.4 Pavement markings

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| pavement markings | marcas en el pavimento | TX p43, NY p31 | CA *demarcaciones* (p19) |
| solid yellow line | línea amarilla continua | CA p19, TX p44 | |
| double solid yellow lines | líneas amarillas dobles continuas | CA p19, TX p43 | FL *doble línea amarilla continua* (p52, p99) |
| broken (dashed) line | línea discontinua | CA p19, TX p43 | NY *línea punteada* (p32); FL *línea entrecortada* (p51) |
| solid white line | línea blanca continua | CA p19, TX p44 | |
| double solid white lines | líneas blancas dobles continuas | CA p20, TX p41, FL p51 | Do not cross |
| center line | línea central | TX p50, FL p99, NY p34 | |
| edge line | línea de borde | TX p44, FL p51 | NY *línea de orilla* (p31) |
| stop line | línea de alto | NY p29, p32, TX p44, CA p39 | CA *línea límite* (p24); FL *línea de detención / de pare* (p28, p55) |
| crosswalk | cruce peatonal | CA p24, TX p72, FL p101, NY p32 | **Choice: cruce peatonal** (all 4). Alternatives: *paso peatonal* (TX p33), *paso de peatones* (FL p28, NY p29). |
| yield line (shark teeth) | línea para ceder el paso | CA p20 | |
| lane-drop markings | demarcaciones de fin de carril | CA p20 | |
| diagonal hatch lines | líneas diagonales | CA p23, p34, NY p44 | FL/TX *rayas diagonales* (p54, p46) |
| HOV diamond | símbolo en forma de rombo | CA p22 | |
| shared-lane marking (sharrow) | demarcación de vía compartida (sharrow) | CA p23, FL p53 | |
| bike box | recuadro para bicicletas | NY p69 | |
| raised pavement markers (reflectors) | botones reflectantes | CA p44 | FL *reflectores* (p100: red reflectors = wrong way) |
| rumble strips | bandas sonoras | TX p81 | TX p39 *surcos* (grooved pavement) |
| yellow-painted curb | bordillo pintado de amarillo | FL p54 | CA curb colors (p34): *rojo, amarillo, blanco, verde, azul* |

### 2.5 Right-of-way and turns

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| right-of-way | derecho de paso | TX p30, FL p28, NY p29 | CA *preferencia de paso* (p45); NY once *derecho de vía* (p67) |
| to yield | ceder el paso | CA p20, TX p30, FL p53, NY p29 | |
| all-way / four-way stop | ALTO en todas las direcciones | CA p40, p45 | FL sign *Parada Total* (p55); TX p41 |
| first come, first served | el primero en llegar pasa primero | CA p45, FL p55 | Rule: yield to the vehicle on your right |
| complete stop | detenerse por completo / alto total | NY p29, CA p41 | FL *parada completa* (p70, p100) |
| turn (noun) | giro | FL p56, TX p73 | CA *vuelta* (p24); NY *viraje* (p29) |
| to turn | girar | CA p16, TX p50, FL p52, NY p30 | CA *dar vuelta*; TX *doblar* (p35), *cruzar* |
| right turn | giro a la derecha | FL p56, TX p73 | CA *vuelta a la derecha* (p24) |
| left turn | giro a la izquierda | FL p100 | CA *vuelta a la izquierda* (p25) |
| U-turn | vuelta en U | CA p26, TX p40, FL p56 | NY *viraje en U* (p4); TX/FL *giro en U* |
| three-point turn | giro de tres puntos | FL p29, p100 | |
| right on red | girar a la derecha con luz roja | CA p24, NY p31 | |
| wide turn (trucks) | giro amplio / vuelta abierta | TX p61, CA p49 | |
| turn signal | luz direccional | CA p17, p21 | *direccionales* (CA p12, FL p18, NY p61). **Avoid** *luces de cruce* (§1). |
| to signal | señalizar / poner la direccional | CA p16, FL p71, NY p61 | |
| hand-and-arm signals | señales con la mano | CA p16, TX p48, NY p68 | FL/NY *señales manuales* (FL p29, NY p36); FL *señal de brazo* (p100) |
| emergency vehicle | vehículo de emergencia | CA p51, TX p32, FL p92, NY p35 | |
| siren | sirena | CA p51, TX p32, NY p35 | |
| ambulance / fire truck / police car | ambulancia / camión de bomberos / patrulla | CA p51, TX p32 | |
| Move Over law | ley "Move Over" (de moverse a un lado) | FL p101 | TX p32 (*desocupar el carril … o desacelerar*) |
| funeral procession | cortejo fúnebre | CA p59, FL p92 | |
| blind pedestrian (white cane, guide dog) | peatón ciego (bastón blanco, perro guía) | CA p48, FL p96, NY p67 | |

### 2.6 Lanes

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| lane | carril | all | |
| left / right lane | carril izquierdo / derecho | CA p21, TX p39, FL p55, NY p32 | |
| passing lane | carril para rebasar | CA p21, NY p70 | TX/FL *carril de adelantamiento* (TX p61, FL p92) |
| center (two-way) left-turn lane | carril central para girar a la izquierda | FL p53, CA p22 (*… dar vuelta …*), TX p43 | FL sign *Carril Central de Giro* (p55) |
| turn lane | carril de giro | FL p55–56 | |
| reversible lane | carril reversible | FL p53 | |
| HOV / carpool lane | carril HOV (para vehículos de alta ocupación) | CA p21–22, TX p40, FL p77, NY p33 | CA *carril de transporte colectivo* |
| bike lane | carril para bicicletas | FL p101, NY p68 | CA *ciclovía* (p23) |
| turnout (slow-vehicle) | apartadero | CA p22 | |
| to change lanes | cambiar de carril | CA p21, TX p46, FL p51, NY p31 | |
| blind spot | punto ciego | CA p21, TX p49, FL p90, NY p39 | FL also *ángulo muerto* (p47) |
| look over your shoulder | mire sobre su hombro | CA p21, p24, NY p39 | |
| rearview mirror | espejo retrovisor | CA p32, TX p16, FL p18, NY p39 | |
| side mirrors | espejos laterales | CA p48, TX p61, FL p67, NY p43 | |
| lane splitting (motorcycles) | circular entre carriles | CA p50 | Legal in CA only. Treat as state-specific. |

### 2.7 Freeway driving

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| on-ramp / entrance ramp | rampa de entrada | CA p29, TX p85, FL p71, NY p61 | |
| off-ramp / exit ramp | rampa de salida | TX p40, FL p55, NY p61 | |
| exit (noun) | salida | CA p29, TX p42, FL p54 | |
| to merge | incorporarse (al tráfico) | CA p29, TX p39, FL p71 | |
| merging (noun) | incorporación | CA p29, TX p81 | |
| acceleration lane | carril de aceleración | TX p81, FL p71, p100 | |
| deceleration lane | carril de desaceleración | TX p81 | |
| exit speed (sign) | velocidad de salida | FL p55 | |
| missed your exit | se pasó la salida | FL p100 | Never back up on the freeway |
| interchange | intercambio vial | (not in handbooks) | Rare in tests. Use the descriptive phrase. |

### 2.8 Passing

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| to pass / overtake | rebasar | CA p30–31, FL p75, NY p39 | TX/FL *adelantar* (TX p33, FL p56) |
| passing on the right | rebasar por la derecha | CA p31, NY p4 | |
| being passed | cuando lo rebasan | CA p31, NY p4 | |
| oncoming traffic | tráfico que viene en sentido contrario | CA p25, TX p35 | |

### 2.9 Parking

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| to park | estacionar(se) | CA p32, TX p52, NY p42 | FL *aparcar* (p29), Spain usage, so avoid |
| parallel parking | estacionarse en paralelo | CA p32, TX p15, NY p42 | |
| parking on a hill | estacionamiento en cuesta | CA p33 | |
| turn wheels toward the curb | gire las ruedas hacia el bordillo | TX p53, NY p42; CA p33 (*borde de acera*) | |
| parking brake | freno de estacionamiento | CA p32, FL p46, NY p42 | TX/CA *freno de mano* (TX p25) |
| fire hydrant | hidrante | TX p52, FL p74, NY p43 | CA *toma de agua para incendios* (p34) |
| disabled parking | estacionamiento para personas con discapacidad | CA p34, TX p52, NY p44 | |
| disabled placard | cartel/placa para personas con discapacidad | CA p34 | |
| no parking zone | zona de estacionamiento prohibido | CA p34, FL p54 | |
| double parking | estacionarse en doble fila | FL p74 | |
| fire lane | carril de bomberos | FL p54 (*carriles contra incendios*) | |
| to back up / reverse | retroceder | CA p33, TX p15, FL p73, NY p61 | |
| backing in a straight line | retroceder en línea recta | CA p33 | |

### 2.10 Speed and following distance

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| speed limit | límite de velocidad | CA p52, TX p32, FL p25, NY p30 | |
| maximum speed | velocidad máxima | CA p49, TX p40, FL p55, NY p52 | |
| minimum speed | velocidad mínima | NY p47 | FL p100 *conducir demasiado despacio* |
| basic speed law | ley de velocidad básica | CA p73, TX p83 | |
| safe speed | velocidad prudente | CA p29, p67 | FL *velocidad segura* (p72) |
| advisory speed | velocidad recomendada | NY p30 | |
| speeding | exceso de velocidad | FL p36, NY p19, TX p70 | |
| fines doubled | multas duplicadas | FL p55 | |
| following distance | distancia de seguimiento | CA p50, TX p55, FL p69 | |
| three-second rule | regla de los tres segundos | CA p63, p90 (*regla de tres segundos*) | NY p47 has the 2-second rule |
| tailgating | seguir demasiado cerca | CA p49, p63 | NY p22 *seguir muy de cerca* |
| space cushion | colchón de espacio | NY p47 | |
| stopping distance | distancia de frenado | TX p82, FL p68 | |
| perception distance | distancia de percepción | TX p82, FL p68 | |
| reaction time / distance | tiempo / distancia de reacción | CA p63, FL p68; TX p82 | |
| peripheral vision | visión periférica | TX p84, FL p68 | |

### 2.11 Sharing the road

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| pedestrian | peatón | CA p47, TX p33, FL p48, NY p32 | |
| bicyclist | ciclista | CA p23, TX p64, FL p52, NY p39 | |
| bicycle | bicicleta | CA p23, TX p52, FL p53, NY p39 | |
| 3-foot passing rule (bikes) | distancia de tres pies | CA p23 | |
| motorcycle / motorcyclist | motocicleta / motociclista | CA p50, TX p62, FL p93, NY p69 | FL *motorista* (p101), Spain usage, so avoid |
| moped | ciclomotor | TX p10, NY p17 | TX *motoneta* (p77) |
| large truck / large vehicle | camión grande / vehículo grande | CA p48–49, NY p73 | |
| tractor-trailer | tractocamión | TX p56, p76 | |
| no-zone (truck blind spots) | zona de no visibilidad ("No-Zone") | FL p101; FL p68 *zonas sin visibilidad* | CA *zonas muertas* (p48) |
| school bus | autobús escolar | CA p57, TX p33, FL p4, NY p40 | |
| school bus stop arm | señal de alto extensible del autobús escolar | NY p22, p40 | FL *señal de alto* (p4) |
| flashing red lights (bus) | luces rojas intermitentes | CA p57, TX p33, NY p40 | |
| crossing guard | guardia de cruce | FL p65, p97 | |
| light rail / streetcar | tren ligero / tranvía | CA p49–50, TX p63 | |
| railroad crossing | cruce de ferrocarril | FL p64, NY p60 | **Choice.** TX *cruce ferroviario* (p31); CA/NY *paso a nivel* (CA p26, NY p59) |
| train tracks | vías del tren | CA p56, TX p42, FL p64 | NY *vía férrea* (p59) |
| stalled on the tracks | atascado en las vías del tren | FL p7, p88 | |
| farm vehicle | vehículo agrícola | TX p27, FL p97, NY p75 | |
| slow-moving vehicle | vehículo de marcha lenta | CA p43, p51 | |
| animals on the road | animales en la vía | CA p52, FL p58 | |
| wheelchair | silla de ruedas | CA p47, TX p39, FL p96 | |

### 2.12 Hazards and conditions

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| hydroplaning | hidroplaneo | FL p7, p80 | CA *hidroplanear* (p68); TX/NY *deslizamiento sobre el agua* (TX p82, NY p62) |
| skid | derrape | CA p66, TX p58, FL p86 | verb *derrapar* |
| traction | tracción | CA p66, TX p59, NY p62 | |
| fog | niebla | CA p70, FL p69, NY p62 | TX *neblina* (p57) |
| black ice | hielo negro (capa delgada de hielo transparente) | (not in handbooks) | None of the 4 names it. CA p66–67 and NY p62 say *hielo*. Explain it on first use. |
| ice / packed snow | hielo / nieve compacta | CA p66–67, TX p59 | |
| bridge ices before road | el puente se congela primero | TX p38 | |
| slippery road | vía resbaladiza | CA p66, NY p62 | TX *resbaloso* |
| rain / snow | lluvia / nieve | CA p67, NY p62 | |
| wet leaves | hojas mojadas | CA p66, NY p62 | |
| gust of wind | ráfaga de viento | CA p68, TX p62, FL p95 | |
| glare | resplandor | CA p66, TX p85, NY p52 | |
| night driving | conducir de noche | TX p57, FL p81, NY p51 | |
| high beams | luces altas | CA p65, TX p61, FL p90, NY p62 | FL also *luces de carretera / largas* |
| low beams | luces bajas | CA p65, TX p85, FL p79 | **Avoid** *luces de cruce* (§1) |
| visibility | visibilidad | CA p57, TX p48, NY p61 | |
| drowsy driving | conducir con somnolencia | FL p43, TX p58 | NY *fatiga* (p50) |
| distracted driving | conducción distraída | FL p42, p99 | |
| texting | enviar mensajes de texto | CA p76, TX p64, FL p42, NY p51 | |
| cell phone / hands-free | teléfono celular / manos libres | CA p76, TX p58 | |
| defensive driving | conducción defensiva | FL p83, NY p45 | |
| aggressive driving | conducción agresiva | TX p77, NY p45 | |
| road rage | furia al volante | FL p44 | TX *agresividad al volante* (p77) |
| soft / low shoulder | arcén blando / desnivel con el arcén | TX p38–39 | |
| flooded road / submerged vehicle | vía inundada / vehículo sumergido | FL p7, p88 | |
| work zone hazards | zona de trabajo | NY p49 | |

### 2.13 Emergencies

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| tire blowout | reventón de llanta | FL p7, p88, CA p74 | NY *llanta reventada* (p64) |
| flat tire | llanta desinflada (ponchada) | TX p58–59 (*neumático desinflado o pinchado*) | *llanta* (CA, FL, NY) is preferred over *neumático* |
| brake failure | falla de los frenos | TX p59, NY p64 | |
| pump the brakes | bombear los frenos | CA p67, FL p49, NY p63 | |
| stuck accelerator | acelerador atascado | FL p7, p87 | |
| running off the pavement | salirse del pavimento | TX p39, p59, NY p64 | |
| vehicle breakdown | avería | CA p44, FL p72 | TX *descompostura* (p42, p58) |
| hazard (emergency) flashers | luces de emergencia | CA p18, TX p58, FL p85, NY p64 | |
| flares | bengalas | FL p73 | |
| oncoming vehicle in your lane | vehículo que se aproxima de frente en su carril | NY p64 | |
| collision / crash | choque | CA p17, FL p47, NY p49 | *colisión* (TX p6, NY p5) is the formal synonym |
| accident report | informe de accidente | NY p21, p76 | CA *reporte* (p84) |
| hit-and-run / leaving the scene | darse a la fuga / abandonar el lugar del accidente | CA p60; FL p38, NY p21 | |

### 2.14 Alcohol and drugs

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| blood alcohol concentration (BAC) | concentración de alcohol en la sangre (BAC) | CA p79, p90, TX p23, p66 | NY *contenido de alcohol en la sangre* (p54) |
| DUI | conducir bajo los efectos del alcohol o drogas (DUI) | CA p78, FL p26, p33 | |
| DWI | conducir intoxicado (DWI) | TX p20, p68, NY p20 | Keep the state's own acronym |
| under the influence | bajo los efectos / bajo la influencia | CA p78, FL p32; TX p66, NY p51 | |
| implied consent | consentimiento implícito | TX p67, FL p33, NY p12 | |
| refuse a test | negarse a la prueba | CA p80, TX p68, FL p33, NY p55 | |
| chemical test | prueba química | CA p81, NY p23, p55 | |
| breath test | prueba de aliento | CA p80, TX p20, FL p26, NY p55 | CA also *alcoholímetro* (p80) |
| blood test | análisis de sangre | FL p33 | |
| field sobriety test | prueba de sobriedad | TX p84 | |
| open container | contenedor abierto | TX p67, NY p56 | NY also *recipiente abierto* |
| ignition interlock device | dispositivo de bloqueo del encendido | TX p16, p68, FL p34, NY p56 | CA *interlock* (p80) |
| zero tolerance | tolerancia cero | FL p34, NY p21 | |
| under 21 | menor de 21 años | CA p79, TX p9, FL p25, NY p8 | |
| designated driver | conductor designado | TX p82, FL p43, NY p58 | |
| prescription medications | medicamentos recetados | CA p15, p78, TX p66 | |
| drugs | drogas | CA p78, TX p66, FL p33, NY p53 | |

### 2.15 Licensing and administration

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| driver license | licencia de conducir | FL p3, NY p3, TX p7 | CA *licencia de manejar*; TX also *licencia para conducir* |
| learner permit | permiso de aprendizaje | TX p7, FL p6, NY p4 | CA *permiso de instrucción* (p5); TX *licencia de aprendiz* (p7) |
| provisional license | licencia provisional | CA p61, TX p8 | NY *licencia juvenil* (p4, p13) |
| graduated driver license (GDL) | programa de licencia graduada (GDL) | TX p8–9 ("GDL") | |
| junior license (NY) | licencia juvenil (Clase DJ) | NY p4, p6 | |
| supervising driver | conductor supervisor | NY p13–14 | |
| knowledge test | examen de conocimientos | TX p7, FL p3, NY p8 | CA *examen teórico* (p7) |
| road test / driving test | examen de manejo | CA p7, TX p8 | NY *prueba práctica (de conducción)* (p7, p14); FL *examen de habilidades de conducción* (p28) |
| vision test | examen de la vista | CA p8, TX p7, FL p12, NY p8 | |
| driver education course | curso de educación vial | CA p8, FL p17 | |
| driving school | escuela de manejo | CA p9, NY p12 | |
| points / point system | puntos / sistema de puntos | TX p22, FL p37, NY p21 | |
| driving record | expediente de manejo | CA p59, TX p22, NY p15 | |
| traffic violation | infracción de tránsito | CA p90, TX p21, FL p25, NY p19 | |
| traffic ticket | multa | CA p35, TX p15, FL p25, NY p19 | NY *boleta de tránsito* (p4); FL/TX *citación* |
| reckless driving | conducción temeraria | FL p25, p38 | NY *conducción imprudente* (p19); CA *manejo imprudente* (p59) |
| suspension / revocation | suspensión / revocación | TX p20, FL p23, NY p19 | |
| insurance | seguro | CA p12, TX p13, FL p31, NY p9 | |
| proof of insurance | comprobante de seguro | CA p12, p80, TX p70 | |
| financial responsibility | responsabilidad financiera | CA p82, TX p13, FL p31 | |
| liability insurance | seguro de responsabilidad civil | CA p82, FL p23, NY p58 | |
| vehicle registration | registro del vehículo | TX p13, p25, FL p5, NY p24 | CA *matrícula vehicular* (p2). Avoid bare *matrícula* (§1). |
| license plates | placas | CA p6, FL p32, NY p21 | TX/NY *matrícula(s)* for plates |
| title (vehicle) | certificado de título | NY p9, p24, FL p45 | |
| vehicle inspection | inspección del vehículo | TX p4, p25, NY p27 | |
| sticker (registration/inspection) | calcomanía | CA p2, TX p19, NY p24 | |
| ID card | tarjeta de identificación | TX p11, FL p13, NY p9 | CA *tarjeta de identidad* |
| renewal | renovación | CA p38, TX p11, FL p20, NY p17 | |
| change of address | cambio de dirección | CA p14, FL p20, NY p17 | |
| commercial driver license (CDL) | licencia de conducir comercial (CDL) | TX p9, NY p6 | |
| law enforcement officer | oficial de policía | CA p36, NY p16 | TX *funcionario de orden público* (p35); FL *agente* |

### 2.16 Vehicle parts and controls

| English | Spanish | Evidence | Notes |
|---|---|---|---|
| steering wheel | volante | CA p25, TX p39, FL p18, NY p38 | |
| brake / brake pedal | freno / pedal del freno | CA p12, p28, FL p49, NY p64 | |
| antilock brakes (ABS) | frenos antibloqueo (ABS) | CA p66, FL p86, NY p63 | |
| emergency brake | freno de emergencia | CA p12, TX p76 | |
| accelerator / gas pedal | acelerador | CA p28, TX p58, FL p87, NY p63 | |
| clutch | embrague | TX p15, FL p87, NY p63 | |
| gearshift | palanca de cambios | FL p74 | |
| automatic / manual transmission | transmisión automática / manual | TX p16, FL p73–74 | |
| Park (P) position | posición de estacionamiento | CA p33, FL p73 | |
| reverse (gear) | marcha atrás (reversa) | CA p48, FL p47 | CA also *reversa* (p16) |
| neutral | neutral (punto muerto) | CA p67; TX p54, FL p87 | |
| horn | claxon | CA p12, FL p28, NY p35 | TX *bocina* (p48) |
| headlights | luces delanteras | CA p16, TX p57, FL p101, NY p52 | TX/FL *faros* |
| taillights | luces traseras | TX p25, FL p46, NY p62 | |
| brake lights | luces de freno | CA p12, TX p25, FL p46, NY p70 | |
| parking lights | luces de estacionamiento | CA p17, TX p25, FL p79, NY p62 | |
| windshield | parabrisas | CA p12, TX p25, FL p46, NY p52 | |
| windshield wipers | limpiaparabrisas | CA p12, TX p25, FL p46, NY p52 | |
| defroster | desempañador | CA p67, TX p59, NY p52 | |
| window | ventanilla | CA p12, FL p46 | TX *vidrios* (p32) |
| seat belt | cinturón de seguridad | CA p71, TX p75, FL p35, NY p13 | |
| airbag | bolsa de aire | CA p72–73, FL p47, NY p49 | |
| child safety seat | asiento de seguridad para niños | CA p72 | FL *asiento para niños* (p99) |
| booster seat | asiento elevador | FL p36, p99 | |
| tires | llantas | CA p12, FL p46, NY p42 | TX/FL *neumáticos* |
| tire tread | banda de rodamiento | NY p52 | |
| wheels | ruedas | CA p28, p33 | |
| bumper | defensa | CA p32 | TX/FL/NY *parachoques* (TX p26, FL p28, NY p39). Either works; *parachoques* is in 3 handbooks. |
| trunk | cajuela | CA p78, TX p75 | |
| hood | capó | TX p58, FL p46, NY p63 | |
| dashboard | tablero | CA p71, FL p47, NY p49 | |
| speedometer / odometer | velocímetro / odómetro | NY p61; TX p84, NY p24 | |
| engine | motor | CA p32, TX p14, FL p46 | |
| ignition | encendido | TX p16, FL p18 | |
| exhaust pipe / muffler | tubo de escape / silenciador | CA p77, NY p28; TX p25 | |
| power steering | dirección asistida | TX p16, FL p18 | |
| cruise control | control de crucero | CA p13, FL p48 | |
| snow chains | cadenas para nieve | CA p67, TX p59 | |
| vehicle identification number (VIN) | número de identificación del vehículo (VIN) | CA p6 (*número de serie del vehículo (VIN)*) | |

---

## 3. Quick rules for translators (summary)

1. Use *usted*, formal imperatives and *debe* + infinitive. Questions start with *¿Qué debe hacer…?*
2. Use the standard terms in the Spanish column. Put a regional alternative in parentheses **once per lesson** only when it helps (e.g. *arcén (acotamiento)*, *cruce de ferrocarril (paso a nivel)*).
3. Name signs in Spanish with the English legend in capitals: *señal de ALTO (STOP)*.
4. Never use: *matrícula* on its own, *luces de cruce*, *prohibido el paso* for no-passing, *aparcar*, *motorista*, or *tú*.
5. Keep acronyms in English (BAC, DUI/DWI, HOV, CDL, ABS, VIN, GDL) with the Spanish expansion on first use. Keep each state's own offence acronym (CA/FL DUI, TX/NY DWI).
6. Keep US units (pies, millas, mph) as digits: *a 100 pies*, *55 mph*.
