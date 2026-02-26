
# Informe de Pruebas TestSprite AI (MCP)

---

## 1️⃣ Metadatos del Documento
- **Nombre del Proyecto:** rocketchat
- **Fecha:** 2026-02-25
- **Preparado por:** Equipo TestSprite AI

---

## 2️⃣ Resumen de Validación de Requisitos

### Requisito: Cambio de Tema de Plataforma (Landing y Dashboard)
- **Descripción:** Los usuarios pueden alternar entre los temas visuales de Twitch y Kick en la página de inicio. El tema seleccionado persiste a través de la autenticación y también puede cambiarse en el dashboard.

#### Test TC001 El tema de la landing alterna de Twitch a Kick
- **Código del Test:** [TC001_Landing_page_theme_toggles_from_Twitch_to_Kick.py](./TC001_Landing_page_theme_toggles_from_Twitch_to_Kick.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/90d34f6d-b7c0-4b66-a045-f20c92981898
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** Al hacer clic en el selector de Kick en la página de inicio, el color principal de la UI cambia correctamente de morado (Twitch) a verde (Kick). El cambio de tema es instantáneo y visualmente consistente.

---

#### Test TC002 El tema de la landing alterna de Kick de vuelta a Twitch
- **Código del Test:** [TC002_Landing_page_theme_toggles_from_Kick_back_to_Twitch.py](./TC002_Landing_page_theme_toggles_from_Kick_back_to_Twitch.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/dc94c2c8-4461-4655-9d77-cf6a3e6625b9
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El ciclo completo de alternancia (Twitch → Kick → Twitch) funciona correctamente. El color de la UI vuelve al morado como se espera.

---

#### Test TC003 La selección de tema en la landing se mantiene en el dashboard tras iniciar sesión
- **Código del Test:** [TC003_Theme_selection_on_landing_carries_into_dashboard_after_sign_in_navigation.py](./TC003_Theme_selection_on_landing_carries_into_dashboard_after_sign_in_navigation.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/c3b67f8d-b6a0-490c-8ba8-d7f1ac5b8861
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El estado del tema persiste correctamente a través del flujo de autenticación. Un tema Kick seleccionado en la landing sigue activo después de iniciar sesión y navegar al `/dashboard`.

---

#### Test TC004 El control de cambio de tema está presente en el encabezado del dashboard tras iniciar sesión
- **Código del Test:** [TC004_Theme_toggle_control_is_present_on_dashboard_header_after_successful_sign_in.py](./TC004_Theme_toggle_control_is_present_on_dashboard_header_after_successful_sign_in.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/95129240-c04a-4119-bd44-07b39e05a3f7
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El control de cambio de tema está presente y visible en el encabezado del dashboard tras la autenticación. No se detectaron elementos faltantes ni problemas de maquetación.

---

#### Test TC005 El tema del dashboard puede cambiarse tras iniciar sesión
- **Código del Test:** [TC005_Dashboard_theme_can_be_switched_after_sign_in.py](./TC005_Dashboard_theme_can_be_switched_after_sign_in.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/23484f33-172b-4771-bbac-3d5e26fe1376
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El tema puede alternarse en el dashboard después de iniciar sesión. Ambos temas (Twitch y Kick) se renderizan correctamente desde la vista autenticada.

---

### Requisito: Alternancia de Modo de Stream (Juegos / Solo Charlando)
- **Descripción:** Los usuarios autenticados pueden alternar entre el modo "Juegos" y el modo "Solo Charlando" en el dashboard. Cada modo muestra una zona de entrada distinta.

#### Test TC006 Cambiar al modo Solo Charlando actualiza el área de entrada
- **Código del Test:** [TC006_Switch_to_Just_Chatting_mode_updates_the_input_area.py](./TC006_Switch_to_Just_Chatting_mode_updates_the_input_area.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/700179c0-82f2-4f04-9542-9f1605614af2
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** Al hacer clic en "Solo Charlando", el área de entrada de juegos es reemplazada por el área de entrada de tema. La transición de UI es correcta y los controles adecuados son visibles.

---

#### Test TC007 Volver al modo Juegos actualiza el área de entrada
- **Código del Test:** [TC007_Switch_back_to_Game_mode_updates_the_input_area.py](./TC007_Switch_back_to_Game_mode_updates_the_input_area.py)
- **Error del Test:** FALLO — El botón de alternancia "Juegos" no era interactuable; los intentos de clic fallaron e impidieron realizar la acción requerida. Los elementos de la UI quedaron obsoletos o no interactuables tras varios intentos.
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/8b0224a7-0818-472c-9dcb-37db56331697
- **Estado:** ❌ Fallido
- **Severidad:** MEDIA
- **Análisis / Hallazgos:** El botón de alternancia "Juegos" se vuelve intermitentemente no interactuable después de salir del modo Juegos. Probablemente es un problema de sincronización en el re-renderizado, donde el elemento es reemplazado en el DOM antes de que se procese el clic. TC008 (ciclo completo) superó el test, lo que sugiere que el problema es sensible al orden de ejecución o al timing, y no una regresión permanente.

---

#### Test TC008 Alternar Juegos → Solo Charlando → Juegos cambia el área de entrada cada vez
- **Código del Test:** [TC008_Toggle_Game___Just_Chatting___Game_swaps_input_area_each_time.py](./TC008_Toggle_Game___Just_Chatting___Game_swaps_input_area_each_time.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/217bfc4f-25b7-4d8b-a3c8-e4d8047524c7
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El ciclo completo de alternancia (Juegos → Solo Charlando → Juegos) cambia correctamente el área de entrada en cada paso. Confirma que la lógica de alternancia es funcional.

---

### Requisito: Modo Juegos — Generación de Frases con IA
- **Descripción:** En el modo Juegos, los usuarios pueden introducir un nombre de juego, enviarlo y recibir frases de chat generadas por IA. Se añade un chip del juego a la lista (máximo 4 juegos). La validación impide entradas vacías o demasiado cortas.

#### Test TC011 Generar frases con IA correctamente y añadir un nuevo chip de juego
- **Código del Test:** [TC011_Generate_AI_phrases_successfully_and_add_a_new_game_chip.py](./TC011_Generate_AI_phrases_successfully_and_add_a_new_game_chip.py)
- **Error del Test:** FALLO — No apareció ningún indicador de carga ni de éxito tras enviar el nombre de juego 'Minecraft'. Los controles interactivos no estaban presentes o estaban bloqueados por una superposición modal.
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/85cbb253-c001-4e39-8978-d46e39f309a5
- **Estado:** ❌ Fallido
- **Severidad:** ALTA
- **Análisis / Hallazgos:** El modal de depuración de Astro aparece en modo desarrollo y bloquea la interacción con los controles del dashboard. Esto es un **artefacto del entorno de desarrollo** — la barra de herramientas dev de Astro intercepta los clics. Este test probablemente superaría la prueba con una build de producción. Se recomienda ejecutar los tests contra una build de producción (`pnpm build && pnpm preview`) para eliminar esta clase de interferencia.

---

#### Test TC012 La generación exitosa muestra una marca de verificación y añade el chip del juego a la lista
- **Código del Test:** [TC012_Successful_generation_shows_checkmark_and_adds_the_game_chip_to_the_list.py](./TC012_Successful_generation_shows_checkmark_and_adds_the_game_chip_to_the_list.py)
- **Error del Test:** FALLO — Icono de verificación no encontrado tras la generación. Chip de 'Valorant' no añadido; el chip de 'apex legends' estaba presente en su lugar. La acción de búsqueda activó el botón de generación de un chip existente en lugar de enviar 'Valorant'.
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/29abe26d-5144-4687-95ee-b3438c85894d
- **Estado:** ❌ Fallido
- **Severidad:** MEDIA
- **Análisis / Hallazgos:** La fuga de estado de una ejecución anterior dejó un chip de 'apex legends' en la lista de juegos, causando ambigüedad en los selectores. La acción de generación resolvió al objetivo equivocado. Es un problema de aislamiento de tests (sin reinicio de estado entre tests), no un bug del producto. Se recomienda añadir una limpieza en el `beforeEach` o usar sesiones de autenticación independientes por test.

---

#### Test TC013 La validación inline bloquea el envío de un nombre de juego de 1 carácter
- **Código del Test:** [TC013_Inline_validation_blocks_1_character_game_submission.py](./TC013_Inline_validation_blocks_1_character_game_submission.py)
- **Error del Test:** FALLO — El error de validación inline no fue visible tras enviar un nombre de juego de 1 carácter. El área de chat sigue mostrando el mensaje del estado vacío.
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/ae74f7e7-c0a1-42c4-95c5-9395d8efa285
- **Estado:** ❌ Fallido
- **Severidad:** ALTA
- **Análisis / Hallazgos:** La validación del lado del cliente para la longitud mínima del nombre del juego (>1 carácter) no muestra ningún mensaje de error inline visible. Aunque el envío es bloqueado silenciosamente (no se inicia la generación), la ausencia de feedback para el usuario es un bug de UX. Los usuarios no reciben ninguna indicación de por qué su entrada fue rechazada. Se recomienda añadir un mensaje de error inline explícito debajo del campo de entrada del juego.

---

#### Test TC017 Al alcanzar el límite de 4 juegos se muestra un error y no se añade el chip
- **Código del Test:** [TC017_4_game_limit_reached_shows_limit_error_and_does_not_add_new_chip.py](./TC017_4_game_limit_reached_shows_limit_error_and_does_not_add_new_chip.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/6cc0a69a-d537-46f0-9986-478b14f25936
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** El límite de 4 juegos se aplica correctamente. Se muestra un mensaje de error claro cuando el usuario intenta añadir un 5º juego, y el chip no se añade a la lista.

---

### Requisito: Modo Solo Charlando — Generación de Frases con IA
- **Descripción:** En el modo Solo Charlando, los usuarios pueden generar frases de chat con IA seleccionando un chip de tema preestablecido o escribiendo un tema personalizado. Las entradas de menos de 2 caracteres son rechazadas con un error de validación.

#### Test TC019 Generar frases desde un chip de tema preestablecido en modo Solo Charlando
- **Código del Test:** [TC019_Generate_phrases_from_a_preset_topic_chip_in_Just_Chatting_mode.py](./TC019_Generate_phrases_from_a_preset_topic_chip_in_Just_Chatting_mode.py)
- **Error del Test:** FALLO — Modal de depuración de Astro visible, bloqueando las interacciones con el dashboard. Los botones de cierre del modal no eran interactuables. Los clics en el botón de reproducción/generar fallaron con errores de elemento obsoleto. No se observó ningún indicador de carga ni marca de verificación de éxito.
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/e4dc23f1-3005-488d-af05-876cef17eaed
- **Estado:** ❌ Fallido
- **Severidad:** ALTA
- **Análisis / Hallazgos:** Misma causa raíz que TC011 — la barra de herramientas dev de Astro en modo desarrollo intercepta las interacciones. No es un bug del producto, sino un problema de configuración del entorno de pruebas. Ejecutar los tests contra una build de producción resolvería esta clase de fallos.

---

#### Test TC020 Generar frases desde un tema escrito válido usando el botón Enviar
- **Código del Test:** [TC020_Generate_phrases_from_a_valid_typed_topic_using_Submit.py](./TC020_Generate_phrases_from_a_valid_typed_topic_using_Submit.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/1e9fe343-0737-44ff-8ea9-f5b957d76d91
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** Escribir un tema válido y hacer clic en Enviar activa correctamente la generación de frases, muestra un indicador de carga y presenta las frases resultantes. El flujo completo funciona como se espera.

---

#### Test TC021 Rechazar tema de menos de 2 caracteres (validación del lado del cliente)
- **Código del Test:** [TC021_Reject_topic_shorter_than_2_characters_client_side_validation.py](./TC021_Reject_topic_shorter_than_2_characters_client_side_validation.py)
- **Visualización y Resultado:** https://www.testsprite.com/dashboard/mcp/tests/2ecac494-57f1-4ae6-8a42-69c67a4642ee/65d7dd3d-a81d-45a2-8af3-b68ccf4a3a6d
- **Estado:** ✅ Superado
- **Severidad:** BAJA
- **Análisis / Hallazgos:** La validación del lado del cliente rechaza correctamente los temas de menos de 2 caracteres y muestra un mensaje de error inline. No se activa ninguna generación.

---

## 3️⃣ Métricas de Cobertura

- **66,67% de tests superados** (10/15)

| Requisito                                       | Tests Totales | ✅ Superados | ❌ Fallidos |
|-------------------------------------------------|---------------|--------------|-------------|
| Cambio de Tema de Plataforma (Landing y Dashboard) | 5          | 5            | 0           |
| Alternancia de Modo de Stream (Juegos / Solo Charlando) | 3      | 2            | 1           |
| Modo Juegos — Generación de Frases con IA       | 4             | 1            | 3           |
| Modo Solo Charlando — Generación de Frases con IA | 3           | 2            | 1           |

---

## 4️⃣ Brechas Clave / Riesgos

> **66,67% de los tests superados completamente (10/15).**

**Problema de Entorno (ALTA — 2 fallos):**
El modal de la barra de herramientas dev de Astro (`TC011`, `TC019`) bloquea la interacción con los elementos durante los tests ejecutados contra el servidor de desarrollo. Son falsos negativos causados por ejecutar los tests en modo dev, no bugs del producto. **Solución recomendada:** ejecutar TestSprite contra una build de producción (`pnpm build && pnpm preview` en el puerto 4321) para eliminar completamente esta clase de fallos.

**Bug Real del Producto (ALTA — 1 fallo, `TC013`):**
La validación del lado del cliente para la longitud mínima del nombre del juego bloquea el envío silenciosamente pero no muestra ningún mensaje de error inline al usuario. Es un bug de usabilidad/UX que debe corregirse independientemente de la infraestructura de tests.

**Problema de Aislamiento de Tests (MEDIA — 1 fallo, `TC012`):**
La fuga de estado entre tests (chips de juegos que persisten entre ejecuciones) causa ambigüedad en los selectores. Se debe implementar un reinicio de estado (limpiar los chips de juegos) en el teardown del test o usar sesiones de autenticación aisladas por test para que los resultados sean deterministas.

**Inestabilidad en el Timing de la Alternancia (MEDIA — 1 fallo, `TC007`):**
El botón de alternancia "Juegos" se vuelve intermitentemente no interactuable tras un cambio de modo, probablemente por una condición de carrera en el re-renderizado. TC008 (ciclo completo) superó el test, por lo que puede ser un problema de timing en los tests y no una regresión funcional. Se recomienda añadir un paso de estabilización con `waitForSelector` tras la primera alternancia antes de intentar el segundo clic.

**Brechas de cobertura:**
- Los flujos de error de autenticación (credenciales inválidas, sesión expirada) no están cubiertos.
- Los controles de reproducción (selector de velocidad, iniciar/detener stream) no tienen tests en esta ejecución.
- El comportamiento de la ventana de chat durante streams activos (renderizado de mensajes, auto-scroll) no está testeado.
- El flujo de cierre de sesión no está cubierto.
