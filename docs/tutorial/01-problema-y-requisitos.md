# 1. Del documento al recorrido

Un PNT largo obliga a localizar instrucciones, excepciones y comprobaciones. FarmaPNT organiza el documento aportado, pero no interpreta su contenido clínico ni comprueba su vigencia.

## Funcionalidad verificable

- Conservar título, versión, referencia de origen, autor, fecha y texto completo.
- Copiar párrafos literalmente en un borrador secuencial, sin inferir decisiones.
- Editar pasos con comprobaciones, decisiones de dos a cuatro respuestas y finales documentales o de derivación.
- Exigir un fragmento literal de origen por nodo, destinos existentes, ausencia de ciclos, nodos alcanzables y final obligatorio.
- Pedir revisión humana antes de ejecutar; no confundirla con aprobación institucional.
- Congelar una copia por recorrido y conservar versión, origen y huella SHA-256.
- Exigir comprobaciones y respuestas explícitas; volver atrás retira el último evento para no conservar ramas descartadas.
- Guardar localmente por voluntad del usuario y exportar procedimiento JSON y registro TXT/PDF.

## Fuera de alcance

Sin IA, extracción de PDFs, backend, APIs, autenticación, sincronización o certificación. No decide uso de medicamentos, estabilidad, dosis o condiciones clínicas. La huella no es una firma; el historial no prueba que una tarea real se haya ejecutado. Una cita literal puede estar mal interpretada: revisa texto y conexiones.

Tres demostraciones ficticias: recepción documental de un envío termolábil, preparación documental de una entrega y control de versión. Cada una tiene ruta normal y de incidencia/derivación. No incluyen umbrales clínicos ni medicamentos reales.

Ejercicio: define dos rutas de un documento ficticio y un caso que deba detenerse. Si la excepción no está en la fuente, no la inventes en el grafo.
