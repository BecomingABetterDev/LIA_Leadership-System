import { useState, useRef, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  Award,
  Calendar,
  Send,
  Plus,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Users,
  StopCircle,
  FileCheck,
  Mail,
  Info,
  ClipboardList,
  Pencil,
  Eye,
  Ban,
  CalendarDays,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  RequirementsBuilder,
  Requirement,
} from "@/components/profile/RequirementsBuilder";
import { ApplicantsModal } from "@/components/profile/ApplicantsModal";
import {
  ClubAttendanceSection,
  attendanceTransactions,
} from "@/components/profile/ClubAttendanceSection";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

// Combine earned tokens with attendance deductions

type SubmittedEventStatus = "pending" | "approved" | "rejected";

interface SubmittedEvent {
  id: number;
  title: string;
  status: SubmittedEventStatus;
  applicants: number;
  views: number;
  comments: number;
  date: string;
  eventDate: string;
  isApplicationEnded: boolean;
  postedBy: string;
  completed?: boolean;
  rejectionReason?: string;
  maxApplicants?: number;
  location?: string;
}

type EventForm = {
  title: string;
  proposedDate: string;
  location: string;
  description: string;
  detailedDescription: string;
  tokenValue: string;
  maxApplicants: string;
  eventCategory: string;
  eventPoster: "me" | "other" | "student";
  customClubName: string;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-success text-success-foreground">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-warning text-warning-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}

// Token History List with pagination

export default function Profile() {
  const { userStudent, updateStudentAccount, isUpdatingAccount } = useAuth();
  const {
    transactions,
    applicants,
    isFetchingApplicants,
    clubSessions,
    isFetchingClubSessions,
    sendFeedback,
    isSendingFeedback,
    feedbacks,
    isFetchingFeedbacks,
    createStudentEvent,
    isCreatingStudentEvent,
    updateEventDate,
    isUpdatingEventDate,
    updateMaxApplicants,
    isUpdatingMaxApplicants,
    rejectApplicant,
    isRejectingApplicant,
    approveApplicant,
    isApprovingApplicant,
    completeEvent,
    isCompletingEvent,
    cancelEvent,
    isCancelingEvent,
    endEventApplications,
    isEndingApplications,
    isProfileAllowed,
    isTrimesterEnded,
    evaluationGrades,
    events,
    fetchTransactions,
    isListingTransactions,
    isTrimisterEnded,
  } = usePublicData();

  const myTransactions = transactions.filter(
    (t) => t.studentID._id === userStudent?._id
  );
  useEffect(() => {
    console.log(transactions, "mines", myTransactions);
    fetchTransactions();
  }, []);
  const tokenBalance = userStudent?.tokenBalance || 0;

  const currentGradeIndex = evaluationGrades.findIndex(
    (grade) => tokenBalance >= grade.minimumValue
  );

  const currentGradeForProfile = evaluationGrades.find(
    (grade) =>
      tokenBalance >= grade.minimumValue && tokenBalance <= grade.maximumValue
  );

  const currentGrade =
    evaluationGrades[currentGradeIndex] ||
    evaluationGrades[evaluationGrades.length - 1];

  const nextGrade =
    currentGradeIndex > 0 ? evaluationGrades[currentGradeIndex - 1] : null;

  let progressValue = 0;
  let tokensNeeded = 0;

  if (nextGrade) {
    const range = nextGrade.minimumValue - currentGrade.minimumValue;
    const earned = tokenBalance - currentGrade.minimumValue;

    progressValue = Math.max(0, Math.min((earned / range) * 100, 100));
    tokensNeeded = nextGrade.minimumValue - tokenBalance;
  } else {
    progressValue = 100;
    tokensNeeded = 0;
  }
  const allTransactions = myTransactions;
  const [activeTab, setActiveTab] = useState("overview");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [spotsModalOpen, setSpotsModalOpen] = useState(false);
  const [editSpotsValue, setEditSpotsValue] = useState("");
  const myEvents = useMemo(() => {
    return events.filter(
      (e) => String(e.postedBy?._id) === String(userStudent._id)
    );
  }, [events, userStudent._id]);

  const [selectedEvent, setSelectedEvent] = useState<SubmittedEvent | null>(
    null
  );

  /* ✅ NEW — Single Event Form State */
  const [eventForm, setEventForm] = useState({
    title: "",
    proposedDate: "",
    location: "",
    description: "",
    detailedDescription: "",
    tokenValue: "",
    maxApplicants: "",
    eventCategory: "",
    eventPoster: "me" as "me" | "other" | "student",
    customClubName: "",
  });

  const [editDateModalOpen, setEditDateModalOpen] = useState(false);
  const [editDateValue, setEditDateValue] = useState("");
  const [cancelEventConfirmOpen, setCancelEventConfirmOpen] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(userStudent.email);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Presentation",
    "Exhibition",
    "Cultural",
    "Workshop",
    "Service",
    "Competition",
  ];

  const handleSaveSettings = async () => {
    const wantsPasswordChange =
      oldPassword.trim() !== "" ||
      newPassword.trim() !== "" ||
      confirmPassword.trim() !== "";

    if (wantsPasswordChange) {
      if (!oldPassword.trim()) {
        toast.error("Please enter your current password");
        return;
      }
      if (!newPassword.trim()) {
        toast.error("Please enter a new password");
        return;
      }
      if (newPassword.trim().length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await updateStudentAccount({
        email,
        oldPassword: oldPassword || undefined, // backend will check this
        newPassword: newPassword || undefined,
        profileImage: profileImage || undefined, // Add this line
      });

      // Clear local password fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // Backend should send proper error if old password is wrong
      const message =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : "Update failed");
      toast.error(message);
      console.error(err);
    }
  };

  const studentFeedbacks = useMemo(() => {
    // Always ensure you have a fallback if userStudent is null/undefined
    if (!userStudent) return [];

    return feedbacks.filter((fb) => fb.studentID?._id === userStudent._id);
  }, [feedbacks, userStudent]);

  const handleSubmitEvent = async () => {
    if (!eventForm.eventCategory) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoadingAction("submit-event");

      const payload = {
        ...eventForm,
        tokenValue: eventForm.tokenValue ? Number(eventForm.tokenValue) : 0,
        maxApplicants: eventForm.maxApplicants
          ? Number(eventForm.maxApplicants)
          : null,
        customClubName:
          eventForm.eventPoster === "other" ? eventForm.customClubName : null,
      };

      await createStudentEvent(payload, requirements);

      // Reset form after success
      setRequirements([]);
      setEventForm({
        title: "",
        proposedDate: "",
        location: "",
        description: "",
        detailedDescription: "",
        tokenValue: "",
        maxApplicants: "",
        eventCategory: "",
        eventPoster: "me",
        customClubName: "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit event");
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendFeedback = async () => {
    if (!subject.trim() || !message.trim()) {
      return toast.error("Please fill in both subject and message");
    }
    if (!userStudent)
      return toast.error("You must be logged in to send feedback");

    try {
      await sendFeedback(subject, message); // context handles loading and toast
      setSubject(""); // reset form
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback");
    }
  };

  const handleEndApplications = async (eventId: string) => {
    try {
      await endEventApplications(eventId);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to close applications"
      );
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    const event = myEvents.find((e) => e._id === eventId);
    if (!event) return;

    const hasPendingApplications = event.applicants?.some(
      (a: any) => a.status === "pending"
    );

    if (hasPendingApplications) {
      toast.error(
        "Cannot complete event with pending applications. Please approve or reject all pending applications first."
      );
      return;
    }

    try {
      await completeEvent(eventId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete event");
    }
  };

  const openApplicantsModal = (event: SubmittedEvent) => {
    setSelectedEvent(event);
    setApplicantsModalOpen(true);
  };

  const openSpotsModal = (event: SubmittedEvent) => {
    setSelectedEvent(event);
    setEditSpotsValue(event.maxApplicants?.toString() || "");
    setSpotsModalOpen(true);
  };

  const handleUpdateSpots = async () => {
    if (!selectedEvent) return;

    const newMax =
      editSpotsValue.trim() === "" ? undefined : parseInt(editSpotsValue);

    if (
      editSpotsValue.trim() !== "" &&
      (isNaN(newMax!) || newMax! < selectedEvent.applicants.length)
    ) {
      toast.error(
        `Spots cannot be less than current applicants (${selectedEvent.applicants.length})`
      );
      return;
    }

    try {
      if (newMax !== undefined) {
        await updateMaxApplicants(selectedEvent._id, newMax);
      }

      setSpotsModalOpen(false);
      toast.success(`Spots updated for "${selectedEvent.title}"!`);
    } catch (error) {
      toast.error("Failed to update spots");
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await cancelEvent(eventId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel event");
    }
  };

  const handleUpdateEventDate = async () => {
    if (!selectedEvent || !editDateValue) return;

    try {
      await updateEventDate(selectedEvent._id, editDateValue);

      setEditDateModalOpen(false);

      toast.success(`Date updated for "${selectedEvent.title}"!`);
    } catch (error) {
      toast.error("Failed to update event date");
      console.log(error);
    }
  };

  const openEditDateModal = (event: SubmittedEvent) => {
    setSelectedEvent(event);
    setEditDateValue("");
    setEditDateModalOpen(true);
  };

  const openCancelConfirm = (event: SubmittedEvent) => {
    setSelectedEvent(event);
    setCancelEventConfirmOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
        toast.success("Photo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  function TokenHistoryList({
    transactions,
  }: {
    transactions: typeof allTransactions;
  }) {
    const [showAll, setShowAll] = useState(false);
    const displayedTransactions = showAll
      ? transactions
      : transactions.slice(0, 7);
    if (!transactions || transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center text-muted-foreground">
          <ClipboardList className="w-14 h-14 text-primary animate-bounce" />
          <p className="text-lg font-semibold">
            No Savannah activity recorded this trimester
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your token history will appear here once events or club attendance
            affect your Savannah balance.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2">
          {displayedTransactions.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm sm:text-base">
                  {item.description}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold whitespace-nowrap ml-2 text-xs sm:text-sm transition-transform duration-200 hover:scale-105 ${
                  item.amount > 0
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {item.amount > 0 ? `+${item.amount}` : item.amount}
              </span>
            </div>
          ))}
        </div>

        {transactions.length > 7 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="transition-all duration-200 hover:scale-105 press-effect"
            >
              {showAll
                ? "Show Less"
                : `Show All (${transactions.length - 7} more)`}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with slide-in animation */}
      <div className="gradient-hero py-8 sm:py-10 lg:py-12 animate-fade-in">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary-foreground/30 shadow-lg animate-scale-in-bounce transition-transform duration-300 hover:scale-105">
              <AvatarImage
                src={isProfileAllowed ? userStudent.profileImage || "" : ""}
                alt={userStudent.name}
              />
              <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary-foreground text-primary">
                {userStudent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left animate-slide-in-right stagger-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-primary-foreground mb-1">
                {userStudent.name}
              </h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                {userStudent.grade}th Grade
              </p>
              {!isTrimesterEnded && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-foreground/20 border border-primary-foreground/30 transition-all duration-300 hover:bg-primary-foreground/30 hover:scale-105">
                    <span className="text-base sm:text-lg font-bold text-primary-foreground">
                      {userStudent.tokenBalance}
                    </span>
                    <span className="text-xs sm:text-sm text-primary-foreground/80 ml-1">
                      Savannah
                    </span>
                  </div>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-foreground/20 border border-primary-foreground/30 transition-all duration-300 hover:bg-primary-foreground/30 hover:scale-105">
                    <span className="text-base sm:text-lg font-bold text-primary-foreground">
                      {currentGradeForProfile?.gradeLetter}
                    </span>
                    <span className="text-xs sm:text-sm text-primary-foreground/80 ml-1">
                      Estimated Grade
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isTrimesterEnded && (
          <div className="p-4 rounded-lg border border-warning/50 bg-warning/10 mb-6">
            <div className="flex items-center gap-2 text-warning">
              <Info className="h-5 w-5 shrink-0" />
              <p className="font-semibold text-sm">Trimester Ended</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The current trimester has ended. A new trimester will start soon.
            </p>
          </div>
        )}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-auto sm:grid sm:grid-cols-6 gap-1 h-auto p-1 animate-fade-in-up">
              <TabsTrigger
                value="overview"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Savannah</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Apps</span>
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Attend</span>
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Feedback</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap transition-all duration-200 data-[state=active]:animate-scale-in"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 animate-fade-in-up"
          >
            {isTrimesterEnded ? (
              <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
                <Info className="h-10 w-10 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-warning mb-1">
                  Trimester Ended
                </h3>
                <p className="text-sm text-muted-foreground">
                  Savannah history is unavailable until a new trimester begins.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Progress Card */}
                <Card className="lg:col-span-1 card-hover animate-slide-in-left opacity-0 stagger-1">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                      Grade Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 animate-scale-in-bounce">
                        {currentGrade.gradeLetter}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Current Grade
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          {nextGrade
                            ? `Progress to ${nextGrade.gradeLetter}`
                            : "Max Grade Achieved"}
                        </span>
                        {nextGrade && (
                          <span className="font-medium">
                            {tokensNeeded} Savannah needed
                          </span>
                        )}
                      </div>

                      <Progress
                        value={progressValue}
                        className="h-2 transition-all duration-500"
                      />
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                      {nextGrade
                        ? `Earn ${tokensNeeded} more Savannah to reach ${nextGrade.gradeLetter}`
                        : "You’ve reached the top grade!"}
                    </p>
                  </CardContent>
                </Card>

                {/* Token History */}
                <Card className="lg:col-span-2 card-hover animate-slide-in-right opacity-0 stagger-2">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                      Savannah History
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your Savannah earnings this trimester
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TokenHistoryList transactions={allTransactions} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {isTrimesterEnded ? (
              <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
                <Info className="h-10 w-10 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-warning mb-1">
                  Trimester Ended
                </h3>
                <p className="text-sm text-muted-foreground">
                  Event submissions are unavailable until a new trimester
                  begins.
                </p>
              </div>
            ) : (
              <>
                {/* Submit New Event */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Submit New Event
                    </CardTitle>
                    <CardDescription>
                      Propose an event for approval by the Leadership Center
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Event Title</Label>
                        <Input
                          placeholder="Enter event title"
                          value={eventForm.title}
                          onChange={(e) =>
                            setEventForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Proposed Date</Label>
                          <Input
                            type="date"
                            value={eventForm.proposedDate}
                            onChange={(e) =>
                              setEventForm((prev) => ({
                                ...prev,
                                proposedDate: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            placeholder="e.g., Main Auditorium"
                            value={eventForm.location}
                            onChange={(e) =>
                              setEventForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Event Poster Selection */}
                    <div className="space-y-2">
                      <Label>Posted By</Label>
                      <Select
                        value={eventForm.eventPoster}
                        onValueChange={(v) =>
                          setEventForm((prev) => ({
                            ...prev,
                            eventPoster: v as "me" | "other" | "student",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select who is posting this event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="me">
                            Me ({userStudent.name})
                          </SelectItem>
                          <SelectItem value="student">
                            Student (Anonymous)
                          </SelectItem>
                          <SelectItem value="other">
                            Other (Club/Organization)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {eventForm.eventPoster === "other" && (
                      <div className="space-y-2">
                        <Label>Posted By (Other)</Label>
                        <Input
                          placeholder="Enter name (e.g., club name)"
                          value={eventForm.customClubName}
                          onChange={(e) =>
                            setEventForm((prev) => ({
                              ...prev,
                              customClubName: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe your event..."
                        rows={4}
                        value={eventForm.description}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Detailed Event Plan</Label>
                      <Textarea
                        placeholder="Describe the detailed plan for your event, the main goal of the event, and any requirements you need from the Leadership Center or the school (e.g., equipment, venue, permissions)..."
                        rows={5}
                        value={eventForm.detailedDescription}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            detailedDescription: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Savannah Value</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
                          value={eventForm.tokenValue}
                          onChange={(e) =>
                            setEventForm((prev) => ({
                              ...prev,
                              tokenValue: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Applicants</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          value={eventForm.maxApplicants}
                          onChange={(e) =>
                            setEventForm((prev) => ({
                              ...prev,
                              maxApplicants: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={eventForm.eventCategory}
                          onValueChange={(value) =>
                            setEventForm((prev) => ({
                              ...prev,
                              eventCategory: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Requirements Builder */}
                    <RequirementsBuilder
                      requirements={requirements}
                      onChange={setRequirements}
                    />

                    <Button
                      onClick={handleSubmitEvent}
                      disabled={loadingAction === "submit-event"}
                    >
                      {loadingAction === "submit-event" ? (
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}

                      {loadingAction === "submit-event" &&
                      isCreatingStudentEvent
                        ? "Submitting..."
                        : "Submit for Approval"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Submitted Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Submitted Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.title}</h4>
                              {getStatusBadge(event.status)}
                              {event.isApplicationEnded &&
                                !event.isCompleted &&
                                event.status === "approved" && (
                                  <Badge variant="secondary" className="gap-1">
                                    <StopCircle className="h-3 w-3" />
                                    Applications Closed
                                  </Badge>
                                )}
                              {event.isCompleted && (
                                <Badge className="bg-success text-success-foreground gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {formatDate(event.createdAt)} • Event:{" "}
                              {formatDate(event.proposedDate)} • Posted by:{" "}
                              {event?.isAnonymousStudent
                                ? "Student"
                                : event?.postedByOther !== null
                                ? event?.postedByOther
                                : event?.postedBy?.name}
                              {event.location && ` • 📍 ${event.location}`}
                            </p>
                            {/* Rejection Reason Display */}
                            {event.status === "rejected" &&
                              event.rejectionReason && (
                                <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                  <div className="flex items-start gap-2">
                                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-destructive mb-1">
                                        Rejection Reason
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {event.rejectionReason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Only show actions for approved events */}
                          {event.status === "approved" && (
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Update Date Button */}
                              {!event.isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 h-8 text-xs sm:text-sm"
                                  onClick={() => openEditDateModal(event)}
                                >
                                  <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Date</span>
                                </Button>
                              )}
                              {/* Update Spots Button */}
                              {!event.isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 h-8 text-xs sm:text-sm"
                                  onClick={() => openSpotsModal(event)}
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">
                                    Spots
                                  </span>
                                  <span>{event.maxApplicants ?? "∞"}</span>
                                </Button>
                              )}
                              {/* Applicants Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-8 text-xs sm:text-sm"
                                onClick={() => openApplicantsModal(event)}
                              >
                                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>{event.applicants.length}</span>
                              </Button>
                              {/* Complete Event Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 h-8 text-xs sm:text-sm text-success hover:text-success hover:bg-success/10 border-success/30"
                                    disabled={!!event.isCompleted}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">
                                      Done
                                    </span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base sm:text-lg">
                                      Mark Event as Completed?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      Are you sure you want to mark "
                                      {event.title}" as completed?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2 sm:gap-0">
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCompleteEvent(event._id)
                                      }
                                    >
                                      {isCompletingEvent ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                      ) : (
                                        "Complete"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              {/* End Applications Button */}
                              {!event.isApplicationEnded &&
                                !event.isCompleted && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 h-8 text-xs sm:text-sm text-warning hover:text-warning hover:bg-warning/10 border-warning/30"
                                      >
                                        <StopCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                          End
                                        </span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-base sm:text-lg">
                                          End Applications?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                          Are you sure you want to close
                                          applications for "{event.title}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="gap-2 sm:gap-0">
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleEndApplications(event._id)
                                          }
                                        >
                                          {isEndingApplications ? (
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          ) : (
                                            "End Applications"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              {/* Cancel Event Button */}
                              {!event.isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 h-8 text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                  onClick={() => openCancelConfirm(event)}
                                >
                                  <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">
                                    Cancel
                                  </span>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            {localStorage.getItem("trimesterEnded") === "true" ? (
              <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
                <Info className="h-10 w-10 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-warning mb-1">
                  Trimester Ended
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applications are unavailable until a new trimester begins.
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    My Event Applications
                  </CardTitle>
                  <CardDescription>
                    Track the status of events you've applied to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      View detailed application status including approvals,
                      rejections, and pending reviews.
                    </p>
                    <Button asChild>
                      <Link to="/applications">View Application Status</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            {isTrimisterEnded ? (
              <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
                <Info className="h-10 w-10 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-warning mb-1">
                  Trimester Ended
                </h3>
                <p className="text-sm text-muted-foreground">
                  Club attendance is unavailable until a new trimester begins.
                </p>
              </div>
            ) : (
              <ClubAttendanceSection />
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {/* Send New Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Contact Leadership Center
                </CardTitle>
                <CardDescription>
                  Send feedback, questions, or concerns to the Leadership team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSendFeedback}
                  disabled={isSendingFeedback}
                >
                  {isSendingFeedback ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isSendingFeedback ? "Sending..." : "Send Feedback"}
                </Button>
              </CardContent>
            </Card>

            {/* Feedback Responses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Feedback Responses
                </CardTitle>
                <CardDescription>
                  Responses from the Leadership Center to your previous feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingFeedbacks ? (
                  <p>Loading your feedbacks...</p>
                ) : studentFeedbacks.length === 0 ? (
                  <p className="text-muted-foreground">
                    No feedbacks submitted yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {studentFeedbacks.map((fb) => (
                      <div
                        key={fb._id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">
                            {fb.subject}
                          </h4>
                          {fb.status === "responded" ? (
                            <Badge className="bg-success/10 text-success border-success/20 text-xs flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Responded
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/10 text-warning border-warning/20 text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Sent on {formatDate(fb.createdAt)}
                        </p>

                        {/* Your message */}
                        <div className="p-3 rounded-lg bg-secondary/50 mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Your Message
                          </p>
                          <p className="text-sm text-foreground">
                            {fb.message}
                          </p>
                        </div>

                        {/* Response */}
                        {fb.response && (
                          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                            <p className="text-xs font-medium text-success mb-1">
                              Leadership Center Response •{" "}
                              {new Date(fb.updatedAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-foreground">
                              {fb.response}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Profile Image Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {isProfileAllowed && (
                      <AvatarImage
                        src={profileImage || ""}
                        alt={userStudent.name}
                      />
                    )}
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {userStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isProfileAllowed ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button variant="outline" onClick={handleUploadClick}>
                          <Upload className="h-4 w-4 mr-2" /> Upload Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Max file size: 10MB
                        </p>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Avatar Feature
                        </p>
                        <p>
                          Profile image uploads are currently disabled by
                          administration.
                        </p>
                        <p>Your initials will be displayed instead.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue={userStudent.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input defaultValue={userStudent.grade} disabled />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Email
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This email will be used to receive responses from the
                    Leadership Center
                  </p>
                </div>

                {/* Password Change Note */}
                <Alert className="border-warning/30 bg-warning/5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-sm">
                    If you are still using the initial password provided to you,
                    please change it now for security purposes.
                  </AlertDescription>
                </Alert>

                {/* Password Change */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
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

                {/* Save Button */}
                <Button
                  onClick={handleSaveSettings} // calls the updated handler below
                  disabled={isUpdatingAccount}
                >
                  {isUpdatingAccount ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  ) : null}
                  {isUpdatingAccount ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Applicants Modal */}
      {selectedEvent && (
        <ApplicantsModal
          open={applicantsModalOpen}
          onOpenChange={setApplicantsModalOpen}
          eventTitle={selectedEvent.title}
          applicants={selectedEvent.applicants}
          eventID={selectedEvent._id}
        />
      )}

      {/* Update Spots Modal */}
      <Dialog open={spotsModalOpen} onOpenChange={setSpotsModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Spots</DialogTitle>
            <DialogDescription>
              Change the maximum number of applicants for "
              {selectedEvent?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Max Applicants</Label>
              <Input
                type="number"
                placeholder="Leave empty for unlimited"
                value={editSpotsValue}
                onChange={(e) => setEditSpotsValue(e.target.value)}
                min={selectedEvent?.applicants.length || 0}
              />
              <p className="text-xs text-muted-foreground">
                Current applicants: {selectedEvent?.applicants.length || 0}.
                Leave empty for unlimited spots.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpotsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSpots}>
              {isUpdatingMaxApplicants ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Event Date Modal */}
      <Dialog open={editDateModalOpen} onOpenChange={setEditDateModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Event Date</DialogTitle>
            <DialogDescription>
              Change the date for "{selectedEvent?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input
                type="date"
                value={editDateValue}
                onChange={(e) => setEditDateValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEventDate} disabled={!editDateValue}>
              {isUpdatingEventDate ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Event Confirmation */}
      <AlertDialog
        open={cancelEventConfirmOpen}
        onOpenChange={setCancelEventConfirmOpen}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Cancel Event?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{selectedEvent?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelEvent(selectedEvent._id)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isCancelingEvent ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
