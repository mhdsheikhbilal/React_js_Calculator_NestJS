import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Logs = ({ client, refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth(); // Get user from AuthContext

  const fetchLogs = async () => {
    if (!client) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await client.listDocuments();
      setLogs(res.rows || []);
    } catch (error) {
      console.error("Fetch logs error:", error);
      setError("Failed to fetch logs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      fetchLogs();
    }
  }, [client, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!client) {
      alert("client not available");
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      alert("Only administrators can delete logs");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await client.deleteDocument(id);
      setLogs((prev) => prev.filter((log) => log.$id !== id));
    } catch (error) {
      alert("Delete Failed: " + (error.message || error));
    }
  };

  const handleDeleteAll = async () => {
    if (!client) {
      alert("client not available");
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      alert("Only administrators can delete all logs");
      return;
    }

    if (!window.confirm("Are you sure you want to delete ALL logs? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add token for admin check
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete all logs');
      }
      
      setLogs([]);
    } catch (error) {
      alert("Delete all failed: " + (error.message || error));
    }
  };

  const handleRetry = () => {
    fetchLogs();
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Operation Logs</h3>
        <div className="flex items-center gap-2">
          {/* {user && (
            <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
              Role: {user.role}
            </span>
          )} */}
          {error && (
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-blue-500 animate-pulse">Loading logs...</div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 font-medium">
            Error
          </div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Check if backend server is running at {import.meta.env.VITE_API_BASE_URL}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-2 max-h-64 overflow-auto mt-3">
            {logs.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded">
                <div className="text-gray-500 dark:text-amber-50">No logs yet</div>
                <div className="text-xs text-gray-400 mt-1 dark:text-amber-50">
                  Perform calculations to see logs here
                </div>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.$id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-mono text-sm truncate text-gray-600 dark:text-amber-50"
                      title={log.expression}
                    >
                      {log.expression}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-amber-50">
                      = {log.result}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          `${log.expression} = ${log.result}`
                        )
                      }
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs transition-colors"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                    
                    {/* Only show delete button for admin users */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(log.$id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition-colors"
                        title="Delete this log"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {logs.length > 0 && (
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-amber-50">
                {logs.length} log{logs.length !== 1 ? "s" : ""} found
              </div>
              
              {/* Only show delete all button for admin users */}
              {user?.role === 'admin' && (
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Delete All
                </button>
              )}
            </div>
          )}
        </>
      )}

      {!client && !loading && !error && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <div className="text-yellow-700 dark:text-yellow-300 font-medium">
            Backend Not Connected
          </div>
          <div className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
            Please check your backend server and restart the app
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;