import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Key, UserCog, Eye, EyeOff, UserPlus } from "lucide-react";

const studentAccounts = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@school.edu", grade: "12", status: "active", lastLogin: "Jan 24, 2026" },
  { id: 2, name: "Michael Chen", email: "michael.c@school.edu", grade: "11", status: "active", lastLogin: "Jan 23, 2026" },
  { id: 3, name: "Emily Williams", email: "emily.w@school.edu", grade: "12", status: "active", lastLogin: "Jan 24, 2026" },
  { id: 4, name: "Alex Thompson", email: "alex.t@school.edu", grade: "11", status: "active", lastLogin: "Jan 22, 2026" },
  { id: 5, name: "Jessica Brown", email: "jessica.b@school.edu", grade: "10", status: "active", lastLogin: "Jan 21, 2026" },
  { id: 6, name: "David Lee", email: "david.l@school.edu", grade: "12", status: "inactive", lastLogin: "Dec 15, 2025" },
  { id: 7, name: "Amanda Garcia", email: "amanda.g@school.edu", grade: "11", status: "active", lastLogin: "Jan 20, 2026" },
  { id: 8, name: "Ryan Martinez", email: "ryan.m@school.edu", grade: "10", status: "active", lastLogin: "Jan 19, 2026" },
];

export default function AccountManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof studentAccounts[0] | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register student state
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regSchoolId, setRegSchoolId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const filteredAccounts = studentAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (student: typeof studentAccounts[0]) => {
    toast.success(`Account for ${student.name} has been deleted.`);
  };

  const handleResetPassword = () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (selectedStudent) {
      toast.success(`Password updated successfully for ${selectedStudent.name}`);
      setResetDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleAdminPasswordUpdate = () => {
    if (!adminCurrentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (!adminNewPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (adminNewPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    toast.success("Admin password updated successfully!");
    setAdminCurrentPassword("");
    setAdminNewPassword("");
  };

  const handleRegisterStudent = () => {
    if (!regName.trim()) {
      toast.error("Please enter the student's full name");
      return;
    }
    if (!regSchoolId.trim()) {
      toast.error("Please enter the student's school ID");
      return;
    }
    if (!regPassword.trim()) {
      toast.error("Please set an initial password");
      return;
    }
    if (regPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success(`Account created successfully for ${regName}`);
    setRegisterOpen(false);
    setRegName("");
    setRegSchoolId("");
    setRegPassword("");
    setRegConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Account Management</h2>
        <p className="text-muted-foreground">Manage student accounts, reset passwords, and remove inactive users.</p>
        <Dialog open={registerOpen} onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) {
            setRegName("");
            setRegSchoolId("");
            setRegPassword("");
            setRegConfirmPassword("");
            setShowRegPassword(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 mt-4">
              <UserPlus className="h-4 w-4" />
              Register New Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Student</DialogTitle>
              <DialogDescription>
                Create a new student account. The student will use their school ID and password to sign in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-school-id">School ID</Label>
                <Input
                  id="reg-school-id"
                  placeholder="e.g. STU-2026-001"
                  value={regSchoolId}
                  onChange={(e) => setRegSchoolId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will be used as the student's login identifier.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Initial Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Set an initial password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Confirm the password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters. Students are advised to change their password after first login.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegisterStudent}>
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Password Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Update Admin Password
          </CardTitle>
          <CardDescription>
            Change your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="admin-current">Current Password</Label>
              <div className="relative">
                <Input
                  id="admin-current"
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-new">New Password</Label>
              <Input
                id="admin-new"
                type={showAdminPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleAdminPasswordUpdate}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <SearchInput
            placeholder="Search by name or email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            containerClassName="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Student Accounts ({filteredAccounts.length})
          </CardTitle>
          <CardDescription>
            Click on actions to manage individual student accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell>{account.grade}th Grade</TableCell>
                  <TableCell>
                    {account.status === "active" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={resetDialogOpen && selectedStudent?.id === account.id} onOpenChange={(open) => {
                        setResetDialogOpen(open);
                        if (open) {
                          setSelectedStudent(account);
                          setNewPassword("");
                          setConfirmPassword("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Key className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Set a new password for {account.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
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
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm Password</Label>
                              <Input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Password must be at least 8 characters long.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleResetPassword}>
                              Update Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the account for <strong>{account.name}</strong>? 
                              This action cannot be undone and will permanently remove all their token history and data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(account)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
