import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Loader2, Users } from "lucide-react";
import { useGsapTextReveal, useGsapStagger } from "@/hooks/useGsapAnimations";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-slate-400" />;
    case 3:
      return <Award className="h-6 w-6 text-orange-600" />;
    default:
      return null;
  }
}

function getRankBgClass(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] relative overflow-hidden scale-105 z-10";
    case 2:
      return "bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 border-2 border-slate-400 shadow-lg mt-4";
    case 3:
      return "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 mt-8";
    default:
      return "";
  }
}

export function LeaderboardSection() {
  const titleRef = useGsapTextReveal<HTMLDivElement>();
  const cardsRef = useGsapStagger<HTMLDivElement>(":scope > div", 0.2);

  // Destructure students and settings.
  // Make sure your AuthContext actually provides 'students' and 'settings'
  const { students, isListingStudents, fetchStudents } = useAuth();
  const { isProfileAllowed } = usePublicData();

  useEffect(() => {
    fetchStudents();
  }, []);

  const topStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    return (
      [...students]
        // Sort by tokens, fallback to 0 if undefined
        .sort((a, b) => (b.tokenBalance || 0) - (a.tokenBalance || 0))
        .slice(0, 3)
        .map((student, index) => ({
          rank: index + 1,
          name: student.name || "Anonymous",
          avatar: student.profileImage,
          tokens: student.tokenBalance || 0,
          grade: student.grade || "N/A",
          section: student.section || "",
        }))
    );
  }, [students]);

  // Podium Order: 2nd, 1st, 3rd
  const podiumStudents =
    topStudents.length > 0
      ? [
          topStudents[1], // 2nd
          topStudents[0], // 1st
          topStudents[2], // 3rd
        ].filter(Boolean)
      : [];

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container">
        <div className="text-center mb-16" ref={titleRef}>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Top Students Leaderboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recognizing our most active and engaged student leaders who have
            earned the highest Savannah points.
          </p>
        </div>

        {isListingStudents ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading leaders...</p>
          </div>
        ) : topStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-2xl border border-dashed max-w-2xl mx-auto">
            <Users className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg">No Students Found</h3>
            <p className="text-sm text-muted-foreground">
              Once students start earning tokens, they will appear here.
            </p>
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 max-w-5xl mx-auto px-4"
          >
            {podiumStudents.map((student) => (
              <Card
                key={student.rank}
                className={`w-full max-w-[320px] relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${getRankBgClass(
                  student.rank
                )} 
                  ${student.rank === 1 ? "order-first md:order-none" : ""}`}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <Avatar
                        className={`h-24 w-24 border-4 shadow-xl ${
                          student.rank === 1
                            ? "border-yellow-400"
                            : "border-card"
                        }`}
                      >
                        {isProfileAllowed && student.avatar && (
                          <AvatarImage
                            src={student.avatar}
                            alt={student.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border border-border">
                        {getRankIcon(student.rank)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <span
                        className={`text-3xl font-black ${
                          student.rank === 1
                            ? "text-yellow-600"
                            : "text-foreground/70"
                        }`}
                      >
                        #{student.rank}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-foreground mb-1 line-clamp-1">
                      {student.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
                      {student.grade}{" "}
                      {student.section && `• Sec ${student.section}`}
                    </p>

                    <div
                      className={`w-full py-3 rounded-2xl border flex flex-col items-center justify-center
                      ${
                        student.rank === 1
                          ? "bg-yellow-500/10 border-yellow-500/20"
                          : "bg-primary/5 border-primary/10"
                      }`}
                    >
                      <span
                        className={`text-2xl font-black ${
                          student.rank === 1
                            ? "text-yellow-700"
                            : "text-primary"
                        }`}
                      >
                        {student.tokens.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Savannah Tokens
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
