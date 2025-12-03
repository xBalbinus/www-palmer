"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dumbbell,
  LogOut,
  Settings,
  Target,
  Calendar,
  StickyNote,
  Loader2,
  Activity,
  Flame,
  Award,
} from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  date: string;
  content: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  sessionsRemaining: number;
  totalSessions: number;
  goals: string | null;
  currentWeight: number | null;
  targetWeight: number | null;
  lastSessionDate: string | null;
  createdAt: string;
  notes: Note[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const weightToGo = user.currentWeight && user.targetWeight
    ? Math.abs(user.currentWeight - user.targetWeight)
    : null;
  
  const weightProgress = user.currentWeight && user.targetWeight
    ? user.currentWeight > user.targetWeight
      ? "lose"
      : "gain"
    : null;

  const sessionsUsed = user.totalSessions - user.sessionsRemaining;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(127,29,29,0.12),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(127,29,29,0.08),transparent_40%)]" />

      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-950 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Breakthrough Fitness</h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-red-400">{user.name.split(" ")[0]}</span>
          </h2>
          <p className="text-gray-400">
            Here&apos;s your training progress at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Sessions Remaining - Featured */}
          <Card className="col-span-2 bg-gradient-to-br from-red-900/40 to-red-950/20 border-red-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300/70 text-sm font-medium">Sessions Remaining</p>
                  <p className="text-5xl font-bold text-white mt-1">{user.sessionsRemaining}</p>
                  <p className="text-red-300/50 text-sm mt-2">
                    {sessionsUsed} sessions completed
                  </p>
                </div>
                <div className="w-20 h-20 bg-red-900/30 rounded-2xl flex items-center justify-center">
                  <Flame className="w-10 h-10 text-red-400" />
                </div>
              </div>
              {user.sessionsRemaining <= 3 && user.sessionsRemaining > 0 && (
                <div className="mt-4 bg-amber-900/30 border border-amber-800/30 rounded-lg px-3 py-2">
                  <p className="text-amber-300 text-sm">
                    ⚡ Running low! Contact Coach Palmer to add more sessions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Session */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Last Session</p>
              <p className="text-xl font-semibold text-white mt-1">
                {user.lastSessionDate || "Not yet"}
              </p>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Member Since</p>
              <p className="text-xl font-semibold text-white mt-1">{user.createdAt}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Goals & Progress */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                <Target className="w-5 h-5 text-green-400" />
                Goals & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.goals ? (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-300">{user.goals}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No goals set yet</p>
              )}

              {(user.currentWeight || user.targetWeight) && (
                <div className="grid grid-cols-3 gap-3">
                  {user.currentWeight && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-gray-500 text-xs uppercase">Current</p>
                      <p className="text-2xl font-bold text-white">{user.currentWeight}</p>
                      <p className="text-gray-500 text-xs">lbs</p>
                    </div>
                  )}
                  {user.targetWeight && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-gray-500 text-xs uppercase">Target</p>
                      <p className="text-2xl font-bold text-white">{user.targetWeight}</p>
                      <p className="text-gray-500 text-xs">lbs</p>
                    </div>
                  )}
                  {weightToGo !== null && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-gray-500 text-xs uppercase">To {weightProgress}</p>
                      <p className={`text-2xl font-bold ${weightProgress === "lose" ? "text-amber-400" : "text-green-400"}`}>
                        {weightToGo}
                      </p>
                      <p className="text-gray-500 text-xs">lbs</p>
                    </div>
                  )}
                </div>
              )}

              {!user.goals && !user.currentWeight && !user.targetWeight && (
                <p className="text-gray-500 text-sm">
                  Talk to Coach Palmer to set your fitness goals!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                <StickyNote className="w-5 h-5 text-blue-400" />
                Coach&apos;s Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.notes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No notes yet</p>
                  <p className="text-gray-600 text-sm">
                    Notes from your training sessions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {user.notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-red-800/50"
                    >
                      <p className="text-xs text-gray-500 mb-2">{note.date}</p>
                      <p className="text-gray-300 text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Contact */}
        <Card className="mt-6 bg-gradient-to-r from-gray-900/80 to-gray-900/40 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Need to schedule a session?</h3>
                  <p className="text-gray-400 text-sm">
                    Contact Coach Palmer to book your next training session
                  </p>
                </div>
              </div>
              <Link href="/#contact">
                <Button className="bg-red-800 hover:bg-red-900 text-white">
                  Contact Coach
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

