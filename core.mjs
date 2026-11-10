// Motor determinista: no interpreta reglas clínicas ni inventa decisiones de un PNT.
export const KEYS = { protocols: 'farmapnt.protocolos.v1', runs: 'farmapnt.recorridos.v1' };
export const KINDS = { action: 'Paso con comprobaciones', decision: 'Decisión', end: 'Final del recorrido' };
export const STATES = { active:'en curso',completed:'cerrado documentalmente',escalated:'derivado a responsable',stopped:'interrumpido' };
const own = (o, k) => o && Object.hasOwn(o, k);
const text = (s, max = 12000) => typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max) : '';
const id = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(s) ? s : '';
const dateOK = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
export function blankProtocol() {
  return { schema: 1, id: crypto.randomUUID(), title: '', version: '', author: '', reviewedAt: new Date().toLocaleDateString('sv-SE'), sourceName: '', sourceText: '', demo: false, start: '', nodes: [] };
}
export function normalizeProtocol(raw) {
  if (!raw || raw.schema !== 1 || !Array.isArray(raw.nodes) || raw.nodes.length > 60) throw new Error('Formato no compatible: se esperan esquema 1 y hasta 60 nodos.');
  if (typeof raw.sourceText !== 'string' || raw.sourceText.length > 100000) throw new Error('El texto de origen debe tener hasta 100 000 caracteres.');
  const p = blankProtocol(); p.id = id(raw.id) || p.id;
  for (const k of ['title','version','author','reviewedAt','sourceName']) p[k] = text(raw[k], 300);
  p.sourceText = text(raw.sourceText, 100000); p.start = id(raw.start); p.demo = raw.demo === true;
  p.nodes = raw.nodes.map(n => {
    if (!n || !Object.hasOwn(KINDS,n.kind)) throw new Error('Tipo de nodo no compatible.');
    if (n.kind === 'end' && !['completed','escalated'].includes(n.outcome)) throw new Error('El tipo de cierre debe ser documental o derivación.');
    if (typeof n.instruction !== 'string' || typeof n.quote !== 'string' || n.instruction.length > 12000 || n.quote.length > 12000 || (Array.isArray(n.checks) && n.checks.length > 12) || (Array.isArray(n.choices) && n.choices.length > 4)) throw new Error('Nodo demasiado extenso: no se recortan instrucciones, comprobaciones o respuestas.');
    return { id: id(n.id), kind: n.kind, title: text(n.title,200), instruction: text(n.instruction), quote: text(n.quote), checks: (Array.isArray(n.checks) ? n.checks : []).slice(0,12).map(c => text(c,500)), next: id(n.next), choices: (Array.isArray(n.choices) ? n.choices : []).slice(0,4).map(c => ({ label: text(c?.label,300), target: id(c?.target) })), outcome: n.outcome === 'escalated' ? 'escalated' : 'completed' };
  });
  return p;
}
export function targets(n) { return n.kind === 'action' ? [n.next] : n.kind === 'decision' ? n.choices.map(c => c.target) : []; }
export function validate(p) {
  const errors = [];
  for (const [key,label] of [['title','Título'],['version','Versión'],['author','Autor de la adaptación'],['sourceName','Documento de origen'],['sourceText','Texto del PNT de origen']]) if (!p[key]?.trim()) errors.push(`${label}: obligatorio.`);
  if (!dateOK(p.reviewedAt || '')) errors.push('Fecha de revisión: no válida.');
  if (!p.nodes.length || p.nodes.length > 60) errors.push('El recorrido necesita entre 1 y 60 nodos.');
  const ids = new Set(p.nodes.map(n => n.id));
  if (ids.size !== p.nodes.length || ids.has('')) errors.push('Los identificadores de nodo deben ser únicos y válidos.');
  if (!ids.has(p.start)) errors.push('Selecciona un nodo inicial existente.');
  for (const n of p.nodes) {
    const name = n.title || n.id || 'Nodo';
    if (!n.title.trim()) errors.push(`${name}: falta el título.`);
    if (!n.instruction.trim()) errors.push(`${name}: falta la instrucción o resultado.`);
    if (!n.quote.trim() || !p.sourceText.includes(n.quote)) errors.push(`${name}: el fragmento de origen debe existir literalmente en el PNT aportado.`);
    if (n.kind === 'action' && (!n.checks.length || n.checks.some(c => !c.trim()))) errors.push(`${name}: añade al menos una comprobación no vacía.`);
    if (n.kind === 'decision' && (n.choices.length < 2 || n.choices.length > 4 || n.choices.some(c => !c.label.trim()) || new Set(n.choices.map(c => c.label.trim())).size !== n.choices.length)) errors.push(`${name}: necesita entre dos y cuatro respuestas distintas con nombre.`);
    if (n.kind === 'end' && !['completed','escalated'].includes(n.outcome)) errors.push(`${name}: selecciona un tipo de cierre válido.`);
    for (const target of targets(n)) if (!ids.has(target)) errors.push(`${name}: destino inexistente (${target || 'vacío'}).`);
  }
  const map = new Map(p.nodes.map(n => [n.id,n])), visiting = new Set(), visited = new Set(); let cyclic = false;
  function walk(key) {
    if (visiting.has(key)) { cyclic = true; return; }
    if (visited.has(key) || !map.has(key)) return;
    visiting.add(key); for (const next of targets(map.get(key))) walk(next); visiting.delete(key); visited.add(key);
  }
  walk(p.start);
  if (cyclic) errors.push('El recorrido contiene un ciclo: debe terminar sin bucles.');
  if (p.nodes.some(n => !visited.has(n.id))) errors.push('Hay nodos que no se pueden alcanzar desde el inicio.');
  if (!p.nodes.some(n => n.kind === 'end' && visited.has(n.id))) errors.push('Debe existir un final alcanzable.');
  return [...new Set(errors)];
}
export function fromText(source, metadata = {}) {
  const paragraphs = source.trim().split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (!paragraphs.length || paragraphs.length > 20 || source.length > 100000) throw new Error('Para el borrador secuencial aporta entre 1 y 20 párrafos separados por una línea vacía, hasta 100 000 caracteres.');
  if (paragraphs.some(p => p.length > 12000)) throw new Error('Divide los párrafos de más de 12 000 caracteres antes de crear el borrador.');
  const p = blankProtocol();
  for (const k of ['title','version','author','reviewedAt','sourceName']) if (own(metadata,k)) p[k] = text(metadata[k],300);
  p.sourceText = source.trim(); p.start = 'paso-1';
  p.nodes = paragraphs.map((paragraph,index) => ({ id:`paso-${index+1}`, kind:'action', title:paragraph.split('\n')[0].slice(0,100), instruction:paragraph, quote:paragraph, checks:['He realizado y comprobado este paso con el documento de origen.'], next:index === paragraphs.length-1 ? 'fin' : `paso-${index+2}`, choices:[], outcome:'completed' }));
  p.nodes.push({id:'fin',kind:'end',title:'Fin del borrador secuencial',instruction:'Recorrido documental terminado. Revisión profesional obligatoria: no implica autorización de uso clínico.',quote:paragraphs.at(-1),checks:[],next:'',choices:[],outcome:'completed'});
  return p;
}
export async function fingerprint(p) {
  const bytes = new TextEncoder().encode(JSON.stringify(normalizeProtocol(p)));
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b => b.toString(16).padStart(2,'0')).join('');
}
export async function startRun(p, reviewed) {
  const errors = validate(p);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!reviewed) throw new Error('Debes contrastar y revisar el recorrido antes de iniciarlo.');
  const protocol = normalizeProtocol(p);
  return { schema:1,id:crypto.randomUUID(),protocol,hash:await fingerprint(protocol),current:protocol.start,history:[],status:'active',startedAt:new Date().toISOString(),endedAt:'',answers:{checks:[],choice:'',note:''} };
}
export function currentNode(run) { return run.protocol.nodes.find(n => n.id === run.current); }
export function advance(run, answers, now = new Date().toISOString()) {
  if (run.status !== 'active') throw new Error('El recorrido ya está finalizado.');
  const node = currentNode(run);
  if (!node) throw new Error('El paso actual no existe.');
  if (node.kind === 'action' && (!Array.isArray(answers.checks) || answers.checks.length !== node.checks.length || !node.checks.every((_,i) => answers.checks?.[i] === true))) throw new Error('Completa todas las comprobaciones antes de avanzar.');
  const choice = node.kind === 'decision' ? node.choices.find(c => c.label === answers.choice) : null;
  if (node.kind === 'decision' && !choice) throw new Error('Selecciona una respuesta para continuar.');
  const target = node.kind === 'action' ? node.next : node.kind === 'decision' ? choice.target : '';
  const nextRun = structuredClone(run);
  nextRun.history.push({nodeId:node.id,kind:node.kind,title:node.title,quote:node.quote,checks:node.kind==='action' ? [...answers.checks] : [],choice:choice?.label || '',note:text(answers.note,2000),at:now,target});
  nextRun.answers = {checks:[],choice:'',note:''};
  if (node.kind === 'end') { nextRun.status = node.outcome; nextRun.endedAt = now; }
  else nextRun.current = target;
  return nextRun;
}
export function back(run) {
  if (run.status !== 'active' || !run.history.length) throw new Error('No hay un paso anterior editable.');
  const next = structuredClone(run), previous = next.history.pop();
  next.current = previous.nodeId; next.answers = {checks:previous.checks,choice:previous.choice,note:previous.note};
  return next;
}
export function stopRun(run) {
  if (run.status !== 'active') throw new Error('El recorrido ya está finalizado.');
  return {...structuredClone(run),status:'stopped',endedAt:new Date().toISOString()};
}
// Reproduce el camino guardado en vez de aceptar un historial que contradiga el grafo.
export async function restoreRun(raw) {
  if (!raw || raw.schema !== 1 || !Array.isArray(raw.history) || raw.history.length > 60) throw new Error('Formato de recorrido no compatible.');
  const protocol = normalizeProtocol(raw.protocol);
  if (validate(protocol).length || raw.hash !== await fingerprint(protocol)) throw new Error('El recorrido guardado no coincide con su versión de origen.');
  let run = await startRun(protocol,true);
  for (const event of raw.history) {
    if (event.nodeId !== run.current) throw new Error('El historial no coincide con el recorrido.');
    run = advance(run,{checks:event.checks,choice:event.choice,note:event.note}, text(event.at,80));
  }
  if (raw.status === 'stopped' && run.status === 'active') run = stopRun(run);
  if (run.current !== raw.current || run.status !== raw.status) throw new Error('Estado de recorrido incoherente.');
  run.id = id(raw.id) || run.id; run.startedAt = text(raw.startedAt,80); run.endedAt = text(raw.endedAt,80);
  if (run.status === 'active') run.answers = {checks:Array.isArray(raw.answers?.checks) ? raw.answers.checks.slice(0,12).map(c => c===true) : [],choice:text(raw.answers?.choice,300),note:text(raw.answers?.note,2000)};
  return run;
}
export function load(key, storage = globalThis.localStorage) {
  const value = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(value) || value.length > 15) throw new Error('Datos locales dañados o no compatibles. No se han sobrescrito.');
  return value;
}
export function save(key, value, storage = globalThis.localStorage) {
  const values = load(key,storage).filter(item => item.id !== value.id);
  if (values.length >= 15) throw new Error('Máximo 15 elementos por historial. Elimina uno antes de añadir otro.');
  storage.setItem(key,JSON.stringify([value,...values]));
}
export function remove(key, itemId, storage = globalThis.localStorage) { storage.setItem(key,JSON.stringify(load(key,storage).filter(v => v.id !== itemId))); }
export function clear(storage = globalThis.localStorage) { storage.removeItem(KEYS.protocols);storage.removeItem(KEYS.runs); }
export function runText(run) {
  const p=run.protocol;
  return [`FarmaPNT · Registro docente de recorrido`,`${p.title} · Versión ${p.version}`,`Origen: ${p.sourceName} · Autor de adaptación: ${p.author} · Revisión: ${p.reviewedAt}`,`Huella de la copia: ${run.hash}`,`Estado: ${STATES[run.status]} · Inicio: ${run.startedAt} · Fin: ${run.endedAt || 'sin finalizar'}`,'Registro local editable, no es auditoría inmutable, firma ni validación clínica.',...run.history.flatMap((e,i)=>[`${i+1}. ${e.title} [${e.nodeId}] · ${e.at}`,`Origen literal: ${e.quote}`,e.choice ? `Respuesta: ${e.choice}` : e.kind==='action' ? `Comprobaciones confirmadas:\n${p.nodes.find(n=>n.id===e.nodeId).checks.map(c=>'- '+c).join('\n')}` : 'Cierre confirmado.',e.note ? `Nota: ${e.note}` : '']), 'Revisión profesional obligatoria. No usar como autorización de utilización de medicamentos.'].join('\n\n');
}
