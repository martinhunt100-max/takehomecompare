// /functions/api/auth/request-link.js
export async function onRequestGet({ request }) {
  console.log('GET /api/auth/request-link hit', request.url);
  return new Response(
    JSON.stringify({ alive: true, route: "/api/auth/request-link", method: "GET" }),
    { headers: { "content-type": "application/json" } }
  );
}

export async function onRequestPost({ request }) {
  console.log('POST /api/auth/request-link hit', request.url);
  const body = await request.text();
  return new Response(
    JSON.stringify({ alive: true, route: "/api/auth/request-link", method: "POST", raw: body }),
    { headers: { "content-type": "application/json" } }
  );
}
