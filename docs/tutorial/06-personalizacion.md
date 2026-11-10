# 6. Personalización y reto

Identifica título, versión, fuente, autor y fecha de un documento ficticio. Pega el texto o carga TXT/MD. La copia por párrafos no interpreta decisiones: revísala. Convierte un paso en decisión solo si la fuente contiene la condición; conecta todas las opciones y su excepción.

## Reto: una excepción documentada

1. Duplica un documento ficticio y añade una excepción escrita por el instructor. No alteres un PNT institucional sin su circuito de aprobación.
2. Incrementa la versión a 1.1-DEMO y registra autor y fecha.
3. Añade un final de derivación con instrucción y cita exacta de la excepción.
4. Conecta la respuesta apropiada a ese nodo.
5. Valida alcanzabilidad, destinos, citas y ausencia de ciclos.
6. Revisa expresamente e inicia: prueba normal, excepción y respuesta cambiada tras volver atrás.
7. Guarda y recupera. La sesión antigua conserva su versión, no se adapta a la nueva.
8. Exporta JSON y TXT/PDF y comprueba origen y versión. Añade una prueba que falle si el destino de la excepción es incorrecto.

## Adaptación técnica

demos.mjs define ejemplos; core.mjs, esquema y ejecución; app.mjs, editor y vistas; farmapnt.css, extensión de tokens locales. Otro tipo de nodo exige actualizar esquema, validador, motor, editor, registro y tests: añadir un menú no implementa la funcionalidad.

Antes de uso institucional se necesitan validación farmacéutica, evaluación de riesgos, accesibilidad, controles de acceso y autorización. No confundas contraseña de frontend o SHA-256 con estas garantías.
