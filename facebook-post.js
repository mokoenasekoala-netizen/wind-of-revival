// Posts to the church Facebook Page. Only logged-in media crew can use it.
// Secrets live in Netlify environment variables, never in the website files.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

  // 1. Check the caller is a logged-in crew member
  const token = (event.headers.authorization || "").replace("Bearer ", "");
  const chk = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + process.env.FIREBASE_API_KEY,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) }
  );
  const who = chk.ok ? (await chk.json()).users?.[0]?.email : null;
  const crew = (process.env.CREW_EMAILS || "").toLowerCase().split(",").map((s) => s.trim());
  if (!who || !crew.includes(who.toLowerCase())) return { statusCode: 401, body: "Not allowed" };

  // 2. Post to the Page
  const { message, link } = JSON.parse(event.body || "{}");
  if (!message) return { statusCode: 400, body: "No message" };
  const p = new URLSearchParams({ message: message.slice(0, 5000), access_token: process.env.FB_PAGE_TOKEN });
  if (link) p.set("link", link);
  const v = process.env.FB_GRAPH_VERSION ? process.env.FB_GRAPH_VERSION + "/" : "";
  const r = await fetch(`https://graph.facebook.com/${v}${process.env.FB_PAGE_ID}/feed`, { method: "POST", body: p });
  return { statusCode: r.ok ? 200 : 502, body: await r.text() };
};
