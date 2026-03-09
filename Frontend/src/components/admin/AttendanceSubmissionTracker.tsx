import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ClipboardCheck, Calendar, AlertCircle } from "lucide-react";
import { format, startOfWeek, addDays, isToday, isBefore, startOfDay } from "date-fns";

interface Club {
  id: string;
  name: string;
  memberCount: number;
}

interface SubmissionRecord {
  clubId: string;
  date: string;
  submitted: boolean;
  submittedAt?: string;
}

interface AttendanceSubmissionTrackerProps {
  clubs: Club[];
  schedule: Record<string, boolean>;
  submissions: SubmissionRecord[];
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function AttendanceSubmissionTracker({ 
  clubs, 
  schedule, 
  submissions 
}: AttendanceSubmissionTrackerProps) {
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  
  const getWeekDates = (weekOffset: number) => {
    const weekStart = addDays(currentWeekStart, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const weekDates = selectedWeek === "current" 
    ? getWeekDates(0) 
    : selectedWeek === "previous" 
    ? getWeekDates(-1)
    : getWeekDates(-2);

  const getScheduledDays = () => {
    return weekDates.filter((date) => {
      const dayKey = DAY_KEYS[date.getDay()];
      return schedule[dayKey];
    });
  };

  const scheduledDays = getScheduledDays();

  const isSubmitted = (clubId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return submissions.some(s => s.clubId === clubId && s.date === dateStr && s.submitted);
  };

  const getClubSubmissionStatus = (club: Club) => {
    const pastScheduledDays = scheduledDays.filter(date => 
      isBefore(startOfDay(date), startOfDay(today)) || isToday(date)
    );
    
    if (pastScheduledDays.length === 0) {
      return { submitted: 0, total: 0, percentage: 100 };
    }

    const submittedCount = pastScheduledDays.filter(date => isSubmitted(club.id, date)).length;
    return {
      submitted: submittedCount,
      total: pastScheduledDays.length,
      percentage: Math.round((submittedCount / pastScheduledDays.length) * 100)
    };
  };

  const isTodayClubDay = () => {
    const dayKey = DAY_KEYS[today.getDay()];
    return schedule[dayKey];
  };

  const todayClubDay = isTodayClubDay();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Attendance Submission Tracker
            </CardTitle>
            <CardDescription className="mt-1.5">
              Track which clubs have submitted their daily attendance
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">View Week:</Label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">This Week</SelectItem>
                  <SelectItem value="previous">Last Week</SelectItem>
                  <SelectItem value="twoWeeksAgo">2 Weeks Ago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {todayClubDay ? (
              <Badge variant="default" className="gap-1 w-fit">
                <Calendar className="h-3 w-3" />
                Today is a club day
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 w-fit">
                <AlertCircle className="h-3 w-3" />
                Today is not a club day
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scheduledDays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No club days scheduled for this week.</p>
            <p className="text-sm mt-1">Configure club days in the scheduler above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header with dates */}
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[600px]">
                <div className="grid gap-2" style={{ gridTemplateColumns: `180px repeat(${scheduledDays.length}, 1fr)` }}>
                  <div className="font-medium text-sm text-muted-foreground p-2">Club</div>
                  {scheduledDays.map((date) => (
                    <div 
                      key={date.toISOString()} 
                      className={`text-center p-2 rounded-lg text-sm font-medium ${
                        isToday(date) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div>{format(date, "EEE")}</div>
                      <div className="text-xs">{format(date, "MMM d")}</div>
                    </div>
                  ))}
                </div>

                {/* Club rows */}
                {clubs.map((club) => {
                  const status = getClubSubmissionStatus(club);
                  return (
                    <div 
                      key={club.id} 
                      className="grid gap-2 py-2 border-t"
                      style={{ gridTemplateColumns: `180px repeat(${scheduledDays.length}, 1fr)` }}
                    >
                      <div className="flex flex-col justify-center p-2">
                        <span className="font-medium text-sm truncate">{club.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {status.submitted}/{status.total} submitted
                        </span>
                      </div>
                      {scheduledDays.map((date) => {
                        const isPast = isBefore(startOfDay(date), startOfDay(today));
                        const isTodayDate = isToday(date);
                        const submitted = isSubmitted(club.id, date);
                        const shouldShowStatus = isPast || isTodayDate;

                        return (
                          <div 
                            key={date.toISOString()} 
                            className="flex items-center justify-center p-2"
                          >
                            {!shouldShowStatus ? (
                              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">—</span>
                              </div>
                            ) : submitted ? (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                <XCircle className="h-5 w-5 text-destructive" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <div className="text-2xl font-bold text-primary">
                  {clubs.filter(c => getClubSubmissionStatus(c).percentage === 100).length}
                </div>
                <div className="text-xs text-muted-foreground">100% Submitted</div>
              </div>
              <div className="p-3 rounded-lg bg-accent text-center">
                <div className="text-2xl font-bold text-accent-foreground">
                  {clubs.filter(c => {
                    const p = getClubSubmissionStatus(c).percentage;
                    return p > 0 && p < 100;
                  }).length}
                </div>
                <div className="text-xs text-muted-foreground">Partial</div>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {clubs.filter(c => getClubSubmissionStatus(c).percentage === 0 && getClubSubmissionStatus(c).total > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">No Submissions</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <div className="text-2xl font-bold">{clubs.length}</div>
                <div className="text-xs text-muted-foreground">Total Clubs</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
