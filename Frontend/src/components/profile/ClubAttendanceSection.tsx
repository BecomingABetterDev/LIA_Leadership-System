import { usePublicData } from "@/contexts/PublicDataContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

function getStatusIcon(status: string) {
  switch (status) {
    case "present":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "late":
      return <Clock className="h-4 w-4 text-warning" />;
    case "absent":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "present":
      return <Badge className="bg-success/10 text-success">Present</Badge>;
    case "late":
      return <Badge className="bg-warning/10 text-warning">Late</Badge>;
    case "absent":
      return (
        <Badge className="bg-destructive/10 text-destructive">Absent</Badge>
      );
    default:
      return null;
  }
}

export function ClubAttendanceSection() {
  const { clubSessions } = usePublicData();
  const { userStudent } = useAuth();

  // Filter only sessions of authenticated student
  const studentSessions = useMemo(() => {
    return clubSessions.filter(
      (session: any) => session.studentId === userStudent?._id
    );
  }, [clubSessions, userStudent]);

  // Group sessions by club
  const attendanceData = useMemo(() => {
    const grouped: Record<string, any> = {};

    studentSessions.forEach((session: any) => {
      const clubId = session.clubId || "unknown-club";
      if (!grouped[clubId]) {
        grouped[clubId] = {
          clubId,
          clubName: session.clubName || "Unknown Club",
          totalSessions: 0,
          present: 0,
          late: 0,
          absent: 0,
          totalTokensLost: 0,
          records: [],
        };
      }

      grouped[clubId].totalSessions += 1;
      grouped[clubId].records.push({
        date: new Date(session.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: session.recordedAttendance,
        tokensLost: session.lostSavanah || 0,
        tokensGained: session.gainedSavanah || 0,
      });

      if (session.recordedAttendance === "present")
        grouped[clubId].present += 1;
      else if (session.recordedAttendance === "late") grouped[clubId].late += 1;
      else if (session.recordedAttendance === "absent")
        grouped[clubId].absent += 1;

      grouped[clubId].totalTokensLost += session.lostSavanah || 0;
    });

    return Object.values(grouped);
  }, [studentSessions]);

  const totalTokensLost = attendanceData.reduce(
    (sum, club) => sum + club.totalTokensLost,
    0
  );
  const totalTokensEarned = attendanceData.reduce(
    (sum, club) =>
      sum + club.records.reduce((s, r) => s + (r.tokensGained || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {attendanceData.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Clubs</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">
                {attendanceData.reduce((sum, c) => sum + c.present, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Present</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">
                {attendanceData.reduce((sum, c) => sum + c.late, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Late</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">
                {attendanceData.reduce((sum, c) => sum + c.absent, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Absent</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <TrendingUp className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">
                +{totalTokensEarned}
              </p>
              <p className="text-sm text-muted-foreground">Savannah Earned</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">
                -{totalTokensLost}
              </p>
              <p className="text-sm text-muted-foreground">Savannah Lost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if tokens lost */}
      {totalTokensLost > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-7 w-7 min-w-[28px] text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Attendance Impact</p>
                <p className="text-sm text-muted-foreground">
                  You have lost <strong>{totalTokensLost} Savannah</strong> due
                  to late arrivals and absences. Improve your attendance to
                  maintain your grade standing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Club Attendance Details */}
      {attendanceData.map((club) => (
        <Card key={club.clubId}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {club.clubName}
                </CardTitle>
                <CardDescription>
                  {club.totalSessions} sessions tracked
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-success/10 text-success">
                  {club.present} Present
                </Badge>
                <Badge className="bg-warning/10 text-warning">
                  {club.late} Late
                </Badge>
                <Badge className="bg-destructive/10 text-destructive">
                  {club.absent} Absent
                </Badge>
                {club.totalTokensLost > 0 && (
                  <Badge variant="destructive">
                    -{club.totalTokensLost} Savannah
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Attendance Rate */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-sm font-bold">
                  {Math.round((club.present / club.totalSessions) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{
                    width: `${(club.present / club.totalSessions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Recent Records */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Recent Sessions
              </p>
              {club.records.slice(0, 5).map((record, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {record.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(record.status)}
                      {record.tokensGained && record.tokensGained > 0 && (
                        <span className="text-sm font-medium text-success">
                          +{record.tokensGained}
                        </span>
                      )}
                      {record.tokensLost > 0 && (
                        <span className="text-sm font-medium text-destructive">
                          -{record.tokensLost}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
