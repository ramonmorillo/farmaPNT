# 4. Construcción y pruebas

## Implementación real

- core.mjs: normalización, validación del grafo y fuente, copia por párrafos, huella, motor de recorrido, reproducción de sesiones, almacenamiento y registro.
- demos.mjs: tres fuentes íntegramente ficticias y grafos de dos rutas.
- app.mjs: editor, controles nativos, biblioteca e importación/exportación.
- index.html y farmapnt.css: interfaz, diseño adaptable y registro imprimible.
- tutorial.html y tutorial.mjs: seis pasos y lectura segura de estos documentos.
- tests/core.test.mjs y scripts/test-farmapnt.py: pruebas del núcleo y navegador.

```sh
npm test
npm run test:browser
git diff --check
```

Node usa su runner incorporado, sin instalar paquetes. El script Python requiere Playwright, pypdf y Chromium (herramientas de desarrollo disponibles en este entorno, no dependencias de la aplicación). En otro entorno prepara un virtualenv fuera del checkout e instala desde fuentes oficiales conservando TLS. Usa CHROMIUM_PATH o chromium en PATH; en su defecto, el navegador de Playwright.

El script sirve deliberadamente bajo /farmaPNT/ y guarda artefactos en una carpeta temporal fuera del checkout. Verifica contenidos de JSON, TXT y PDF, no solo descargas. No cuentes una prueba no ejecutada como aprobada.

## Depuración

No avanza: completa comprobaciones o elige respuesta. Nodo aislado: corrige conexiones entrantes e inicio. Ciclo: rompe el bucle; esta versión ejecuta grafos finitos sin repeticiones. Cita ausente: copia el fragmento literal y revisa su sentido; no alteres la fuente para justificar reglas inventadas. Historial dañado: no se sobrescribe. Sesión incoherente: comprueba copia, huella y eventos; no la migres automáticamente a otra versión.

Ejercicio: cambia un destino por un ID inexistente, detecta el fallo, corrígelo y prueba ambas ramas sin debilitar el test.
