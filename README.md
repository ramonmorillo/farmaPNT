# FarmaPNT

Aplicación docente para transformar un procedimiento aportado en pasos, decisiones y comprobaciones con versión y origen trazables. Repositorio independiente del taller y de FarmaInforme.

## Funcionalidades

- Tres fuentes ficticias completas: recepción documental de un envío termolábil, preparación documental de una entrega y control de versión.
- Editor de metadatos, texto TXT/MD, nodos, respuestas y excepciones.
- Borrador secuencial por copia literal de párrafos, sin interpretación mediante IA.
- Validador de fragmentos, destinos, IDs, ciclos, nodos aislados y final alcanzable.
- Recorrido guiado con comprobaciones obligatorias, respuestas explícitas, retroceso, derivación e interrupción.
- Copia fija de la versión para cada recorrido y recuperación coherente con el historial.
- Guardado local voluntario, borrado, procedimiento JSON y registro TXT/PDF por impresión.
- Tutorial interactivo de seis pasos, prompts copiables y reto de excepción.

## Ejecutar

Node.js 24 y Python 3. Sin npm install, backend, claves o compilación.

```sh
git clone https://github.com/ramonmorillo/farmaPNT.git
cd farmaPNT
npm run serve
```

La aplicación está en la raíz del servidor local; el tutorial, en tutorial.html. No uses file://. La versión inicial está incorporada a main. Para mejoras posteriores, crea una rama y abre una PR. Las rutas relativas se prueban bajo /farmaPNT/ y permiten otro prefijo sin modificar los módulos.

## Verificar

```sh
npm test
npm run test:browser
```

Node usa su runner sin dependencias. Las pruebas de navegador requieren Playwright para Python, pypdf y Chromium; son herramientas de desarrollo, no dependencias de producción. El script escribe sus artefactos en una carpeta temporal fuera del checkout. Consulta docs/tutorial/limitaciones.md para resultados y pruebas no realizadas.

## Publicación

En Settings → Pages → Source selecciona GitHub Actions. La fusión a main dispara pages.yml: pruebas, empaquetado de aplicación/assets/docs y publicación. ci.yml prueba Node en push y PR; el navegador se ejecuta por separado. No hay CNAME.

Publicación confirmada por GitHub Pages: **https://ramonmorillo.es/farmaPNT/**. Tutorial: **https://ramonmorillo.es/farmaPNT/tutorial.html**. El repositorio usa el dominio personalizado heredado del propietario conservando /farmaPNT/. Verifica cada nuevo despliegue antes de anunciar cambios: una rama subida no implica publicación.

## Límites

Solo documentos y datos ficticios. No decide utilización de medicamentos, estabilidad, dosis o acciones clínicas. La coincidencia literal no garantiza significado, vigencia o aprobación; la revisión profesional es obligatoria. La huella no es firma y el registro no es auditoría inmutable ni prueba de tareas reales. No es un producto sanitario certificado.

No hay IA, APIs ni transmisión del PNT. Los borradores locales no están cifrados. La aplicación es pública y no hereda la clave del taller. Los archivos descargados se borran aparte de los datos locales.

## Estructura

Código en la raíz; demos.mjs contiene los documentos ficticios; docs/tutorial/ contiene nueve documentos; tests/ y scripts/ verifican el producto; .github/workflows/ configura CI y Pages. Se reutilizan identidad visual y lector de tutorial de FarmaInforme. Licencias de las fuentes en assets/fonts/ y procedencia en NOTICE.md.
