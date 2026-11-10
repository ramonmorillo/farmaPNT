# Arquitectura y decisiones · FarmaPNT v1

Se verificó ramonmorillo/farmaPNT, creado y vacío. Se prepararon main y feature/farmapnt. La ficha del taller definía pasos, decisiones, versiones, checklist y un ejemplo ficticio de termolábiles.

Se reutilizaron tokens CSS, fuentes con licencias, favicon, lector seguro de tutorial y patrón de workflows de FarmaInforme, sin modificar su aplicación. No se copiaron talleres, claves, CNAME ni materiales protegidos. El motor PNT es propio.

```text
index.html, farmapnt.css, app.mjs    interfaz, edición y recorrido
core.mjs                           esquema, grafo, estado y persistencia
demos.mjs                          tres documentos ficticios
tutorial.html, tutorial.mjs         guía y lector seguro
assets/                            estilos, favicon, fuentes y licencias
docs/tutorial/                     nueve documentos
tests/core.test.mjs                 Node
scripts/test-farmapnt.py            navegador y exportaciones
.github/workflows/                 CI y publicación
```

## Decisiones registradas

1. Sin IA, APIs, backend o dependencias de producción. La conversión copia párrafos y no interpreta reglas.
2. Grafo acíclico de hasta 60 nodos: action, decision y end. Inicio, destinos existentes, nodos alcanzables y final obligatorios. Los bucles se rechazan.
3. Cada nodo conserva un fragmento de sourceText. La coincidencia literal se comprueba; significado, vigencia y aprobación no se verifican automáticamente.
4. Copia fija por sesión con SHA-256 del esquema normalizado. Al recuperar, se reproduce el historial sobre esa copia. No es un registro seguro o inmutable.
5. Volver atrás retira el último evento; la nueva respuesta reconstruye desde ahí sin conservar otra rama.
6. Estados active, completed, escalated y stopped. Completed solo significa cierre documental, no cumplimiento demostrado de una tarea real.
7. JSON portable para procedimientos, TXT para registro y PDF por impresión nativa. No se añade una biblioteca ofimática innecesaria.
8. Guardado manual sin cifrar, hasta 15 procedimientos y 15 recorridos: farmapnt.protocolos.v1 y farmapnt.recorridos.v1. El tutorial usa su propia clave de sessionStorage, sin documentos.
9. DOM seguro sin innerHTML de usuario; JSON normalizado y tamaños limitados; TXT/MD local. CSP bloquea conexiones de aplicación y limita el tutorial a documentos del mismo origen. Sin telemetría.
10. Rutas relativas probadas bajo /farmaPNT/ respetando mayúsculas; despliegue independiente con enlaces en el taller.

schema es la versión de software; version, la del documento. Editar una fuente no actualiza sesiones antiguas ni les transfiere una aprobación.
