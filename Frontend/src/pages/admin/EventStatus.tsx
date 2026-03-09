import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  MessageCircle, Users, Eye, Calendar, Award, 
  StopCircle, CheckCircle, XCircle, Send, User, Clock, Reply, Pencil, Trash2, X, Check, CornerDownRight, ChevronDown, ChevronUp
} from "lucide-react";

interface CommentReply {
  id: number;
  studentName: string;
  studentInitials: string;
  comment: string;
  timestamp: string;
}

interface EventComment {
  id: number;
  studentName: string;
  studentInitials: string;
  comment: string;
  timestamp: string;
  replies?: CommentReply[];
}

interface EventApplicant {
  id: number;
  name: string;
  grade: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
  answers?: { requirement: string; answer: string; type?: "text" | "image" }[];
  rejectionReason?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  status: "active" | "completed" | "ended";
  tokenValue: number;
  views: number;
  category: string;
  applicants: EventApplicant[];
  comments: EventComment[];
  isApplicationOpen: boolean;
}

const categories = ["All", "Presentation", "Exhibition", "Cultural", "Workshop", "Service", "Competition"];

const eventsData: Event[] = [
  {
    id: 1,
    title: "Community Meeting Presentation",
    date: "Feb 15, 2026",
    status: "active",
    tokenValue: 150,
    views: 234,
    category: "Presentation",
    isApplicationOpen: true,
    applicants: [
      { 
        id: 1, 
        name: "Sarah Johnson", 
        grade: "12", 
        appliedDate: "Jan 22, 2026", 
        status: "pending",
        answers: [
          { requirement: "Why do you want to participate?", answer: "I am passionate about community service and want to inspire others with my initiatives.", type: "text" },
          { requirement: "Relevant Experience", answer: "I have organized multiple charity events in my neighborhood.", type: "text" },
          { requirement: "Upload your community service certificate", answer: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400", type: "image" },
        ]
      },
      { 
        id: 2, 
        name: "Michael Chen", 
        grade: "11", 
        appliedDate: "Jan 21, 2026", 
        status: "approved",
        answers: [
          { requirement: "Why do you want to participate?", answer: "I want to share my environmental project with the community.", type: "text" },
          { requirement: "Relevant Experience", answer: "Led the school's recycling program for 2 years.", type: "text" },
          { requirement: "Upload your community service certificate", answer: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400", type: "image" },
        ]
      },
      { 
        id: 3, 
        name: "Emily Williams", 
        grade: "12", 
        appliedDate: "Jan 20, 2026", 
        status: "pending",
        answers: [
          { requirement: "Why do you want to participate?", answer: "I believe in giving back to our community through education.", type: "text" },
          { requirement: "Relevant Experience", answer: "Volunteer tutor at the local library.", type: "text" },
          { requirement: "Upload your community service certificate", answer: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400", type: "image" },
        ]
      },
    ],
    comments: [
      { id: 1, studentName: "Alex Thompson", studentInitials: "AT", comment: "Is there a specific topic we need to prepare for?", timestamp: "2 hours ago", replies: [
        { id: 101, studentName: "Admin", studentInitials: "AD", comment: "You can present any community initiative you've been part of.", timestamp: "1 hour ago" }
      ] },
      { id: 2, studentName: "Jessica Brown", studentInitials: "JB", comment: "Can we present in groups or is it individual only?", timestamp: "5 hours ago", replies: [] },
      { id: 3, studentName: "David Kim", studentInitials: "DK", comment: "What is the time limit for each presentation?", timestamp: "1 day ago", replies: [
        { id: 102, studentName: "Admin", studentInitials: "AD", comment: "Each presentation should be 10-15 minutes.", timestamp: "20 hours ago" }
      ] },
    ],
  },
  {
    id: 2,
    title: "Science Fair Project Exhibition",
    date: "Feb 20, 2026",
    status: "active",
    tokenValue: 200,
    views: 456,
    category: "Exhibition",
    isApplicationOpen: true,
    applicants: [
      { id: 4, name: "David Lee", grade: "12", appliedDate: "Jan 23, 2026", status: "pending", answers: [] },
      { id: 5, name: "Amanda Garcia", grade: "11", appliedDate: "Jan 22, 2026", status: "pending", answers: [] },
    ],
    comments: [
      { id: 3, studentName: "Ryan Martinez", studentInitials: "RM", comment: "What categories are available for the science fair?", timestamp: "1 day ago", replies: [] },
    ],
  },
  {
    id: 3,
    title: "Chess Tournament",
    date: "Jan 28, 2026",
    status: "completed",
    tokenValue: 75,
    views: 312,
    category: "Competition",
    isApplicationOpen: false,
    applicants: [
      { id: 6, name: "Sarah Johnson", grade: "12", appliedDate: "Jan 15, 2026", status: "approved", answers: [] },
      { id: 7, name: "Michael Chen", grade: "11", appliedDate: "Jan 14, 2026", status: "approved", answers: [] },
    ],
    comments: [
      { id: 4, studentName: "Emily Williams", studentInitials: "EW", comment: "Great event! When's the next one?", timestamp: "3 days ago", replies: [] },
    ],
  },
  {
    id: 4,
    title: "Student Art Portfolio Showcase",
    date: "Mar 25, 2026",
    status: "active",
    tokenValue: 175,
    views: 189,
    category: "Exhibition",
    isApplicationOpen: true,
    applicants: [
      { 
        id: 8, 
        name: "Maya Rodriguez", 
        grade: "11", 
        appliedDate: "Jan 24, 2026", 
        status: "pending",
        answers: [
          { requirement: "Describe your art style and inspiration", answer: "I specialize in watercolor landscapes inspired by Ethiopian highlands. My work focuses on capturing the natural beauty and vibrant colors of nature.", type: "text" },
          { requirement: "Upload your best artwork", answer: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400", type: "image" },
          { requirement: "Upload a photo of yourself with your artwork", answer: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400", type: "image" },
        ]
      },
      { 
        id: 9, 
        name: "Ethan Park", 
        grade: "12", 
        appliedDate: "Jan 23, 2026", 
        status: "approved",
        answers: [
          { requirement: "Describe your art style and inspiration", answer: "I create digital art focusing on futuristic cityscapes. My inspiration comes from science fiction movies and video games.", type: "text" },
          { requirement: "Upload your best artwork", answer: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400", type: "image" },
          { requirement: "Upload a photo of yourself with your artwork", answer: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", type: "image" },
        ]
      },
      { 
        id: 10, 
        name: "Sophia Turner", 
        grade: "10", 
        appliedDate: "Jan 22, 2026", 
        status: "pending",
        answers: [
          { requirement: "Describe your art style and inspiration", answer: "Abstract expressionism is my style. I use bold colors and dynamic brushstrokes to convey emotions.", type: "text" },
          { requirement: "Upload your best artwork", answer: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400", type: "image" },
          { requirement: "Upload a photo of yourself with your artwork", answer: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", type: "image" },
        ]
      },
    ],
    comments: [
      { id: 5, studentName: "Maya K.", studentInitials: "MK", comment: "So excited to showcase my paintings! This is a great opportunity.", timestamp: "30 minutes ago", replies: [] },
      { id: 6, studentName: "Ryan T.", studentInitials: "RT", comment: "What art mediums are accepted? Can I submit digital art?", timestamp: "2 hours ago", replies: [
        { id: 103, studentName: "Admin", studentInitials: "AD", comment: "Yes, all art mediums are welcome including digital art, paintings, sculptures (photos), and mixed media.", timestamp: "1 hour ago" }
      ] },
      { id: 7, studentName: "Sophie L.", studentInitials: "SL", comment: "Will there be prizes for the best submissions?", timestamp: "5 hours ago", replies: [] },
    ],
  },
];

export default function EventStatus() {
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [applicantsDialogOpen, setApplicantsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<EventApplicant | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingApplicantId, setRejectingApplicantId] = useState<number | null>(null);
  const [endApplicationsConfirmOpen, setEndApplicationsConfirmOpen] = useState(false);
  const [completeEventConfirmOpen, setCompleteEventConfirmOpen] = useState(false);
  const [eventToAction, setEventToAction] = useState<Event | null>(null);
  
  // Custom modal states replacing browser confirm/prompt
  const [cancelEventConfirmOpen, setCancelEventConfirmOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);
  const [updateSpotsOpen, setUpdateSpotsOpen] = useState(false);
  const [spotsEvent, setSpotsEvent] = useState<Event | null>(null);
  const [spotsValue, setSpotsValue] = useState("");
  const [updateDateOpen, setUpdateDateOpen] = useState(false);
  const [dateEvent, setDateEvent] = useState<Event | null>(null);
  const [dateValue, setDateValue] = useState("");

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenComments = (event: Event) => {
    setSelectedEvent(event);
    setCommentsDialogOpen(true);
  };

  const handleOpenApplicants = (event: Event) => {
    setSelectedEvent(event);
    setApplicantsDialogOpen(true);
  };

  const handleViewDetails = (applicant: EventApplicant) => {
    setSelectedApplicant(applicant);
    setDetailsDialogOpen(true);
  };

  const handleStopApplications = (event: Event) => {
    setEventToAction(event);
    setEndApplicationsConfirmOpen(true);
  };

  const confirmStopApplications = () => {
    if (!eventToAction) return;
    setEvents(events.map((e) => 
      e.id === eventToAction.id ? { ...e, isApplicationOpen: false, status: "ended" as const } : e
    ));
    toast.success(`Applications closed for "${eventToAction.title}"`);
    setEndApplicationsConfirmOpen(false);
    setEventToAction(null);
  };

  const handleCompleteEvent = (event: Event) => {
    // Check for pending applications
    const pendingCount = event.applicants.filter(a => a.status === "pending").length;
    if (pendingCount > 0) {
      toast.error(`Cannot complete event. Please approve or reject ${pendingCount} pending application(s) first.`);
      return;
    }
    setEventToAction(event);
    setCompleteEventConfirmOpen(true);
  };

  const confirmCompleteEvent = () => {
    if (!eventToAction) return;
    setEvents(events.map((e) => 
      e.id === eventToAction.id ? { ...e, status: "completed" as const, isApplicationOpen: false } : e
    ));
    toast.success(`"${eventToAction.title}" marked as completed`);
    setCompleteEventConfirmOpen(false);
    setEventToAction(null);
  };

  const handleApproveApplicant = (applicantId: number) => {
    if (!selectedEvent) return;
    
    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          applicants: e.applicants.map((a) =>
            a.id === applicantId ? { ...a, status: "approved" as const } : a
          ),
        };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    toast.success("Applicant approved successfully");
  };

  const handleRejectApplicant = (applicantId: number) => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    
    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          applicants: e.applicants.map((a) =>
            a.id === applicantId ? { ...a, status: "rejected" as const, rejectionReason } : a
          ),
        };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    setRejectingApplicantId(null);
    setRejectionReason("");
    toast.error("Applicant rejected");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedEvent) return;
    
    const newCommentObj: EventComment = {
      id: Date.now(),
      studentName: "Admin",
      studentInitials: "AD",
      comment: newComment,
      timestamp: "Just now",
      replies: [],
    };
    
    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        return { ...e, comments: [newCommentObj, ...e.comments] };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    setNewComment("");
    toast.success("Comment added");
  };

  const handleAddReply = (commentId: number) => {
    if (!replyText.trim() || !selectedEvent) return;

    const newReply: CommentReply = {
      id: Date.now(),
      studentName: "Admin",
      studentInitials: "AD",
      comment: replyText,
      timestamp: "Just now",
    };

    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          comments: e.comments.map((c) => 
            c.id === commentId 
              ? { ...c, replies: [newReply, ...(c.replies || [])] }
              : c
          ),
        };
      }
      return e;
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    setReplyingTo(null);
    setReplyText("");
    toast.success("Reply added");
  };

  const handleEditComment = (commentId: number, isReply?: boolean, parentId?: number) => {
    if (!editText.trim() || !selectedEvent) return;

    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        if (isReply && parentId) {
          return {
            ...e,
            comments: e.comments.map((c) => 
              c.id === parentId 
                ? { ...c, replies: c.replies?.map((r) => r.id === commentId ? { ...r, comment: editText } : r) }
                : c
            ),
          };
        } else {
          return {
            ...e,
            comments: e.comments.map((c) => c.id === commentId ? { ...c, comment: editText } : c),
          };
        }
      }
      return e;
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    setEditingId(null);
    setEditText("");
    toast.success("Comment updated");
  };

  const handleDeleteComment = (commentId: number, isReply?: boolean, parentId?: number) => {
    if (!selectedEvent) return;

    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvent.id) {
        if (isReply && parentId) {
          return {
            ...e,
            comments: e.comments.map((c) => 
              c.id === parentId 
                ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) }
                : c
            ),
          };
        } else {
          return {
            ...e,
            comments: e.comments.filter((c) => c.id !== commentId),
          };
        }
      }
      return e;
    });

    setEvents(updatedEvents);
    setSelectedEvent(updatedEvents.find((e) => e.id === selectedEvent.id) || null);
    toast.success("Comment deleted");
  };

  const startEdit = (comment: EventComment | CommentReply) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
    setReplyingTo(null);
  };

  const getStatusBadge = (event: Event) => {
    if (event.status === "completed") {
      return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    }
    if (event.status === "ended" || !event.isApplicationOpen) {
      return <Badge variant="secondary" className="bg-muted"><StopCircle className="h-3 w-3 mr-1" />Applications Closed</Badge>;
    }
    return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
  };

  // Count approved and rejected applicants per event for badges
  const getApplicantStatusBadges = (event: Event) => {
    const approved = event.applicants.filter(a => a.status === "approved").length;
    const rejected = event.applicants.filter(a => a.status === "rejected").length;
    const pending = event.applicants.filter(a => a.status === "pending").length;
    return { approved, rejected, pending };
  };

  const trimesterEnded = localStorage.getItem("trimesterEnded") === "true";

  const pendingCount = selectedEvent?.applicants.filter(a => a.status === "pending").length || 0;
  const approvedCount = selectedEvent?.applicants.filter(a => a.status === "approved").length || 0;
  const rejectedCount = selectedEvent?.applicants.filter(a => a.status === "rejected").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Event Status</h2>
        <p className="text-muted-foreground">Manage event applications, comments, and status.</p>
      </div>

      {trimesterEnded ? (
        <div className="p-6 rounded-lg border border-warning/50 bg-warning/10 text-center">
          <Clock className="h-10 w-10 text-warning mx-auto mb-3" />
          <h3 className="font-semibold text-warning mb-1">Trimester Ended</h3>
          <p className="text-sm text-muted-foreground">Event status management is unavailable until a new trimester begins.</p>
        </div>
      ) : (
      <>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              placeholder="Search events..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              containerClassName="flex-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                    <Badge variant="outline" className="ml-2">{event.category}</Badge>
                  </div>
                </div>
                {getStatusBadge(event)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold">{event.views}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold">{event.applicants.length}</p>
                  <p className="text-xs text-muted-foreground">Applicants</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Award className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-primary">+{event.tokenValue}</p>
                  <p className="text-xs text-muted-foreground">Savannah</p>
                </div>
              </div>

              {/* Applicant Status Badges */}
              {(() => {
                const stats = getApplicantStatusBadges(event);
                return (stats.approved > 0 || stats.rejected > 0 || stats.pending > 0) ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {stats.approved > 0 && (
                      <Badge className="bg-success/10 text-success border border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />{stats.approved} Approved
                      </Badge>
                    )}
                    {stats.rejected > 0 && (
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />{stats.rejected} Rejected
                      </Badge>
                    )}
                    {stats.pending > 0 && (
                      <Badge className="bg-warning/10 text-warning border border-warning/20">
                        <Clock className="h-3 w-3 mr-1" />{stats.pending} Pending
                      </Badge>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenComments(event)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comments ({event.comments.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenApplicants(event)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  View Applicants
                </Button>
                {event.status !== "completed" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSpotsEvent(event);
                        setSpotsValue("");
                        setUpdateSpotsOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Update Spots
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateEvent(event);
                        setDateValue("");
                        setUpdateDateOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Update Date
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEventToCancel(event);
                        setCancelEventConfirmOpen(true);
                      }}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Event
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteEvent(event)}
                      className="gap-2 text-success hover:text-success hover:bg-success/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </Button>
                  </>
                )}
                {event.isApplicationOpen && event.status !== "completed" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStopApplications(event)}
                    className="gap-2"
                  >
                    <StopCircle className="h-4 w-4" />
                    End Applications
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events found matching your search</p>
          </CardContent>
        </Card>
      )}

      {/* Comments Dialog - Matching Public Style */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Event Comments
            </DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddComment} size="icon" className="shrink-0 h-auto">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {selectedEvent?.comments.map((comment) => {
                  const hasReplies = comment.replies && comment.replies.length > 0;
                  const isExpanded = expandedReplies.has(comment.id);

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm">
                          {comment.studentInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm">{comment.studentName}</span>
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            {comment.studentName === "Admin" && editingId !== comment.id && (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(comment)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {editingId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="resize-none text-sm" />
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>
                                  <X className="h-3 w-3 mr-1" />Cancel
                                </Button>
                                <Button size="sm" className="h-7" onClick={() => handleEditComment(comment.id)}>
                                  <Check className="h-3 w-3 mr-1" />Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{comment.comment}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-1">
                          {editingId !== comment.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                setReplyText("");
                                setEditingId(null);
                              }}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          )}

                          {hasReplies && (
                            <Collapsible open={isExpanded} onOpenChange={() => toggleReplies(comment.id)}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground">
                                  {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                  {comment.replies?.length} {comment.replies?.length === 1 ? "Reply" : "Replies"}
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          )}
                        </div>

                        {/* Reply input */}
                        {replyingTo === comment.id && (
                          <div className="flex gap-2 mt-2 ml-4">
                            <CornerDownRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2}
                              className="flex-1 text-sm"
                            />
                            <div className="flex flex-col gap-1">
                              <Button size="sm" className="h-7" onClick={() => handleAddReply(comment.id)}>
                                <Send className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7" onClick={() => setReplyingTo(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {hasReplies && (
                          <Collapsible open={isExpanded}>
                            <CollapsibleContent>
                              <div className="space-y-2 mt-2">
                                {comment.replies?.map((reply) => (
                                  <div key={reply.id} className="flex gap-2 ml-4">
                                    <CornerDownRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                                    <Avatar className="h-7 w-7 flex-shrink-0">
                                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {reply.studentInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="p-2.5 rounded-lg bg-muted/50">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground text-xs">{reply.studentName}</span>
                                            <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                                          </div>
                                          {reply.studentName === "Admin" && editingId !== reply.id && (
                                            <div className="flex items-center gap-0.5">
                                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEdit(reply)}>
                                                <Pencil className="h-2.5 w-2.5" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => handleDeleteComment(reply.id, true, comment.id)}>
                                                <Trash2 className="h-2.5 w-2.5" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {editingId === reply.id ? (
                                          <div className="space-y-2">
                                            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="resize-none text-xs" />
                                            <div className="flex gap-2">
                                              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingId(null)}>
                                                <X className="h-3 w-3 mr-1" />Cancel
                                              </Button>
                                              <Button size="sm" className="h-6 text-xs" onClick={() => handleEditComment(reply.id, true, comment.id)}>
                                                <Check className="h-3 w-3 mr-1" />Save
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground">{reply.comment}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {selectedEvent?.comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applicants Dialog - Matching Public Style */}
      <Dialog open={applicantsDialogOpen} onOpenChange={setApplicantsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Applicants
            </DialogTitle>
            <DialogDescription>{selectedEvent?.title}</DialogDescription>
          </DialogHeader>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
              <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
              <p className="text-2xl font-bold text-success">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {selectedEvent?.applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="p-3 sm:p-4 rounded-lg border bg-card"
                >
                  {/* Applicant Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{applicant.name}</p>
                    </div>
                  </div>
                  
                  {/* Grade and Date - Vertical */}
                  <div className="flex flex-col gap-1.5 mb-3 text-sm text-muted-foreground pl-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 shrink-0" />
                      <span>{applicant.grade}th Grade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{applicant.appliedDate}</span>
                    </div>
                  </div>
                    
                  {/* Actions - Vertical on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleViewDetails(applicant)}
                    >
                      Details
                    </Button>
                    
                    {applicant.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none text-success hover:text-success"
                          onClick={() => handleApproveApplicant(applicant.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="sm:hidden">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                          onClick={() => setRejectingApplicantId(applicant.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="sm:hidden">Reject</span>
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={`w-fit ${
                          applicant.status === "approved"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {applicant.status === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    )}
                  </div>

                  {/* Rejection reason input */}
                  {rejectingApplicantId === applicant.id && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <Label className="text-sm font-medium">Reason for Rejection</Label>
                      <Textarea
                        placeholder="Please provide a reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-2"
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setRejectingApplicantId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectApplicant(applicant.id)}>
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {selectedEvent?.applicants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No applicants yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Applicant Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
            <DialogDescription>
              {selectedApplicant?.name} • {selectedApplicant?.grade}th Grade
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              {selectedApplicant?.answers && selectedApplicant.answers.length > 0 ? (
                selectedApplicant.answers.map((answer, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/50 border">
                    <Label className="text-sm font-medium text-muted-foreground">{answer.requirement}</Label>
                    {answer.type === "image" ? (
                      <div className="mt-2">
                        <img 
                          src={answer.answer} 
                          alt="Uploaded requirement" 
                          className="rounded-lg max-h-48 w-full object-cover border"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-foreground">{answer.answer}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No requirements submitted</p>
              )}

              {selectedApplicant?.status === "rejected" && selectedApplicant.rejectionReason && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Label className="text-sm font-medium text-destructive">Rejection Reason</Label>
                  <p className="mt-2 text-foreground">{selectedApplicant.rejectionReason}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* End Applications Confirmation */}
      <AlertDialog open={endApplicationsConfirmOpen} onOpenChange={setEndApplicationsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Applications?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close applications for "{eventToAction?.title}"? 
              Students will no longer be able to apply for this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStopApplications} className="bg-destructive hover:bg-destructive/90">
              End Applications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Event Confirmation */}
      <AlertDialog open={completeEventConfirmOpen} onOpenChange={setCompleteEventConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{eventToAction?.title}" as completed? 
              This will distribute tokens to approved participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteEvent} className="bg-success hover:bg-success/90">
              Complete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
      )}

      {/* Cancel Event Confirmation Modal */}
      <AlertDialog open={cancelEventConfirmOpen} onOpenChange={setCancelEventConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Cancel Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{eventToCancel?.title}"? This action cannot be undone and will remove the event entirely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (eventToCancel) {
                  setEvents(events.filter(e => e.id !== eventToCancel.id));
                  toast.success(`"${eventToCancel.title}" has been cancelled.`);
                  setCancelEventConfirmOpen(false);
                  setEventToCancel(null);
                }
              }} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Spots Modal */}
      <Dialog open={updateSpotsOpen} onOpenChange={setUpdateSpotsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Spots</DialogTitle>
            <DialogDescription>
              Update max spots for "{spotsEvent?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Max Applicants</Label>
              <Input
                type="number"
                placeholder="Leave empty for unlimited"
                value={spotsValue}
                onChange={(e) => setSpotsValue(e.target.value)}
                min={spotsEvent?.applicants.length || 0}
              />
              <p className="text-xs text-muted-foreground">
                Current applicants: {spotsEvent?.applicants.length || 0}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateSpotsOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (spotsEvent) {
                toast.success(`Spots updated for "${spotsEvent.title}"`);
                setUpdateSpotsOpen(false);
                setSpotsEvent(null);
              }
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Date Modal */}
      <Dialog open={updateDateOpen} onOpenChange={setUpdateDateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Event Date</DialogTitle>
            <DialogDescription>
              Change the date for "{dateEvent?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateDateOpen(false)}>Cancel</Button>
            <Button 
              disabled={!dateValue}
              onClick={() => {
                if (dateEvent && dateValue) {
                  const formatted = new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  setEvents(events.map(e => e.id === dateEvent.id ? { ...e, date: formatted } : e));
                  toast.success(`Date updated for "${dateEvent.title}" to ${formatted}`);
                  setUpdateDateOpen(false);
                  setDateEvent(null);
                }
              }}
            >Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
