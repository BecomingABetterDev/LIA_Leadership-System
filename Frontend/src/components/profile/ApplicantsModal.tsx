import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Users,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { usePublicData } from "@/contexts/PublicDataContext";
interface RequirementAnswer {
  requirement: string;
  answer: string;
}

interface Applicant {
  id: number;
  name: string;
  avatar?: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
  answers?: RequirementAnswer[];
  rejectionReason?: string;
}

interface ApplicantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  applicants: Applicant[];
}

export function ApplicantsModal({
  open,
  onOpenChange,
  eventTitle,
  applicants: initialApplicants,
  eventID,
}: ApplicantsModalProps) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);

  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingApplicant, setRejectingApplicant] =
    useState<Applicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const {
    rejectApplicant,
    isRejectingApplicant,
    approveApplicant,
    isApprovingApplicant,
    isProfileAllowed,
    requirements,
  } = usePublicData();

  const [myRequirments, setMyRequirments] = useState([]);

  useEffect(() => {
    if (!selectedApplicant || !requirements) {
      setMyRequirments([]);
      return;
    }

    const filtered = requirements.filter((r) => {
      if (r.isQuestion) return false;

      const rStudentId =
        r.studentID?._id?.toString() || r.studentID?.toString();

      const selectedId =
        selectedApplicant?.studentID?._id?.toString() ||
        selectedApplicant?.studentID?.toString();

      return (
        rStudentId === selectedId &&
        r.eventID?.toString() === eventID?.toString()
      );
    });

    setMyRequirments(filtered);
  }, [selectedApplicant, requirements, eventID]);
  const handleApprove = async (applicantId: string, applicantName: string) => {
    setProcessingId(applicantId);
    try {
      await approveApplicant(applicantId, eventID);

      // Update local UI state immediately
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicantId ? { ...app, status: "approved" } : app
        )
      );

      toast.success(`${applicantName} has been approved!`);
    } catch (error) {
      toast.error("Failed to approve applicant");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (applicant: Applicant) => {
    setRejectingApplicant(applicant);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingApplicant) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectApplicant(rejectingApplicant._id, rejectionReason.trim());

      // Update local UI state immediately
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === rejectingApplicant._id
            ? {
                ...app,
                status: "rejected",
                rejectionReason: rejectionReason.trim(),
              }
            : app
        )
      );

      toast.error(`${rejectingApplicant.studentID.name} has been rejected.`);
      setRejectDialogOpen(false);
      setRejectingApplicant(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject applicant");
      console.error(error);
    }
  };

  const openDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDetailsOpen(true);
    console.log(applicant);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning text-warning-foreground gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const pendingCount = applicants.filter((a) => a.status === "pending").length;
  const approvedCount = applicants.filter(
    (a) => a.status === "approved"
  ).length;
  const rejectedCount = applicants.filter(
    (a) => a.status === "rejected"
  ).length;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Applicants
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {eventTitle}
            </DialogDescription>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="rounded-lg border bg-secondary/30 p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                {pendingCount}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">Pending</span>
              </div>
            </div>
            <div className="rounded-lg border bg-success/10 p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-success">
                {approvedCount}
              </div>
              <div className="text-[10px] sm:text-xs text-success flex items-center justify-center gap-1">
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">Approved</span>
              </div>
            </div>
            <div className="rounded-lg border bg-destructive/10 p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-destructive">
                {rejectedCount}
              </div>
              <div className="text-[10px] sm:text-xs text-destructive flex items-center justify-center gap-1">
                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">Rejected</span>
              </div>
            </div>
          </div>

          <Separator />

          <ScrollArea className="flex-1 min-h-0 pr-4 -mr-4">
            {applicants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No applicants yet</p>
                <p className="text-sm">
                  Applications will appear here once submitted
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-3 sm:py-4">
                {applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                  >
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20 shrink-0">
                        <AvatarImage
                          src={
                            isProfileAllowed
                              ? applicant.studentID.profileImage || ""
                              : ""
                          }
                          alt={applicant.studentID.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                          {applicant.studentID.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                          {applicant.studentID.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Applied {formatDate(applicant.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 sm:h-9 text-primary hover:text-primary hover:bg-primary/10 text-xs sm:text-sm"
                        onClick={() => openDetails(applicant)}
                      >
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                        Details
                      </Button>

                      {applicant.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 sm:h-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-xs sm:text-sm"
                            onClick={() => openRejectDialog(applicant)}
                          >
                            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 sm:h-9 bg-success hover:bg-success/90 text-success-foreground text-xs sm:text-sm"
                            onClick={() =>
                              handleApprove(
                                applicant._id,
                                applicant.studentID.name
                              )
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            {isApprovingApplicant &&
                            processingId === applicant._id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        </div>
                      ) : (
                        getStatusBadge(applicant.status)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Application Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Applicant Info Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage
                  src={
                    isProfileAllowed
                      ? selectedApplicant?.studentID.profileImage || ""
                      : ""
                  }
                  alt={selectedApplicant?.studentID.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {selectedApplicant?.studentID.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {selectedApplicant?.studentID.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Applied {formatDate(selectedApplicant?.createdAt)}
                </p>
              </div>
              {selectedApplicant && getStatusBadge(selectedApplicant.status)}
            </div>

            {/* Answers Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Requirement Answers
              </h4>
              {myRequirments && myRequirments.length > 0 ? (
                myRequirments.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {item.name}
                    </p>
                    {item.type === "image" ? (
                      <img
                        src={item.image}
                        alt="announcement"
                        className="max-w-full rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground mb-2">
                    No custom details found!
                  </p>
                </div>
              )}

              {selectedApplicant?.status === "rejected" &&
                selectedApplicant.rejectionReason && (
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <p className="text-sm font-medium text-destructive mb-2">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedApplicant.rejectionReason}
                    </p>
                  </div>
                )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{" "}
              {rejectingApplicant?.studentID.name}'s application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              {isRejectingApplicant ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
