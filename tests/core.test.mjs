import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProtocol,normalizeProtocol,validate,fromText,fingerprint,startRun,advance,back,restoreRun,stopRun,save,load,remove,clear,KEYS,runText} from '../core.mjs';
import {DEMOS,demoProtocol} from '../demos.mjs';
const answers={checks:[true],choice:'',note:'Nota ficticia'};
for(const d of DEMOS)test(`${d.id}: las dos ramas terminan y preservan el origen`,async()=>{
  const p=demoProtocol(d.id);assert.deepEqual(validate(p),[]);
  for(const positive of [true,false]){
    let r=await startRun(p,true);r=advance(r,answers);
    assert.throws(()=>advance(r,{...answers,choice:''}),/Selecciona/);
    r=advance(r,{...answers,choice:positive?'Completa / coincide':'Incidencia, discrepancia o duda'});
    if(positive)r=advance(r,answers);
    r=advance(r,answers);
    assert.equal(r.status,positive?'completed':'escalated');
    assert.equal(r.history.length,positive?4:3);
    assert.equal(r.protocol.version,'1.0-DEMO');
    assert.ok(r.history.every(e=>p.sourceText.includes(e.quote)));
    assert.match(runText(r),/no es auditoría inmutable/);
    assert.deepEqual(await restoreRun(JSON.parse(JSON.stringify(r))),r);
  }
});
test('No se inicia sin metadatos, fecha válida o revisión humana',async()=>{
  assert.ok(validate(blankProtocol()).length>4);
  const p=demoProtocol('termolabiles');await assert.rejects(startRun(p,false),/revisar/);
  p.reviewedAt='2026-02-30';assert.ok(validate(p).some(e=>e.includes('Fecha')));
});
test('El origen literal y su versión se validan por separado de la interpretación',()=>{
  const p=demoProtocol('termolabiles');p.nodes[0].quote='Este fragmento no existe';
  assert.ok(validate(p).some(e=>e.includes('literalmente')));
  p.nodes[0].quote=p.sourceText.slice(0,30);assert.deepEqual(validate(p),[]);
});
test('Grafo: destinos inexistentes, ciclos, nodos aislados y finales ausentes',()=>{
  const p=demoProtocol('termolabiles');p.nodes[0].next='no-existe';assert.ok(validate(p).some(e=>e.includes('destino inexistente')));
  p.nodes[0].next='inicio';assert.ok(validate(p).some(e=>e.includes('ciclo')));
  p.nodes[0].next='decision';p.nodes.push({...structuredClone(p.nodes[0]),id:'aislado',next:'fin'});assert.ok(validate(p).some(e=>e.includes('alcanzar')));
  const q=demoProtocol('versiones');q.nodes=q.nodes.filter(n=>n.kind!=='end');assert.ok(validate(q).some(e=>e.includes('final alcanzable')));
});
test('IDs únicos, listas vacías y respuestas ambiguas se rechazan',()=>{
  const p=demoProtocol('termolabiles');p.nodes[2].id='inicio';assert.ok(validate(p).some(e=>e.includes('únicos')));
  const q=demoProtocol('termolabiles');q.nodes[0].checks=[];assert.ok(validate(q).some(e=>e.includes('comprobación')));
  q.nodes[1].choices[1].label=q.nodes[1].choices[0].label;assert.ok(validate(q).some(e=>e.includes('distintas')));
});
test('Todas las comprobaciones son obligatorias; un cierre no avanza de nuevo',async()=>{
  let r=await startRun(demoProtocol('termolabiles'),true);
  for(const checks of [[],[false],[true,true]])assert.throws(()=>advance(r,{checks}),/Completa/);
  r=advance(r,answers);r=advance(r,{...answers,choice:'Incidencia, discrepancia o duda'});r=advance(r,answers);
  assert.throws(()=>advance(r,answers),/finalizado/);
});
test('Volver atrás descarta la respuesta anterior y permite otra rama sin registros residuales',async()=>{
  let r=await startRun(demoProtocol('termolabiles'),true);r=advance(r,answers);r=advance(r,{...answers,choice:'Completa / coincide'});
  r=back(r);assert.equal(r.current,'decision');assert.equal(r.history.length,1);
  r=advance(r,{...answers,choice:'Incidencia, discrepancia o duda'});r=advance(r,answers);
  assert.ok(!r.history.some(e=>e.nodeId==='registro'));
  assert.equal(r.status,'escalated');
});
test('La copia ejecutada no cambia cuando se edita el procedimiento y la huella detecta cambios',async()=>{
  const p=demoProtocol('termolabiles'),r=await startRun(p,true),hash=r.hash;
  p.version='2';p.sourceText+='\nCambio';assert.equal(r.protocol.version,'1.0-DEMO');assert.notEqual(await fingerprint(p),hash);
});
test('Sesiones guardadas: rechaza alteración del grafo, ruta y elección',async()=>{
  let r=await startRun(demoProtocol('termolabiles'),true);r=advance(r,answers);
  const bad=structuredClone(r);bad.protocol.version='manipulada';await assert.rejects(restoreRun(bad),/versión/);
  const wrong=structuredClone(r);wrong.history[0].nodeId='fin';await assert.rejects(restoreRun(wrong),/historial/);
  const state=structuredClone(r);state.current='fin';await assert.rejects(restoreRun(state),/incoherente/);
});
test('Interrumpir conserva la condición de incompleto al guardar y recuperar',async()=>{
  const r=stopRun(await startRun(demoProtocol('versiones'),true));assert.equal(r.status,'stopped');assert.equal((await restoreRun(r)).status,'stopped');assert.throws(()=>back(r),/anterior/);
});
test('Texto: conversión literal secuencial, sin interpretar decisiones ni recortar párrafos',()=>{
  const p=fromText('Si sucede X, consulta a la persona responsable.\n\nFin del ejemplo.',{title:'Prueba',version:'1',author:'Docente',reviewedAt:'2026-11-10',sourceName:'Documento ficticio'});
  assert.deepEqual(validate(p),[]);assert.equal(p.nodes.filter(n=>n.kind==='decision').length,0);assert.equal(p.nodes[0].instruction,p.nodes[0].quote);
  assert.throws(()=>fromText('a'.repeat(12001)),/Divide/);assert.throws(()=>fromText(Array(21).fill('Párrafo').join('\n\n')),/20/);
});
test('Importación normaliza solo propiedades conocidas y rechaza tamaños o tipos inválidos',()=>{
  assert.throws(()=>normalizeProtocol({schema:2,nodes:[]}),/Formato/);
  const p=demoProtocol('versiones');p.unexpected='ignorar';assert.ok(!Object.hasOwn(normalizeProtocol(p),'unexpected'));
  p.nodes[0].kind='script';assert.throws(()=>normalizeProtocol(p),/Tipo/);
  const q=demoProtocol('versiones');q.nodes[0].checks=Array(13).fill('x');assert.throws(()=>normalizeProtocol(q),/recortan/);
});
class Storage{data=new Map();getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
test('Guardar, sustituir, eliminar y borrar sin afectar otros datos',()=>{
  const s=new Storage();s.setItem('otra-app','conservar');const p=demoProtocol('versiones');save(KEYS.protocols,p,s);p.version='2';save(KEYS.protocols,p,s);assert.equal(load(KEYS.protocols,s).length,1);assert.equal(load(KEYS.protocols,s)[0].version,'2');remove(KEYS.protocols,p.id,s);assert.equal(load(KEYS.protocols,s).length,0);clear(s);assert.equal(s.getItem('otra-app'),'conservar');
});
test('Historial dañado, límite y cuota de almacenamiento son errores visibles',()=>{
  const s=new Storage();s.setItem(KEYS.protocols,'roto');assert.throws(()=>save(KEYS.protocols,demoProtocol('versiones'),s));assert.equal(s.getItem(KEYS.protocols),'roto');clear(s);
  for(let i=0;i<15;i++)save(KEYS.protocols,demoProtocol('versiones'),s);
  assert.throws(()=>save(KEYS.protocols,demoProtocol('versiones'),s),/15/);
  assert.throws(()=>save(KEYS.protocols,demoProtocol('versiones'),{getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError');}}),/Quota/);
});
