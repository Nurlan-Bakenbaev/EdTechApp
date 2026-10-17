import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/register/route";

const validInput = {
  displayName: "  Star   Fox ",
  email: " Parent@Example.com ",
  password: "Correct horse 42!",
  consent: true,
};

function registrationRequest(
  body: unknown = validInput,
  options: { origin?: string; contentType?: string } = {},
) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      Origin: options.origin ?? "http://localhost:3000",
      "Content-Type": options.contentType ?? "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("parent account registration endpoint", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("validates input and delegates password storage to Supabase without exposing tokens", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      access_token: "must-not-be-returned",
      refresh_token: "must-not-be-returned",
      user: { id: "parent-id" },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(registrationRequest());
    const body = await response.json();
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const forwarded = JSON.parse(String(init.body));

    expect(response.status).toBe(202);
    expect(body).toEqual({ code: "confirmation_required" });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(url.toString()).toBe("https://school-test.supabase.co/auth/v1/signup");
    expect(new Headers(init.headers).get("apikey")).toBe("test-anon-key");
    expect(forwarded.email).toBe("parent@example.com");
    expect(forwarded.data).toEqual({ display_name: "Star Fox" });
    expect(forwarded.password).toBe(validInput.password);
    expect(JSON.stringify(forwarded)).not.toMatch(/child|student|dateOfBirth/i);
    expect(JSON.stringify(body)).not.toContain("must-not-be-returned");
  });

  it("rejects cross-origin requests before contacting the auth provider", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(registrationRequest(validInput, { origin: "https://attacker.example" }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: "origin_not_allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing consent and weak passwords without sending them upstream", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const missingConsent = await POST(registrationRequest({ ...validInput, consent: false }));
    const weakPassword = await POST(registrationRequest({ ...validInput, password: "short" }));

    expect(missingConsent.status).toBe(400);
    expect(weakPassword.status).toBe(400);
    expect(await weakPassword.json()).toEqual({ code: "weak_password" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires an uppercase letter, number, and symbol in the password", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(registrationRequest({ ...validInput, password: "all lowercase words" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "weak_password" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows account registration without any display name", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const inputWithoutDisplayName = {
      displayName: "",
      email: validInput.email,
      password: validInput.password,
      consent: validInput.consent,
    };

    const response = await POST(registrationRequest(inputWithoutDisplayName));
    const forwarded = JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body));

    expect(response.status).toBe(202);
    expect(forwarded.data).toEqual({});
  });

  it("reports missing backend configuration without pretending registration succeeded", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(registrationRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "registration_unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not reveal whether an email address already has an account", async () => {
    vi.stubEnv("SUPABASE_URL", "https://school-test.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: "User already registered" }),
      { status: 400 },
    )));

    const response = await POST(registrationRequest());

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ code: "confirmation_required" });
  });
});
