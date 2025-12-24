import React, { useEffect, useState } from "react";
import Display from "./components/Display";
import Keypad from "./components/Keypad";
import Logs from "./components/Logs";
import { safeEvaluate } from "./utils/evaluator";
import { createApiClient } from "./api/client";
import { ThemeProvider } from "./context/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ThemeButton from "./components/ThemeButtton";
import LoginForm from "./components/LoginForm";

const CalculatorApp = () => {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("");
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshLogs, setRefreshLogs] = useState(0);

  const { token, user, logout } = useAuth();

  useEffect(() => {
    const initializeClient = async () => {
      setLoading(true);
      try {
        // Create client with token getter function
        const apiClient = createApiClient(() => token);
        setClient(apiClient);
      } catch (err) {
        console.error("Failed to initialize API client:", err);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    initializeClient();
  }, [token]); // Re-initialize when token changes

  const saveLog = async (operation, result) => {
    if (!client) {
      console.warn("No API client available");
      return;
    }

    try {
      await client.createDocument({
        expression: String(operation),
        result: String(result),
      });

      setRefreshLogs((prev) => prev + 1);
    } catch (error) {
      console.warn("Save log failed", error);
    }
  };

  const handleInput = (char) => {
    setError("");
    const last = expr[expr.length - 1];
    const isOp = /[+\-*/.]/.test(char);

    if (isOp) {
      if (!expr && char !== "-") return;
      if (/[+\-*/.]/.test(last) && char !== "(" && char !== ")") {
        if (char === "-" && /[+\-*/]/.test(last)) {
          // allow unary minus after operator
        } else {
          setExpr((s) => s.slice(0, -1) + char);
          setDisplay((s) => s.slice(0, -1) + char);
          return;
        }
      }
    }
    setExpr((s) => s + char);
    setDisplay((s) => s + char);
  };

  const handleClear = () => {
    setExpr("");
    setDisplay("");
    setError("");
  };

  const handleDelete = () => {
    setExpr((s) => s.slice(0, -1));
    setDisplay((s) => s.slice(0, -1));
    setError("");
  };

  const handleEquals = () => {
    try {
      if (!expr) return;
      const result = safeEvaluate(expr);
      setDisplay(String(result));
      saveLog(expr, result);
      setExpr(String(result));
      setError("");
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const [themeMode, setThemeMode] = useState("light");
  const darkTheme = () => setThemeMode("dark");
  const lightTheme = () => setThemeMode("light");

  useEffect(() => {
    const doc = document.querySelector("html").classList;
    doc.remove("dark", "light");
    doc.add(themeMode);
  }, [themeMode]);

  // If not logged in, show login form
  if (!user && !loading) {
    return (
      <div className="min-h-screen p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <LoginForm />
      </div>
    );
  }

  return (
    <ThemeProvider value={{ themeMode, darkTheme, lightTheme }}>
      <div className="min-h-screen p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-3xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">React Calculator</h1>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                    Role: {user.role}
                  </span>
                  {/* <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                    <span className="font-medium">{user.username}</span>
                  </div> */}
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              )}
              <ThemeButton />
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <Display value={display} error={error} />

              <div className="mt-4">
                <Keypad
                  onInput={handleInput}
                  onClear={handleClear}
                  onDelete={handleDelete}
                  onEquals={handleEquals}
                />
              </div>
            </section>

            <aside>
              <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded">
                <h2 className="text-lg font-semibold">Logs</h2>
                <p className="text-sm text-gray-500 mt-2 dark:text-amber-50">
                  Backend status: {client ? "Connected" : "Not connected"}
                </p>
                <div className="mt-3">
                  <Logs client={client} refreshTrigger={refreshLogs} />
                </div>
              </div>
            </aside>
          </main>

          <footer className="mt-6 text-sm text-gray-500 dark:text-amber-50">
            <div>Notes:</div>
            <ul className="list-disc ml-6">
              <li>Supports + - * / and parentheses and decimals.</li>
              <li>
                Input validation prevents some invalid operator sequences.
              </li>
              <li>Logs are saved to MongoDB backend.</li>
            </ul>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CalculatorApp />
    </AuthProvider>
  );
};

export default App;
