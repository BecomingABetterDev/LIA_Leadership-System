import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Trophy,
  Star,
  Medal,
  Users,
  MessageSquare,
  ArrowRight,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePublicData } from "@/contexts/PublicDataContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { events, feedbacks, transactions, adminSettings } = usePublicData();
  const { students, fetchStudents, isListingStudents } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================== UTILS ================== */
  // Fix: Formats to "3d ago" or "2h ago" as requested
  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Silver":
        return "bg-gray-400/10 text-gray-600 border-gray-400/20";
      case "Bronze":
        return "bg-amber-600/10 text-amber-600 border-amber-600/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  /* ================== STATS ================== */
  const stats = [
    {
      title: "Total Students",
      value: isListingStudents ? "..." : students.length.toString(),
      icon: Users,
    },
    {
      title: "Savannah Distributed",
      value: adminSettings?.thisTrimisterDistributed?.toLocaleString() || "0",
      icon: Award,
    },
    { title: "Active Events", value: events.length.toString(), icon: Calendar },
    {
      title: "New Feedback",
      value: feedbacks
        .filter(
          (f) =>
            new Date(f.createdAt) >=
            new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        )
        .length.toString(),
      icon: MessageSquare,
    },
  ];

  /* ================== TOP PERFORMERS ================== */
  const topPerformers = [...students]
    .sort((a, b) => (b.tokenBalance || 0) - (a.tokenBalance || 0))
    .slice(0, 7);

  /* ================== RECENT FEEDBACKS ================== */
  const recentFeedbacks = feedbacks
    .filter(
      (f) =>
        new Date(f.createdAt) >= new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  /* ================== RECENT TRANSACTIONS (FIXED MAPPING) ================== */
  /* ================== RECENT TRANSACTIONS ================== */
  const recentTransactions = transactions.slice(0, 5).map((tx) => {
    // Find student name
    const studentName =
      typeof tx.studentID === "object" && tx.studentID?.name
        ? tx.studentID.name
        : students.find((s) => s._id === tx.studentID)?.name || "Student";

    // FIX: Use the description field from your schema instead of event title
    // If description is empty, we fall back to the event title as a safety measure
    const description =
      tx.description ||
      (typeof tx.eventId === "object" ? tx.eventId?.title : "N/A");

    return {
      student: studentName,
      event: description, // This now shows the description
      tokens: tx.amount || 0,
      bonus: tx.bonusGiven || 0,
      decrease: tx.deductedMark || 0,
      date: new Date(tx.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const trimesterEnded = localStorage.getItem("trimesterEnded") === "true";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2">
          Dashboard Overview
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back! Here's what's happening in the LIA System.
        </p>
      </div>

      {trimesterEnded ? (
        <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
          <Clock className="h-10 w-10 text-warning mx-auto mb-3" />
          <h3 className="font-semibold text-warning mb-1">Trimester Ended</h3>
          <p className="text-sm text-muted-foreground">
            Dashboard overview is unavailable until a new trimester begins.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="card-hover animate-fade-in-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Performers */}
            <Card className="card-hover animate-slide-in-left opacity-0 stagger-3">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Top 7 Performers
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Leading students by token balance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {topPerformers.map((p, idx) => (
                    <div
                      key={p._id}
                      className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm animate-fade-in opacity-0 ${
                        idx < 3
                          ? "bg-gradient-to-r from-primary/5 to-transparent"
                          : "bg-secondary/50"
                      }`}
                      style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                    >
                      <div className="flex items-center justify-center w-6 sm:w-8 shrink-0">
                        {getRankIcon(idx + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm sm:text-base">
                          {isListingStudents ? "..." : p.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {p.grade}th Grade
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary text-sm sm:text-base">
                          {p.tokenBalance.toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getLevelColor(
                            p.gradeLetter
                          )}`}
                        >
                          {p.gradeLetter}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedbacks */}
            <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-2 card-hover animate-slide-in-right opacity-0 stagger-4">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 sm:p-6">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Recent Feedback
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Latest student inquiries
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto transition-all duration-200 hover:scale-105 press-effect"
                >
                  <Link
                    to="/admin/feedback?key=LIA-Leadership-2026"
                    className="gap-2 justify-center"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {recentFeedbacks.map((f, i) => (
                    <div
                      key={f._id}
                      className="block p-3 sm:p-4 rounded-lg bg-background/70 border animate-fade-in opacity-0"
                      style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                            {f.studentID?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-foreground truncate text-sm sm:text-base">
                              {f.studentID?.name}
                            </p>
                            <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {getRelativeTime(f.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-primary mb-1">
                            {f.subject}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {f.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="card-hover animate-fade-in-up opacity-0 stagger-5">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Latest token distributions this trimester
                </CardDescription>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full sm:w-auto transition-all duration-200 hover:scale-105 press-effect"
              >
                <Link
                  to="/admin/tokens?key=LIA-Leadership-2026"
                  className="gap-2 justify-center"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((tx, i) => {
                  // Net total calculation: Amount + Bonus - Deductions
                  const total = tx.tokens + tx.bonus - tx.decrease;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 animate-fade-in opacity-0"
                      style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {tx.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {tx.student}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.event} • {tx.date}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary text-sm">
                          +{total}
                        </p>
                        <div className="flex items-center gap-1.5 justify-end">
                          {tx.bonus > 0 && (
                            <span className="text-[10px] flex items-center gap-0.5 text-success font-medium">
                              <ArrowUpRight className="h-2.5 w-2.5" />+
                              {tx.bonus}
                            </span>
                          )}
                          {tx.decrease > 0 && (
                            <span className="text-[10px] flex items-center gap-0.5 text-destructive font-medium">
                              <ArrowDownRight className="h-2.5 w-2.5" />-
                              {tx.decrease}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
