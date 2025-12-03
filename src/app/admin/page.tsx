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

interface ExerciseLog {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  notes: string | null;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  sessionsRemaining: number;
  totalSessions: number;
  notes: Note[];
  exercises: ExerciseLog[];
  createdAt: string;
  lastSessionDate: string | null;
  goals: string;
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
  const [newClientCredentials, setNewClientCredentials] = useState<NewClientCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    sessionsRemaining: 10,
    goals: "",
  });

  const [editForm, setEditForm] = useState({
    goals: "",
  });

  const [newExercise, setNewExercise] = useState({
    exercise: "",
    weight: "",
    reps: "",
    sets: "1",
  });

  // Local session counts for optimistic UI (allows +/- without API calls)
  const [localSessions, setLocalSessions] = useState<Record<string, number>>({});
  const [resetInputs, setResetInputs] = useState<Record<string, string>>({});
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      setCustomers([{ ...data.client, exercises: [] }, ...customers]);
      setNewClientCredentials(data.credentials);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        sessionsRemaining: 10,
        goals: "",
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setActionLoading(null);
    }
  };

  // Get the displayed session count (local override or server value)
  const getDisplayedSessions = (customer: Customer) => {
    return localSessions[customer.id] ?? customer.sessionsRemaining;
  };

  // Check if local differs from server
  const hasUnsavedChanges = (customer: Customer) => {
    return localSessions[customer.id] !== undefined && 
           localSessions[customer.id] !== customer.sessionsRemaining;
  };

  // Local +/- (no API call)
  const adjustLocalSessions = (customerId: string, delta: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    const current = localSessions[customerId] ?? customer.sessionsRemaining;
    const newValue = Math.max(0, current + delta);
    setLocalSessions({ ...localSessions, [customerId]: newValue });
  };

  // Commit to server
  const handleSaveSessions = async (customerId: string) => {
    const newCount = localSessions[customerId];
    if (newCount === undefined) return;

    setActionLoading(`sessions-${customerId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", count: newCount }),
      });

      if (!response.ok) throw new Error("Failed to update sessions");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, ...data.client }
          : c
      ));
      // Clear local override since server is now in sync
      const { [customerId]: _, ...rest } = localSessions;
      setLocalSessions(rest);
    } catch (err) {
      console.error("Error updating sessions:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reset session package (sets both remaining AND total)
  const handleResetPackage = async (customerId: string) => {
    const count = parseInt(resetInputs[customerId] || "");
    if (isNaN(count)) return;

    setActionLoading(`reset-${customerId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", count }),
      });

      if (!response.ok) throw new Error("Failed to reset sessions");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, ...data.client }
          : c
      ));
      setResetInputs({ ...resetInputs, [customerId]: "" });
    } catch (err) {
      console.error("Error resetting sessions:", err);
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

  const handleAddExercise = async (customerId: string) => {
    if (!newExercise.exercise.trim() || !newExercise.weight || !newExercise.reps) return;
    setActionLoading(`exercise-${customerId}`);

    try {
      const response = await fetch(`/api/clients/${customerId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: newExercise.exercise,
          weight: parseFloat(newExercise.weight),
          reps: parseInt(newExercise.reps),
          sets: parseInt(newExercise.sets) || 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add exercise");

      const data = await response.json();
      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, exercises: [data.exercise, ...(c.exercises || [])] }
          : c
      ));
      setNewExercise({ exercise: "", weight: "", reps: "", sets: "1" });
    } catch (err) {
      console.error("Error adding exercise:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteExercise = async (customerId: string, exerciseId: string) => {
    setActionLoading(`delete-exercise-${exerciseId}`);
    try {
      const response = await fetch(`/api/clients/${customerId}/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete exercise");

      setCustomers(customers.map((c) => 
        c.id === customerId 
          ? { ...c, exercises: (c.exercises || []).filter((e) => e.id !== exerciseId) }
          : c
      ));
    } catch (err) {
      console.error("Error deleting exercise:", err);
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
                          
                          <div className="flex items-center gap-3">
                            {/* Sessions Counter - local updates, then Set to save */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                onClick={() => adjustLocalSessions(customer.id, -1)}
                                size="sm"
                                className="bg-red-900/50 hover:bg-red-900 text-white h-8 w-8 p-0"
                                disabled={getDisplayedSessions(customer) === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <div className="text-center min-w-[50px]">
                                <div className={`text-2xl font-bold ${
                                  hasUnsavedChanges(customer)
                                    ? "text-blue-400"
                                    : getDisplayedSessions(customer) <= 3 && getDisplayedSessions(customer) > 0
                                      ? "text-amber-400" 
                                      : getDisplayedSessions(customer) === 0 
                                        ? "text-red-400" 
                                        : "text-white"
                                }`}>
                                  {getDisplayedSessions(customer)}
                                </div>
                                <div className="text-xs text-gray-500">sessions</div>
                              </div>
                              <Button
                                onClick={() => adjustLocalSessions(customer.id, 1)}
                                size="sm"
                                className="bg-green-900/50 hover:bg-green-900 text-white h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              
                              {/* Set button - only shows when there are unsaved changes */}
                              {hasUnsavedChanges(customer) && (
                                <Button
                                  onClick={() => handleSaveSessions(customer.id)}
                                  size="sm"
                                  className="bg-blue-700 hover:bg-blue-800 text-white h-8 px-3 ml-1"
                                  disabled={actionLoading === `sessions-${customer.id}`}
                                >
                                  {actionLoading === `sessions-${customer.id}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
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

                          {/* New Session Package */}
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <h4 className="font-medium text-gray-300 text-sm mb-3">New Session Package</h4>
                            <p className="text-gray-500 text-xs mb-3">
                              Reset session count when client purchases a new package
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={resetInputs[customer.id] || ""}
                                onChange={(e) => setResetInputs({...resetInputs, [customer.id]: e.target.value})}
                                placeholder="Enter sessions"
                                className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
                                min="0"
                              />
                              <Button
                                onClick={() => handleResetPackage(customer.id)}
                                size="sm"
                                className="bg-purple-800 hover:bg-purple-900 text-white px-4"
                                disabled={actionLoading === `reset-${customer.id}` || !resetInputs[customer.id]}
                              >
                                {actionLoading === `reset-${customer.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Set New Package"
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Goals */}
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
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-300 flex items-center gap-2">
                                  <Target className="w-4 h-4" /> Goals
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
                              <p className="text-white whitespace-pre-wrap">{customer.goals || "No goals set"}</p>
                            </div>
                          )}

                          {/* Exercise Log */}
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <h4 className="font-medium text-gray-300 flex items-center gap-2 mb-3">
                              <Activity className="w-4 h-4" /> Exercise Log
                            </h4>
                            
                            {/* Add Exercise Form */}
                            <div className="flex flex-wrap gap-2 mb-4 bg-gray-800/50 rounded-lg p-3">
                              <input
                                type="text"
                                value={newExercise.exercise}
                                onChange={(e) => setNewExercise({...newExercise, exercise: e.target.value})}
                                placeholder="Exercise (e.g. Bench Press)"
                                className="flex-1 min-w-[140px] px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
                              />
                              <input
                                type="number"
                                value={newExercise.weight}
                                onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                                placeholder="Weight"
                                className="w-20 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
                              />
                              <span className="text-gray-500 self-center text-sm">lbs ×</span>
                              <input
                                type="number"
                                value={newExercise.reps}
                                onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                                placeholder="Reps"
                                className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
                              />
                              <span className="text-gray-500 self-center text-sm">×</span>
                              <input
                                type="number"
                                value={newExercise.sets}
                                onChange={(e) => setNewExercise({...newExercise, sets: e.target.value})}
                                placeholder="Sets"
                                className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
                                min="1"
                              />
                              <Button
                                onClick={() => handleAddExercise(customer.id)}
                                size="sm"
                                className="bg-green-800 hover:bg-green-900 text-white px-3"
                                disabled={actionLoading === `exercise-${customer.id}` || !newExercise.exercise || !newExercise.weight || !newExercise.reps}
                              >
                                {actionLoading === `exercise-${customer.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Exercise List */}
                            {(!customer.exercises || customer.exercises.length === 0) ? (
                              <p className="text-gray-500 text-sm italic">No exercises logged yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {(expandedExercises[customer.id] 
                                  ? customer.exercises 
                                  : customer.exercises.slice(0, 5)
                                ).map((ex) => (
                                  <div
                                    key={ex.id}
                                    className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-white font-medium">{ex.exercise}</span>
                                      <span className="text-green-400 font-mono text-sm">
                                        {ex.weight}lbs × {ex.reps} × {ex.sets}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-500">{ex.date}</span>
                                      <button
                                        onClick={() => handleDeleteExercise(customer.id, ex.id)}
                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={actionLoading === `delete-exercise-${ex.id}`}
                                      >
                                        {actionLoading === `delete-exercise-${ex.id}` ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {customer.exercises.length > 5 && (
                                  <button
                                    onClick={() => setExpandedExercises({
                                      ...expandedExercises,
                                      [customer.id]: !expandedExercises[customer.id]
                                    })}
                                    className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center py-2"
                                  >
                                    {expandedExercises[customer.id] 
                                      ? `Show less` 
                                      : `Show ${customer.exercises.length - 5} more`}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

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
                              <div className="space-y-2">
                                {(expandedNotes[customer.id] 
                                  ? customer.notes 
                                  : customer.notes.slice(0, 3)
                                ).map((note) => (
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
                                {customer.notes.length > 3 && (
                                  <button
                                    onClick={() => setExpandedNotes({
                                      ...expandedNotes,
                                      [customer.id]: !expandedNotes[customer.id]
                                    })}
                                    className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center py-2"
                                  >
                                    {expandedNotes[customer.id] 
                                      ? `Show less` 
                                      : `Show ${customer.notes.length - 3} more notes`}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete Client */}
                          <div className="pt-4 border-t border-gray-800 flex justify-end">
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
