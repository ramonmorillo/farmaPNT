# 2. Preparación del entorno

Repositorio independiente: https://github.com/ramonmorillo/farmaPNT.

```sh
git clone https://github.com/ramonmorillo/farmaPNT.git
cd farmaPNT
git switch -c ejercicio/farmapnt
npm run serve
```

Si el desarrollo inicial no está fusionado, parte de feature/farmapnt. Abre la raíz del servidor local y tutorial.html. No uses file://: los módulos y la lectura de documentos necesitan HTTP.

Requisitos: Node.js 24 y Python 3. Sin npm install ni compilación. En la nube usa el checkout existente: cada tarea ya está aislada; no crees worktrees salvo petición explícita. Conserva cambios ajenos y revisa git status.

## Claude Code

Sigue https://code.claude.com/docs/ para instalar y autenticar el agente. Desde la carpeta del proyecto abre claude, pide inspección y aporta el prompt del paso 3. La autenticación del agente no se incorpora al frontend.

## Codex

Sigue https://developers.openai.com/codex/ para terminal, editor o nube. Selecciona farmaPNT y comprueba rama y permisos. No supongas que otro entorno tiene las mismas herramientas. Pide npm test y explicación de los fallos antes de modificar código.

Para copiar el proyecto conserva estructura, assets y licencias de fuentes. No copies CNAME, claves ni materiales protegidos del taller. Las referencias relativas permiten servir bajo /farmaPNT/ o en la raíz. Ejercicio: localiza core.mjs, demos.mjs y app.mjs y explica sus responsabilidades antes de editar.
