import type { MessBody } from "./mess";
import type { AppSession, HomeResponse, MessData, MessDetail, MessSubscriptionRecord, Viewer } from "./types";

export type ApiErrorCode =
  | "network"
  | "timeout"
  | "bad_request"
  | "unauthorized"
  | "no_role"
  | "forbidden"
  | "not_found"
  | "platform"
  | "rate_limited"
  | "server";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type SessionStore = {
  load(): Promise<AppSession | null>;
  save(session: AppSession | null): Promise<void>;
};

type Options = {
  baseUrl: string;
  store: SessionStore;
  onSignedOut?: () => void;
  timeoutMs?: number;
};

const REFRESH_EARLY_SECONDS = 60;
const FALLBACK_MESSAGE = "Something went wrong. Try again.";

export function createApi({ baseUrl, store, onSignedOut, timeoutMs = 15_000 }: Options) {
  const root = `${baseUrl.replace(/\/+$/, "")}/api/app-modules`;
  let session: AppSession | null | undefined;
  let refreshing: Promise<AppSession | null> | null = null;

  async function current(): Promise<AppSession | null> {
    if (session === undefined) session = await store.load();
    return session;
  }

  async function setSession(next: AppSession | null) {
    session = next;
    await store.save(next);
  }

  async function endSession() {
    await setSession(null);
    onSignedOut?.();
  }

  async function raw(path: string, init: RequestInit, token?: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${root}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      throw controller.signal.aborted
        ? new ApiError("The server is taking too long. Try again.", 0, "timeout")
        : new ApiError("No connection. Check the internet and try again.", 0, "network");
    } finally {
      clearTimeout(timer);
    }
  }

  async function parse<T>(res: Response): Promise<T> {
    const body = (await res.json().catch(() => null)) as ({ error?: unknown; code?: ApiErrorCode } & Record<string, unknown>) | null;
    if (!res.ok) {
      const message = typeof body?.error === "string" && body.error ? body.error : FALLBACK_MESSAGE;
      throw new ApiError(message, res.status, body?.code ?? "server");
    }
    if (!body) throw new ApiError(FALLBACK_MESSAGE, res.status, "server");
    return body as T;
  }

  function refresh(): Promise<AppSession | null> {
    refreshing ??= (async () => {
      const old = await current();
      if (!old) return null;
      try {
        const res = await raw("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: old.refreshToken }) });
        if (res.status === 401) {
          await endSession();
          return null;
        }
        const { session: next } = await parse<{ session: AppSession }>(res);
        await setSession(next);
        return next;
      } catch (e) {
        if (e instanceof ApiError && (e.code === "network" || e.code === "timeout")) return old;
        throw e;
      }
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
    let s = await current();
    if (s && s.expiresAt - REFRESH_EARLY_SECONDS <= Date.now() / 1000) s = await refresh();
    if (!s) throw new ApiError("Log in to continue.", 401, "unauthorized");

    let res = await raw(path, init, s.accessToken);
    if (res.status === 401) {
      const next = await refresh();
      if (!next) throw new ApiError("Your session ended. Log in again.", 401, "unauthorized");
      res = await raw(path, init, next.accessToken);
    }
    try {
      return await parse<T>(res);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.code === "platform")) await endSession();
      throw e;
    }
  }

  const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });
  const patch = (body: unknown): RequestInit => ({ method: "PATCH", body: JSON.stringify(body) });
  const messPath = (id: string) => `/mess/${encodeURIComponent(id)}`;

  return {
    hasSession: async () => Boolean(await current()),

    sendCode: async (email: string) => parse<{ ok: true }>(await raw("/auth/send-code", post({ email }))),

    verifyCode: async (email: string, code: string) => {
      const out = await parse<{ session: AppSession; viewer: Viewer }>(await raw("/auth/verify-code", post({ email, code })));
      await setSession(out.session);
      return out.viewer;
    },

    signOut: async () => {
      const s = await current();
      await setSession(null);
      if (s) await raw("/auth/sign-out", { method: "POST" }, s.accessToken).catch(() => undefined);
      onSignedOut?.();
    },

    me: () => authed<{ viewer: Viewer }>("/me").then((r) => r.viewer),
    updateName: (fullName: string) => authed<{ viewer: Viewer }>("/me", patch({ fullName })).then((r) => r.viewer),

    home: () => authed<HomeResponse>("/home"),

    mess: () => authed<MessData>("/mess"),
    messDetail: (id: string) => authed<MessDetail>(messPath(id)),
    addMess: (body: Omit<MessBody, "meal_id" | "lead_source">) =>
      authed<{ row: MessSubscriptionRecord }>("/mess", post(body)).then((r) => r.row),
    updateMess: (id: string, body: MessBody) => authed<{ row: MessSubscriptionRecord }>(messPath(id), patch(body)).then((r) => r.row),
    markDelivered: (subscriptionId: string, date: string, unit: string) =>
      authed<{ alreadyExists: boolean }>("/mess/deliveries", post({ subscription_id: subscriptionId, delivery_date: date, delivery_unit: unit })),
  };
}

export type Api = ReturnType<typeof createApi>;

export function errorMessage(e: unknown, fallback = FALLBACK_MESSAGE): string {
  return e instanceof ApiError ? e.message : fallback;
}
