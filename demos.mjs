import { blankProtocol } from './core.mjs';
// Documentos íntegramente ficticios, sin umbrales clínicos, posologías ni decisiones de uso.
export const DEMOS = [
  {id:'termolabiles',title:'Recepción de un envío termolábil',description:'Dos recorridos: documentación completa o incidencia que exige revisión.',sourceName:'PNT-DEMO-01 · Recepción docente de un envío',paragraphs:[
    '1. Identifica el envío ficticio y localiza su documentación. Registra únicamente el código docente; no introduzcas datos de pacientes.',
    '2. Comprueba si la documentación del envío ficticio está completa. Si está completa, continúa el registro. Si falta documentación o existe una incidencia, detén el recorrido y deriva al responsable designado.',
    '3. Con documentación completa, registra que la comprobación documental se ha realizado. Este ejercicio no evalúa condiciones térmicas, estabilidad ni aptitud de un medicamento.',
    '4. Si existe una incidencia, registra su motivo y solicita revisión del responsable. No decidas la utilización o eliminación de medicamentos mediante este ejercicio.',
    '5. Cierra el registro docente. El cierre documental no autoriza el uso del medicamento.'
  ]},
  {id:'telefarmacia',title:'Preparación documental de una entrega',description:'Comprueba documentos ficticios y deriva las discrepancias antes de continuar.',sourceName:'PNT-DEMO-02 · Circuito documental ficticio',paragraphs:[
    '1. Reúne los documentos simulados para la entrega docente. No introduzcas nombres, direcciones, teléfonos ni información de pacientes.',
    '2. Comprueba si las referencias documentales ficticias coinciden. Si coinciden, prepara el registro de revisión. Si hay discrepancias, detén el circuito y solicita revisión del responsable.',
    '3. Si coinciden las referencias, anota que la revisión documental se ha completado. El ejercicio no ejecuta envíos ni integra sistemas asistenciales.',
    '4. Ante discrepancias, registra únicamente un motivo ficticio y deriva al responsable. No subsanes automáticamente información identificativa.',
    '5. Finaliza el registro docente sin emitir una autorización asistencial.'
  ]},
  {id:'versiones',title:'Control de versión de un documento',description:'Distingue la versión vigente de una copia que necesita aclaración.',sourceName:'PNT-DEMO-03 · Control documental simulado',paragraphs:[
    '1. Localiza la identificación y la versión de la copia documental de prueba.',
    '2. Compara la versión con el listado docente aportado por el instructor. Si coincide, registra la comprobación. Si no coincide o hay dudas, interrumpe el uso y consulta al responsable documental.',
    '3. Si coincide la versión, registra su identificación y la fecha de consulta. La herramienta no comprueba por sí misma cuál es la versión vigente del hospital.',
    '4. Si la versión no coincide o hay dudas, registra el motivo y solicita aclaración al responsable; no sustituyas instrucciones por inferencias.',
    '5. Cierra la comprobación docente. Su resultado no valida un procedimiento institucional.'
  ]},
];
export function demoProtocol(key) {
  const d=DEMOS.find(d=>d.id===key);if (!d) throw new Error('Demostración inexistente.');
  const p=blankProtocol();Object.assign(p,{title:d.title,version:'1.0-DEMO',author:'Autor docente ficticio',sourceName:d.sourceName,sourceText:d.paragraphs.join('\n\n'),demo:true,start:'inicio'});
  const node=(id,kind,title,index,extra={})=>({id,kind,title,instruction:d.paragraphs[index],quote:d.paragraphs[index],checks:kind==='action'?['He contrastado este paso con el fragmento original.']:[],next:'',choices:[],outcome:'completed',...extra});
  p.nodes=[node('inicio','action','Reúne la documentación',0,{next:'decision'}),node('decision','decision','Selecciona el resultado de la comprobación',1,{choices:[{label:'Completa / coincide',target:'registro'},{label:'Incidencia, discrepancia o duda',target:'derivar'}]}),node('registro','action','Registra la revisión',2,{next:'fin'}),node('derivar','end','Detén y deriva al responsable',3,{outcome:'escalated'}),node('fin','end','Cierre documental',4)];
  return p;
}
