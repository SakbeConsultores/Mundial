# Sincronización compartida del Mundial 2026 — Guía de instalación

Objetivo: que los marcadores y tarjetas se guarden en la nube (Notion) y todos los
que abran la página —en iPhone o computadora— vean y editen la misma información.

## Cómo funciona (en 1 minuto)

```
Tu página (GitHub Pages)  ──►  Worker de Cloudflare  ──►  Base de datos en Notion
   (pública, sin secretos)      (guarda el token escondido)   (guarda los datos)
```

La página **nunca** habla directo con Notion, porque eso obligaría a poner el token
de Notion en el código público y cualquiera podría borrar tu Notion. El Worker es un
intermediario gratuito que guarda ese token en secreto.

## Lo que ya quedó hecho

- ✅ Base de datos creada en tu Notion: **"Mundial 2026 - Estado (sync)"**
  - **Database ID:** `ef330d42e3c84618b155bc84f680f4b8`
  - Filas `results` (marcadores) y `discipline` (tarjetas), con JSON vacío.
- ✅ Código del Worker listo: `worker/worker.js`
- ✅ La app (`src/App.jsx`) ya sabe sincronizar; solo falta pegarle la URL del Worker.

## Lo que falta (haces tú estos pasos)

---

### PASO 1 — Crear la integración de Notion (te da el "token")

1. Entra a https://www.notion.so/my-integrations
2. Clic en **"+ New integration"**.
3. Nombre: `Mundial Sync`. Workspace: el tuyo. Tipo: **Internal**.
4. Guarda y copia el **"Internal Integration Secret"** (empieza con `ntn_` o `secret_`).
   Es tu **NOTION_TOKEN**. No lo compartas con nadie.

### PASO 2 — Dar acceso a la base de datos

1. Abre en Notion la base **"Mundial 2026 - Estado (sync)"**.
2. Arriba a la derecha, menú **•••** → **"Connections"** (Conexiones) → **"Connect to"**.
3. Elige **Mundial Sync**. (Sin esto, el Worker no puede leer ni escribir.)

### PASO 3 — Crear el Worker en Cloudflare (gratis)

1. Crea cuenta en https://dash.cloudflare.com (gratis) y entra.
2. Menú izquierdo: **"Workers & Pages"** → **"Create application"** → **"Create Worker"**.
3. Ponle un nombre, ej. `mundial-sync`. Clic en **"Deploy"** (despliega un ejemplo).
4. Clic en **"Edit code"**. Borra todo lo que haya y pega **completo** el contenido de
   `worker/worker.js`. Clic en **"Deploy"** otra vez.

### PASO 4 — Configurar las variables secretas del Worker

1. En el Worker: **"Settings"** → **"Variables and Secrets"** (o "Variables").
2. Agrega estas dos (tipo **Secret** la primera, **Text** la segunda):

   | Nombre         | Valor                                      |
   |----------------|--------------------------------------------|
   | `NOTION_TOKEN` | el secret del PASO 1                       |
   | `DATABASE_ID`  | `ef330d42e3c84618b155bc84f680f4b8`         |

3. Guarda. (Si Cloudflare lo pide, vuelve a **Deploy**.)

### PASO 5 — Copiar la URL del Worker y probarla

1. La URL es algo como: `https://mundial-sync.TU-USUARIO.workers.dev`
2. Ábrela en el navegador. Debe responder: `{"results":{},"discipline":{}}`
   - Si ves un error, revisa el PASO 2 (conexión) y el PASO 4 (variables).

### PASO 6 — Pegar la URL en la app

1. Abre `src/App.jsx`.
2. Busca cerca del inicio la línea:

   ```js
   const API_URL = "";
   ```

3. Pega tu URL entre las comillas:

   ```js
   const API_URL = "https://mundial-sync.TU-USUARIO.workers.dev";
   ```

### PASO 7 — Publicar (push a GitHub)

Al hacer push a la rama `main`, GitHub Actions compila y publica solo (ya está configurado).

```bash
git add src/App.jsx
git commit -m "Sincronización compartida vía Notion + Worker"
git push
```

Espera 1–2 minutos a que termine el deploy (pestaña **Actions** en GitHub).

### PASO 8 — Probar de verdad

1. Abre la página en la computadora, captura un marcador.
2. Abre la misma página en el iPhone: debe aparecer el dato (puede tardar hasta ~15 s,
   o jala de inmediato al volver a la pestaña).
3. Arriba a la derecha verás el estado: **🟢 en línea** / **🔴 sin conexión** / **📴 solo local**.

---

## Cosas que debes saber (riesgos y límites)

- **Cualquiera con el link puede editar.** Fue tu decisión. No hay contraseña. Si en el
  futuro quieres proteger la edición con una clave, se puede agregar.
- **Gana el último que guarda.** Si dos personas editan el *mismo* partido al mismo
  tiempo, se queda el último cambio. Para un grupo de amigos es suficiente.
- **No es instantáneo entre dispositivos.** La página revisa cambios cada 15 segundos y
  cada vez que regresas a la pestaña. No es chat en vivo, pero para esto sobra.
- **Sin conexión sigue funcionando.** Si no hay internet, la página usa la copia local y
  vuelve a sincronizar cuando regresa la conexión.
- **Costo: $0.** El plan gratis de Cloudflare da 100,000 peticiones diarias; tú usarás
  una mínima fracción.
- **El token es la llave maestra.** Si alguna vez se filtra, entra a
  https://www.notion.so/my-integrations y haz **"Refresh"** del secret; luego actualiza
  la variable `NOTION_TOKEN` en el Worker.

## Si algo falla

- La URL del Worker no responde `{...}` → revisa PASO 2 y PASO 4.
- En la app dice **🔴 sin conexión** → la `API_URL` en `App.jsx` está mal o el Worker no
  está desplegado. Abre la URL del Worker en el navegador para confirmarlo.
- Quiero volver atrás → la versión original está guardada en
  `worker/App.jsx.ANTES-de-sync.bak`.
