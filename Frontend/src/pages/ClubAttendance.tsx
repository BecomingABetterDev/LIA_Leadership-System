import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Users, Lock, CheckCircle, XCircle, Clock, Send, ArrowLeft, 
  GraduationCap, AlertTriangle, User, Settings, KeyRound, Eye, EyeOff, ShieldCheck, Info
} from "lucide-react";
import { toast } from "sonner";

interface ClubMember {
  id: number;
  name: string;
  avatar?: string;
  grade: string;
}

interface Club {
  id: string;
  name: string;
  password: string;
  members: ClubMember[];
}

// Store club passwords in a mutable way for password update functionality
const initialClubPasswords: Record<string, string> = {
  "tech-club": "123",
  "art-club": "123",
  "debate-club": "123",
  "music-club": "123",
};

// Ensure default permission sample exists
const ensureDefaultPermissions = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem("clubPermissions");
  const perms: { studentName: string; clubId: string; date: string }[] = stored ? JSON.parse(stored) : [];
  const hasSample = perms.some(p => p.studentName === "Olivia Brown" && p.clubId === "art-club" && p.date === todayStr);
  if (!hasSample) {
    perms.push({ studentName: "Olivia Brown", clubId: "art-club", date: todayStr });
    localStorage.setItem("clubPermissions", JSON.stringify(perms));
  }
};
ensureDefaultPermissions();

const getStoredPasswords = (): Record<string, string> => {
  const stored = localStorage.getItem("clubPasswords");
  return stored ? JSON.parse(stored) : initialClubPasswords;
};

const savePassword = (clubId: string, newPassword: string) => {
  const passwords = getStoredPasswords();
  passwords[clubId] = newPassword;
  localStorage.setItem("clubPasswords", JSON.stringify(passwords));
};

const clubsData: Club[] = [
  {
    id: "tech-club",
    name: "Technology Club",
    password: "123",
    members: [
      { id: 1, name: "Alex Thompson", grade: "11th Grade" },
      { id: 2, name: "Sarah Johnson", grade: "10th Grade" },
      { id: 3, name: "Michael Chen", grade: "12th Grade" },
      { id: 4, name: "Emily Davis", grade: "11th Grade" },
      { id: 5, name: "James Wilson", grade: "9th Grade" },
    ],
  },
  {
    id: "art-club",
    name: "Art Club",
    password: "123",
    members: [
      { id: 6, name: "Olivia Brown", grade: "10th Grade" },
      { id: 7, name: "Daniel Martinez", grade: "11th Grade" },
      { id: 8, name: "Sophia Garcia", grade: "12th Grade" },
      { id: 9, name: "Ethan Rodriguez", grade: "10th Grade" },
    ],
  },
  {
    id: "debate-club",
    name: "Debate Club",
    password: "123",
    members: [
      { id: 10, name: "Ava Hernandez", grade: "11th Grade" },
      { id: 11, name: "Noah Lopez", grade: "12th Grade" },
      { id: 12, name: "Isabella Gonzalez", grade: "10th Grade" },
      { id: 13, name: "Mason Perez", grade: "11th Grade" },
      { id: 14, name: "Mia Sanchez", grade: "9th Grade" },
      { id: 15, name: "Liam Rivera", grade: "12th Grade" },
    ],
  },
  {
    id: "music-club",
    name: "Music Club",
    password: "123",
    members: [
      { id: 16, name: "Charlotte Torres", grade: "10th Grade" },
      { id: 17, name: "Aiden Nguyen", grade: "11th Grade" },
      { id: 18, name: "Harper Kim", grade: "9th Grade" },
    ],
  },
];

type AttendanceStatus = "present" | "absent" | "late" | null;

export default function ClubAttendance() {
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedClub, setAuthenticatedClub] = useState<Club | null>(null);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password update states
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuthenticate = () => {
    const club = clubsData.find(c => c.id === selectedClubId);
    if (!club) {
      toast.error("Please select a club");
      return;
    }
    const storedPasswords = getStoredPasswords();
    const clubPassword = storedPasswords[club.id] || club.password;
    if (password !== clubPassword) {
      toast.error("Incorrect password");
      return;
    }
    setAuthenticatedClub(club);
    setIsAuthenticated(true);
    setAttendance({});
    toast.success(`Welcome to ${club.name} attendance`);
  };

  const handleUpdatePassword = () => {
    if (!authenticatedClub) return;
    
    const storedPasswords = getStoredPasswords();
    const clubPassword = storedPasswords[authenticatedClub.id] || authenticatedClub.password;
    
    if (currentPassword !== clubPassword) {
      toast.error("Current password is incorrect");
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    savePassword(authenticatedClub.id, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordUpdate(false);
    toast.success("Password updated successfully!");
  };

  const handleStatusChange = (memberId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const getStatusButton = (memberId: number, status: AttendanceStatus) => {
    const currentStatus = attendance[memberId];
    const isActive = currentStatus === status;
    
    const baseClasses = "flex-1 gap-1.5 text-sm font-medium transition-all";
    
    switch (status) {
      case "present":
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`${baseClasses} ${isActive ? "bg-success hover:bg-success/90 text-success-foreground" : "hover:bg-success/10 hover:text-success hover:border-success"}`}
            onClick={() => handleStatusChange(memberId, status)}
          >
            <CheckCircle className="h-4 w-4" />
            Present
          </Button>
        );
      case "late":
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`${baseClasses} ${isActive ? "bg-warning hover:bg-warning/90 text-warning-foreground" : "hover:bg-warning/10 hover:text-warning hover:border-warning"}`}
            onClick={() => handleStatusChange(memberId, status)}
          >
            <Clock className="h-4 w-4" />
            Late (-5)
          </Button>
        );
      case "absent":
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`${baseClasses} ${isActive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"}`}
            onClick={() => handleStatusChange(memberId, status)}
          >
            <XCircle className="h-4 w-4" />
            Absent (-10)
          </Button>
        );
      default:
        return null;
    }
  };

  const handleSubmitAttendance = () => {
    if (!authenticatedClub) return;
    
    // Get permission-granted members
    const todayStr = new Date().toISOString().split('T')[0];
    const storedPerms = JSON.parse(localStorage.getItem("clubPermissions") || "[]");
    const permittedIds = authenticatedClub.members
      .filter(m => storedPerms.some(
        (p: { studentName: string; clubId: string; date: string }) =>
          p.studentName === m.name && p.clubId === authenticatedClub.id && p.date === todayStr
      ))
      .map(m => m.id);

    const unmarkedMembers = authenticatedClub.members.filter(m => !attendance[m.id] && !permittedIds.includes(m.id));
    if (unmarkedMembers.length > 0) {
      toast.error(`Please mark attendance for all ${unmarkedMembers.length} remaining member(s)`);
      return;
    }

    setIsSubmitting(true);
    
    // Calculate deductions
    const lateCount = Object.values(attendance).filter(s => s === "late").length;
    const absentCount = Object.values(attendance).filter(s => s === "absent").length;
    const presentCount = Object.values(attendance).filter(s => s === "present").length;
    const totalDeductions = (lateCount * 5) + (absentCount * 10);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Attendance submitted! Present: ${presentCount}, Late: ${lateCount} (-${lateCount * 5}), Absent: ${absentCount} (-${absentCount * 10})`
      );
      // Reset for next session
      setIsAuthenticated(false);
      setAuthenticatedClub(null);
      setPassword("");
      setSelectedClubId("");
      setAttendance({});
    }, 1000);
  };

  const getAttendanceSummary = () => {
    if (!authenticatedClub) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const storedPerms = JSON.parse(localStorage.getItem("clubPermissions") || "[]");
    const permittedCount = authenticatedClub.members.filter(m => storedPerms.some(
      (p: { studentName: string; clubId: string; date: string }) =>
        p.studentName === m.name && p.clubId === authenticatedClub.id && p.date === todayStr
    )).length;
    const total = authenticatedClub.members.length;
    const marked = Object.keys(attendance).length + permittedCount;
    const present = Object.values(attendance).filter(s => s === "present").length;
    const late = Object.values(attendance).filter(s => s === "late").length;
    const absent = Object.values(attendance).filter(s => s === "absent").length;
    
    return { total, marked, present, late, absent, permitted: permittedCount };
  };

  const summary = getAttendanceSummary();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 border border-primary-foreground/30">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
                Club Attendance
              </h1>
              <p className="text-primary-foreground/80">
                Mark daily attendance for club members
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {localStorage.getItem("trimesterEnded") === "true" ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-3" />
              <h3 className="font-semibold text-warning mb-1">Trimester Ended</h3>
              <p className="text-sm text-muted-foreground">Club attendance is unavailable until a new trimester begins.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (() => {
          // Check if today is a club day
          const storedSchedule = localStorage.getItem("clubDaySchedule");
          const schedule = storedSchedule ? JSON.parse(storedSchedule) : { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true };
          const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const todayKey = dayKeys[new Date().getDay()];
          const isClubDay = schedule[todayKey] === true;
          
          if (!isClubDay && !isAuthenticated) {
            return (
              <Card className="max-w-md mx-auto">
                <CardContent className="py-10 text-center">
                  <Info className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Not a Club Day</h3>
                  <p className="text-sm text-muted-foreground">
                    Today is not a scheduled club day. Club attendance login is only available on designated club days.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Check with the Leadership Center for the current club day schedule.
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/">Back to Home</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          }

          return !isAuthenticated ? (
          /* Club Selection & Authentication */
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Club Authentication</CardTitle>
              <CardDescription>
                Select your club and enter the password to record attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Club</Label>
                <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubsData.map(club => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name} ({club.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Club Password</Label>
                <Input
                  type="password"
                  placeholder="Enter club password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleAuthenticate}
                disabled={!selectedClubId || !password.trim()}
              >
                <Lock className="h-4 w-4 mr-2" />
                Access Attendance
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Attendance Recording */
          <div className="space-y-6">
            {/* Club Info & Summary */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-hero">
                      <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{authenticatedClub?.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {summary && (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                      <Badge variant="secondary" className="px-3 py-1.5 justify-center">
                        {summary.marked}/{summary.total} Marked
                      </Badge>
                      <Badge className="bg-success/10 text-success px-3 py-1.5 justify-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {summary.present}
                      </Badge>
                      <Badge className="bg-warning/10 text-warning px-3 py-1.5 justify-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {summary.late}
                      </Badge>
                      <Badge className="bg-destructive/10 text-destructive px-3 py-1.5 justify-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        {summary.absent}
                      </Badge>
                      {summary.permitted > 0 && (
                        <Badge className="bg-success/10 text-success px-3 py-1.5 justify-center border border-success/20">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {summary.permitted} Permitted
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Responsibility Notice */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-primary">Important Responsibility Notice</p>
                    <p className="text-sm text-muted-foreground">
                      Club attendance directly affects student Savannah (token) values. Please be <strong>responsible and careful</strong> when recording attendance. 
                      We recommend waiting until the club session ends before submitting, as some members may arrive late.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Deduction Notice */}
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Savannah Deductions</p>
                    <p className="text-sm text-muted-foreground">
                      Late arrivals result in <strong>-5 Savannah</strong> deduction. 
                      Absences result in <strong>-10 Savannah</strong> deduction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Club Members
                </CardTitle>
                <CardDescription>
                  Mark each member's attendance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {authenticatedClub?.members.map((member, index) => {
                    // Check if this member has permission for today
                    const todayStr = new Date().toISOString().split('T')[0];
                    const storedPerms = JSON.parse(localStorage.getItem("clubPermissions") || "[]");
                    const hasPermission = storedPerms.some(
                      (p: { studentName: string; clubId: string; date: string }) =>
                        p.studentName === member.name && p.clubId === authenticatedClub.id && p.date === todayStr
                    );

                    return (
                    <div key={member.id}>
                      {index > 0 && <Separator className="mb-3" />}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.grade}</p>
                          </div>
                        </div>
                        
                        {hasPermission ? (
                          <Badge className="bg-success/10 text-success border border-success/20 px-3 py-1.5">
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Permission Granted
                          </Badge>
                        ) : (
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2 w-full sm:w-auto">
                          {getStatusButton(member.id, "present")}
                          {getStatusButton(member.id, "late")}
                          {getStatusButton(member.id, "absent")}
                        </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Password Update Section */}
            <Card className="border-primary/20">
              <CardContent className="py-4">
                <Collapsible open={showPasswordUpdate} onOpenChange={setShowPasswordUpdate}>
                  <CollapsibleTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between p-0 h-auto bg-transparent border-none cursor-pointer hover:bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Update Club Password</p>
                          <p className="text-sm text-muted-foreground">Change your club's access password</p>
                        </div>
                      </div>
                      <KeyRound className={`h-5 w-5 text-muted-foreground transition-transform ${showPasswordUpdate ? "rotate-180" : ""}`} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border">
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter new password (min 4 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleUpdatePassword}
                        disabled={!currentPassword || !newPassword || !confirmPassword}
                        className="w-full"
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAuthenticated(false);
                  setAuthenticatedClub(null);
                  setPassword("");
                  setSelectedClubId("");
                  setAttendance({});
                  setShowPasswordUpdate(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button 
                size="lg"
                onClick={handleSubmitAttendance}
                disabled={isSubmitting || (summary && summary.marked < summary.total)}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        })()}
      </div>
    </div>
  );
}
