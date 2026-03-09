import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  Bell,
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  RequirementsBuilder,
  Requirement,
} from "@/components/profile/RequirementsBuilder";
import { usePublicData } from "@/contexts/PublicDataContext";

const categories = [
  "Presentation",
  "Exhibition",
  "Cultural",
  "Workshop",
  "Service",
  "Competition",
];

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Announcement Card Component
function AnnouncementCard({
  onPost,
}: {
  onPost: (postedBy: string, title: string, content: string) => void;
}) {
  const { isCreatingAnnouncement, createAnnouncement } = usePublicData();
  const [postedBy, setPostedBy] = useState<"leadership" | "other">(
    "leadership"
  );
  const [otherName, setOtherName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handlePostAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (postedBy === "other" && !otherName.trim()) {
      toast.error("Please enter the author name");
      return;
    }
    await onPost({
      postedBy: postedBy === "leadership" ? postedBy : otherName,
      title,
      content,
    });
    setTitle("");
    setContent("");
    setOtherName("");
    setPostedBy("leadership");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Post Announcement
        </CardTitle>
        <CardDescription>
          Create a new announcement visible to all students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Posted By</Label>
          <Select
            value={postedBy}
            onValueChange={(v: "leadership" | "other") => setPostedBy(v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="other">Other (specify)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {postedBy === "other" && (
          <div className="space-y-2">
            <Label>Author Name</Label>
            <Input
              placeholder="Enter the author's name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Announcement Title</Label>
          <Input
            placeholder="Enter announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            placeholder="Write your announcement..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <Button
          onClick={handlePostAnnouncement}
          disabled={isCreatingAnnouncement}
        >
          {isCreatingAnnouncement ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          {isCreatingAnnouncement ? "Publishing..." : "Publish Announcement"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Announcements Management Card
function AnnouncementsManagementCard() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { announcements, updateAnnouncement, deleteAnnouncement } =
    usePublicData();

  const handleEdit = (a: (typeof announcements)[0]) => {
    setEditingId(a._id);
    setEditTitle(a.title);
    setEditContent(a.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    await updateAnnouncement(editingId, {
      title: editTitle,
      content: editContent,
    });

    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    await deleteAnnouncement(deleteConfirmId);

    setDeleteConfirmId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Manage Announcements
        </CardTitle>
        <CardDescription>Edit or remove existing announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a._id} className="p-4 rounded-lg border bg-card">
              {editingId === a._id ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    placeholder="Content"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {a.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{formatDate(a.createdAt)}</span>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        {a.postedBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(a)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      onClick={() => setDeleteConfirmId(a._id)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Announcement?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The announcement will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface PendingEvent {
  id: number;
  title: string;
  submittedBy: string;
  date: string;
  location: string;
  description: string;
  eventPlan: string;
  requestedTokens: number;
  requirements: {
    label: string;
    maxWordCount: number;
    type?: "text" | "image";
  }[];
  submittedDate: string;
}

export default function EventsAndApprovals() {
  const {
    events,
    announcements,

    createLeadershipEvent,
    approveEvent,
    rejectEvent,

    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,

    isCreatingLeadershipEvent,
    isApprovingEvent,
    isRejectingEvent,

    isCreatingAnnouncement,
    isUpdatingAnnouncement,
    isDeletingAnnouncement,
    isTrimesterEnded,
  } = usePublicData();
  const [activeTab, setActiveTab] = useState("approvals");
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [eventToReject, setEventToReject] = useState<PendingEvent | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [eventCategory, setEventCategory] = useState("");
  const [eventStatuses, setEventStatuses] = useState<
    Record<number, "pending" | "approved" | "rejected">
  >({});
  {
  }

  const pendingEvents = events.filter(
    (e) => e?.isPostedByAStudent && e?.status === "pending"
  );

  const [loadingEventId, setLoadingEventId] = useState<number | null>(null);

  const handleApprove = async (event: any) => {
    try {
      setLoadingEventId(event._id);

      await approveEvent(
        event._id,
        (event.tokenValue * 0.03).toFixed(2) || 0,
        0,
        0,
        "Event approved"
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleOpenRejection = (event: PendingEvent) => {
    setEventToReject(event);
    setRejectionReason("");
    setRejectionDialogOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (eventToReject) {
      await rejectEvent(eventToReject._id, rejectionReason);
    }

    setRejectionDialogOpen(false);
    setEventToReject(null);
    setRejectionReason("");
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tokenValue, setTokenValue] = useState(0);
  const [maxApplicants, setMaxApplicants] = useState<number | undefined>();
  const [proposedDate, setProposedDate] = useState("");

  const handleCreateEvent = async () => {
    if (!eventCategory) {
      toast.error("Please select a category");
      return;
    }

    await createLeadershipEvent(
      {
        title,
        description,
        tokenValue,
        eventCategory,
        proposedDate,
        maxApplicants,
        location,
      },
      requirements
    );
  };

  const trimesterEnded = isTrimesterEnded;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Events & Approvals
        </h2>
        <p className="text-muted-foreground">
          Manage events, announcements, and student submissions.
        </p>
      </div>

      {trimesterEnded ? (
        <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
          <div className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Trimester Ended</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Events & approvals are unavailable until a new trimester begins.
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2">
              <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-3">
                <TabsTrigger
                  value="approvals"
                  className="gap-2 whitespace-nowrap"
                >
                  <FileCheck className="h-4 w-4" />
                  Approvals
                </TabsTrigger>
                <TabsTrigger
                  value="create-event"
                  className="gap-2 whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4" />
                  {isCreatingLeadershipEvent ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Create Event"
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="announcements"
                  className="gap-2 whitespace-nowrap"
                >
                  <Bell className="h-4 w-4" />
                  Announcements
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
          </div>

          {/* Pending Approvals */}
          <TabsContent value="approvals" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Student Events ({pendingEvents.length})
                </CardTitle>
                <CardDescription>
                  Review and approve student-submitted events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEvents.map((event) => {
                    const status = event.status;
                    return (
                      <div
                        key={event._id}
                        className="p-4 rounded-lg border bg-card hover:shadow-card transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">
                                {event.title}
                              </h4>
                              {status === "pending" && (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                              {status === "approved" && (
                                <Badge className="bg-success text-success-foreground">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                              {status === "rejected" && (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejected
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <User className="h-4 w-4" />
                              <span>Submitted by {event?.postedBy?.name}</span>
                              <span>•</span>
                              <span>{formatDate(event?.createdAt)}</span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Event Date:{" "}
                                <span className="font-medium text-foreground">
                                  {event.proposedDate}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                Requested Savannah:{" "}
                                <span className="font-medium text-primary">
                                  {event.tokenValue}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full lg:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full lg:w-auto"
                              onClick={() => {
                                setSelectedEvent(event);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90 w-full lg:w-auto"
                                  onClick={() => handleApprove(event)}
                                  disabled={loadingEventId === event._id}
                                >
                                  {loadingEventId === event._id ? (
                                    <div className="h-4 w-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-full lg:w-auto"
                                  onClick={() => handleOpenRejection(event)}
                                >
                                  {isRejectingEvent ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    "Reject"
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Leadership Event */}
          <TabsContent value="create-event" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Leadership Event
                </CardTitle>
                <CardDescription>
                  Create an official event that will appear on the public events
                  page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Savannah Value</Label>
                    <Input
                      value={tokenValue}
                      onChange={(e) => setTokenValue(e.target.value)}
                      type="number"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Max Applicants{" "}
                      <span className="text-muted-foreground font-normal">
                        (leave empty for unlimited)
                      </span>
                    </Label>
                    <Input
                      value={maxApplicants}
                      onChange={(e) => setMaxApplicants(e.target.value)}
                      type="number"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={eventCategory}
                      onValueChange={setEventCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Application Requirements
                  </Label>
                  <RequirementsBuilder
                    requirements={requirements}
                    onChange={setRequirements}
                  />
                </div>

                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreatingLeadershipEvent}
                >
                  {isCreatingLeadershipEvent ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isCreatingLeadershipEvent ? "Creating..." : "Create Event"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Announcement */}
          <TabsContent value="announcements" className="mt-6 space-y-6">
            <AnnouncementCard
              onPost={(data: {
                postedBy: string;
                title: string;
                content: string;
              }) => createAnnouncement(data)}
            />{" "}
            <AnnouncementsManagementCard />
          </TabsContent>
        </Tabs>
      )}

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Submitted by {selectedEvent?.postedBy?.name} on{" "}
              {formatDate(selectedEvent?.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedEvent?.description}</p>
              </div>
              {selectedEvent?.eventPlan && (
                <div>
                  <Label className="text-muted-foreground">
                    Event Plan & Goals
                  </Label>
                  <p className="mt-1 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                    {selectedEvent.eventPlan}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Event Date</Label>
                  <p className="mt-1 font-medium">{selectedEvent?.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="mt-1 font-medium">
                    {selectedEvent?.location || "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Requested Savannah
                </Label>
                <p className="mt-1 font-medium text-primary">
                  {selectedEvent?.tokenValue}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Application Requirements (
                  {selectedEvent?.requirements?.length || 0})
                </Label>
                {selectedEvent?.requirements &&
                selectedEvent.requirements.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEvent.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-secondary/50 border"
                      >
                        <div className="flex items-center gap-2">
                          {req.type === "image" ? (
                            <ImageIcon className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">
                            {req.label}
                          </span>
                        </div>
                        {req.type !== "image" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Max {req.maxWordCount} words{" "}
                            {req.maxWordCount > 10 ? "(textarea)" : "(input)"}
                          </p>
                        )}
                        {req.type === "image" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Image upload required
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No specific requirements
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedEvent) handleOpenRejection(selectedEvent);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => {
                if (selectedEvent) handleApprove(selectedEvent);
                setDialogOpen(false);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Event
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{eventToReject?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Rejection</Label>
              <Textarea
                placeholder="Explain why this event is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to the student in their profile.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={isRejectingEvent}
            >
              {isRejectingEvent ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
