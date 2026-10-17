const maxRequestBytes = 8 * 1024;
const maximumPasswordBytes = 72;

type RegistrationInput = {
  displayName?: string;
  email: string;
  password: string;
  consent: boolean;
};

function jsonResponse(body: { code: string }, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function parseRegistrationInput(value: unknown): RegistrationInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const fields = value as Record<string, unknown>;
  if (
    (fields.displayName !== undefined && typeof fields.displayName !== "string")
    || typeof fields.email !== "string"
    || typeof fields.password !== "string"
    || fields.consent !== true
  ) return null;

  const displayName = typeof fields.displayName === "string"
    ? fields.displayName.trim().replace(/\s+/g, " ")
    : "";
  const email = fields.email.trim().toLowerCase();
  const passwordBytes = new TextEncoder().encode(fields.password).length;

  if (
    [...displayName].length > 80
    || /[\u0000-\u001f\u007f]/.test(displayName)
    || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || passwordBytes > maximumPasswordBytes
  ) return null;

  return { ...(displayName ? { displayName } : {}), email, password: fields.password, consent: true };
}

function isDuplicateAccountError(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;

  const fields = payload as Record<string, unknown>;
  return [fields.code, fields.message, fields.msg].some(
    (value) => typeof value === "string" && /already registered|already exists/i.test(value),
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonResponse({ code: "origin_not_allowed" }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ code: "invalid_request" }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
    return jsonResponse({ code: "invalid_request" }, 413);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > maxRequestBytes) {
    return jsonResponse({ code: "invalid_request" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ code: "invalid_request" }, 400);
  }

  const input = parseRegistrationInput(body);
  if (!input) return jsonResponse({ code: "invalid_request" }, 400);

  if (
    [...input.password].length < 12
    || !/\p{Lu}/u.test(input.password)
    || !/\p{N}/u.test(input.password)
    || !/[^\p{L}\p{N}\s]/u.test(input.password)
  ) return jsonResponse({ code: "weak_password" }, 400);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ code: "registration_unavailable" }, 503);
  }

  let authEndpoint: URL;
  try {
    const baseUrl = new URL(supabaseUrl);
    const isLocalDevelopment = ["localhost", "127.0.0.1", "[::1]"].includes(baseUrl.hostname);
    if (
      (baseUrl.protocol !== "https:" && !(isLocalDevelopment && baseUrl.protocol === "http:"))
      || baseUrl.username
      || baseUrl.password
      || baseUrl.search
      || baseUrl.hash
    ) return jsonResponse({ code: "registration_unavailable" }, 503);
    authEndpoint = new URL("/auth/v1/signup", baseUrl);
  } catch {
    return jsonResponse({ code: "registration_unavailable" }, 503);
  }

  let upstream: Response;
  try {
    upstream = await fetch(authEndpoint, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: input.displayName ? { display_name: input.displayName } : {},
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch {
    console.error("Registration provider request failed.");
    return jsonResponse({ code: "registration_unavailable" }, 503);
  }

  if (upstream.ok) {
    return jsonResponse({ code: "confirmation_required" }, 202);
  }

  if (upstream.status === 429) {
    return jsonResponse({ code: "rate_limited" }, 429);
  }

  if (upstream.status >= 400 && upstream.status < 500) {
    let providerError: unknown;
    try {
      providerError = await upstream.json();
    } catch {
      providerError = null;
    }

    if (isDuplicateAccountError(providerError)) {
      return jsonResponse({ code: "confirmation_required" }, 202);
    }

    return jsonResponse({ code: "registration_failed" }, 400);
  }

  console.error("Registration provider returned an unsuccessful response.", { status: upstream.status });
  return jsonResponse({ code: "registration_unavailable" }, 503);
}
