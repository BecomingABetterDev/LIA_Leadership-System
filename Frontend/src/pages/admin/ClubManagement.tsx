import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Users, Clock, UserX, Pencil, Eye, EyeOff, AlertTriangle, ShieldCheck, Plus, Trash2, CheckCircle } from "lucide-react";
import ClubCrudCard from "@/components/admin/ClubCrudCard";
import ClubDayScheduler from "@/components/admin/ClubDayScheduler";
import AttendanceSubmissionTracker from "@/components/admin/AttendanceSubmissionTracker";

// Club data
const initialClubs = [
  { id: "debate", name: "Debate Club", password: "123", memberCount: 24 },
  { id: "drama", name: "Drama Club", password: "123", memberCount: 18 },
  { id: "science", name: "Science Club", password: "123", memberCount: 32 },
  { id: "music", name: "Music Club", password: "123", memberCount: 20 },
  { id: "art", name: "Art Club", password: "123", memberCount: 15 },
  { id: "sports", name: "Sports Club", password: "123", memberCount: 45 },
];

// Student club assignments
const studentClubData = [
  { id: 1, name: "Sarah Johnson", grade: "12", clubs: ["Debate Club", "Science Club"], email: "sarah.j@school.edu" },
  { id: 2, name: "Michael Chen", grade: "11", clubs: ["Drama Club", "Music Club"], email: "michael.c@school.edu" },
  { id: 3, name: "Emily Williams", grade: "12", clubs: ["Art Club"], email: "emily.w@school.edu" },
  { id: 4, name: "Alex Thompson", grade: "11", clubs: ["Sports Club", "Debate Club"], email: "alex.t@school.edu" },
  { id: 5, name: "Jessica Brown", grade: "10", clubs: ["Music Club", "Drama Club"], email: "jessica.b@school.edu" },
  { id: 6, name: "David Lee", grade: "12", clubs: ["Science Club"], email: "david.l@school.edu" },
  { id: 7, name: "Amanda Garcia", grade: "11", clubs: ["Art Club", "Music Club"], email: "amanda.g@school.edu" },
  { id: 8, name: "Ryan Martinez", grade: "10", clubs: ["Sports Club"], email: "ryan.m@school.edu" },
];

// Late comers data
const lateComersData = [
  { id: 1, name: "Jake Wilson", club: "Drama Club", lateCount: 8, tokensLost: 40 },
  { id: 2, name: "Mia Anderson", club: "Science Club", lateCount: 7, tokensLost: 35 },
  { id: 3, name: "Liam Harris", club: "Music Club", lateCount: 6, tokensLost: 30 },
  { id: 4, name: "Olivia Davis", club: "Debate Club", lateCount: 6, tokensLost: 30 },
  { id: 5, name: "Noah White", club: "Art Club", lateCount: 5, tokensLost: 25 },
  { id: 6, name: "Emma Brown", club: "Sports Club", lateCount: 5, tokensLost: 25 },
  { id: 7, name: "William Taylor", club: "Science Club", lateCount: 4, tokensLost: 20 },
  { id: 8, name: "Sophia Martinez", club: "Drama Club", lateCount: 4, tokensLost: 20 },
  { id: 9, name: "James Lee", club: "Music Club", lateCount: 3, tokensLost: 15 },
  { id: 10, name: "Isabella Garcia", club: "Debate Club", lateCount: 3, tokensLost: 15 },
];

// Absent data
const absentData = [
  { id: 1, name: "Ethan Moore", club: "Art Club", absentCount: 5, tokensLost: 50 },
  { id: 2, name: "Ava Jackson", club: "Music Club", absentCount: 4, tokensLost: 40 },
  { id: 3, name: "Mason Thompson", club: "Drama Club", absentCount: 4, tokensLost: 40 },
  { id: 4, name: "Charlotte Wilson", club: "Science Club", absentCount: 3, tokensLost: 30 },
  { id: 5, name: "Benjamin Clark", club: "Debate Club", absentCount: 3, tokensLost: 30 },
  { id: 6, name: "Amelia Rodriguez", club: "Sports Club", absentCount: 3, tokensLost: 30 },
  { id: 7, name: "Lucas Lewis", club: "Art Club", absentCount: 2, tokensLost: 20 },
  { id: 8, name: "Harper Walker", club: "Music Club", absentCount: 2, tokensLost: 20 },
  { id: 9, name: "Henry Hall", club: "Drama Club", absentCount: 2, tokensLost: 20 },
  { id: 10, name: "Evelyn Young", club: "Science Club", absentCount: 2, tokensLost: 20 },
];

// Sample submission data
const initialSubmissions = [
  { clubId: "debate", date: "2026-02-03", submitted: true },
  { clubId: "drama", date: "2026-02-03", submitted: true },
  { clubId: "science", date: "2026-02-03", submitted: false },
  { clubId: "music", date: "2026-02-03", submitted: true },
  { clubId: "art", date: "2026-02-03", submitted: false },
  { clubId: "sports", date: "2026-02-03", submitted: true },
  { clubId: "debate", date: "2026-02-05", submitted: true },
  { clubId: "drama", date: "2026-02-05", submitted: true },
  { clubId: "science", date: "2026-02-05", submitted: true },
  { clubId: "music", date: "2026-02-05", submitted: false },
  { clubId: "art", date: "2026-02-05", submitted: true },
  { clubId: "sports", date: "2026-02-05", submitted: true },
];

// Initial schedule (Tuesday and Thursday are club days)
const initialSchedule: Record<string, boolean> = {
  monday: false,
  tuesday: true,
  wednesday: false,
  thursday: true,
  friday: false,
  saturday: false,
  sunday: false,
};

// Permission data - stored in localStorage for cross-page sharing
const getStoredPermissions = (): { studentName: string; clubId: string; date: string }[] => {
  const stored = localStorage.getItem("clubPermissions");
  return stored ? JSON.parse(stored) : [
    { studentName: "Olivia Brown", clubId: "art-club", date: new Date().toISOString().split('T')[0] },
  ];
};

const savePermissions = (permissions: { studentName: string; clubId: string; date: string }[]) => {
  localStorage.setItem("clubPermissions", JSON.stringify(permissions));
};

export default function ClubManagement() {
  const [clubs, setClubs] = useState(initialClubs);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [submissions] = useState(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<typeof clubs[0] | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof studentClubData[0] | null>(null);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);

  // Permission states
  const [permissions, setPermissions] = useState(getStoredPermissions());
  const [permSelectedStudents, setPermSelectedStudents] = useState<string[]>([]);
  const [permClubId, setPermClubId] = useState("");
  const [permDate, setPermDate] = useState(new Date().toISOString().split('T')[0]);

  // Get students filtered by selected club
  const getStudentsForClub = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    if (!club) return [];
    return studentClubData.filter(s => s.clubs.includes(club.name));
  };

  const filteredStudents = studentClubData.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResetPassword = () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 3) {
      toast.error("Password must be at least 3 characters");
      return;
    }
    if (selectedClub) {
      toast.success(`Password for ${selectedClub.name} has been reset`);
      setResetDialogOpen(false);
      setNewPassword("");
    }
  };

  const handleUpdateStudentClubs = () => {
    if (selectedStudent) {
      toast.success(`Club assignments updated for ${selectedStudent.name}`);
      setEditStudentOpen(false);
    }
  };

  const handleAddClub = (clubData: { name: string; password: string }) => {
    const newClub = {
      id: clubData.name.toLowerCase().replace(/\s+/g, '-'),
      name: clubData.name,
      password: clubData.password,
      memberCount: 0,
    };
    setClubs([...clubs, newClub]);
  };

  const handleUpdateClub = (id: string, data: Partial<typeof clubs[0]>) => {
    setClubs(clubs.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const handleDeleteClub = (id: string) => {
    setClubs(clubs.filter(c => c.id !== id));
  };

  const handleAddClubToStudent = (clubName: string) => {
    if (!selectedClubs.includes(clubName)) {
      setSelectedClubs([...selectedClubs, clubName]);
    }
  };

  const handleRemoveClubFromStudent = (clubName: string) => {
    setSelectedClubs(selectedClubs.filter(c => c !== clubName));
  };

  const handleAddPermission = () => {
    if (permSelectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!permClubId) {
      toast.error("Please select a club");
      return;
    }
    if (!permDate) {
      toast.error("Please select a date");
      return;
    }
    const newPerms = permSelectedStudents.map(name => ({ studentName: name, clubId: permClubId, date: permDate }));
    const updated = [...permissions, ...newPerms];
    setPermissions(updated);
    savePermissions(updated);
    toast.success(`Permission granted for ${permSelectedStudents.length} student(s)`);
    setPermSelectedStudents([]);
    setPermClubId("");
    setPermDate(new Date().toISOString().split('T')[0]);
  };

  const handleRemovePermission = (index: number) => {
    const updated = permissions.filter((_, i) => i !== index);
    setPermissions(updated);
    savePermissions(updated);
    toast.success("Permission removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Club Management</h2>
        <p className="text-muted-foreground">Manage clubs, schedule club days, and track attendance submissions.</p>
      </div>

      {/* Club CRUD Card */}
      <ClubCrudCard
        clubs={clubs}
        onAddClub={handleAddClub}
        onUpdateClub={handleUpdateClub}
        onDeleteClub={handleDeleteClub}
      />

      {/* Club Day Scheduler */}
      <ClubDayScheduler
        schedule={schedule}
        onScheduleChange={setSchedule}
      />

      {/* Attendance Submission Tracker */}
      <AttendanceSubmissionTracker
        clubs={clubs}
        schedule={schedule}
        submissions={submissions}
      />

      {/* Top 10 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Late Comers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Top 10 Most Late
            </CardTitle>
            <CardDescription>Students with the most late arrivals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lateComersData.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.club}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">{student.lateCount} times</p>
                    <p className="text-xs text-destructive">-{student.tokensLost} Savannah</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Absents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Top 10 Most Absents
            </CardTitle>
            <CardDescription>Students with the most absences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {absentData.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.club}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-destructive">{student.absentCount} times</p>
                    <p className="text-xs text-destructive">-{student.tokensLost} Savannah</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Club Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Club Password Management
          </CardTitle>
          <CardDescription>
            Reset club access passwords directly without verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Club Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {club.memberCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={resetDialogOpen && selectedClub?.id === club.id} onOpenChange={(open) => {
                        setResetDialogOpen(open);
                        if (open) {
                          setSelectedClub(club);
                          setNewPassword("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Key className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Reset Password</span>
                            <span className="sm:hidden">Reset</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Reset Club Password</DialogTitle>
                            <DialogDescription>
                              Set a new password for {club.name}. No verification required.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-700 dark:text-amber-400">
                                This will immediately change the club's access password.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter new password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setResetDialogOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button onClick={handleResetPassword} className="w-full sm:w-auto">
                              Reset Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Club Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Club Assignments
          </CardTitle>
          <CardDescription>
            Update which clubs students are assigned to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            placeholder="Search by name or email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            containerClassName="max-w-md"
          />
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Clubs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{student.grade}th Grade</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.clubs.map((club) => (
                          <Badge key={club} variant="secondary" className="text-xs">
                            {club}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editStudentOpen && selectedStudent?.id === student.id} onOpenChange={(open) => {
                        setEditStudentOpen(open);
                        if (open) {
                          setSelectedStudent(student);
                          setSelectedClubs(student.clubs);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Club Assignments</DialogTitle>
                            <DialogDescription>
                              Update club memberships for {student.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Current Clubs</Label>
                              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-secondary/30">
                                {selectedClubs.length === 0 ? (
                                  <span className="text-sm text-muted-foreground">No clubs assigned</span>
                                ) : (
                                  selectedClubs.map((club) => (
                                    <Badge key={club} variant="default" className="gap-1 pr-1">
                                      {club}
                                      <button
                                        onClick={() => handleRemoveClubFromStudent(club)}
                                        className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Add Club</Label>
                              <Select onValueChange={handleAddClubToStudent}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a club to add" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clubs.filter(c => !selectedClubs.includes(c.name)).map((club) => (
                                    <SelectItem key={club.id} value={club.name}>
                                      {club.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setEditStudentOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateStudentClubs} className="w-full sm:w-auto">
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Club Attendance Permission Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            Attendance Permission
          </CardTitle>
          <CardDescription>
            Grant permission to students for specific club days. Permitted students will be automatically marked as "Permission Granted" in the attendance page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Club</Label>
              <Select value={permClubId} onValueChange={(v) => { setPermClubId(v); setPermSelectedStudents([]); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select club first" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={permDate}
                onChange={(e) => setPermDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPermission} className="w-full" disabled={permSelectedStudents.length === 0}>
                <Plus className="h-4 w-4 mr-1" />
                Grant Permission ({permSelectedStudents.length})
              </Button>
            </div>
          </div>

          {permClubId && (
            <div className="space-y-2">
              <Label>Select Students</Label>
              {getStudentsForClub(permClubId).length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 border rounded-md bg-secondary/30">No students found in this club.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {getStudentsForClub(permClubId).map((student) => {
                    const isSelected = permSelectedStudents.includes(student.name);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setPermSelectedStudents(prev =>
                            isSelected ? prev.filter(n => n !== student.name) : [...prev, student.name]
                          );
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-sm ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                          {isSelected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.grade}th Grade</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {permissions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Permissions</Label>
              <div className="space-y-2">
                {permissions.map((perm, index) => {
                  const clubName = clubs.find(c => c.id === perm.clubId)?.name || perm.clubId;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-success" />
                        <div>
                          <p className="font-medium text-sm">{perm.studentName}</p>
                          <p className="text-xs text-muted-foreground">{clubName} • {new Date(perm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemovePermission(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
