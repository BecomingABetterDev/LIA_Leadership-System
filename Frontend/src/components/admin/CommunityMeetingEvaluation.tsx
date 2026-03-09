import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ClipboardList,
  Users,
  User,
  Plus,
  Minus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { usePublicData } from "@/contexts/PublicDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";

// Rating levels with their percentage values
const RATING_LEVELS = [
  {
    value: "excellent",
    label: "Excellent",
    percentage: 100,
    color: "text-success bg-success/10 border-success/30",
  },
  {
    value: "very_good",
    label: "Very Good",
    percentage: 85,
    color: "text-primary bg-primary/10 border-primary/30",
  },
  {
    value: "good",
    label: "Good",
    percentage: 70,
    color: "text-warning bg-warning/10 border-warning/30",
  },
  {
    value: "needs_improvement",
    label: "Needs Improvement",
    percentage: 50,
    color: "text-destructive bg-destructive/10 border-destructive/30",
  },
] as const;

type RatingValue = (typeof RATING_LEVELS)[number]["value"];

interface Group {
  id: number;
  name: string;
  memberIds: number[];
}

const groupCriteria = [
  {
    id: "presentation_type",
    category: "Skills & Organization",
    label:
      "The type of presentation is appropriate for the topic and the audience",
  },
  {
    id: "logical_sequence",
    category: "Skills & Organization",
    label: "Information is presented in a logical sequence",
  },
  {
    id: "powerpoint_quality",
    category: "Skills & Organization",
    label:
      "The PowerPoint is neat, easy to understand, and includes clear pictures and graphics",
  },
  {
    id: "accurate_info",
    category: "Skills & Organization",
    label: "Presentation contains appropriate and accurate information",
  },
  {
    id: "well_researched",
    category: "Content",
    label: "Well-researched content",
  },
  {
    id: "relevant_examples",
    category: "Content",
    label: "Relevant and interesting examples that support the main topic",
  },
  {
    id: "topic_organization",
    category: "Content",
    label: "Topic elements are clearly organized and well placed",
  },
  {
    id: "creative_presentation",
    category: "Presentation Style & Body Language",
    label: "Creative way of presenting",
  },
];

const individualCriteria = [
  {
    id: "clear_structure",
    category: "Organization",
    label: "The speaker has a clear beginning, middle, and ending",
  },
  {
    id: "time_usage",
    category: "Use of Time",
    label: "The presenter uses time effectively",
  },
  {
    id: "eye_contact",
    category: "Presentation Style & Body Language",
    label: "Speaker maintains good eye contact with the audience",
  },
  {
    id: "voice_clarity",
    category: "Presentation Style & Body Language",
    label: "Voice audibility and tone are clear",
  },
  {
    id: "creative_style",
    category: "Presentation Style & Body Language",
    label: "Creative way of presenting",
  },
  {
    id: "body_language",
    category: "Presentation Style & Body Language",
    label: "Body language (confidence, standing position, posture)",
  },
];

type RatingState = Record<string, RatingValue>;
type IndividualRatingsState = Record<string, Record<string, RatingValue>>;
const calculateScoreFromRatings = (
  ratings: Record<string, RatingValue>,
  criteriaCount: number
): number => {
  if (criteriaCount === 0) return 0;
  const totalPercentage = Object.values(ratings).reduce((sum, rating) => {
    const level = RATING_LEVELS.find((r) => r.value === rating);
    return sum + (level?.percentage || 0);
  }, 0);
  // Returns the average percentage across all criteria
  return Math.round((totalPercentage / (criteriaCount * 100)) * 100);
};

const getPerformanceLevel = (
  percentage: number
): { label: string; color: string } => {
  if (percentage >= 90) return { label: "Excellent", color: "text-success" };
  if (percentage >= 75) return { label: "Very Good", color: "text-primary" };
  if (percentage >= 60) return { label: "Good", color: "text-warning" };
  return { label: "Needs Improvement", color: "text-destructive" };
};

export default function CommunityMeetingEvaluation() {
  const [activeTab, setActiveTab] = useState("group");

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<number | null>(
    null
  );
  const { students } = useAuth();
  const {
    cmGroups,
    distributeTokensToStudent,
    loadingDistribute,
    fetchCMGroups,
    loadingCMGroups,
    createCMGroup,
    loadingCreateGroup,
    updateCMGroup,
    loadingUpdateGroup,
    deleteCMGroup,
    loadingDeleteGroup,
  } = useAdmin();
  const groups = cmGroups;
  useEffect(() => {
    fetchCMGroups();
  }, []);
  // Group assessment state
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupRatings, setGroupRatings] = useState<RatingState>({});

  // Group token adjustments (bonus/decrease)
  const [groupBonusTokens, setGroupBonusTokens] = useState("");
  const [groupDecreaseTokens, setGroupDecreaseTokens] = useState("");

  // Individual assessment state - now tracks per-student ratings
  const [individualRatings, setIndividualRatings] =
    useState<IndividualRatingsState>({});
  const [currentStudent, setCurrentStudent] = useState<number | null>(null);

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Get selected group data
  const selectedGroupData = groups.find(
    (g) => g._id.toString() === selectedGroup
  );
  const groupMembers = selectedGroupData?.students;

  // Token calculation - fetch Community Meeting base from Evaluation Settings
  const { events } = usePublicData();
  const communityMeeting = events.find((e) => e.title === "Community Meeting");

  const communityMeetingBaseTokens = communityMeeting?.tokenValue || 0;

  // Token pools - split CM into two equal parts (50% each)
  const groupTokenPool = communityMeetingBaseTokens * 0.5;
  const individualTokenPool = communityMeetingBaseTokens * 0.5;

  // Group bonus/decrease calculations with 10% cap
  const maxGroupAdjustment = Math.floor(communityMeetingBaseTokens * 0.1);
  const groupBonus = parseInt(groupBonusTokens) || 0;
  const groupDecrease = parseInt(groupDecreaseTokens) || 0;
  const groupBonusExceeds =
    groupBonus > maxGroupAdjustment && communityMeetingBaseTokens > 0;
  const groupDecreaseExceeds =
    groupDecrease > maxGroupAdjustment && communityMeetingBaseTokens > 0;
  const appliedGroupBonus = Math.min(groupBonus, maxGroupAdjustment);
  const appliedGroupDecrease = Math.min(groupDecrease, maxGroupAdjustment);

  // Group score calculations
  const groupScorePercentage = calculateScoreFromRatings(
    groupRatings,
    groupCriteria.length
  );
  const groupPerformance = getPerformanceLevel(groupScorePercentage);
  const isGroupComplete =
    Object.keys(groupRatings).length === groupCriteria.length;

  // Check if all individual assessments are complete
  const areAllIndividualsComplete = selectedGroupData
    ? selectedGroupData.students.every((member) => {
        const memberRatings = individualRatings[member._id] || {};
        return Object.keys(memberRatings).length === individualCriteria.length;
      })
    : false;

  // Get individual score for a specific student
  const getIndividualScore = (studentId: number): number => {
    const ratings = individualRatings[studentId] || {};
    return calculateScoreFromRatings(ratings, individualCriteria.length);
  };

  // Calculate final tokens for a student
  // Formula: Final Student Tokens = Group Tokens Earned + Individual Tokens Earned + Group Bonus - Group Decrease
  // Group Tokens Earned = Group Token Pool × Group Performance Percentage
  // Individual Tokens Earned = Individual Token Pool × Individual Performance Percentage
  const calculateFinalTokens = (studentId: number): number => {
    const groupPercentage = groupScorePercentage / 100; // Convert to decimal (0-1)
    const individualPercentage = getIndividualScore(studentId) / 100; // Convert to decimal (0-1)

    // Group tokens earned = Group Token Pool × Group Performance %
    const groupTokensEarned = groupTokenPool * groupPercentage;

    // Individual tokens earned = Individual Token Pool × Individual Performance %
    const individualTokensEarned = individualTokenPool * individualPercentage;

    // Final tokens = Group Tokens + Individual Tokens + Bonus - Decrease (all applied to each group member)
    const baseTokens = groupTokensEarned + individualTokensEarned;
    return Math.max(
      0,
      Math.round(baseTokens + appliedGroupBonus - appliedGroupDecrease)
    );
  };

  // Group management functions
  const handleOpenGroupModal = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setNewGroupName(group.name);
      setSelectedMemberIds(group.students.map((student) => student._id));
    } else {
      setEditingGroup(null);
      setNewGroupName("");
      setSelectedMemberIds([]);
    }
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    const data = {
      name: newGroupName,
      studentIds: selectedMemberIds.map(String), // ensure IDs are strings if backend expects that
    };

    try {
      if (editingGroup) {
        await updateCMGroup(editingGroup._id.toString(), data);
        toast.success("Group updated successfully");
      } else {
        await createCMGroup(data);
        toast.success("Group created successfully");
      }
      setGroupModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteCMGroup(groupId);
      if (selectedGroup === groupId) {
        setSelectedGroup("");
        setGroupRatings({});
        setIndividualRatings({});
      }
      setDeleteGroupConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMemberToggle = (studentId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Rating functions
  const handleGroupRatingChange = (
    criterionId: string,
    rating: RatingValue
  ) => {
    setGroupRatings((prev) => ({ ...prev, [criterionId]: rating }));
  };

  const handleIndividualRatingChange = (
    studentId: number,
    criterionId: string,
    rating: RatingValue
  ) => {
    setIndividualRatings((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [criterionId]: rating,
      },
    }));
  };

  // Reset when group changes
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setGroupRatings({});
    setIndividualRatings({});
    setCurrentStudent(null);
    setGroupBonusTokens("");
    setGroupDecreaseTokens("");
  };

  // Submission
  const handleSubmit = () => {
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    if (!isGroupComplete) {
      toast.error("Please complete all group assessment criteria");
      return;
    }
    if (!areAllIndividualsComplete) {
      toast.error(
        "Please complete individual assessments for all group members"
      );
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmSubmit = async () => {
    const group = groups?.find((g) => g._id.toString() === selectedGroup);
    if (!group) return;

    try {
      for (const student of group.students) {
        await distributeTokensToStudent({
          studentId: student._id,
          amount: calculateFinalTokens(student._id),
          bonusGiven: Number(groupBonusTokens) || 0,
          deductedMark: Number(groupDecreaseTokens) || 0,
          description: "Community Meeting evaluation",
        });
      }

      toast.success(
        `Evaluation submitted! Tokens distributed to ${group.name}`,
        {
          description: group.students
            .map((s) => `${s.name}: +${calculateFinalTokens(s._id)}`)
            .join(", "),
        }
      );

      // Reset states
      setSelectedGroup("");
      setGroupRatings({});
      setIndividualRatings({});
      setCurrentStudent(null);
      setGroupBonusTokens("");
      setGroupDecreaseTokens("");
      setConfirmDialogOpen(false);
    } catch {
      toast.error("Failed to distribute tokens. Try again.");
    }
  };

  const renderRatingSelector = (
    criterionId: string,
    currentRating: RatingValue | undefined,
    onChange: (rating: RatingValue) => void
  ) => (
    <div className="flex flex-wrap gap-1.5">
      {RATING_LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => onChange(level.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
            currentRating === level.value
              ? level.color + " border-2"
              : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );

  const renderCriteriaSection = (
    criteria: typeof groupCriteria,
    ratings: Record<string, RatingValue>,
    onRatingChange: (criterionId: string, rating: RatingValue) => void
  ) => {
    const categories = [...new Set(criteria.map((c) => c.category))];

    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h4 className="font-semibold text-sm text-primary border-b pb-2">
              {category}
            </h4>
            {criteria
              .filter((c) => c.category === category)
              .map((criterion) => (
                <div
                  key={criterion.id}
                  className="p-3 rounded-lg bg-secondary/30 space-y-2"
                >
                  <p className="text-sm">{criterion.label}</p>
                  {renderRatingSelector(
                    criterion.id,
                    ratings[criterion.id],
                    (rating) => onRatingChange(criterion.id, rating)
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const renderScoreSummary = (percentage: number, label: string) => {
    const performance = getPerformanceLevel(percentage);
    return (
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{label}:</span>
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Performance Level:</span>
          <span className={`font-semibold ${performance.color}`}>
            {performance.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="p-4 sm:p-6">
          <div className="space-y-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              Community Meeting Evaluation
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Evaluate journals for groups and individuals
            </CardDescription>
            <Button
              onClick={() => handleOpenGroupModal()}
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {/* Group Selection */}
          <div className="space-y-4 mb-6">
            <Label className="text-base font-semibold">
              Select Group to Evaluate
            </Label>
            <div className="flex flex-col gap-2">
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => {
                    const members = group.students;
                    return (
                      <SelectItem key={group._id} value={group._id.toString()}>
                        <div className="flex flex-col">
                          <span>{group.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {members.map((m) => m.name).join(", ")}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedGroupData && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenGroupModal(selectedGroupData)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteGroupConfirm(selectedGroupData._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {selectedGroupData && (
              <div className="flex flex-wrap gap-1.5">
                {groupMembers?.map((member) => {
                  const memberRatings = individualRatings[member._id] || {};
                  const isComplete =
                    Object.keys(memberRatings).length ===
                    individualCriteria.length;
                  return (
                    <Badge
                      key={member._id}
                      variant={isComplete ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {isComplete && <CheckCircle2 className="h-3 w-3" />}
                      {member.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {selectedGroup && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-col w-full h-auto gap-1 mb-4 sm:mb-6 sm:flex-row sm:grid sm:grid-cols-2">
                <TabsTrigger
                  value="group"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm w-full justify-center"
                >
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Group Assessment
                  {isGroupComplete && (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm w-full justify-center"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Individual Assessment
                  {areAllIndividualsComplete && (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Group Assessment Tab */}
              <TabsContent value="group" className="space-y-6">
                {renderCriteriaSection(
                  groupCriteria,
                  groupRatings,
                  handleGroupRatingChange
                )}
                {renderScoreSummary(groupScorePercentage, "Group Score")}

                {/* Group Token Adjustments */}
                <div className="space-y-4 p-3 sm:p-4 rounded-lg border bg-card">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm sm:text-base font-semibold">
                      Group Token Adjustment
                    </Label>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Max adjustment allowed: ±{maxGroupAdjustment} tokens (10%
                      of base score)
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Bonus Tokens */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm flex items-center gap-2 text-success">
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Bonus Tokens
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter bonus tokens"
                        min="0"
                        value={groupBonusTokens}
                        onChange={(e) => setGroupBonusTokens(e.target.value)}
                        className={`border-success/30 focus:border-success ${
                          groupBonusExceeds ? "border-destructive" : ""
                        }`}
                      />
                      {groupBonusExceeds && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Max: {maxGroupAdjustment}
                        </div>
                      )}
                    </div>

                    {/* Decrease Tokens */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm flex items-center gap-2 text-destructive">
                        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Decrease Tokens
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter decrease tokens"
                        min="0"
                        value={groupDecreaseTokens}
                        onChange={(e) => setGroupDecreaseTokens(e.target.value)}
                        className={`border-destructive/30 focus:border-destructive ${
                          groupDecreaseExceeds ? "border-destructive" : ""
                        }`}
                      />
                      {groupDecreaseExceeds && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Max: {maxGroupAdjustment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adjustment Summary */}
                  {(groupBonus > 0 || groupDecrease > 0) && (
                    <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                      <p className="font-medium mb-2">
                        Adjustment applied to all group members:
                      </p>
                      {groupBonus > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="text-success">Bonus (applied):</span>
                          <span className="font-medium text-success">
                            +{appliedGroupBonus}
                          </span>
                        </div>
                      )}
                      {groupDecrease > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="text-destructive">
                            Decrease (applied):
                          </span>
                          <span className="font-medium text-destructive">
                            -{appliedGroupDecrease}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">
                          Net Adjustment:
                        </span>
                        <span
                          className={`font-bold ${
                            appliedGroupBonus - appliedGroupDecrease >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {appliedGroupBonus - appliedGroupDecrease >= 0
                            ? "+"
                            : ""}
                          {appliedGroupBonus - appliedGroupDecrease}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  This group score will contribute <strong>50%</strong> to each
                  member's final token value.
                  {(appliedGroupBonus > 0 || appliedGroupDecrease > 0) && (
                    <> Bonus/decrease tokens are also applied to all members.</>
                  )}
                </p>
              </TabsContent>

              {/* Individual Assessment Tab */}
              <TabsContent value="individual" className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Select Group Member
                  </Label>
                  <Select
                    value={currentStudent || ""}
                    onValueChange={(v) => setCurrentStudent(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student to evaluate" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupMembers?.map((member) => {
                        const memberRatings =
                          individualRatings[member._id] || {};
                        const isComplete =
                          Object.keys(memberRatings).length ===
                          individualCriteria.length;
                        const score = getIndividualScore(member._id);
                        return (
                          <SelectItem
                            key={member._id}
                            value={member?._id?.toString()}
                          >
                            <div className="flex items-center gap-2">
                              {isComplete && (
                                <CheckCircle2 className="h-3 w-3 text-success" />
                              )}
                              <span>{member.name}</span>
                              {isComplete && (
                                <span className="text-xs text-muted-foreground">
                                  ({score}%)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {currentStudent && (
                  <>
                    {renderCriteriaSection(
                      individualCriteria,
                      individualRatings[currentStudent] || {},
                      (criterionId, rating) =>
                        handleIndividualRatingChange(
                          currentStudent,
                          criterionId,
                          rating
                        )
                    )}
                    {renderScoreSummary(
                      getIndividualScore(currentStudent),
                      "Individual Score"
                    )}

                    {/* Final Token Preview */}
                    <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            Estimated Final Tokens
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Based on Community Meeting base:{" "}
                            {communityMeetingBaseTokens} tokens
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          +{calculateFinalTokens(currentStudent)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>
                            Group Pool ({groupTokenPool}) ×{" "}
                            {groupScorePercentage}%
                          </span>
                          <span className="font-medium">
                            +
                            {Math.round(
                              groupTokenPool * (groupScorePercentage / 100)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Individual Pool ({individualTokenPool}) ×{" "}
                            {getIndividualScore(currentStudent)}%
                          </span>
                          <span className="font-medium">
                            +
                            {Math.round(
                              individualTokenPool *
                                (getIndividualScore(currentStudent) / 100)
                            )}
                          </span>
                        </div>
                        {appliedGroupBonus > 0 && (
                          <div className="flex justify-between text-success">
                            <span>Group Bonus</span>
                            <span className="font-medium">
                              +{appliedGroupBonus}
                            </span>
                          </div>
                        )}
                        {appliedGroupDecrease > 0 && (
                          <div className="flex justify-between text-destructive">
                            <span>Group Decrease</span>
                            <span className="font-medium">
                              -{appliedGroupDecrease}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!currentStudent && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a group member above to evaluate</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Validation Messages */}
          {selectedGroup && (
            <div className="mt-6 space-y-2">
              {!isGroupComplete && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Group assessment is incomplete (
                  {Object.keys(groupRatings).length}/{groupCriteria.length}{" "}
                  criteria rated)
                </div>
              )}
              {!areAllIndividualsComplete && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {
                    groupMembers?.filter((m) => {
                      const ratings = individualRatings[m._id] || {};
                      return (
                        Object.keys(ratings).length < individualCriteria.length
                      );
                    }).length
                  }{" "}
                  member(s) need individual assessment
                </div>
              )}
            </div>
          )}

          {selectedGroup && (
            <Button
              onClick={handleSubmit}
              className="w-full mt-6"
              size="lg"
              disabled={!isGroupComplete || !areAllIndividualsComplete}
            >
              Submit All Evaluations
            </Button>
          )}

          {!selectedGroup && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a group above to begin evaluation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Management Modal */}
      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Create New Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update the group name and members"
                : "Add a name and select students for this group"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Select Members ({selectedMemberIds.length} selected)
              </Label>
              <ScrollArea className="h-48 border rounded-lg">
                {students?.map((student) => (
                  <div
                    key={student._id}
                    className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      selectedMemberIds.includes(student._id)
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleMemberToggle(student._id)}
                  >
                    <Checkbox
                      checked={selectedMemberIds.includes(student._id)}
                      onCheckedChange={() => handleMemberToggle(student._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Grade {student.grade} - Section {student.section}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>
              {loadingCreateGroup || loadingUpdateGroup ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : editingGroup ? (
                "Update Group"
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog
        open={deleteGroupConfirm !== null}
        onOpenChange={() => setDeleteGroupConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteGroupConfirm && handleDeleteGroup(deleteGroupConfirm)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingDeleteGroup ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submission Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Evaluation Submission</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Please review the evaluation summary:</p>
                <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group:</span>
                    <span className="font-medium text-foreground">
                      {selectedGroupData?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Score:</span>
                    <span className={`font-medium ${groupPerformance.color}`}>
                      {groupScorePercentage}% ({groupPerformance.label})
                    </span>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Token Distribution:
                    </p>
                    {groupMembers?.map((member) => {
                      const indScore = getIndividualScore(member._id);
                      const finalTokens = calculateFinalTokens(member._id);
                      return (
                        <div
                          key={member._id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {member.name} (Ind: {indScore}%)
                          </span>
                          <span className="font-bold text-primary">
                            +{finalTokens}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              {loadingDistribute ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Confirm Submission"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
