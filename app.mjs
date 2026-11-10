import {KEYS,KINDS,STATES,blankProtocol,normalizeProtocol,validate,fromText,targets,startRun,currentNode,advance,back,stopRun,restoreRun,load,save,remove,clear,runText} from './core.mjs';
import {DEMOS,demoProtocol} from './demos.mjs';
const $=id=>document.getElementById(id);
function el(tag,attrs={},children=[]) {
  const node=document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) if(v!==undefined&&v!==null) node.setAttribute(k,String(v));
  for (const child of Array.isArray(children)?children:[children]) node.append(child instanceof Node?child:document.createTextNode(String(child)));
  return node;
}
function button(label,action,secondary=true){const b=el('button',{type:'button',class:secondary?'pnt-secondary':''},label);b.addEventListener('click',action);return b;}
function status(message){$('status').textContent=message;}
function download(name,data,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type})),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
let protocol=blankProtocol(),selected='',run=null,dirty=false,approved=false,mode='library';
function changed(){dirty=true;approved=false;$('reviewed').checked=false;}
function guarded(action){if(!dirty||confirm('Hay cambios sin guardar. ¿Continuar y descartarlos?'))action();}
function show(next){mode=next;for(const id of ['library','editor','runner'])$(id).hidden=id!==next;$(next==='library'?'library-title':next==='editor'?'editor-title':'run-title').focus();}
function openProtocol(p){protocol=normalizeProtocol(p);selected=protocol.start||protocol.nodes[0]?.id||'';run=null;dirty=false;approved=false;$('reviewed').checked=false;renderEditor();show('editor');status(protocol.demo?'Demostración ficticia. Contrasta sus instrucciones y revisa ambas ramas antes de iniciar.':'Procedimiento abierto. El guardado es manual y no se comprueba su vigencia.');}
function home(){show('library');renderLibrary();dirty=false;}
document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>guarded(home)));
$('new').addEventListener('click',()=>openProtocol(blankProtocol()));
$('protocol-form').addEventListener('submit',e=>e.preventDefault());
for(const demo of DEMOS)$('demo-cards').append(el('article',{class:'pnt-card'},[el('p',{class:'eyebrow'},'Documento y circuito ficticios'),el('h3',{},demo.title),el('p',{},demo.description),button('Abrir demostración',()=>openProtocol(demoProtocol(demo.id)),false)]));
function renderLibrary(){
  for(const [key,target,isRun] of [[KEYS.protocols,'protocol-list',false],[KEYS.runs,'run-list',true]]){
    const container=$(target);container.replaceChildren();
    try{
      const items=load(key);if(!items.length)container.append(el('p',{},isRun?'No hay recorridos guardados.':'No hay procedimientos guardados.'));
      for(const item of items){
        const p=isRun?item.protocol:item;
        container.append(el('div',{class:'pnt-item'},[el('p',{},`${typeof p?.title==='string'?p.title:'Sin título'} · versión ${typeof p?.version==='string'?p.version:'desconocida'}${isRun?' · '+(STATES[item.status]||'estado no compatible'):''}`),el('div',{class:'pnt-actions'},[
          button(isRun?'Abrir recorrido':'Editar procedimiento',async()=>{try{if(isRun){run=await restoreRun(item);protocol=run.protocol;dirty=false;renderRun();show('runner');status('Se ha recuperado la copia exacta de este recorrido; no se actualiza a versiones nuevas.');}else openProtocol(item);}catch(e){status('No se pudo abrir: '+e.message);}}),
          button('Eliminar',()=>{if(confirm('¿Eliminar este elemento local?'))try{remove(key,item.id);renderLibrary();status('Elemento eliminado.');}catch(e){status(e.message);}})
        ])]));
      }
    }catch{container.append(el('p',{role:'alert'},'No se pudo leer el historial: datos dañados o almacenamiento bloqueado. No se sobrescribirán. Puedes borrar los datos de FarmaPNT.'));}
  }
}
$('clear').addEventListener('click',()=>{if(!confirm('¿Borrar todos los procedimientos y recorridos locales de FarmaPNT?'))return;try{clear();protocol=blankProtocol();run=null;selected='';dirty=false;approved=false;$('source-text').value='';$('record').textContent='';$('node-editor').replaceChildren();$('run-step').replaceChildren();$('run-title').textContent='';$('run-meta').textContent='';$('run-progress').textContent='';$('import-json').value='';$('source-file').value='';renderEditor();home();status('Datos locales de FarmaPNT eliminados. Borra aparte los archivos exportados y las impresiones.');}catch{status('No se pudo borrar: usa los ajustes de datos del sitio de tu navegador.');}});
$('import-json').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1000000)throw new Error('Archivo demasiado grande: máximo 1 MB.');const p=normalizeProtocol(JSON.parse(await f.text()));openProtocol(p);const errors=validate(p);status(errors.length?'Borrador importado con incidencias de estructura; revísalo antes de iniciar.':'Procedimiento importado. Debes revisarlo antes de iniciar.');}catch(error){status('No se pudo importar: '+error.message);}finally{e.target.value='';}});
const metadata=[['title','Título del procedimiento'],['version','Versión de origen'],['author','Autor de la adaptación'],['reviewedAt','Fecha de revisión de esta adaptación'],['sourceName','Nombre o referencia del documento de origen']];
function field(label,id,value,oninput,kind='input'){
  const control=el(kind,{id,...(kind==='textarea'?{rows:'4',maxlength:id==='run-note'?'2000':'12000'}:{type:id==='meta-reviewedAt'?'date':'text',maxlength:'300'})});control.value=value||'';
  control.addEventListener('input',()=>{oninput(control.value);changed();});
  return el('div',{class:'pnt-field'},[el('label',{for:id},label),control]);
}
function selector(id,label,value,options,change){
  const select=el('select',{id});select.append(el('option',{value:''},'Selecciona…'));
  for(const [key,text] of options)select.append(el('option',{value:key},text));select.value=value||'';
  select.addEventListener('change',()=>{change(select.value);changed();});
  return el('div',{class:'pnt-field'},[el('label',{for:id},label),select]);
}
function nodeOptions(){return protocol.nodes.map(n=>[n.id,`${n.id} · ${n.title||'Sin título'}`]);}
function renderEditor(){
  $('metadata').replaceChildren(...metadata.map(([key,label])=>field(label+' · obligatorio','meta-'+key,protocol[key],v=>protocol[key]=v)));
  $('source-text').value=protocol.sourceText;
  $('errors').hidden=true;renderNodeList();renderNode();
}
function renderNodeList(){
  for(const [id,value]of[['start-node',protocol.start],['selected-node',selected]]){
    const select=$(id);select.replaceChildren(el('option',{value:''},'Selecciona…'));
    for(const[key,text]of nodeOptions())select.append(el('option',{value:key},text));select.value=value;
  }
  $('graph').replaceChildren(...protocol.nodes.map(n=>el('tr',{},[el('td',{},`${n.id} · ${n.title}`),el('td',{},KINDS[n.kind]),el('td',{},targets(n).join(' / ')||'Fin')])));
}
$('source-text').addEventListener('input',e=>{protocol.sourceText=e.target.value;changed();});
$('source-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>200000||!/\.(txt|md)$/i.test(f.name))throw new Error('Usa un TXT/MD de hasta 200 kB.');const text=await f.text();if(text.length>100000||text.includes('\u0000'))throw new Error('El archivo supera 100 000 caracteres o no es texto válido.');protocol.sourceText=text;$('source-text').value=text;changed();status('Texto cargado localmente. No se ha interpretado ni validado su contenido.');}catch(error){status(error.message);}finally{e.target.value='';}});
$('generate').addEventListener('click',()=>{if(protocol.nodes.length&&!confirm('¿Sustituir los nodos actuales por un borrador secuencial?'))return;try{const p=fromText(protocol.sourceText,protocol);p.id=protocol.id;protocol=p;selected=p.start;changed();renderEditor();status('Borrador secuencial creado por párrafos. Revisa y añade manualmente las decisiones y excepciones.');}catch(e){status(e.message);}});
$('start-node').addEventListener('change',e=>{protocol.start=e.target.value;changed();});
$('selected-node').addEventListener('change',e=>{selected=e.target.value;renderNode();});
$('add-node').addEventListener('click',()=>{if(protocol.nodes.length>=60){status('Máximo 60 nodos.');return;}const n={id:'n-'+crypto.randomUUID(),kind:'action',title:'Paso nuevo',instruction:'',quote:'',checks:['Comprobación pendiente de definir'],next:'',choices:[],outcome:'completed'};protocol.nodes.push(n);selected=n.id;changed();renderNodeList();renderNode();status('Conecta el nodo nuevo y añade su instrucción y fragmento de origen.');});
$('delete-node').addEventListener('click',()=>{if(!selected||!confirm('¿Eliminar el nodo? Deberás corregir las conexiones que apuntaban a él.'))return;protocol.nodes=protocol.nodes.filter(n=>n.id!==selected);selected=protocol.nodes[0]?.id||'';changed();renderNodeList();renderNode();});
function renderNode(){
  const box=$('node-editor');box.replaceChildren();const n=protocol.nodes.find(n=>n.id===selected);if(!n){box.append(el('p',{},'Crea un borrador desde el texto o añade un paso.'));return;}
  box.append(el('p',{class:'pnt-help'},`Identificador estable: ${n.id}. Una coincidencia literal con el origen no garantiza que la adaptación preserve su sentido.`));
  box.append(field('Título · obligatorio','node-title',n.title,v=>{n.title=v;renderNodeList();}),selector('node-kind','Tipo de nodo',n.kind,Object.entries(KINDS),v=>{if(!Object.hasOwn(KINDS,v)){renderNode();return;}n.kind=v;if(v==='action'&&!n.checks.length)n.checks=['Comprobación pendiente de definir'];if(v==='decision'&&n.choices.length<2)n.choices=[{label:'Sí',target:n.next},{label:'No / excepción',target:''}];renderNodeList();renderNode();}),field('Instrucción, pregunta o resultado · obligatorio','node-instruction',n.instruction,v=>n.instruction=v,'textarea'),field('Fragmento literal que respalda este nodo · obligatorio','node-quote',n.quote,v=>n.quote=v,'textarea'));
  if(n.kind==='action')box.append(field('Comprobaciones (una por línea, entre 1 y 12)','node-checks',n.checks.join('\n'),v=>n.checks=v.split('\n'),'textarea'),selector('node-next','Siguiente nodo',n.next,nodeOptions(),v=>{n.next=v;renderNodeList();}));
  if(n.kind==='decision'){
    n.choices.forEach((choice,index)=>box.append(el('fieldset',{},[el('legend',{},`Respuesta ${index+1}`),field('Texto de respuesta',`choice-label-${index}`,choice.label,v=>choice.label=v),selector(`choice-target-${index}`,'Destino',choice.target,nodeOptions(),v=>{choice.target=v;renderNodeList();}),...(n.choices.length>2?[button('Eliminar respuesta',()=>{n.choices.splice(index,1);changed();renderNode();renderNodeList();})]:[])])));
    if(n.choices.length<4)box.append(button('Añadir respuesta',()=>{n.choices.push({label:'',target:''});changed();renderNode();}));
  }
  if(n.kind==='end')box.append(selector('node-outcome','Tipo de cierre',n.outcome,[['completed','Cierre documental'],['escalated','Derivación a responsable']],v=>n.outcome=v));
}
function showErrors(errors){$('errors').hidden=false;$('errors').replaceChildren(el('p',{},errors.length?'Corrige estas incidencias antes de iniciar:':'Estructura y fragmentos comprobados. Falta tu revisión profesional.'),el('ul',{},errors.map(error=>el('li',{},error))));$('errors').focus();}
$('validate').addEventListener('click',()=>showErrors(validate(protocol)));
$('save-protocol').addEventListener('click',()=>{try{save(KEYS.protocols,normalizeProtocol(protocol));dirty=false;status('Borrador guardado sin cifrar, solo en este navegador.');}catch(e){status('No se pudo guardar: '+e.message);}});
$('export-protocol').addEventListener('click',()=>{try{download('FarmaPNT-procedimiento.json',JSON.stringify(normalizeProtocol(protocol),null,2));status('Procedimiento JSON exportado, incluido el texto de origen. No contiene una aprobación institucional.');}catch(e){status(e.message);}});
$('reviewed').addEventListener('change',e=>approved=e.target.checked);
$('start-run').addEventListener('click',async()=>{try{run=await startRun(protocol,approved);dirty=true;renderRun();show('runner');status('Recorrido iniciado sobre una copia fija del procedimiento revisado.');}catch(e){showErrors(validate(protocol));status(e.message);}});
function renderRun(){
  const p=run.protocol,n=currentNode(run);$('run-title').textContent=p.title;$('run-meta').textContent=`${p.demo?'DEMOSTRACIÓN FICTICIA · ':''}Origen: ${p.sourceName} · Versión ${p.version} · Revisión ${p.reviewedAt} · Adaptación: ${p.author}`;
  $('run-progress').textContent=run.status==='active'?`${run.history.length} pasos confirmados. Ahora: ${n.title}. La longitud depende de tus respuestas.`:`Recorrido ${run.status==='completed'?'cerrado documentalmente':run.status==='escalated'?'derivado a responsable':'interrumpido'}. ${run.history.length} pasos confirmados.`;
  const box=$('run-step');box.replaceChildren();
  if(run.status==='active'){
    box.append(el('h3',{id:'current-title',tabindex:'-1'},n.title),el('p',{},n.instruction),el('details',{},[el('summary',{},'Contrastar con el fragmento del PNT de origen'),el('blockquote',{},n.quote)]));
    if(n.kind==='action')n.checks.forEach((text,index)=>{const input=el('input',{type:'checkbox',id:`check-${index}`});input.checked=run.answers.checks[index]===true;input.addEventListener('change',()=>{run.answers.checks[index]=input.checked;dirty=true;});box.append(el('label',{class:'pnt-check',for:`check-${index}`},[input,text]));});
    if(n.kind==='decision'){
      const choices=el('fieldset',{},el('legend',{},'Selecciona una respuesta · obligatorio'));
      n.choices.forEach((choice,index)=>{const input=el('input',{type:'radio',name:'decision',id:`answer-${index}`,value:choice.label});input.checked=run.answers.choice===choice.label;input.addEventListener('change',()=>{run.answers.choice=choice.label;dirty=true;});choices.append(el('label',{class:'pnt-check',for:`answer-${index}`},[input,choice.label]));});box.append(choices);
    }
    box.append(field('Nota docente opcional · sin datos de pacientes','run-note',run.answers.note,v=>run.answers.note=v,'textarea'));
    $('advance').textContent=n.kind==='end'?'Confirmar cierre':'Confirmar y continuar';
  }else box.append(el('h3',{},'Registro de cierre'),el('p',{},'El recorrido ha finalizado. Su cierre no valida un PNT, no prueba que una tarea real se haya realizado ni autoriza una decisión clínica. Puedes consultar, guardar o exportar el registro.'));
  $('back').disabled=run.status!=='active'||!run.history.length;$('advance').hidden=run.status!=='active';$('stop').hidden=run.status!=='active';$('record').textContent=runText(run);
}
$('advance').addEventListener('click',()=>{try{run=advance(run,run.answers);dirty=true;renderRun();$('current-title')?.focus();status('Paso confirmado.');}catch(e){status(e.message);}});
$('back').addEventListener('click',()=>{try{run=back(run);dirty=true;renderRun();$('current-title')?.focus();status('Último paso retirado del registro; confirma de nuevo sus comprobaciones o respuesta.');}catch(e){status(e.message);}});
$('stop').addEventListener('click',()=>{if(confirm('¿Interrumpir este recorrido? Quedará marcado como incompleto.')){run=stopRun(run);dirty=true;renderRun();status('Recorrido interrumpido; no consta como completado.');}});
$('save-run').addEventListener('click',()=>{try{save(KEYS.runs,run);dirty=false;status('Recorrido y su copia de origen guardados localmente sin cifrar.');}catch(e){status('No se pudo guardar: '+e.message);}});
$('export-run').addEventListener('click',()=>download('FarmaPNT-registro.txt',runText(run),'text/plain;charset=utf-8'));
$('print-run').addEventListener('click',()=>window.print());
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
renderLibrary();
