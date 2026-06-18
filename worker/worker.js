// ─────────────────────────────────────────────────────────────
// Cloudflare Worker · Intermediario seguro entre la página y Notion
// ─────────────────────────────────────────────────────────────
// La página NUNCA habla directo con Notion (eso expondría el token).
// La página le habla a este Worker; el Worker guarda el token escondido
// en variables de entorno y es el único que habla con la API de Notion.
//
// Variables de entorno requeridas (se configuran en el panel de Cloudflare):
//   NOTION_TOKEN  -> el "Internal Integration Secret" de tu integración Notion
//   DATABASE_ID   -> ef330d42e3c84618b155bc84f680f4b8  (la base "Mundial 2026 - Estado")
//
// Endpoints que expone:
//   GET  /  -> devuelve { results: {...}, discipline: {...} }
//   POST /  -> recibe { results?: {...}, discipline?: {...} } y los guarda
// ─────────────────────────────────────────────────────────────

const NOTION_VERSION = "2022-06-28";

export default {
  async fetch(request, env) {
    // Cabeceras CORS: permiten que tu página (otro dominio) llame a este Worker.
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // El navegador manda una petición "OPTIONS" de prueba antes del POST: respondemos OK.
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    try {
      if (request.method === "GET") {
        const state = await readState(env);          // lee las 2 filas de Notion
        return json(state, cors);
      }
      if (request.method === "POST") {
        const body = await request.json();           // { results?, discipline? }
        await writeState(env, body);                 // actualiza solo lo que venga
        return json({ ok: true }, cors);
      }
      return json({ error: "metodo no permitido" }, cors, 405);
    } catch (e) {
      return json({ error: String(e) }, cors, 500);
    }
  },
};

// Devuelve una respuesta JSON con las cabeceras CORS incluidas.
function json(obj, cors, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

// Cabeceras para autenticar contra la API de Notion.
function nh(env) {
  return {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

// ── LECTURA ──────────────────────────────────────────────────
// Consulta la base y arma { results, discipline } a partir de las filas.
async function readState(env) {
  const r = await fetch(
    `https://api.notion.com/v1/databases/${env.DATABASE_ID}/query`,
    { method: "POST", headers: nh(env), body: JSON.stringify({ page_size: 10 }) }
  );
  const data = await r.json();
  const out = { results: {}, discipline: {} };

  for (const page of data.results || []) {
    // "Clave" es la columna título: vale "results" o "discipline".
    const key = page.properties?.Clave?.title?.[0]?.plain_text;
    if (key !== "results" && key !== "discipline") continue;

    // "Datos" guarda el JSON; puede venir partido en varios trozos: los unimos.
    const txt = (page.properties?.Datos?.rich_text || [])
      .map((t) => t.plain_text)
      .join("");
    try {
      out[key] = txt ? JSON.parse(txt) : {};
    } catch {
      out[key] = {};
    }
  }
  return out;
}

// ── ESCRITURA ────────────────────────────────────────────────
// Actualiza la fila de cada clave que venga en el body.
async function writeState(env, body) {
  for (const key of ["results", "discipline"]) {
    if (!body[key]) continue;                        // si no vino esa clave, no la tocamos

    const pageId = await findPage(env, key);
    const chunks = chunkText(JSON.stringify(body[key]));

    if (pageId) {
      // La fila ya existe -> la actualizamos.
      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: nh(env),
        body: JSON.stringify({ properties: { Datos: { rich_text: chunks } } }),
      });
    } else {
      // No existe (caso raro) -> la creamos.
      await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: nh(env),
        body: JSON.stringify({
          parent: { database_id: env.DATABASE_ID },
          properties: {
            Clave: { title: [{ text: { content: key } }] },
            Datos: { rich_text: chunks },
          },
        }),
      });
    }
  }
}

// Busca el id de la fila cuya "Clave" es exactamente el valor pedido.
async function findPage(env, key) {
  const r = await fetch(
    `https://api.notion.com/v1/databases/${env.DATABASE_ID}/query`,
    {
      method: "POST",
      headers: nh(env),
      body: JSON.stringify({
        filter: { property: "Clave", title: { equals: key } },
        page_size: 1,
      }),
    }
  );
  const data = await r.json();
  return data.results?.[0]?.id || null;
}

// Notion limita cada bloque de texto a 2000 caracteres.
// Partimos el JSON en trozos de 1900 para no pasarnos.
function chunkText(str) {
  const parts = [];
  for (let i = 0; i < str.length; i += 1900) {
    parts.push({ text: { content: str.slice(i, i + 1900) } });
  }
  return parts.length ? parts : [{ text: { content: "" } }];
}
