import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare, Send, Clock, CheckCircle, User, Calendar, ArrowRight, Inbox, AlertTriangle } from "lucide-react";

interface Feedback {
  id: number;
  studentName: string;
  studentGrade: string;
  subject: string;
  message: string;
  submittedDate: string;
  status: "pending" | "responded";
  response?: string;
  responseDate?: string;
}

const feedbackData: Feedback[] = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    studentGrade: "12",
    subject: "Token Distribution Query",
    message: "I participated in the Science Fair last month but haven't received my tokens yet. Could you please check on this?",
    submittedDate: "Jan 23, 2026",
    status: "responded",
    response: "Your tokens have been distributed. Please check your balance.",
    responseDate: "Jan 24, 2026",
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentGrade: "11",
    subject: "Event Application Issue",
    message: "I'm having trouble applying for the Community Meeting Presentation. The submit button doesn't seem to work.",
    submittedDate: "Jan 22, 2026",
    status: "responded",
    response: "Thank you for reporting this issue. We've fixed the bug and you should be able to apply now. Please try again and let us know if you face any more issues.",
    responseDate: "Jan 22, 2026",
  },
  {
    id: 3,
    studentName: "Emily Williams",
    studentGrade: "12",
    subject: "Leadership Level Clarification",
    message: "I'm confused about how my leadership level is calculated. Could you explain the criteria for moving from Silver to Gold?",
    submittedDate: "Jan 21, 2026",
    status: "responded",
    response: "Gold level requires 1000+ Savannah tokens. Keep participating in events!",
    responseDate: "Jan 22, 2026",
  },
  {
    id: 4,
    studentName: "Alex Thompson",
    studentGrade: "11",
    subject: "Event Suggestion",
    message: "I'd like to suggest organizing a coding bootcamp for beginners. Many students are interested in learning programming basics.",
    submittedDate: "Jan 20, 2026",
    status: "responded",
    response: "Great suggestion! We're actually planning a coding workshop for February. We'll keep you updated on the details.",
    responseDate: "Jan 21, 2026",
  },
  {
    id: 5,
    studentName: "Jessica Brown",
    studentGrade: "10",
    subject: "Account Access Problem",
    message: "I forgot my password and can't access my account. The reset link isn't working for me.",
    submittedDate: "Jan 19, 2026",
    status: "responded",
    response: "Your password has been reset. Please check your email for the new credentials.",
    responseDate: "Jan 20, 2026",
  },
];

export default function FeedbackManagement() {
  const [feedback] = useState<Feedback[]>(feedbackData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");
  const [isSending, setIsSending] = useState(false);

  const trimesterEnded = localStorage.getItem("trimesterEnded") === "true";

  const filteredFeedback = feedback.filter((f) => {
    const matchesSearch = 
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = feedback.filter((f) => f.status === "pending").length;
  const respondedCount = feedback.filter((f) => f.status === "responded").length;

  const handleOpenResponse = (item: Feedback) => {
    setSelectedFeedback(item);
    setResponseText(item.response || "");
    setDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response message");
      return;
    }
    
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Response sent to ${selectedFeedback?.studentName}`);
      setDialogOpen(false);
      setResponseText("");
      setSelectedFeedback(null);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Feedback Management</h2>
        <p className="text-muted-foreground">Read and respond to student feedback and inquiries.</p>
      </div>

      {trimesterEnded && (
        <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Trimester Ended</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Feedback management is unavailable until a new trimester begins.</p>
        </div>
      )}

      {!trimesterEnded && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Inbox className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{feedback.length}</p>
                    <p className="text-sm text-muted-foreground">Total Feedback</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{respondedCount}</p>
                    <p className="text-sm text-muted-foreground">Responded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <SearchInput
                  placeholder="Search by student name or subject..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  containerClassName="w-full"
                />
                <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    All <span className="hidden sm:inline ml-1">({feedback.length})</span>
                  </Button>
                  <Button
                    variant={filter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("pending")}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Pending <span className="hidden sm:inline ml-1">({pendingCount})</span>
                  </Button>
                  <Button
                    variant={filter === "responded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("responded")}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Done <span className="hidden sm:inline ml-1">({respondedCount})</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Student Feedback ({filteredFeedback.length})
              </CardTitle>
              <CardDescription>
                Click on a feedback item to view details and respond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 rounded-lg border bg-card hover:shadow-card transition-shadow cursor-pointer"
                      onClick={() => handleOpenResponse(item)}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.subject}</h4>
                            {item.status === "pending" ? (
                              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{item.studentName}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>{item.studentGrade}th</span>
                            <span>•</span>
                            <span>{item.submittedDate}</span>
                          </div>
                          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{item.message}</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto self-end text-xs sm:text-sm">
                          {item.status === "responded" ? "View" : "Respond"}
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFeedback.length === 0 && (
                    <div className="text-center py-12">
                      <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No feedback found matching your criteria</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* Response Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedFeedback?.subject}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedFeedback?.studentName} ({selectedFeedback?.studentGrade}th Grade)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedFeedback?.submittedDate}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Student Message */}
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Student Message</p>
              <p className="text-foreground">{selectedFeedback?.message}</p>
            </div>

            {/* Previous Response (if any) */}
            {selectedFeedback?.status === "responded" && selectedFeedback.response && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-success mb-2">
                  Your Response • {selectedFeedback.responseDate}
                </p>
                <p className="text-foreground">{selectedFeedback.response}</p>
              </div>
            )}

            {/* Response Input */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedFeedback?.status === "responded" ? "Update Response" : "Your Response"}
              </p>
              <Textarea
                placeholder="Write your response to the student..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendResponse} className="gap-2" disabled={isSending}>
              {isSending ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
