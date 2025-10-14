export async function onRequestGet() {
  return new Response("PING from Functions", {
    headers: { "content-type": "text/plain" }
  });
}
