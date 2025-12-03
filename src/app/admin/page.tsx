"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Minus, 
  Edit, 
  UserPlus, 
  Users, 
  LogOut, 
  Save, 
  X, 
  Search,
  Target,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  StickyNote,
  Calendar,
  Loader2,
  Copy,
  Check
} from "lucide-react";

interface Note {
  id: string;
  date: string;
  content: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  sessionsRemaining: number;
  totalSessions: number;
  notes: Note[];
  createdAt: string;
  lastSessionDate: string | null;
  goals: string;
  currentWeight: number | null;
  targetWeight: number | null;
  xorsUserId?: string;
  xorsApiKey?: string;
}

interface NewClientCredentials {
  email: string;
  password: string;
  apiKey: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ customerId: string; noteId: string | null } | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [newClientCredentials, setNewClientCredentials] = useState<NewClientCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    sessionsRemaining: 10,
    goals: "",
    currentWeight: "",
    targetWeight: "",
  });

  const [editForm, setEditForm] = useState({
    goals: "",
    currentWeight: "",
    targetWeight: "",
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setCustomers(data.clients || []);
    } catch (err) {
      console.error("Error loading customers:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadCustomers();
    }
  }, [loadCustomers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      loadCustomers();
      setPassword("");
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setCustomers([]);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("create");
    setError("");

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          sessionsRemaining: newCustomer.sessionsRemaining,
          goals: newCustomer.goals,
          currentWeight: newCustomer.currentWeight ? parseFloat(newCustomer.currentWeight) : null,
          targetWeight: newCustomer.targetWeight ? parseFloat(newCustomer.targetWeight) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      setCustomers([data.client, ...customers]);
      setNewClientCredentials(data.credentials);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        sessionsRemaining: 10,
        goals: "",
        currentWeight: "",
        targetWeight: "",
      });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSessions = async (customerId: string, action: "increment" | "decrement" | "set", count?: number) => {
    setActionLoading(`sessions-${customerId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, count }),
      });

      if (!response.ok) throw new Error("Failed to update sessions");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, ...data.client }
          : c
      ));
      setSessionInput("");
    } catch (err) {
      console.error("Error updating sessions:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async (customerId: string) => {
    if (!newNoteContent.trim()) return;
    setActionLoading(`note-${customerId}`);

    try {
      const response = await fetch(`/api/clients/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, notes: [data.note, ...c.notes] }
          : c
      ));
      setNewNoteContent("");
      setEditingNote(null);
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNote = async (customerId: string, noteId: string) => {
    setActionLoading(`delete-note-${noteId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
          : c
      ));
    } catch (err) {
      console.error("Error deleting note:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCustomer = async (customerId: string) => {
    setActionLoading(`update-${customerId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: editForm.goals,
          currentWeight: editForm.currentWeight ? parseFloat(editForm.currentWeight) : null,
          targetWeight: editForm.targetWeight ? parseFloat(editForm.targetWeight) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update client");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, ...data.client }
          : c
      ));
      setEditingCustomer(null);
    } catch (err) {
      console.error("Error updating customer:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) return;
    
    setActionLoading(`delete-${customerId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete client");

      setCustomers(customers.filter((c) => c.id !== customerId));
      setExpandedCustomer(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const startEditing = (customer: Customer) => {
    setEditingCustomer(customer.id);
    setEditForm({
      goals: customer.goals || "",
      currentWeight: customer.currentWeight?.toString() || "",
      targetWeight: customer.targetWeight?.toString() || "",
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.sessionsRemaining > 0).length;
  const totalSessionsRemaining = customers.reduce((sum, c) => sum + c.sessionsRemaining, 0);
  const lowSessionCustomers = customers.filter((c) => c.sessionsRemaining <= 3 && c.sessionsRemaining > 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(127,29,29,0.1),transparent_50%)]" />
        <Card className="w-full max-w-md bg-gray-900/80 border-gray-800 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-800 to-red-950 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl font-bold">Coach Dashboard</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your password to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-medium py-3 rounded-lg transition-all"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* New Client Credentials Modal */}
      {newClientCredentials && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Client Created Successfully
              </CardTitle>
              <CardDescription className="text-gray-400">
                Share these credentials with your new client so they can log in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 text-sm">{newClientCredentials.email}</code>
                    <button
                      onClick={() => copyToClipboard(newClientCredentials.email, "email")}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedField === "email" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 text-sm font-mono">{newClientCredentials.password}</code>
                    <button
                      onClick={() => copyToClipboard(newClientCredentials.password, "password")}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedField === "password" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 text-xs font-mono break-all">{newClientCredentials.apiKey}</code>
                    <button
                      onClick={() => copyToClipboard(newClientCredentials.apiKey, "apiKey")}
                      className="text-gray-400 hover:text-white flex-shrink-0"
                    >
                      {copiedField === "apiKey" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-amber-400 text-sm">
                ⚠️ Save these credentials now. The password cannot be retrieved later.
              </p>
              <Button
                onClick={() => setNewClientCredentials(null)}
                className="w-full bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950"
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-red-950 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Coach Dashboard</h1>
                <p className="text-xs text-gray-400">Breakthrough Fitness</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Clients</p>
                      <p className="text-3xl font-bold text-white">{totalCustomers}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Clients</p>
                      <p className="text-3xl font-bold text-white">{activeCustomers}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Sessions Remaining</p>
                      <p className="text-3xl font-bold text-white">{totalSessionsRemaining}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Need Renewal</p>
                      <p className="text-3xl font-bold text-white">{lowSessionCustomers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Low Sessions Alert */}
            {lowSessionCustomers.length > 0 && (
              <Card className="mb-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-200">Clients Running Low on Sessions</h3>
                      <p className="text-amber-300/70 text-sm mt-1">
                        {lowSessionCustomers.map((c) => c.name).join(", ")} {lowSessionCustomers.length === 1 ? "has" : "have"} 3 or fewer sessions remaining.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="mb-6 bg-red-900/20 border-red-800/30">
                <CardContent className="p-4">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-medium px-4 py-2.5 flex-shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card className="mb-6 bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Add New Client</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter client details to create a new account. They will receive login credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        required
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        required
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Initial Sessions</label>
                      <input
                        type="number"
                        value={newCustomer.sessionsRemaining}
                        onChange={(e) => setNewCustomer({ ...newCustomer, sessionsRemaining: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        min="0"
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Weight (lbs)</label>
                      <input
                        type="number"
                        value={newCustomer.currentWeight}
                        onChange={(e) => setNewCustomer({ ...newCustomer, currentWeight: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Target Weight (lbs)</label>
                      <input
                        type="number"
                        value={newCustomer.targetWeight}
                        onChange={(e) => setNewCustomer({ ...newCustomer, targetWeight: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Goals</label>
                      <textarea
                        value={newCustomer.goals}
                        onChange={(e) => setNewCustomer({ ...newCustomer, goals: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                        placeholder="Client's fitness goals..."
                        disabled={actionLoading === "create"}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-3 justify-end">
                      <Button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        variant="outline"
                        className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        disabled={actionLoading === "create"}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white"
                        disabled={actionLoading === "create"}
                      >
                        {actionLoading === "create" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Client"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Clients List */}
            <div className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchQuery ? "No clients match your search." : "No clients yet. Add your first client to get started."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className={`bg-gray-900/80 border-gray-800 transition-all ${
                      expandedCustomer === customer.id ? "ring-1 ring-red-800/50" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      {/* Header Row */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                        onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-800/30 to-red-950/30 rounded-xl flex items-center justify-center text-red-400 font-bold text-lg">
                              {customer.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{customer.name}</h3>
                              <p className="text-sm text-gray-400">{customer.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            {/* Sessions Counter */}
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSessions(customer.id, "decrement");
                                }}
                                size="sm"
                                className="bg-red-900/50 hover:bg-red-900 text-white h-9 w-9 p-0"
                                disabled={actionLoading === `sessions-${customer.id}`}
                              >
                                {actionLoading === `sessions-${customer.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Minus className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="text-center min-w-[60px]">
                                <div className={`text-2xl font-bold ${
                                  customer.sessionsRemaining <= 3 
                                    ? "text-amber-400" 
                                    : customer.sessionsRemaining === 0 
                                      ? "text-red-400" 
                                      : "text-white"
                                }`}>
                                  {customer.sessionsRemaining}
                                </div>
                                <div className="text-xs text-gray-500">sessions</div>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSessions(customer.id, "increment");
                                }}
                                size="sm"
                                className="bg-green-900/50 hover:bg-green-900 text-white h-9 w-9 p-0"
                                disabled={actionLoading === `sessions-${customer.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="text-gray-500">
                              {expandedCustomer === customer.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedCustomer === customer.id && (
                        <div className="border-t border-gray-800 p-4 space-y-6">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                              <p className="text-white font-medium">{customer.phone || "—"}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
                              <p className="text-white font-medium">{customer.createdAt}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Last Session</p>
                              <p className="text-white font-medium">{customer.lastSessionDate || "Not yet"}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sessions</p>
                              <p className="text-white font-medium">{customer.totalSessions}</p>
                            </div>
                          </div>

                          {/* Goals and Weight */}
                          {editingCustomer === customer.id ? (
                            <div className="bg-gray-800/30 rounded-lg p-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Goals</label>
                                <textarea
                                  value={editForm.goals}
                                  onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Weight</label>
                                  <input
                                    type="number"
                                    value={editForm.currentWeight}
                                    onChange={(e) => setEditForm({ ...editForm, currentWeight: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Target Weight</label>
                                  <input
                                    type="number"
                                    value={editForm.targetWeight}
                                    onChange={(e) => setEditForm({ ...editForm, targetWeight: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-800"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  onClick={() => setEditingCustomer(null)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-gray-800 border-gray-700 text-gray-300"
                                >
                                  <X className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                                <Button
                                  onClick={() => handleUpdateCustomer(customer.id)}
                                  size="sm"
                                  className="bg-green-800 hover:bg-green-900 text-white"
                                  disabled={actionLoading === `update-${customer.id}`}
                                >
                                  {actionLoading === `update-${customer.id}` ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4 mr-1" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-800/30 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-gray-300 flex items-center gap-2">
                                  <Target className="w-4 h-4" /> Goals & Progress
                                </h4>
                                <Button
                                  onClick={() => startEditing(customer)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white h-8"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-white mb-3">{customer.goals || "No goals set"}</p>
                              {(customer.currentWeight || customer.targetWeight) && (
                                <div className="flex gap-6">
                                  {customer.currentWeight && (
                                    <div>
                                      <span className="text-gray-500 text-sm">Current: </span>
                                      <span className="text-white font-medium">{customer.currentWeight} lbs</span>
                                    </div>
                                  )}
                                  {customer.targetWeight && (
                                    <div>
                                      <span className="text-gray-500 text-sm">Target: </span>
                                      <span className="text-white font-medium">{customer.targetWeight} lbs</span>
                                    </div>
                                  )}
                                  {customer.currentWeight && customer.targetWeight && (
                                    <div>
                                      <span className="text-gray-500 text-sm">To go: </span>
                                      <span className={`font-medium ${
                                        customer.currentWeight > customer.targetWeight ? "text-amber-400" : "text-green-400"
                                      }`}>
                                        {Math.abs(customer.currentWeight - customer.targetWeight)} lbs
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notes Section */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-300 flex items-center gap-2">
                                <StickyNote className="w-4 h-4" /> Session Notes
                              </h4>
                              <Button
                                onClick={() => setEditingNote({ customerId: customer.id, noteId: null })}
                                size="sm"
                                variant="outline"
                                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-8"
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Note
                              </Button>
                            </div>

                            {editingNote?.customerId === customer.id && editingNote.noteId === null && (
                              <div className="mb-4 bg-gray-800/50 rounded-lg p-3">
                                <textarea
                                  value={newNoteContent}
                                  onChange={(e) => setNewNoteContent(e.target.value)}
                                  rows={3}
                                  placeholder="Add session notes, progress updates, or reminders..."
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 resize-none mb-2"
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    onClick={() => {
                                      setEditingNote(null);
                                      setNewNoteContent("");
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="bg-gray-800 border-gray-700 text-gray-300"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleAddNote(customer.id)}
                                    size="sm"
                                    className="bg-red-800 hover:bg-red-900 text-white"
                                    disabled={actionLoading === `note-${customer.id}`}
                                  >
                                    {actionLoading === `note-${customer.id}` ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : null}
                                    Save Note
                                  </Button>
                                </div>
                              </div>
                            )}

                            {customer.notes.length === 0 ? (
                              <p className="text-gray-500 text-sm italic">No notes yet.</p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {customer.notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="bg-gray-800/50 rounded-lg p-3 group relative"
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="text-xs text-gray-500">{note.date}</span>
                                      <button
                                        onClick={() => handleDeleteNote(customer.id, note.id)}
                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={actionLoading === `delete-note-${note.id}`}
                                      >
                                        {actionLoading === `delete-note-${note.id}` ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">{note.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Set Sessions */}
                          <div className="pt-4 border-t border-gray-800 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Set Sessions Directly
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={sessionInput}
                                  onChange={(e) => setSessionInput(e.target.value)}
                                  placeholder="Enter number"
                                  className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-800"
                                  min="0"
                                />
                                <Button
                                  onClick={() => {
                                    const count = parseInt(sessionInput);
                                    if (!isNaN(count)) {
                                      handleUpdateSessions(customer.id, "set", count);
                                    }
                                  }}
                                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
                                  disabled={actionLoading === `sessions-${customer.id}`}
                                >
                                  Set
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                variant="outline"
                                className="bg-red-900/20 border-red-800/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 px-4 py-2"
                                disabled={actionLoading === `delete-${customer.id}`}
                              >
                                {actionLoading === `delete-${customer.id}` ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Delete Client
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
