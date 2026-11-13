
/**
 * Shared application state for all roles.
 * Data and demo sessions are saved in localStorage.
 */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import { createSeed } from "@/data/seed";
  
  const DATA_KEY = "sallihha.data.v1";
  const SESSION_KEY = "sallihha.session.v1";
  
  const Ctx = createContext(null);
  
  export function AppStoreProvider({ children }) {
    const [state, setState] = useState(createSeed);
    const [sessionId, setSessionId] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const [storageError, setStorageError] = useState(null);
  
    const ref = useRef(state);
    ref.current = state;
  
    // Load saved data and session
    useEffect(() => {
      try {
        const raw = localStorage.getItem(DATA_KEY);
  
        if (raw) {
          const parsed = JSON.parse(raw);
  
          if (
            parsed &&
            Array.isArray(parsed.users) &&
            Array.isArray(parsed.requests)
          ) {
            ref.current = parsed;
            setState(parsed);
          }
        }
  
        setSessionId(localStorage.getItem(SESSION_KEY));
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
  
      setHydrated(true);
    }, []);
  
    // Save application data
    useEffect(() => {
      if (!hydrated) return;
  
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify(state));
        setStorageError(null);
      } catch (error) {
        console.error("Failed to save data:", error);
  
        setStorageError(
          "Your changes could not be saved in this browser."
        );
      }
    }, [state, hydrated]);
  
    // Run business logic and update state
    const run = useCallback((fn) => {
      try {
        const out = fn(ref.current);
  
        if (!out || typeof out !== "object") {
          throw new Error("Invalid business operation result.");
        }
  
        const next = "users" in out ? out : out.state;
        const value = "users" in out ? undefined : out.value;
  
        if (!next || !Array.isArray(next.users)) {
          throw new Error("Invalid application state.");
        }
  
        ref.current = next;
        setState(next);
  
        return { ok: true, value };
      } catch (error) {
        // Handle business rule errors
        if (error?.name === "RuleError") {
          return {
            ok: false,
            error: error.message,
            ...(error.field ? { field: error.field } : {}),
          };
        }
  
        console.error(error);
  
        return {
          ok: false,
          error: "Something went wrong. Please try again.",
        };
      }
    }, []);
  
    // Sign in with a demo session
    const signIn = useCallback((id) => {
      try {
        localStorage.setItem(SESSION_KEY, id);
        setSessionId(id);
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    }, []);
  
    // Clear the current session
    const signOut = useCallback(() => {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (error) {
        console.error("Failed to clear session:", error);
      }
  
      setSessionId(null);
    }, []);
  
    // Restore initial demo data
    const resetDemo = useCallback(() => {
      try {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(SESSION_KEY);
      } catch (error) {
        console.error("Failed to reset demo:", error);
      }
  
      const seed = createSeed();
  
      ref.current = seed;
      setState(seed);
      setSessionId(null);
      setStorageError(null);
    }, []);
  
    // Find the active signed-in user
    const currentUser = useMemo(() => {
      const user =
        state.users.find((u) => u.id === sessionId) ?? null;
  
      return user?.status === "Active" ? user : null;
    }, [state.users, sessionId]);
  
    return (
      <Ctx.Provider
        value={{
          state,
          hydrated,
          currentUser,
          run,
          signIn,
          signOut,
          resetDemo,
          storageError,
        }}
      >
        {children}
      </Ctx.Provider>
    );
  }
  
  // Access shared application state
  export function useStore() {
    const store = useContext(Ctx);
  
    if (!store) {
      throw new Error(
        "useStore must be used inside AppStoreProvider"
      );
    }
  
    return store;
  }
  