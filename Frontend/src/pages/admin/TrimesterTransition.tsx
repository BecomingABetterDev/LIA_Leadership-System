import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  CalendarClock, AlertTriangle, Download, Play, StopCircle, 
  CheckCircle, FileSpreadsheet, Users, Award, Calendar, 
  MessageSquare, ClipboardList, RotateCcw, Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function TrimesterTransition() {
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const trimesterEnded = localStorage.getItem("trimesterEnded") === "true";

  const currentTrimester = {
    name: "Trimester 2",
    startDate: "Jan 6, 2026",
    endDate: "Present",
    totalStudents: 524,
    totalTokens: 28450,
    totalEvents: 15,
    totalFeedback: 47,
  };

  const exportSteps = [
    { label: "Student results & Savannah balances", icon: Users },
    { label: "Token transactions & adjustments", icon: Award },
    { label: "Events, comments & replies", icon: Calendar },
    { label: "Attendance records", icon: ClipboardList },
    { label: "Feedback & responses", icon: MessageSquare },
  ];

  const generateCSV = (headers: string[], rows: string[][]): string => {
    return [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEndTrimester = async () => {
    // Check for pending feedback - all feedback is now approved/responded
    const feedbackData = [
      { status: "responded", studentName: "Sarah Johnson" },
      { status: "responded", studentName: "Michael Chen" },
      { status: "responded", studentName: "Emily Williams" },
      { status: "responded", studentName: "Alex Thompson" },
      { status: "responded", studentName: "Jessica Brown" },
    ];
    const pendingFeedback = feedbackData.filter(f => f.status === "pending");
    if (pendingFeedback.length > 0) {
      const names = pendingFeedback.map(f => f.studentName).join(", ");
      toast.error(`Cannot end trimester: There are ${pendingFeedback.length} pending feedback(s) from: ${names}. Please respond to all feedback first.`);
      setEndDialogOpen(false);
      return;
    }

    setEndDialogOpen(false);
    setExportProgress(0);

    const date = new Date().toISOString().split("T")[0];

    // Step 1: Export student results
    await new Promise(r => setTimeout(r, 600));
    setExportProgress(20);
    toast.info("Exporting student results...");
    downloadFile(
      generateCSV(
        ["Name", "Grade", "Section", "Savannah", "Est. Grade", "Level"],
        [
          ["Sarah Johnson", "12", "A", "1250", "A+", "Gold"],
          ["Michael Chen", "11", "B", "1180", "A+", "Gold"],
          ["Emily Williams", "12", "A", "1095", "A+", "Gold"],
          ["Alex Thompson", "11", "C", "875", "A", "Silver"],
          ["Jessica Brown", "10", "A", "820", "A-", "Silver"],
          ["David Lee", "12", "B", "780", "B+", "Silver"],
          ["Amanda Garcia", "11", "A", "720", "B", "Bronze"],
          ["Ryan Martinez", "10", "C", "650", "B-", "Bronze"],
        ]
      ),
      `student_results_${date}.csv`
    );

    // Step 2: Export transactions
    await new Promise(r => setTimeout(r, 600));
    setExportProgress(40);
    toast.info("Exporting token transactions...");
    downloadFile(
      generateCSV(
        ["Student", "Event", "Base Tokens", "Bonus", "Decrease", "Total", "Date"],
        [
          ["Sarah Johnson", "Science Fair Project", "200", "20", "0", "220", "Feb 10, 2026"],
          ["Michael Chen", "Debate Competition", "125", "10", "0", "135", "Feb 8, 2026"],
          ["Emily Williams", "Community Meeting", "150", "0", "15", "135", "Feb 5, 2026"],
          ["Alex Thompson", "Workshop Participation", "50", "5", "0", "55", "Feb 3, 2026"],
          ["Jessica Brown", "Volunteer Work", "25", "0", "0", "25", "Feb 1, 2026"],
          ["David Lee", "Club Leadership Role", "150", "15", "0", "165", "Jan 28, 2026"],
        ]
      ),
      `token_transactions_${date}.csv`
    );

    // Step 3: Export events & comments
    await new Promise(r => setTimeout(r, 600));
    setExportProgress(60);
    toast.info("Exporting events and comments...");
    downloadFile(
      generateCSV(
        ["Event", "Category", "Date", "Location", "Attendees", "Tokens", "Status", "Comment By", "Comment", "Reply By", "Reply"],
        [
          ["Community Meeting Presentation", "Presentation", "Feb 15, 2026", "Main Auditorium", "45", "150", "Active", "Sarah M.", "Can't wait for this event!", "Admin", "See you there!"],
          ["Science Fair Project Exhibition", "Exhibition", "Feb 20, 2026", "Science Building", "120", "200", "Closed", "Michael T.", "Working on renewable energy project!", "", ""],
          ["Adwa Week Celebration", "Cultural", "Mar 2, 2026", "School Grounds", "300", "100", "Active", "Abebe D.", "Wonderful celebration!", "", ""],
          ["Student Council Workshop", "Workshop", "Mar 10, 2026", "Conference Room A", "30", "75", "Completed", "Alex P.", "Great opportunity!", "", ""],
        ]
      ),
      `events_comments_${date}.csv`
    );

    // Step 4: Export attendance
    await new Promise(r => setTimeout(r, 600));
    setExportProgress(80);
    toast.info("Exporting attendance records...");
    downloadFile(
      generateCSV(
        ["Student", "Club", "Date", "Status", "Token Impact"],
        [
          ["Alex Thompson", "Tech Club", "Feb 10, 2026", "Present", "0"],
          ["Alex Thompson", "Tech Club", "Feb 3, 2026", "Late", "-5"],
          ["Alex Thompson", "Debate Society", "Jan 28, 2026", "Absent", "-10"],
          ["Sarah Johnson", "Art Club", "Feb 10, 2026", "Present", "0"],
          ["Michael Chen", "Science Club", "Feb 8, 2026", "Present", "0"],
        ]
      ),
      `attendance_records_${date}.csv`
    );

    // Step 5: Export feedback
    await new Promise(r => setTimeout(r, 600));
    setExportProgress(100);
    toast.info("Exporting feedback...");
    downloadFile(
      generateCSV(
        ["Student", "Subject", "Message", "Date", "Response"],
        [
          ["Marcus Lee", "Token Inquiry", "I have a question about my Savannah balance", "Feb 10, 2026", "Your balance has been updated"],
          ["Sarah Kim", "Event Participation", "Could you clarify the requirements", "Feb 9, 2026", "Requirements have been posted"],
          ["David Chen", "Grade Calculation", "I'm confused about how my grade is calculated", "Feb 8, 2026", "Pending response"],
        ]
      ),
      `feedback_${date}.csv`
    );

    await new Promise(r => setTimeout(r, 400));

    // Clear data
    localStorage.setItem("trimesterEnded", "true");
    localStorage.removeItem("appliedEventIds");
    
    setIsExporting(false);
    setExportProgress(0);
    toast.success("Trimester ended successfully! All data has been exported and archived.");
  };

  const handleStartTrimester = () => {
    localStorage.removeItem("trimesterEnded");
    setStartDialogOpen(false);
    toast.success("New trimester started! All systems are ready.");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2">Trimester Transition</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage trimester lifecycle — end current trimester or start a new one.</p>
      </div>

      {/* Status Banner */}
      <Card className={`border-2 animate-fade-in-up ${trimesterEnded ? "border-warning/50 bg-gradient-to-br from-warning/5 to-card" : "border-success/50 bg-gradient-to-br from-success/5 to-card"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${trimesterEnded ? "bg-warning/10" : "bg-success/10"}`}>
              {trimesterEnded ? (
                <StopCircle className="h-7 w-7 text-warning" />
              ) : (
                <Play className="h-7 w-7 text-success" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">{currentTrimester.name}</h3>
                <Badge className={trimesterEnded ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}>
                  {trimesterEnded ? "Ended" : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Started {currentTrimester.startDate} • {trimesterEnded ? "Ended" : "Ongoing"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trimester Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Students", value: currentTrimester.totalStudents, icon: Users, color: "text-primary" },
          { label: "Savannah Distributed", value: currentTrimester.totalTokens.toLocaleString(), icon: Award, color: "text-success" },
          { label: "Total Events", value: currentTrimester.totalEvents, icon: Calendar, color: "text-accent" },
          { label: "Feedback Received", value: currentTrimester.totalFeedback, icon: MessageSquare, color: "text-warning" },
        ].map((stat, i) => (
          <Card key={i} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Preview */}
      {isExporting && (
        <Card className="border-2 border-primary/30 animate-fade-in">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-primary animate-bounce" />
              Exporting Trimester Data...
            </CardTitle>
            <CardDescription>Please wait while all data is being downloaded to your device</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <Progress value={exportProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center font-medium">{exportProgress}% complete</p>
            <div className="space-y-2">
              {exportSteps.map((step, i) => {
                const completed = exportProgress >= (i + 1) * 20;
                const active = exportProgress >= i * 20 && exportProgress < (i + 1) * 20;
                return (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${completed ? "bg-success/10" : active ? "bg-primary/10" : "bg-secondary/50"}`}>
                    {completed ? (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <step.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    )}
                    <span className={`text-sm ${completed ? "text-success font-medium" : active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* End Trimester Card */}
        <Card className={`border-2 transition-all duration-300 ${trimesterEnded ? "opacity-50 pointer-events-none" : "border-destructive/20 hover:border-destructive/40 hover:shadow-lg"}`}>
          <CardHeader className="p-4 sm:p-6">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-3">
              <StopCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-base sm:text-lg">End Current Trimester</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Archive all data and download exports. This will clear all events, student points, transactions, attendance records, and feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data to be exported & cleared:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: FileSpreadsheet, label: "Student results & grades" },
                  { icon: Award, label: "All Savannah transactions" },
                  { icon: Calendar, label: "Events, comments & replies" },
                  { icon: ClipboardList, label: "Attendance records" },
                  { icon: MessageSquare, label: "Student feedback" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              size="lg"
              onClick={() => setEndDialogOpen(true)}
              disabled={trimesterEnded || isExporting}
            >
              <StopCircle className="h-4 w-4" />
              End Trimester & Export Data
            </Button>
          </CardContent>
        </Card>

        {/* Start New Trimester Card */}
        <Card className={`border-2 transition-all duration-300 ${!trimesterEnded ? "opacity-50 pointer-events-none" : "border-success/20 hover:border-success/40 hover:shadow-lg"}`}>
          <CardHeader className="p-4 sm:p-6">
            <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-success" />
            </div>
            <CardTitle className="text-base sm:text-lg">Start New Trimester</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Reset all systems and begin fresh. Student results will start from zero, events will be cleared, and all sections will be reactivated.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What will happen:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: RotateCcw, label: "All student scores reset to 0" },
                  { icon: Calendar, label: "Event listings cleared" },
                  { icon: Award, label: "Transaction history cleared" },
                  { icon: ClipboardList, label: "Attendance records reset" },
                  { icon: CheckCircle, label: "Info banners removed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground"
              size="lg"
              onClick={() => setStartDialogOpen(true)}
              disabled={!trimesterEnded || isExporting}
            >
              <Play className="h-4 w-4" />
              Start New Trimester
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* End Trimester Confirmation */}
      <AlertDialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              End Current Trimester?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong>permanently archive</strong> all current trimester data. All files will be automatically downloaded to your device in Excel/CSV format before clearing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndTrimester}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              End Trimester & Download Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Trimester Confirmation */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-success">
              <Sparkles className="h-5 w-5" />
              Start New Trimester?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all student results to zero, clear trimester-ended notifications across all pages, and prepare the system for a fresh start. Are you ready to begin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartTrimester}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Start New Trimester
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}