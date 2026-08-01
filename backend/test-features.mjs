const BASE = "http://localhost:3000";

async function request(path, { method = "GET", body, cookie } = {}) {
  const headers = { "content-type": "application/json", origin: "http://localhost:5173" };
  if (cookie) headers["cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = text.slice(0, 300); }
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, json, setCookie };
}

async function main() {
  const email = `feature-test-${Date.now()}@test.com`;
  const signup = await request("/api/auth/sign-up/email", {
    method: "POST",
    body: { name: "Feature Test", email, password: "FeaturePass123!" },
  });
  console.log("signup status:", signup.status);
  if (signup.status !== 200) {
    console.log(JSON.stringify(signup.json, null, 2));
    return;
  }
  const cookie = (signup.setCookie ?? "").split(",").map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");
  console.log("cookie set:", cookie ? "yes" : "no");

  const tests = [
    ["codegen", "POST", "/api/ai/generate", { type: "generate", prompt: "Create a hello world function in TypeScript" }],
    ["debug", "POST", "/api/debug/analyze", { errorMessage: "TypeError: Cannot read properties of undefined (reading 'map')" }],
    ["security", "POST", "/api/security/scan", {}],
    ["performance", "POST", "/api/performance/scan", {}],
    ["codegen-history", "GET", "/api/ai/history", null],
    ["debug-history", "GET", "/api/debug/history", null],
    ["security-history", "GET", "/api/security/history", null],
    ["performance-history", "GET", "/api/performance/history", null],
    ["saved-prompts", "GET", "/api/ai/prompts", null],
  ];

  for (const [name, method, path, body] of tests) {
    const start = Date.now();
    try {
      const r = await request(path, { method, body, cookie });
      const data = r.json?.data;
      const err = r.json?.error;
      console.log(`\n=== ${name} ${path} -> ${r.status} (${Date.now() - start}ms) ===`);
      if (err) console.log("ERROR:", err);
      else if (data && typeof data === "object") {
        console.log("keys:", Object.keys(data).join(", "));
        if (data.generatedCode) console.log("generatedCode:", String(data.generatedCode).slice(0, 120).replace(/\n/g, " "));
        if (data.explanation) console.log("explanation:", String(data.explanation).slice(0, 120));
        if (data.securityScore !== undefined) console.log("securityScore:", data.securityScore);
        if (data.overallHealth !== undefined) console.log("overallHealth:", data.overallHealth);
        if (Array.isArray(data.items)) console.log("history items:", data.items.length);
        else if (Array.isArray(data)) console.log("array length:", data.length);
      } else {
        console.log("data:", JSON.stringify(r.json).slice(0, 200));
      }
    } catch (e) {
      console.log(`\n=== ${name} ${path} -> EXCEPTION: ${e.message}`);
    }
  }

  const cleanup = await request("/api/auth/delete-user", { method: "DELETE", cookie }).catch(() => null);
  console.log("\ncleanup:", cleanup ? cleanup.status : "skipped");
}

main().catch((e) => { console.error(e); process.exit(1); });
