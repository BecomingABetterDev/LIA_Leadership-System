import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  User,
  CalendarX,
  Send,
  Reply,
  Pencil,
  Trash2,
  X,
  Check,
  CornerDownRight,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

const categories = [
  "All",
  "Presentation",
  "Exhibition",
  "Cultural",
  "Workshop",
  "Service",
  "Competition",
];

export default function Events() {
  const {
    events,
    applyLoading,
    commentLoading,
    replyLoading,
    isTrimesterEnded,
    applyToEvent,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply,
    requirements,
    isProfileAllowed,
    applyRefreshing,
  } = usePublicData();

  const { userStudent, isStudentAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const eventRequirements = requirements.filter(
    (req) =>
      req.eventID.toString() === selectedEvent?._id?.toString() &&
      req.isQuestion === true
  );
  const [eventComments, setEventComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Application form state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<number, File | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>(
    {}
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const validateWordCount = (
    text: string,
    maxWords: number | undefined,
    idx: number
  ) => {
    if (!maxWords) return true;
    const wordCount = countWords(text);
    if (wordCount > maxWords) {
      setErrors((prev) => ({
        ...prev,
        [idx]: `Exceeds maximum of ${maxWords} words (currently ${wordCount})`,
      }));
      return false;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[idx];
        return newErrors;
      });
      return true;
    }
  };

  const handleAnswerChange = (
    idx: number,
    value: string,
    maxWords?: number
  ) => {
    setAnswers({ ...answers, [idx]: value });
    if (maxWords) {
      validateWordCount(value, maxWords, idx);
    }
  };

  const handleImageUpload = (idx: number, file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      setImageFiles((prev) => ({ ...prev, [idx]: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => ({
          ...prev,
          [idx]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };
  const eventsFiltered = events.filter(
    (event) => event.status !== "rejected" && event.status !== "pending"
  );
  const filteredEvents = eventsFiltered.filter((event) => {
    return (
      (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === "All" || event.category === selectedCategory) &&
      event.status !== "pending" &&
      event.status !== "rejected" &&
      !event.isFixed
    );
  });

  useEffect(() => {
    if (!selectedEvent) return;

    const updated = events.find((e) => e._id === selectedEvent._id);
    if (updated) {
      setSelectedEvent(updated);
    }
  }, [events]);

  // Track applied events
  const [appliedEventIds, setAppliedEventIds] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("appliedEventIds");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleApply = (event: Event) => {
    if (!isStudentAuthenticated) {
      toast.info("Please sign in to apply for events");
      return;
    }

    if (
      event.applicants.some(
        (a) => a.studentID?._id?.toString() === userStudent._id.toString()
      )
    ) {
      toast.info("You already applied to this event");
      return;
    }

    // compute requirements based on THIS event
    const eventReqs = requirements.filter(
      (req) => req.eventID.toString() === event._id.toString()
    );

    setSelectedEvent(event); // set selected event first

    if (eventReqs.length > 0) {
      // Event has requirements → open application dialog
      setAnswers({});
      setErrors({});
      setImageFiles({});
      setImagePreviews({});
      setApplicationDialogOpen(true);
      setConfirmModalOpen(false);
    } else {
      // Event has no requirements → open confirmation modal
      setConfirmModalOpen(true);
      setApplicationDialogOpen(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleSubmitApplication = async () => {
    if (!selectedEvent) return;

    if (eventRequirements && eventRequirements.length > 0) {
      const allAnswered = eventRequirements.every((req, idx) => {
        if (req.type === "image") {
          return imageFiles[idx] != null;
        }
        return answers[idx]?.trim();
      });

      if (!allAnswered) {
        toast.error("Please complete all requirements");
        return;
      }

      let hasErrors = false;
      eventRequirements.forEach((req, idx) => {
        if (req.maxWord && countWords(answers[idx] || "") > req.maxWord) {
          hasErrors = true;
          setErrors((prev) => ({
            ...prev,
            [idx]: `Exceeds maximum of ${req.maxWord} words`,
          }));
        }
      });

      if (hasErrors || Object.keys(errors).length > 0) {
        toast.error("Please fix word count errors before submitting");
        return;
      }
    }

    try {
      let requirementsFilled = [];

      if (eventRequirements.length > 0) {
        requirementsFilled = await Promise.all(
          eventRequirements.map(async (req, idx) => ({
            requirementID: req._id,
            text: req.type === "text" ? answers[idx] || null : null,
            image:
              req.type === "image"
                ? imageFiles[idx]
                  ? await toBase64(imageFiles[idx])
                  : null
                : null,
          }))
        );
      }

      await applyToEvent(selectedEvent._id, requirementsFilled);
      setApplicationDialogOpen(false);
      setSelectedEvent(null);
      setAnswers({});
      setErrors({});
      setImageFiles({});
      setImagePreviews({});
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to apply. Please try again."
      );
      console.log(error);
    }
  };

  const handleOpenComments = (event: Event) => {
    setSelectedEvent(event);
    setEventComments([...event.comments]);
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = async () => {
    const text = newComment.trim();
    if (!text) return toast.error("Please write a comment");
    if (!isStudentAuthenticated) return toast.info("Please sign in to comment");

    try {
      await addComment(selectedEvent._id, text, modalContentRef);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment. Please try again.");
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    if (!isStudentAuthenticated) {
      toast.info("Please sign in to reply");
      return;
    }

    try {
      await addReply(commentId, replyText);
      setExpandedReplies((prev) => {
        const newSet = new Set(prev);
        newSet.add(commentId);
        return newSet;
      });
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply posted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post reply. Please try again.");
    }
  };

  const handleEdit = async (
    commentId: string,
    isReply?: boolean,
    parentId?: string
  ) => {
    if (!editText.trim()) return;

    try {
      if (isReply && parentId) {
        await updateReply(commentId, editText.trim());
      } else {
        await updateComment(commentId, editText.trim());
      }

      setEditingId(null);
      setEditText("");
      toast.success("Comment updated!");
    } catch (err) {
      toast.error("Failed to update comment!");
    }
  };

  const handleDelete = async (
    commentId: string,
    isReply?: boolean,
    parentId?: string
  ) => {
    try {
      if (isReply && parentId) {
        await deleteReply(commentId);
      } else {
        await deleteComment(commentId);
      }

      toast.success("Comment deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment. Please try again.");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
    setReplyingTo(null);
  };

  function timeAgo(timestamp) {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) return "Just Now";
    if (diffInSeconds == 60) return "1 minute ago";
    if (diffInSeconds < 3600 && diffInSeconds > 60)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  const renderReply = (reply: Comment, parentId: number) => (
    <div key={reply._id} className="flex gap-2 mt-2 ml-4">
      <CornerDownRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={isProfileAllowed ? reply.userID.profileImage : ""} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {reply?.userID?.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-xs">
                {reply?.userID?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(reply.createdAt)}
              </span>
            </div>
            {reply?.userID?.name === userStudent?.name &&
              editingId !== reply._id && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => startEdit(reply)}
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(reply._id, true, parentId)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              )}
          </div>

          {editingId === reply._id ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="resize-none text-xs"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleEdit(reply._id, true, parentId)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{reply.text}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderComment = (comment: Comment) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment._id);
    const replyCount = comment.replies?.length || 0;

    return (
      <div key={comment._id} className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={isProfileAllowed ? comment?.userID?.profileImage : ""}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {comment?.userID?.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">
                  {comment?.userID?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(comment?.createdAt)}
                </span>
              </div>
              {comment?.userID?.name === userStudent?.name &&
                editingId !== comment._id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => startEdit(comment)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(comment._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
            </div>

            {editingId === comment._id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7"
                    onClick={() => handleEdit(comment._id)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{comment.text}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-1">
            {editingId !== comment._id && isStudentAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setReplyingTo(
                    replyingTo === comment._id ? null : comment._id
                  );
                  setReplyText("");
                  setEditingId(null);
                }}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {/* View Replies Button */}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => toggleReplies(comment._id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    View {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment._id && (
            <div className="mt-2 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="resize-none text-sm flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  className="h-7"
                  onClick={() => handleReply(comment._id)}
                  disabled={!replyText.trim()}
                >
                  {replyLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Collapsible Replies */}
          {hasReplies && (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleReplies(comment._id)}
            >
              <CollapsibleContent className="space-y-1">
                {comment.replies?.map((reply) =>
                  renderReply(reply, comment._id)
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Events
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Discover opportunities to participate in school activities, develop
            leadership skills, and earn Savannah points.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {isTrimesterEnded ? (
          <div className="p-8 rounded-lg border border-warning/50 bg-warning/10 text-center max-w-lg mx-auto">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warning mb-2">
              Trimester Ended
            </h3>
            <p className="text-muted-foreground">
              The current trimester has ended. All events are unavailable until
              a new trimester begins. Please check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
              <SearchInput
                placeholder="Search events..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                containerClassName="w-full max-w-md"
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden bg-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{event.category}</Badge>
                        {event.isApplicationEnded && (
                          <Badge
                            variant="outline"
                            className="border-warning/50 text-warning bg-warning/10 gap-1"
                          >
                            <Ban className="h-3 w-3" />
                            Applications Closed
                          </Badge>
                        )}
                        {event.isCompleted && (
                          <Badge
                            variant="outline"
                            className="border-success/50 text-success bg-success/10 gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium whitespace-nowrap">
                        +{event.tokenValue} Savannah
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mt-2">
                      {event.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {event?.isPostedByAStudent
                            ? event?.isAnonymousStudent
                              ? "Student"
                              : event?.postedByOther !== null
                              ? event?.postedByOther
                              : event?.postedBy?.name
                            : "Leadership Center"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.proposedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.applicants.length}
                            {event.maxApplicants
                              ? `/${event.maxApplicants} registered`
                              : ""}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenComments(event)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer font-medium text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{event.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    {event.isCompleted ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-success/50 text-success bg-success/5"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Event Completed
                      </Badge>
                    ) : event.applicants?.some(
                        (a) =>
                          a.studentID?._id?.toString() ===
                          userStudent?._id?.toString()
                      ) ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-primary/50 text-primary bg-primary/5"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Applied
                      </Badge>
                    ) : event.isApplicationEnded ||
                      (event.maxApplicants > 0 &&
                        event.applicants.length >= event.maxApplicants) ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-warning/30 text-warning bg-warning/5"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {event.maxApplicants > 0 &&
                        event.applicants.length >= event.maxApplicants
                          ? "No Spots Available"
                          : "Applications Closed"}
                      </Badge>
                    ) : isStudentAuthenticated ? (
                      <Button
                        onClick={() => handleApply(event)}
                        className="w-full"
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to="/login">Sign In to Apply</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <CalendarX className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Events Found
                </h3>
                {(searchQuery !== "" || selectedCategory !== "All") && (
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any events matching your criteria. Try
                    adjusting your search or filter settings.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onOpenChange={setApplicationDialogOpen}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg pr-6">
              Apply for {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Fill out the requirements below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[55vh] pr-4 -mr-4">
            <div className="space-y-4 py-2 px-1">
              {eventRequirements &&
                eventRequirements.length > 0 &&
                eventRequirements.map((req, idx) => {
                  const wordCount = countWords(answers[idx] || "");
                  const hasError = errors[idx];
                  const isImageType = req.type === "image";

                  return (
                    <div key={idx} className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        {isImageType && (
                          <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="line-clamp-2">{req.name}</span>
                      </Label>

                      {isImageType ? (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => {
                              fileInputRefs.current[idx] = el;
                            }}
                            onChange={(e) =>
                              handleImageUpload(
                                idx,
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                          />

                          {imagePreviews[idx] ? (
                            <div className="relative">
                              <img
                                src={imagePreviews[idx]}
                                alt="Preview"
                                className="w-full h-32 sm:h-40 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-2 right-2 text-xs"
                                onClick={() =>
                                  fileInputRefs.current[idx]?.click()
                                }
                              >
                                Change
                              </Button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                fileInputRefs.current[idx]?.click()
                              }
                              className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                            >
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Click to upload
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Max 10MB
                              </p>
                            </div>
                          )}
                        </div>
                      ) : req.maxWord && req.maxWord > 10 ? (
                        <Textarea
                          placeholder="Enter your answer..."
                          value={answers[idx] || ""}
                          onChange={(e) =>
                            handleAnswerChange(idx, e.target.value, req.maxWord)
                          }
                          rows={req.maxWord > 100 ? 4 : 3}
                          className={`text-sm ${
                            hasError
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                        />
                      ) : (
                        <Input
                          placeholder="Enter your answer..."
                          value={answers[idx] || ""}
                          onChange={(e) =>
                            handleAnswerChange(idx, e.target.value, req.maxWord)
                          }
                          className={`text-sm ${
                            hasError
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                        />
                      )}

                      {!isImageType && (
                        <div className="flex items-center justify-between">
                          {req.maxWord && (
                            <p
                              className={`text-xs ${
                                hasError
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {hasError
                                ? errors[idx]
                                : `${wordCount}/${req.maxWord}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setApplicationDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              className="w-full sm:w-auto"
            >
              {applyLoading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Comments
            </DialogTitle>
            <DialogDescription className="line-clamp-1">
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable comments area */}
          <div
            ref={modalContentRef} // <-- scrollable div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          >
            {selectedEvent?.comments?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-medium">
                  No comments yet.
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  Be the first to start the conversation!
                </p>
              </div>
            ) : (
              selectedEvent?.comments?.map((comment) => renderComment(comment))
            )}
          </div>

          {/* Comment input */}
          <div className="p-4 bg-background border-t">
            <div className="flex gap-2 items-center">
              <Avatar className="h-8 w-8 hidden sm:flex">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {userStudent?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder={
                    isStudentAuthenticated
                      ? "Write a comment..."
                      : "Sign in to comment"
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isStudentAuthenticated}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  className="flex-1 bg-muted/50 border-none focus-visible:ring-1"
                />
                <Button
                  size="icon"
                  onClick={handleSubmitComment}
                  disabled={!isStudentAuthenticated || !newComment.trim()}
                  className="shrink-0"
                >
                  {commentLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {!isStudentAuthenticated && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                You must be logged in to participate.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for events without requirements */}
      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply for "{selectedEvent?.title}"? This
              action will register you for the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedEvent) {
                  handleSubmitApplication(selectedEvent.id);
                  toast.success(
                    `Successfully applied to "${selectedEvent.title}"!`
                  );
                  setSelectedEvent(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
