"use client";

import { useState, useEffect } from "react";
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
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  StickyNote
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
}

// Mock initial data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    sessionsRemaining: 8,
    totalSessions: 12,
    notes: [
      { id: "n1", date: "2024-01-15", content: "Great progress on deadlifts. Increased weight by 10lbs." },
      { id: "n2", date: "2024-01-10", content: "Working on form for squats. Need to focus on depth." },
    ],
    createdAt: "2024-01-01",
    lastSessionDate: "2024-01-15",
    goals: "Lose 15lbs, build core strength",
    currentWeight: 165,
    targetWeight: 150,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "(555) 987-6543",
    sessionsRemaining: 3,
    totalSessions: 10,
    notes: [
      { id: "n3", date: "2024-01-14", content: "Completed first 5K benchmark. Time: 28:45" },
    ],
    createdAt: "2023-12-15",
    lastSessionDate: "2024-01-14",
    goals: "Run a half marathon, improve endurance",
    currentWeight: 180,
    targetWeight: 175,
  },
  {
    id: "3",
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "(555) 456-7890",
    sessionsRemaining: 15,
    totalSessions: 20,
    notes: [],
    createdAt: "2024-01-10",
    lastSessionDate: null,
    goals: "Build muscle, improve flexibility",
    currentWeight: 135,
    targetWeight: 140,
  },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ customerId: string; noteId: string | null } | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [sessionInput, setSessionInput] = useState("");

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

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadMockData();
    }
  }, []);

  const loadMockData = () => {
    // Load from localStorage or use mock data
    const stored = localStorage.getItem("palmer_customers");
    if (stored) {
      setCustomers(JSON.parse(stored));
    } else {
      setCustomers(mockCustomers);
      localStorage.setItem("palmer_customers", JSON.stringify(mockCustomers));
    }
  };

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem("palmer_customers", JSON.stringify(updatedCustomers));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Mock password check - in production this would be verified server-side
    if (password === "breakthrough2024" || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      loadMockData();
      setPassword("");
    } else {
      setError("Invalid password. Try 'breakthrough2024'");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setCustomers([]);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      sessionsRemaining: newCustomer.sessionsRemaining,
      totalSessions: newCustomer.sessionsRemaining,
      notes: [],
      createdAt: new Date().toISOString().split("T")[0],
      lastSessionDate: null,
      goals: newCustomer.goals,
      currentWeight: newCustomer.currentWeight ? parseFloat(newCustomer.currentWeight) : null,
      targetWeight: newCustomer.targetWeight ? parseFloat(newCustomer.targetWeight) : null,
    };
    
    const updated = [...customers, customer];
    saveCustomers(updated);
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
  };

  const handleUpdateSessions = (customerId: string, action: "increment" | "decrement" | "set", count?: number) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        let newCount = c.sessionsRemaining;
        if (action === "increment") {
          newCount = c.sessionsRemaining + 1;
        } else if (action === "decrement") {
          newCount = Math.max(0, c.sessionsRemaining - 1);
        } else if (action === "set" && count !== undefined) {
          newCount = Math.max(0, count);
        }
        return {
          ...c,
          sessionsRemaining: newCount,
          totalSessions: action === "increment" ? c.totalSessions + 1 : c.totalSessions,
          lastSessionDate: action === "decrement" ? new Date().toISOString().split("T")[0] : c.lastSessionDate,
        };
      }
      return c;
    });
    saveCustomers(updated);
    setSessionInput("");
  };

  const handleAddNote = (customerId: string) => {
    if (!newNoteContent.trim()) return;
    
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          notes: [
            { id: Date.now().toString(), date: new Date().toISOString().split("T")[0], content: newNoteContent },
            ...c.notes,
          ],
        };
      }
      return c;
    });
    saveCustomers(updated);
    setNewNoteContent("");
    setEditingNote(null);
  };

  const handleDeleteNote = (customerId: string, noteId: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          notes: c.notes.filter((n) => n.id !== noteId),
        };
      }
      return c;
    });
    saveCustomers(updated);
  };

  const handleUpdateCustomer = (customerId: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          goals: editForm.goals,
          currentWeight: editForm.currentWeight ? parseFloat(editForm.currentWeight) : null,
          targetWeight: editForm.targetWeight ? parseFloat(editForm.targetWeight) : null,
        };
      }
      return c;
    });
    saveCustomers(updated);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const updated = customers.filter((c) => c.id !== customerId);
      saveCustomers(updated);
    }
  };

  const startEditing = (customer: Customer) => {
    setEditingCustomer(customer.id);
    setEditForm({
      goals: customer.goals,
      currentWeight: customer.currentWeight?.toString() || "",
      targetWeight: customer.targetWeight?.toString() || "",
    });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
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
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
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
                Enter client details to create a new account
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Weight (lbs)</label>
                  <input
                    type="number"
                    value={newCustomer.currentWeight}
                    onChange={(e) => setNewCustomer({ ...newCustomer, currentWeight: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Target Weight (lbs)</label>
                  <input
                    type="number"
                    value={newCustomer.targetWeight}
                    onChange={(e) => setNewCustomer({ ...newCustomer, targetWeight: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800"
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
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white"
                  >
                    Create Client
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
                          >
                            <Minus className="w-4 h-4" />
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
                            >
                              <Save className="w-4 h-4 mr-1" /> Save
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
                              >
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
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-gray-300 text-sm mt-1">{note.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Set Sessions */}
                      <div className="flex flex-col sm:flex-row gap-4 items-end pt-4 border-t border-gray-800">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Set Sessions Directly
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={sessionInput}
                              onChange={(e) => setSessionInput(e.target.value)}
                              placeholder="Enter number"
                              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-800"
                              min="0"
                            />
                            <Button
                              onClick={() => {
                                const count = parseInt(sessionInput);
                                if (!isNaN(count)) {
                                  handleUpdateSessions(customer.id, "set", count);
                                }
                              }}
                              className="bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              Set
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          variant="outline"
                          className="bg-red-900/20 border-red-800/50 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
      </main>
    </div>
  );
}

