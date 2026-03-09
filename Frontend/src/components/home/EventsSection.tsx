import { useState, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Ban,
} from "lucide-react";
import { useGsapFadeIn, useGsapStagger } from "@/hooks/useGsapAnimations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Hooks & Context
import { usePublicData } from "@/contexts/PublicDataContext";
import { useAuth } from "@/contexts/AuthContext";

// Helper for Base64 (Matching Events.tsx logic)
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function EventsSection() {
  const headerRef = useGsapFadeIn<HTMLDivElement>();
  const cardsRef = useGsapStagger<HTMLDivElement>(":scope > div", 0.15);
  const navigate = useNavigate();

  const { events, requirements, isTrimesterEnded, applyToEvent, applyLoading } =
    usePublicData();
  const { isStudentAuthenticated, userStudent } = useAuth();

  // Logic: Filter 3 closest valid future events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => {
        const eventDate = event.proposedDate
          ? new Date(event.proposedDate)
          : null;
        return (
          event.status !== "rejected" &&
          event.status !== "pending" &&
          !event.isFixed &&
          !event.isCompleted &&
          eventDate &&
          eventDate >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.proposedDate!).getTime() -
          new Date(b.proposedDate!).getTime()
      )
      .slice(0, 3);
  }, [events]);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const eventRequirements = useMemo(
    () =>
      requirements.filter(
        (req) =>
          req.eventID.toString() === selectedEvent?._id?.toString() &&
          req.isQuestion === true
      ),
    [requirements, selectedEvent]
  );

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<number, File | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>(
    {}
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleApplyClick = (event: any) => {
    if (!isStudentAuthenticated) {
      toast.info("Please sign in to apply for events");
      navigate("/login");
      return;
    }

    const eventReqs = requirements.filter(
      (req) => req.eventID.toString() === event._id.toString()
    );

    setSelectedEvent(event);
    setAnswers({});
    setErrors({});
    setImageFiles({});
    setImagePreviews({});

    if (eventReqs.length > 0) {
      setApplyModalOpen(true);
      setConfirmModalOpen(false);
    } else {
      setConfirmModalOpen(true);
      setApplyModalOpen(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedEvent) return;

    if (eventRequirements.length > 0) {
      const allAnswered = eventRequirements.every((req, idx) => {
        if (req.type === "image") return imageFiles[idx] != null;
        return answers[idx]?.trim();
      });

      if (!allAnswered) {
        toast.error("Please complete all requirements");
        return;
      }

      let hasWordErrors = false;
      eventRequirements.forEach((req, idx) => {
        if (req.maxWord && countWords(answers[idx] || "") > req.maxWord) {
          hasWordErrors = true;
          setErrors((prev) => ({
            ...prev,
            [idx]: `Exceeds maximum of ${req.maxWord} words`,
          }));
        }
      });

      if (hasWordErrors) {
        toast.error("Please fix word count errors before submitting");
        return;
      }
    }

    try {
      const requirementsFilled = await Promise.all(
        eventRequirements.map(async (req, idx) => ({
          requirementID: req._id,
          text: answers[idx] || null,
          image: imageFiles[idx] ? await toBase64(imageFiles[idx]!) : null,
        }))
      );

      await applyToEvent(selectedEvent._id, requirementsFilled);
      toast.success(`Successfully applied to "${selectedEvent.title}"!`);
      setApplyModalOpen(false);
      setConfirmModalOpen(false);
      setSelectedEvent(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to apply.");
    }
  };

  const hasUserApplied = (event: any) => {
    return event.applicants?.some(
      (a: any) => (a.studentID?._id || a.studentID || a) === userStudent?._id
    );
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover opportunities to participate and lead.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/events">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isTrimesterEnded ? (
          <div className="p-8 rounded-lg border border-warning/50 bg-warning/10 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warning">
              Trimester Ended
            </h3>
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {upcomingEvents.map((event) => {
              const applied = hasUserApplied(event);
              const isFull =
                event.maxApplicants > 0 &&
                event.applicants.length >= event.maxApplicants;
              const isClosed = event.isApplicationEnded || isFull;
              {
                event.maxApplicants > 0 &&
                event.applicants.length >= event.maxApplicants
                  ? "No Spots Available"
                  : "Applications Closed";
              }

              return (
                <Card
                  key={event._id}
                  className="group overflow-hidden bg-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary">
                        {event.category || "General"}
                      </Badge>
                      <div className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                        +{event.tokenValue || 0} Savannah
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-4 flex-grow">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.proposedDate
                            ? formatDate(event.proposedDate)
                            : "TBA"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location || "On Campus"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.applicants.length}
                          {event.maxApplicants
                            ? `/${event.maxApplicants} registered`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    {applied ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-primary/50 text-primary bg-primary/5"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Already Applied
                      </Badge>
                    ) : event.isCompleted ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-success/50 text-success bg-success/5"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Event Completed
                      </Badge>
                    ) : isClosed ? (
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2.5 border-warning/30 text-warning bg-warning/5"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {isFull ? "No Spots Available" : "Applications Closed"}
                      </Badge>
                    ) : isStudentAuthenticated ? (
                      <Button
                        onClick={() => handleApplyClick(event)}
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
              );
            })}
          </div>
        )}
      </div>

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
            <AlertDialogCancel onClick={() => setSelectedEvent(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitApplication}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            {eventRequirements.map((req, idx) => (
              <div key={idx} className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  {req.type === "image" && (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}{" "}
                  {req.name}
                </Label>
                {req.type === "image" ? (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => (fileInputRefs.current[idx] = el)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image must be less than 5MB");
                            return;
                          }
                          setImageFiles((prev) => ({ ...prev, [idx]: file }));
                          const reader = new FileReader();
                          reader.onload = (ev) =>
                            setImagePreviews((prev) => ({
                              ...prev,
                              [idx]: ev.target?.result as string,
                            }));
                          reader.readAsDataURL(file);
                        }
                      }}
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
                          onClick={() => fileInputRefs.current[idx]?.click()}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                          Click to upload
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {req.maxWord && req.maxWord > 10 ? (
                      <Textarea
                        placeholder="Enter your answer..."
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        className={
                          errors[idx]
                            ? "border-destructive focus-visible:ring-destructive text-sm min-h-[100px]"
                            : "text-sm min-h-[100px]"
                        }
                      />
                    ) : (
                      <Input
                        placeholder="Enter your answer..."
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        className={
                          errors[idx]
                            ? "border-destructive focus-visible:ring-destructive text-sm"
                            : "text-sm"
                        }
                      />
                    )}
                    {req.maxWord && (
                      <p
                        className={`text-[10px] text-left ${
                          errors[idx]
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {errors[idx]
                          ? errors[idx]
                          : `${countWords(answers[idx] || "")}/${
                              req.maxWord
                            } words`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApplyModalOpen(false);
                setSelectedEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={applyLoading}>
              {applyLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
