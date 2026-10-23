import { ApiError, type Viewer } from "@aapka/shared";
import { createContext, use, useEffect, useState, type ReactNode } from "react";

import { api, onSignedOut } from "./api";

type AuthState =
  | { status: "loading" }
  | { status: "offline" }
  | { status: "signedOut" }
  | { status: "signedIn"; viewer: Viewer };

type AuthContextValue = {
  state: AuthState;
  signedIn: (viewer: Viewer) => void;
  setViewer: (viewer: Viewer) => void;
  signOut: () => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function restore(): Promise<AuthState> {
  if (!(await api.hasSession())) return { status: "signedOut" };
  try {
    return { status: "signedIn", viewer: await api.me() };
  } catch (e) {
    if (e instanceof ApiError && (e.code === "network" || e.code === "timeout")) return { status: "offline" };
    await api.signOut();
    return { status: "signedOut" };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const stop = onSignedOut(() => setState({ status: "signedOut" }));
    void restore().then(setState);
    return () => {
      stop();
    };
  }, []);

  const value: AuthContextValue = {
    state,
    signedIn: (viewer) => setState({ status: "signedIn", viewer }),
    setViewer: (viewer) => setState({ status: "signedIn", viewer }),
    signOut: async () => {
      await api.signOut();
      setState({ status: "signedOut" });
    },
    retry: () => {
      setState({ status: "loading" });
      void restore().then(setState);
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useViewer(): Viewer {
  const { state } = useAuth();
  if (state.status !== "signedIn") throw new Error("useViewer needs a signed-in user");
  return state.viewer;
}
