# Limitaciones y registro de validación

- Aplicación docente, pública, no certificada; solo documentos y datos ficticios.
- No interpreta clínica, PDFs, vigencia, estabilidad o utilización de medicamentos.
- La copia por párrafos no genera decisiones. Autoría de conexiones y excepciones es manual y requiere revisión.
- Coincidencia literal no garantiza significado. SHA-256 identifica la copia, no acredita origen, firma o aprobación.
- Historial local y editable; no demuestra ejecución de tareas reales.
- Sin autenticación, roles, sincronización ni almacenamiento cifrado.
- Límites: 60 nodos, 12 comprobaciones, 2 a 4 respuestas; 100 000 caracteres de origen, 12 000 por instrucción/fragmento. Borrador de hasta 20 párrafos sin recorte silencioso.
- PDF depende del diálogo de impresión. Exportaciones e impresiones se borran aparte de los datos locales.
- Sin bucles. No se afirma validación clínica, certificación de accesibilidad ni compatibilidad visual con todos los navegadores.

## Resultados

Validación local del 10 de noviembre de 2026:

- Node 24: 16 pruebas aprobadas, sin fallos ni omisiones. Incluyen ambas rutas de tres documentos, metadatos, citas, grafos inválidos, comprobaciones, retroceso, copia de versión, sesiones incoherentes, interrupción, límites y almacenamiento.
- Chromium con Playwright para Python: creación desde TXT, conversión secuencial, edición de decisión, nueva excepción, invalidación de revisión al editar, JSON exportado y reimportado, citas ausentes e importación incompatible: aprobados.
- Seis recorridos reales de navegador (tres casos por dos ramas), comprobaciones obligatorias, respuesta explícita, cambio de rama tras retroceso y cierres distintos: aprobados.
- Seis TXT y seis PDF comprobados por contenido: versión, origen, citas, comprobaciones, respuestas y estado. Se usó pypdf para extraer el texto del PDF y comprobar ausencia de botones de interfaz. PDF se generó con el motor de impresión de Chromium y se verificó que el botón invoca window.print; la elección manual de impresora depende del usuario.
- Recuperación tras recarga de recorridos activos y cerrados, interrupción, borrado individual/total, conservación de datos de otra aplicación y errores por historial dañado: aprobados. Cuota y máximo de elementos se prueban en Node.
- Entrada con etiqueta HTML maliciosa conservada literalmente, sin ejecución. Sin tráfico externo, errores JavaScript o respuestas HTTP fallidas durante aplicación y tutorial.
- Etiquetas de controles, teclado, anchuras 360, 390, 768 y 1440 px en biblioteca, editor, recorrido y tutorial abierto, sin desbordamiento. Capturas de biblioteca y móvil revisadas.
- Seis documentos docentes, prompts copiables, progreso/restablecimiento, enlaces locales bajo /farmaPNT/ y alternativa Markdown sin JavaScript: aprobados.

No hay validación clínica o de usuarios institucionales, certificación de accesibilidad ni pruebas visuales en todos los navegadores. Las comprobaciones anteriores son locales. La activación, CI y publicación se registran por separado y no se dan por hechas por haber subido código.

## Publicación observada

GitHub Pages confirmó el despliegue inicial del commit 5a70000 en https://github.com/ramonmorillo/farmaPNT/actions/runs/42853222612, con destino ramonmorillo.es/farmaPNT/. La CI de main también terminó correctamente. La prueba funcional se ejecutó localmente; esta observación remota confirma el despliegue y no se presenta como una prueba de navegador sobre el dominio publicado. La ficha del taller se incorpora después de comprobar ese resultado.
