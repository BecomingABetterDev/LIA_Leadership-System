import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  PartyPopper,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

interface Application {
  id: number;
  eventTitle: string;
  eventDate: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  organizer: string;
}

export default function ApplicationStatus() {
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const { events } = usePublicData();
  const { userStudent } = useAuth();

  const getOrganizerName = (event: any) => {
    if (event?.isAnonymousStudent) return "Student";
    if (event?.postedByOther) return event.postedByOther;
    return event?.postedBy?.name || "Unknown";
  };

  const applications = events
    .map((event) => {
      const applicant = event.applicants?.find(
        (a: any) => a.studentID?._id === userStudent?._id
      );

      if (!applicant) return null;

      return {
        id: applicant._id,
        eventTitle: event.title,
        eventDate: event.proposedDate,
        appliedDate: new Date(applicant.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: applicant.status,
        rejectionReason: applicant.rejectionReason,
        organizer: getOrganizerName(event),
      };
    })
    .filter(Boolean);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground">Approved</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  const approvedCount = applications.filter(
    (a) => a.status === "approved"
  ).length;
  const pendingCount = applications.filter(
    (a) => a.status === "pending"
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-12">
        <div className="container">
          <Button
            asChild
            variant="ghost"
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <Link to="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
            My Applications
          </h1>
          <p className="text-primary-foreground/80">
            Track the status of your event applications
          </p>
        </div>
      </div>

      <div className="container py-8">
        {localStorage.getItem("trimesterEnded") === "true" ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="py-10 text-center">
                <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-warning mb-1">
                  Trimester Ended
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applications are unavailable until a new trimester begins.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/profile">Back to Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-2 sm:p-4 text-center">
                  <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-success mx-auto mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold text-success">
                    {approvedCount}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Approved
                  </p>
                </CardContent>
              </Card>
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-2 sm:p-4 text-center">
                  <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-warning mx-auto mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold text-warning">
                    {pendingCount}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pending
                  </p>
                </CardContent>
              </Card>
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-2 sm:p-4 text-center">
                  <XCircle className="h-5 w-5 sm:h-8 sm:w-8 text-destructive mx-auto mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold text-destructive">
                    {rejectedCount}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Rejected
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application History</CardTitle>
                  <CardDescription>
                    Click on an application to view details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4 pb-2 pr-4">
                      {applications.map((application) => (
                        <button
                          key={application.id}
                          onClick={() => setSelectedApplication(application)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedApplication?.id === application.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusIcon(application.status)}
                              <h4 className="font-medium text-foreground text-sm sm:text-base">
                                {application.eventTitle}
                              </h4>
                              {getStatusBadge(application.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>{application.organizer}</p>
                              <p>Event: {application.eventDate}</p>
                              <p className="text-xs mt-1">
                                Applied: {application.appliedDate}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Details Panel */}
              <div>
                {selectedApplication ? (
                  selectedApplication.status === "approved" ? (
                    // Congratulations Card
                    <Card className="border-success/30 bg-gradient-to-br from-success/5 to-success/10 overflow-hidden">
                      <CardContent className="p-8 text-center">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <PartyPopper className="h-48 w-48 text-success" />
                          </div>
                          <div className="relative z-10">
                            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                              <CheckCircle className="h-10 w-10 text-success" />
                            </div>
                            <h2 className="text-2xl font-bold text-success mb-2">
                              Congratulations! 🎉
                            </h2>
                            <p className="text-lg font-medium text-foreground mb-4">
                              Your application has been approved!
                            </p>
                            <Card className="bg-card/80 backdrop-blur">
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-foreground mb-2">
                                  {selectedApplication.eventTitle}
                                </h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>
                                    Organizer: {selectedApplication.organizer}
                                  </p>
                                  <p>
                                    Event Date: {selectedApplication.eventDate}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            <p className="text-muted-foreground mt-6 text-sm">
                              Please check your email for further details and
                              instructions about the event.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedApplication.status === "rejected" ? (
                    // Rejection Card
                    <Card className="border-destructive/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-destructive" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-destructive">
                              Application Rejected
                            </CardTitle>
                            <CardDescription>
                              {selectedApplication.eventTitle}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            Organizer
                          </p>
                          <p className="font-medium">
                            {selectedApplication.organizer}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            Event Date
                          </p>
                          <p className="font-medium">
                            {selectedApplication.eventDate}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm font-medium text-destructive">
                              Reason for Rejection
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedApplication.rejectionReason ||
                              "No specific reason was provided."}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center pt-4">
                          Don't be discouraged! There are many other events you
                          can apply for.
                        </p>
                        <Button asChild className="w-full">
                          <Link to="/events">Browse Other Events</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    // Pending Card
                    <Card className="border-warning/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-warning" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-warning">
                              Pending Review
                            </CardTitle>
                            <CardDescription>
                              {selectedApplication.eventTitle}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            Organizer
                          </p>
                          <p className="font-medium">
                            {selectedApplication.organizer}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            Event Date
                          </p>
                          <p className="font-medium">
                            {selectedApplication.eventDate}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                          <p className="text-sm text-muted-foreground">
                            Your application is currently being reviewed by the
                            organizers. You will be notified once a decision has
                            been made.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-16">
                      <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an application to view its details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
