import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Settings, BookOpen, Award, Plus, Pencil, Trash2, Save, Clock, XCircle, Image, CheckCircle } from "lucide-react";

interface GradeMapping {
  id: string;
  grade: string;
  minTokens: number;
  maxTokens: number;
  color: string;
}

interface SavannahValue {
  id: string;
  event: string;
  tokens: number;
  description: string;
}

interface AttendanceDeductions {
  lateDeduction: number;
  absentDeduction: number;
  presentReward: number;
}

const initialGradeMappings: GradeMapping[] = [
  { id: "1", grade: "A+", minTokens: 950, maxTokens: 9999, color: "bg-success" },
  { id: "2", grade: "A", minTokens: 850, maxTokens: 949, color: "bg-success/80" },
  { id: "3", grade: "A-", minTokens: 800, maxTokens: 849, color: "bg-success/60" },
  { id: "4", grade: "B+", minTokens: 750, maxTokens: 799, color: "bg-primary" },
  { id: "5", grade: "B", minTokens: 700, maxTokens: 749, color: "bg-primary/80" },
  { id: "6", grade: "B-", minTokens: 650, maxTokens: 699, color: "bg-primary/60" },
  { id: "7", grade: "C+", minTokens: 600, maxTokens: 649, color: "bg-warning" },
  { id: "8", grade: "C", minTokens: 550, maxTokens: 599, color: "bg-warning/80" },
  { id: "9", grade: "C-", minTokens: 500, maxTokens: 549, color: "bg-warning/60" },
  { id: "10", grade: "D+", minTokens: 450, maxTokens: 499, color: "bg-muted" },
  { id: "11", grade: "D", minTokens: 400, maxTokens: 449, color: "bg-muted" },
  { id: "12", grade: "F", minTokens: 0, maxTokens: 399, color: "bg-destructive/50" },
];

const initialSavannahValues: SavannahValue[] = [
  { id: "1", event: "Community Meeting Presentation", tokens: 150, description: "Present community service initiatives to peers" },
  { id: "2", event: "Adwa Week Presentation", tokens: 100, description: "Cultural celebration and heritage activities" },
  { id: "3", event: "Science Fair Project", tokens: 200, description: "Showcase innovative science research" },
  { id: "4", event: "Student Council Meeting Attendance", tokens: 75, description: "Active participation in governance" },
  { id: "5", event: "Volunteer Work (per hour)", tokens: 25, description: "Community service hours" },
  { id: "6", event: "Workshop Participation", tokens: 50, description: "Attend leadership development workshops" },
  { id: "7", event: "Debate Competition", tokens: 125, description: "Compete in official debates" },
  { id: "8", event: "Sports Event Organization", tokens: 100, description: "Help organize school sports events" },
  { id: "9", event: "Tutoring Sessions (per hour)", tokens: 30, description: "Peer-to-peer academic support" },
  { id: "10", event: "Club Leadership Role", tokens: 150, description: "Serve as club president or officer" },
];

// Store settings in localStorage
const getStoredSettings = () => {
  const stored = localStorage.getItem("evaluationSettings");
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    attendanceDeductions: { lateDeduction: 5, absentDeduction: 10, presentReward: 3 },
    allowProfileImages: true,
  };
};

const saveSettings = (settings: { attendanceDeductions: AttendanceDeductions; allowProfileImages: boolean }) => {
  localStorage.setItem("evaluationSettings", JSON.stringify(settings));
};

export default function EvaluationSettings() {
  const storedSettings = getStoredSettings();
  
  const [gradeMappings, setGradeMappings] = useState<GradeMapping[]>(initialGradeMappings);
  const [savannahValues, setSavannahValues] = useState<SavannahValue[]>(initialSavannahValues);
  
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [savannahDialogOpen, setSavannahDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeMapping | null>(null);
  const [editingSavannah, setEditingSavannah] = useState<SavannahValue | null>(null);

  // Grade form state
  const [gradeForm, setGradeForm] = useState({ grade: "", minTokens: 0, maxTokens: 0 });
  
  // Savannah form state
  const [savannahForm, setSavannahForm] = useState({ event: "", tokens: 0, description: "" });
  
  // Attendance deductions state
  const [lateDeduction, setLateDeduction] = useState<number>(storedSettings.attendanceDeductions.lateDeduction);
  const [absentDeduction, setAbsentDeduction] = useState<number>(storedSettings.attendanceDeductions.absentDeduction);
  const [presentReward, setPresentReward] = useState<number>(storedSettings.attendanceDeductions.presentReward ?? 3);
  
  // Profile image settings
  const [allowProfileImages, setAllowProfileImages] = useState<boolean>(storedSettings.allowProfileImages);

  const handleSaveAttendanceSettings = () => {
    const settings = {
      attendanceDeductions: { lateDeduction, absentDeduction, presentReward },
      allowProfileImages,
    };
    saveSettings(settings);
    localStorage.setItem("allowProfileImages", JSON.stringify(allowProfileImages));
    toast.success("Attendance deduction settings saved!");
  };

  const handleToggleProfileImages = (checked: boolean) => {
    setAllowProfileImages(checked);
    const settings = {
      attendanceDeductions: { lateDeduction, absentDeduction, presentReward },
      allowProfileImages: checked,
    };
    saveSettings(settings);
    localStorage.setItem("allowProfileImages", JSON.stringify(checked));
    toast.success(checked ? "Profile images enabled" : "Profile images disabled - students will see initials instead");
  };

  const handleSaveGrade = () => {
    if (!gradeForm.grade.trim()) {
      toast.error("Please enter a grade");
      return;
    }

    if (editingGrade) {
      setGradeMappings(prev => prev.map(g => 
        g.id === editingGrade.id 
          ? { ...g, grade: gradeForm.grade, minTokens: gradeForm.minTokens, maxTokens: gradeForm.maxTokens }
          : g
      ));
      toast.success("Grade mapping updated successfully");
    } else {
      const newGrade: GradeMapping = {
        id: crypto.randomUUID(),
        grade: gradeForm.grade,
        minTokens: gradeForm.minTokens,
        maxTokens: gradeForm.maxTokens,
        color: "bg-muted",
      };
      setGradeMappings(prev => [...prev, newGrade]);
      toast.success("Grade mapping added successfully");
    }

    setGradeDialogOpen(false);
    setEditingGrade(null);
    setGradeForm({ grade: "", minTokens: 0, maxTokens: 0 });
  };

  const handleSaveSavannah = () => {
    if (!savannahForm.event.trim()) {
      toast.error("Please enter an event name");
      return;
    }

    if (editingSavannah) {
      setSavannahValues(prev => prev.map(s => 
        s.id === editingSavannah.id 
          ? { ...s, event: savannahForm.event, tokens: savannahForm.tokens, description: savannahForm.description }
          : s
      ));
      toast.success("Savannah value updated successfully");
    } else {
      const newValue: SavannahValue = {
        id: crypto.randomUUID(),
        event: savannahForm.event,
        tokens: savannahForm.tokens,
        description: savannahForm.description,
      };
      setSavannahValues(prev => [...prev, newValue]);
      toast.success("Savannah value added successfully");
    }

    setSavannahDialogOpen(false);
    setEditingSavannah(null);
    setSavannahForm({ event: "", tokens: 0, description: "" });
  };

  const openEditGrade = (grade: GradeMapping) => {
    setEditingGrade(grade);
    setGradeForm({ grade: grade.grade, minTokens: grade.minTokens, maxTokens: grade.maxTokens });
    setGradeDialogOpen(true);
  };

  const openEditSavannah = (value: SavannahValue) => {
    setEditingSavannah(value);
    setSavannahForm({ event: value.event, tokens: value.tokens, description: value.description });
    setSavannahDialogOpen(true);
  };

  const deleteGrade = (id: string) => {
    setGradeMappings(prev => prev.filter(g => g.id !== id));
    toast.success("Grade mapping deleted");
  };

  const deleteSavannah = (id: string) => {
    setSavannahValues(prev => prev.filter(s => s.id !== id));
    toast.success("Savannah value deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Evaluation Settings</h2>
        <p className="text-muted-foreground">Manage grade mappings and Savannah point values used in evaluation.</p>
      </div>

      {/* Grade Mappings */}
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Grade Mappings</CardTitle>
              <CardDescription>Define Savannah thresholds for each grade level</CardDescription>
            </div>
          </div>
          <Button 
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingGrade(null);
              setGradeForm({ grade: "", minTokens: 0, maxTokens: 0 });
              setGradeDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Min Savannah</TableHead>
                <TableHead>Max Savannah</TableHead>
                <TableHead>Range</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeMappings.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-bold text-lg">{grade.grade}</TableCell>
                  <TableCell>{grade.minTokens}</TableCell>
                  <TableCell>{grade.maxTokens === 9999 ? "∞" : grade.maxTokens}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {grade.minTokens} - {grade.maxTokens === 9999 ? "∞" : grade.maxTokens} Savannah
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditGrade(grade)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteGrade(grade.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Savannah Values */}
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Savannah Values</CardTitle>
              <CardDescription>Define point values for different event types</CardDescription>
            </div>
          </div>
          <Button 
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingSavannah(null);
              setSavannahForm({ event: "", tokens: 0, description: "" });
              setSavannahDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event Type
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Savannah Points</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savannahValues.map((value) => (
                <TableRow key={value.id}>
                  <TableCell className="font-medium">{value.event}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                      +{value.tokens}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {value.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditSavannah(value)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSavannah(value.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendance Deductions Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-lg">Club Attendance Settings</CardTitle>
              <CardDescription>Set token rewards and deductions for attendance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border bg-success/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <Label className="font-semibold">Present Reward</Label>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-success font-bold">+</span>
                <Input
                  type="number"
                  min="0"
                  value={presentReward}
                  onChange={(e) => setPresentReward(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">Savannah</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Rewarded when a student is present at club meetings
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-warning/5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-warning" />
                <Label className="font-semibold">Late Arrival Deduction</Label>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-destructive font-bold">-</span>
                <Input
                  type="number"
                  min="0"
                  value={lateDeduction}
                  onChange={(e) => setLateDeduction(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">Savannah</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Deducted when a student arrives late to club meetings
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-destructive/5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <Label className="font-semibold">Absence Deduction</Label>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-destructive font-bold">-</span>
                <Input
                  type="number"
                  min="0"
                  value={absentDeduction}
                  onChange={(e) => setAbsentDeduction(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">Savannah</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Deducted when a student is absent from club meetings
              </p>
            </div>
          </div>
          <Button onClick={handleSaveAttendanceSettings} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            Save Deduction Settings
          </Button>
        </CardContent>
      </Card>

      {/* Profile Image Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Image className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Image Settings</CardTitle>
              <CardDescription>Control whether students can upload profile images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Allow Profile Image Uploads</p>
              <p className="text-sm text-muted-foreground">
                {allowProfileImages 
                  ? "Students can upload custom profile pictures" 
                  : "Students will see their name initials instead of photos"}
              </p>
            </div>
            <Switch
              checked={allowProfileImages}
              onCheckedChange={handleToggleProfileImages}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrade ? "Edit Grade Mapping" : "Add Grade Mapping"}</DialogTitle>
            <DialogDescription>
              Define the Savannah threshold range for this grade level
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Input 
                placeholder="e.g., A+, B-, C" 
                value={gradeForm.grade}
                onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Savannah</Label>
                <Input 
                  type="number" 
                  value={gradeForm.minTokens}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, minTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Savannah</Label>
                <Input 
                  type="number" 
                  value={gradeForm.maxTokens}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGrade}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Savannah Dialog */}
      <Dialog open={savannahDialogOpen} onOpenChange={setSavannahDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSavannah ? "Edit Savannah Value" : "Add Savannah Value"}</DialogTitle>
            <DialogDescription>
              Define the point value for this event type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Input 
                placeholder="e.g., Workshop Participation" 
                value={savannahForm.event}
                onChange={(e) => setSavannahForm(prev => ({ ...prev, event: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Savannah Points</Label>
              <Input 
                type="number" 
                value={savannahForm.tokens}
                onChange={(e) => setSavannahForm(prev => ({ ...prev, tokens: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Brief description of this event type" 
                value={savannahForm.description}
                onChange={(e) => setSavannahForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavannahDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSavannah}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
