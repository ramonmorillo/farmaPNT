# 5. Auditoría y publicación

Ejecuta npm test y npm run test:browser. Revisa las dos rutas de cada demo, fragmentos, versión, retroceso, respuesta cambiada, interrupción, recuperación y borrado. Comprueba contenido de JSON/TXT/PDF, teclado, móvil, enlaces y ausencia de tráfico o ejecución HTML. Usa el prompt de auditoría; revisión técnica y profesional son diferentes y ninguna certifica la aplicación.

## GitHub Pages

Repositorio: https://github.com/ramonmorillo/farmaPNT. Rutas relativas; los documentos se cargan usando import.meta.url. No hay CNAME.

1. Settings → Pages → Source: GitHub Actions.
2. Fusiona los cambios revisados a main.
3. pages.yml ejecuta npm test, prepara un artefacto con aplicación, módulos, assets y docs y publica. No incluye tests, claves ni metadatos Git.
4. Comprueba ejecución y SHA. URL prevista: https://ramonmorillo.github.io/farmaPNT/. Pages puede heredar ramonmorillo.es conservando /farmaPNT/.
5. Prueba aplicación, tutorial y ambas rutas. Solo después actualiza el taller.

ci.yml ejecuta Node en push y PR; el navegador se ejecuta por separado con el script Python. Si la activación inicial de Pages requiere un ajuste de administración no disponible, registra el bloqueo sin afirmar publicación.

## Integración del taller

Fuente y cifrado de Santiago permanecen en ramonmorillo.github.io. No copies su clave ni modifiques taller-acceso.js. Cambia solo la ficha FarmaPNT y regenera solo Santiago con su clave actual. La aplicación pública no hereda el acceso del taller.

Ejercicio: distingue código subido, tests locales, CI aprobada y despliegue publicado comparando sus SHA.
