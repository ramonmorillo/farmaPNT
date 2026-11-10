# 3. Encargo y especificación reproducible

## Encargo real recibido

«perfecto, ya tenemos una primera herramienta. vamos a por l asegunda . ya he creado el repo en github se llama farmaPNT. trabajamos igual».

La ficha del taller definía pasos, decisiones, versiones, listas de comprobación, un caso ficticio de termolábiles y el reto de añadir una excepción. El siguiente prompt concreta esa necesidad para reproducir esta implementación; no se presenta como una transcripción de una conversación con otro agente ni como validación institucional.

## Prompt reproducible

```text
Construye FarmaPNT y su tutorial en ramonmorillo/farmaPNT. Inspecciona los
archivos y conserva cambios ajenos. Usa HTML, CSS y módulos JavaScript, sin
backend, IA, APIs, claves ni dependencias de producción.
Modelo: título, versión, autor, fecha, referencia, texto de origen, inicio y
nodos action, decision, end. Cada nodo requiere una cita literal de origen.
Acciones: comprobaciones y destino. Decisiones: 2 a 4 respuestas explícitas
con destino. Finales: cierre documental o derivación. Valida IDs únicos,
destinos, ausencia de ciclos, alcanzabilidad y final antes de ejecutar.
Permite pegar TXT/MD y copiar párrafos en un borrador secuencial. No deduzcas
decisiones ni interpretes clínica. No recortes instrucciones silenciosamente.
Editor de nodos, metadatos y excepciones. JSON portable con esquema versionado.
Tres documentos completamente ficticios: recepción documental de un envío
termolábil, preparación documental de una entrega y control de versión.
Cada uno debe tener ruta normal y ruta de incidencia. No incluyas medicamentos
reales, umbrales clínicos ni decisiones de uso.
Exige revisión humana y congela una copia con SHA-256 para cada recorrido.
No confundas la huella con autenticidad ni la revisión con aprobación clínica.
Exige todas las comprobaciones y una respuesta sin preselección. Volver atrás
retira el último evento; otra respuesta no conserva la rama descartada.
Distingue activo, cerrado, derivado e interrumpido. Recupera sesiones
reproduciendo sus eventos sobre la copia de origen; rechaza incoherencias.
Guardado voluntario sin cifrar: hasta 15 procedimientos y 15 recorridos.
Recuperar, eliminar y borrar sin tocar otras apps. Errores visibles de cuota
 y datos dañados. Exporta JSON y registro TXT/PDF por impresión nativa.
DOM seguro, sin HTML de usuario, CSP, sin telemetría. Etiquetas, foco, teclado,
móvil y rutas relativas probadas bajo /farmaPNT/.
Tutorial real de seis pasos con documentos, prompts copiables y reto de
excepción. Pruebas Node y navegador: seis rutas, autoría, versiones, ciclos,
fragmentos, sesiones, retroceso, exportaciones, XSS, móviles y tutorial.
Prepara Pages y actualiza solo la ficha FarmaPNT cuando el despliegue esté
comprobado. Conserva el cifrado, otras herramientas y materiales del taller.
Informa pruebas fallidas o no ejecutadas; no inventes resultados remotos.
```

Funcional: editor, rutas y registros. Técnico: esquema, grafo y estado. Visual: componentes, foco y móvil. Seguridad: trazabilidad, revisión y privacidad. Estos grupos permiten comprobar si existe una funcionalidad y no solo un botón.
