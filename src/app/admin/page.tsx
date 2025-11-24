"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Edit, Users, LogOut } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: number;
  updatedAt: number;
  sessionCount: number | null;
  palmerAppId: number | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [sessionInput, setSessionInput] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem("admin_authenticated");
    const storedApiKey = sessionStorage.getItem("admin_api_key");
    if (authStatus === "true" && storedApiKey) {
      setIsAuthenticated(true);
      setApiKey(storedApiKey);
      fetchCustomers();
    }
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_api_key", apiKeyInput);
        fetchCustomers();
        setApiKeyInput("");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid API key");
      }
    } catch (error) {
      setError("Failed to authenticate. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_api_key");
    setCustomers([]);
    setApiKey(null);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Get API key from session storage
      const storedApiKey = sessionStorage.getItem("admin_api_key");
      if (!storedApiKey) {
        setError("No API key found. Please login again.");
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("/api/admin/customers", {
        headers: {
          "X-API-Key": storedApiKey,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both single customer and array response
        if (data.customer) {
          setCustomers([data.customer]);
        } else {
          setCustomers(data.customers || []);
        }
      } else {
        if (response.status === 401) {
          setError("Unauthorized. Please login again.");
          setIsAuthenticated(false);
          sessionStorage.removeItem("admin_authenticated");
          sessionStorage.removeItem("admin_api_key");
        } else {
          setError("Failed to fetch customers");
        }
      }
    } catch (error) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateSessions = async (
    customerId: number,
    action: "increment" | "decrement" | "set",
    count?: number
  ) => {
    setLoading(true);
    setError("");

    try {
      const storedApiKey = sessionStorage.getItem("admin_api_key");
      if (!storedApiKey) {
        setError("No API key found. Please login again.");
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/admin/customers/${customerId}/sessions`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": storedApiKey,
        },
        body: JSON.stringify({
          action,
          count: count !== undefined ? count : 1,
        }),
      });

      if (response.ok) {
        await fetchCustomers();
        setEditingSession(null);
        setSessionInput("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update sessions");
      }
    } catch (error) {
      setError("Failed to update sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSetSessions = async (customerId: number) => {
    const count = parseInt(sessionInput);
    if (isNaN(count) || count < 0) {
      setError("Please enter a valid number");
      return;
    }
    await handleUpdateSessions(customerId, "set", count);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your API key to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="API Key"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 font-mono text-sm"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-red-800 hover:bg-red-900 text-white"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Account</h1>
            <p className="text-gray-400">Manage your session count</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {customers.length > 0 && customers[0] && (
              <div className="bg-gray-900 border border-gray-800 rounded-md px-4 py-2 text-sm">
                <div className="text-gray-400 text-xs mb-1">Logged in as:</div>
                <div className="text-white font-medium">{customers[0].name}</div>
                <div className="text-gray-400 text-xs">{customers[0].email}</div>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400">
            {error}
          </div>
        )}

        {/* Customer Info */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your session count
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No customers yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {customer.name}
                        </h3>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>{customer.email}</div>
                          {customer.phone && <div>{customer.phone}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-800">
                            {customer.sessionCount ?? 0}
                          </div>
                          <div className="text-xs text-gray-400">Sessions</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {editingSession === customer.id ? (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={sessionInput}
                                onChange={(e) => setSessionInput(e.target.value)}
                                placeholder="Count"
                                className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                min="0"
                              />
                              <Button
                                onClick={() => handleSetSessions(customer.id)}
                                size="sm"
                                className="bg-red-800 hover:bg-red-900 text-white text-xs px-2"
                              >
                                Set
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingSession(null);
                                  setSessionInput("");
                                }}
                                size="sm"
                                variant="outline"
                                className="bg-gray-700 border-gray-600 text-white text-xs px-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleUpdateSessions(customer.id, "increment")
                                  }
                                  size="sm"
                                  className="bg-green-800 hover:bg-green-900 text-white"
                                  disabled={loading}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleUpdateSessions(customer.id, "decrement")
                                  }
                                  size="sm"
                                  className="bg-red-800 hover:bg-red-900 text-white"
                                  disabled={loading}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingSession(customer.id);
                                    setSessionInput(
                                      (customer.sessionCount ?? 0).toString()
                                    );
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="bg-gray-700 border-gray-600 text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

