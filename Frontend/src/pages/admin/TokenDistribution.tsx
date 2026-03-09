import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Award,
  Plus,
  Minus,
  X,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import CommunityMeetingEvaluation from "@/components/admin/CommunityMeetingEvaluation";
import EventTokenValuesCard from "@/components/admin/EventTokenValuesCard";
import { usePublicData } from "@/contexts/PublicDataContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TokenDistribution() {
  const { loadingDistribute, distributeTokensToStudent } = useAdmin();
  const { events, transactions, isTrimesterEnded } = usePublicData();
  const { students, fetchStudents } = useAuth();
  useEffect(() => {
    fetchStudents();
    console.log("distr", events, students);
  }, []);
  const filteredEvents = events.filter(
    (e) => e.isFixed === true || e.status === "approved"
  );

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bonusTokens, setBonusTokens] = useState("");
  const [decreaseTokens, setDecreaseTokens] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  const selectedEventData = filteredEvents.find(
    (e) => e._id.toString() === selectedEvent
  );
  const isStudentEvent = (selectedEventData as any)?.isPostedByAStudent;
  const organizerName = (selectedEventData as any)?.userID?.name;
  const baseTokens = selectedEventData?.tokenValue || 0;
  const bonus = parseInt(bonusTokens) || 0;
  const decrease = parseInt(decreaseTokens) || 0;

  // Calculate 10% limit
  const maxAdjustment = Math.floor(baseTokens * 0.1);
  const bonusExceeds = bonus > maxAdjustment && baseTokens > 0;
  const decreaseExceeds = decrease > maxAdjustment && baseTokens > 0;

  // Apply capped values
  const appliedBonus = Math.min(bonus, maxAdjustment);
  const appliedDecrease = Math.min(decrease, maxAdjustment);
  const totalTokens = Math.max(0, baseTokens + appliedBonus - appliedDecrease);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    }
  };

  const handleDistributeClick = () => {
    if (!selectedEvent || selectedStudents.length === 0) {
      toast.error("Please select an event and at least one student");
      return;
    }

    if (totalTokens <= 0) {
      toast.error("Total tokens must be greater than 0");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmDistribute = async () => {
    try {
      if (!selectedStudents.length) {
        toast.error("Please select at least one student.");
        return;
      }

      // Find organizer student if any
      const organizerStudent =
        isStudentEvent && organizerName
          ? students.find(
              (s) =>
                s.name === organizerName && selectedStudents.includes(s._id)
            )
          : null;

      const organizerExtra = organizerStudent
        ? Math.floor(baseTokens * 0.35)
        : 0;

      if (selectedStudents.length === 1) {
        // Single student
        const studentId = selectedStudents[0];
        await distributeTokensToStudent({
          studentId,
          amount:
            totalTokens +
            (organizerStudent?._id === studentId ? organizerExtra : 0),
          bonusGiven: appliedBonus,
          deductedMark: appliedDecrease,
          description: `Payment for event: ${selectedEventData?.title || ""}`,
        });

        toast.success(
          `${totalTokens} Savannah tokens distributed to ${
            students.find((s) => s._id === studentId)?.name
          }${
            organizerStudent?._id === studentId
              ? ` (+${organizerExtra} organizer bonus)`
              : ""
          }!`
        );
      } else {
        // Group distribution
        // Prepare amounts per student (add organizer bonus to him only)
        const amountPerStudent = selectedStudents.map((id) => ({
          studentId: id,
          amount:
            totalTokens + (organizerStudent?._id === id ? organizerExtra : 0),
        }));

        // Since backend expects single amount for all, we can do multiple requests or modify backend to accept individual amounts
        // For now, simplest is multiple calls per student
        for (const { studentId, amount } of amountPerStudent) {
          await distributeTokensToStudent({
            studentId,
            amount,
            bonusGiven: appliedBonus,
            deductedMark: appliedDecrease,
            description: `Payment for event: ${selectedEventData?.title || ""}`,
          });
        }

        toast.success(
          `${totalTokens} Savannah tokens distributed to ${
            selectedStudents.length
          } students${
            organizerStudent
              ? ` (${organizerName} received +${organizerExtra} organizer bonus)`
              : ""
          }!`
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to distribute tokens.");
      console.log(err);
    }
  };

  const getSelectedStudentNames = () => {
    return students
      .filter((s) => selectedStudents.includes(s._id))
      .map((s) => s.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Savannah Token Distribution
        </h2>
        <p className="text-muted-foreground">
          Assign Savannah tokens to students for event participation and
          evaluations.
        </p>
      </div>

      {isTrimesterEnded && (
        <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Trimester Ended</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Token distribution is unavailable. All data has been archived. Start
            a new trimester to resume operations.
          </p>
        </div>
      )}

      {!isTrimesterEnded && (
        <>
          {/* Community Meeting Evaluation Card - Premium Card */}
          <CommunityMeetingEvaluation />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Assign Tokens
                </CardTitle>
                <CardDescription>
                  Select an event and students to distribute tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Select Event */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    1. Select Event
                  </Label>
                  <Popover open={eventOpen} onOpenChange={setEventOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={eventOpen}
                        className="w-full justify-between font-normal"
                      >
                        {selectedEventData
                          ? `${selectedEventData.title} (+${selectedEventData.tokenValue})`
                          : "Choose an event"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search events..." />
                        <CommandList>
                          <CommandEmpty>No event found.</CommandEmpty>
                          <CommandGroup>
                            {filteredEvents.map((event) => (
                              <CommandItem
                                className="group"
                                key={event._id}
                                value={event.title}
                                onSelect={() => {
                                  setSelectedEvent(event._id.toString());
                                  setEventOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedEvent === event._id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="flex-1">{event.title}</span>
                                <span className="text-muted-foreground ml-2 group-data-[selected=true]:text-accent-foreground">
                                  +{event.tokenValue}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedEventData && (
                    <p className="text-sm text-muted-foreground">
                      Base tokens:{" "}
                      <span className="font-medium text-foreground">
                        {selectedEventData.tokenValue}
                      </span>
                    </p>
                  )}
                  {isStudentEvent && organizerName && (
                    <Alert className="border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        <strong>Note:</strong>{" "}
                        <span className="font-semibold">{organizerName}</span>{" "}
                        (the organizer) will receive{" "}
                        <span className="font-bold text-primary">
                          35% additional
                        </span>{" "}
                        to the event's token value as an organizer bonus. Other
                        selected students will receive the standard token amount
                        only.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Step 2: Select Students (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      2. Select Students
                    </Label>
                    {selectedStudents.length > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {selectedStudents.length} selected
                      </Badge>
                    )}
                  </div>
                  <SearchInput
                    placeholder="Search students..."
                    value={studentSearch}
                    onValueChange={setStudentSearch}
                    containerClassName="mb-2"
                  />
                  <div className="border rounded-lg">
                    <div className="p-2 border-b bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all"
                          checked={
                            filteredStudents.length > 0 &&
                            selectedStudents.length === filteredStudents.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <Label
                          htmlFor="select-all"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Select All ({filteredStudents.length})
                        </Label>
                      </div>
                    </div>
                    <ScrollArea className="h-48">
                      {filteredStudents.map((student) => (
                        <div
                          key={student._id}
                          className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                            selectedStudents.includes(student._id)
                              ? "bg-primary/10"
                              : ""
                          }`}
                          onClick={() => handleStudentToggle(student._id)}
                        >
                          <Checkbox
                            checked={selectedStudents.includes(student._id)}
                            onCheckedChange={() =>
                              handleStudentToggle(student._id)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.grade}th Grade
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  {/* Selected Students Tags */}
                  {selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {getSelectedStudentNames().map((name, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const student = students.find(
                                (s) => s.name === name
                              );
                              if (student) handleStudentToggle(student._id);
                            }}
                            className="ml-1 hover:bg-muted rounded-sm p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 3: Token Adjustments */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    3. Token Adjustments (optional)
                  </Label>
                  {selectedEventData && (
                    <p className="text-xs text-muted-foreground">
                      Maximum adjustment allowed: ±{maxAdjustment} tokens (10%
                      of base score)
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bonus Tokens */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 text-success">
                        <Plus className="h-4 w-4" />
                        Bonus Tokens
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={bonusTokens}
                        onChange={(e) => setBonusTokens(e.target.value)}
                        className={`border-success/30 focus:border-success ${
                          bonusExceeds ? "border-destructive" : ""
                        }`}
                      />
                      {bonusExceeds && (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>Max: {maxAdjustment} (10%)</span>
                        </div>
                      )}
                    </div>

                    {/* Decrease Tokens */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 text-destructive">
                        <Minus className="h-4 w-4" />
                        Decrease Tokens
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={decreaseTokens}
                        onChange={(e) => setDecreaseTokens(e.target.value)}
                        className={`border-destructive/30 focus:border-destructive ${
                          decreaseExceeds ? "border-destructive" : ""
                        }`}
                      />
                      {decreaseExceeds && (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>Max: {maxAdjustment} (10%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEventData && (bonus > 0 || decrease > 0) && (
                    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">
                          Base tokens:
                        </span>
                        <span className="font-medium">{baseTokens}</span>
                      </div>
                      {bonus > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="text-success">Bonus (applied):</span>
                          <span className="font-medium text-success">
                            +{appliedBonus}
                          </span>
                        </div>
                      )}
                      {decrease > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="text-destructive">
                            Decrease (applied):
                          </span>
                          <span className="font-medium text-destructive">
                            -{appliedDecrease}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">
                          Final Savannah tokens:
                        </span>
                        <span className="font-bold text-primary">
                          {totalTokens}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                {selectedEvent && selectedStudents.length > 0 && (
                  <div
                    className={`p-4 rounded-lg border ${
                      totalTokens > baseTokens
                        ? "bg-success/10 border-success/20"
                        : totalTokens < baseTokens
                        ? "bg-warning/10 border-warning/20"
                        : "bg-primary/10 border-primary/20"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      Total tokens to distribute per student:
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        totalTokens > baseTokens
                          ? "text-success"
                          : totalTokens < baseTokens
                          ? "text-warning"
                          : "text-primary"
                      }`}
                    >
                      {totalTokens > 0 ? "+" : ""}
                      {totalTokens}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      to {selectedStudents.length} student
                      {selectedStudents.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleDistributeClick}
                  className="w-full"
                  size="lg"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {loadingDistribute ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Distribute Tokens"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Event Token Values Reference */}
            <EventTokenValuesCard events={filteredEvents} />
          </div>

          {/* Trimester Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Trimester Transactions
              </CardTitle>
              <CardDescription>
                All token distributions this trimester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx, index) => {
                  const total = tx.base + tx.bonus - tx.decrease;
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {tx.studentID.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary text-sm">
                            +{tx.amount}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tx.bonusGiven > 0 && (
                              <span className="text-[10px] flex items-center gap-0.5 text-success">
                                <ArrowUpRight className="h-2.5 w-2.5" />+
                                {tx.bonusGiven}
                              </span>
                            )}
                            {tx.deductedMark > 0 && (
                              <span className="text-[10px] flex items-center gap-0.5 text-destructive">
                                <ArrowDownRight className="h-2.5 w-2.5" />-
                                {tx.deductedMark}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Token Distribution</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Please review the distribution details:</p>
                <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium text-foreground">
                      {selectedEventData?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tokens per student:
                    </span>
                    <span className="font-bold text-primary">
                      +{totalTokens}
                    </span>
                  </div>
                  {isStudentEvent &&
                    organizerName &&
                    selectedStudents.includes(
                      students.find((s) => s.name === organizerName)?._id || -1
                    ) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Organizer bonus ({organizerName}):
                        </span>
                        <span className="font-bold text-success">
                          +{Math.floor(baseTokens * 0.35)} (35%)
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="font-medium text-foreground">
                      {selectedStudents.length} student
                      {selectedStudents.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">
                      Students:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedStudentNames().map((name, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={`text-xs ${
                            name === organizerName && isStudentEvent
                              ? "border-success text-success"
                              : ""
                          }`}
                        >
                          {name}
                          {name === organizerName && isStudentEvent ? " ★" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDistribute}>
              {loadingDistribute ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Confirm Distribution"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
