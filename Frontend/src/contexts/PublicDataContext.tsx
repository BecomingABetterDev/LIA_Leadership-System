import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

/* ================= TYPES ================= */

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  author: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  proposedDate?: string;
  maxApplicants?: number;
  status?: string;
  isCompleted?: boolean;
  isApplicationEnded?: boolean;
  comments?: any[];
  views?: number;
  applicants?: any[];
}

export interface EvaluationGrade {
  _id: string;
  studentName: string;
  grade: string;
  course: string;
  date: string;
}

interface RequirementFilled {
  requirementID: string;
  text?: string;
  image?: string;
}

interface ProviderProps {
  children: ReactNode;
}

interface PublicDataContextType {
  announcements: Announcement[];
  events: Event[];
  evaluationGrades: EvaluationGrade[];
  requirements: any[];
  adminSettings: any[];
  isLoading: boolean;
  applyLoading: boolean;
  commentLoading: boolean;
  replyLoading: boolean;
  isTrimesterEnded: boolean;
  isProfileAllowed: boolean;
  applyRefreshing: boolean;

  transactions: any[];
  applicants: any[];
  notifications: any[];
  clubSessions: any[];
  feedbacks: any[];

  isListingTransactions: boolean;
  isCreatingStudentEvent: boolean;
  isFetchingApplicants: boolean;
  isUpdatingEventDate: boolean;
  isUpdatingMaxApplicants: boolean;
  isCancelingEvent: boolean;
  isCompletingEvent: boolean;
  isEndingApplications: boolean;
  isApprovingApplicant: boolean;
  isRejectingApplicant: boolean;
  isFetchingNotifications: boolean;
  isFetchingClubSessions: boolean;
  isFetchingFeedbacks: boolean;
  isSendingFeedback: boolean;
  isMarkingNotificationRead: boolean;
  createLeadershipEvent: (data: any, requirements: any[]) => Promise<void>;

  approveEvent: (
    eventId: string,
    amount: number,
    bonusGiven: number,
    deductedMark: number,
    description?: string
  ) => Promise<void>;

  rejectEvent: (eventId: string, rejectionReason: string) => Promise<void>;

  fetchPublicData: () => Promise<void>;
  applyToEvent: (
    eventId: string,
    requirements: RequirementFilled[]
  ) => Promise<void>;

  addComment: (
    eventID: string,
    text: string,
    modalContentRef?: React.RefObject<HTMLDivElement>
  ) => Promise<void>;
  updateComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  addReply: (commentID: string, text: string) => Promise<void>;
  updateReply: (replyId: string, text: string) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;

  countEventView: (eventId: string) => void;

  fetchTransactions: () => Promise<void>;
  createStudentEvent: (data: any) => Promise<void>;
  fetchApplicants: () => Promise<void>;
  approveApplicant: (applicantId: string) => Promise<void>;
  rejectApplicant: (
    applicantId: string,
    rejectionReason: string
  ) => Promise<void>;
  updateEventDate: (eventId: string, proposedDate: string) => Promise<void>;
  updateMaxApplicants: (
    eventId: string,
    maxApplicants: number
  ) => Promise<void>;
  cancelEvent: (eventId: string) => Promise<void>;
  completeEvent: (eventId: string) => Promise<void>;
  endEventApplications: (eventId: string) => Promise<void>;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (notificationIds: string[] | string) => Promise<void>;
  fetchClubSessions: () => Promise<void>;
  fetchFeedbacks: () => Promise<void>;
  sendFeedback: (subject: string, message: string) => Promise<void>;
  createAnnouncement: (data: any) => Promise<void>;

  updateAnnouncement: (announcementId: string, data: any) => Promise<void>;

  deleteAnnouncement: (announcementId: string) => Promise<void>;

  createGradeMapping: (data: {
    maximumValue: number;
    minimumValue: number;
    gradeLetter: string;
  }) => Promise<void>;

  updateGradeMapping: (
    id: string,
    data: {
      maximumValue?: number;
      minimumValue?: number;
      gradeLetter?: string;
    }
  ) => Promise<void>;

  deleteGradeMapping: (id: string) => Promise<void>;

  createFixedEvent: (data: {
    title: string;
    description: string;
    tokenValue: number;
  }) => Promise<void>;

  updateFixedEvent: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      tokenValue: number;
    }>
  ) => Promise<void>;

  deleteFixedEvent: (id: string) => Promise<void>;

  isCreatingLeadershipEvent: boolean;
  isApprovingEvent: boolean;
  isRejectingEvent: boolean;

  isCreatingAnnouncement: boolean;
  isUpdatingAnnouncement: boolean;
  isDeletingAnnouncement: boolean;

  isCreatingGrade: boolean;
  isUpdatingGrade: boolean;
  isDeletingGrade: boolean;

  isCreatingFixedEvent: boolean;
  isUpdatingFixedEvent: boolean;
  isDeletingFixedEvent: boolean;
}

/* ================= CONTEXT ================= */

const PublicDataContext = createContext<PublicDataContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export const PublicDataProvider = ({ children }: ProviderProps) => {
  const { userStudent, isStudentAuthenticated } = useAuth();

  /* ================= STATES ================= */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [evaluationGrades, setEvaluationGrades] = useState<EvaluationGrade[]>(
    []
  );
  const [requirements, setRequirements] = useState<any[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [clubSessions, setClubSessions] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  /* ================= GLOBAL LOADINGS ================= */
  const [isLoading, setIsLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [isTrimesterEnded, setIsTrimesterEnded] = useState(false);
  const [isProfileAllowed, setIsProfileAllowed] = useState(false);
  const [applyRefreshing, setApplyRefreshing] = useState(false);

  /* ================= ADMIN/STUDENT ACTION LOADINGS ================= */
  const [isListingTransactions, setIsListingTransactions] = useState(false);
  const [isCreatingStudentEvent, setIsCreatingStudentEvent] = useState(false);
  const [isFetchingApplicants, setIsFetchingApplicants] = useState(false);
  const [isUpdatingEventDate, setIsUpdatingEventDate] = useState(false);
  const [isUpdatingMaxApplicants, setIsUpdatingMaxApplicants] = useState(false);
  const [isCancelingEvent, setIsCancelingEvent] = useState(false);
  const [isCompletingEvent, setIsCompletingEvent] = useState(false);
  const [isEndingApplications, setIsEndingApplications] = useState(false);
  const [isApprovingApplicant, setIsApprovingApplicant] = useState(false);
  const [isRejectingApplicant, setIsRejectingApplicant] = useState(false);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  const [isFetchingClubSessions, setIsFetchingClubSessions] = useState(false);
  const [isFetchingFeedbacks, setIsFetchingFeedbacks] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isListingReqs, setIsListingReqs] = useState(false);
  const [isMarkingNotificationRead, setIsMarkingNotificationRead] =
    useState(false);
  const [isCreatingLeadershipEvent, setIsCreatingLeadershipEvent] =
    useState(false);
  const [isApprovingEvent, setIsApprovingEvent] = useState(false);
  const [isRejectingEvent, setIsRejectingEvent] = useState(false);

  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);
  const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);

  const [isCreatingGrade, setIsCreatingGrade] = useState(false);
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false);
  const [isDeletingGrade, setIsDeletingGrade] = useState(false);

  const [isCreatingFixedEvent, setIsCreatingFixedEvent] = useState(false);
  const [isUpdatingFixedEvent, setIsUpdatingFixedEvent] = useState(false);
  const [isDeletingFixedEvent, setIsDeletingFixedEvent] = useState(false);

  const viewedEventsRef = useRef<Set<string>>(new Set());
  const [adminSettings, setAdminSettings] = useState<any[]>([]);

  /* ================= FETCH PUBLIC DATA ================= */
  const fetchPublicData = async () => {
    setIsLoading(true);
    try {
      const [annRes, eventRes, gradeRes, settingRes] = await Promise.all([
        axiosInstance.get("/announcements"),
        axiosInstance.get("/events/list"),
        axiosInstance.get("/evaluation/grades"),
        axiosInstance.get("/events/admin-settings"),
      ]);

      setAnnouncements(annRes.data || []);
      setEvents(eventRes.data || []);
      setEvaluationGrades(gradeRes.data || []);
      setIsTrimesterEnded(settingRes.data?.isTrimesterEnded || false);
      setIsProfileAllowed(settingRes.data?.isProfileAllowed || false);
      setAdminSettings(settingRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load portal data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequirements = async () => {
    setIsListingReqs(true);
    try {
      const res = await axiosInstance.get("/events/requirements");
      setRequirements(res.data || []);
      console.log(res.data);
    } catch (err) {
      console.error("Error fetching requirements:", err);
      toast.error("Failed to load requirements");
    } finally {
      setIsListingReqs(false);
    }
  };

  /* ================= EVENT ACTIONS ================= */
  const applyToEvent = async (eventId: string, requirementsFilled) => {
    if (!userStudent) return toast.error("Please login to apply");

    setApplyLoading(true);

    try {
      const res = await axiosInstance.post("/events/apply", {
        eventId,
        requirementsFilled,
      });

      toast.success("Application submitted!");

      // update UI locally
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                applicants: [
                  ...event.applicants,
                  {
                    _id: res.data.applicant._id,
                    studentID: {
                      _id: userStudent._id,
                      name: userStudent.name,
                      profileImage: userStudent.profileImage || "",
                    },
                    status: "pending",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : event
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Application failed");
      console.log(err);
    } finally {
      setApplyLoading(false);
    }
  };

  const createStudentEvent = async (data: any, requirements: any[]) => {
    setIsCreatingStudentEvent(true);
    try {
      // Send as one payload object
      const res = await axiosInstance.post("/events/student", {
        ...data, // Spreading event details (title, desc, date, etc.)
        requirements, // The list of requirements
      });

      const newEvent = {
        ...res.data.event,
        postedBy: {
          _id: res.data.event.postedBy,
          name: userStudent.name,
        },
      };

      setEvents((prev) => [newEvent, ...prev]);
      toast.success("Event proposal created!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setIsCreatingStudentEvent(false);
    }
  };

  const cancelEvent = async (eventId: string) => {
    setIsCancelingEvent(true);
    try {
      await axiosInstance.post("/events/cancel/", { eventId });
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success("Event canceled");
    } catch {
      toast.error("Failed to cancel event");
    } finally {
      setIsCancelingEvent(false);
    }
  };

  const completeEvent = async (eventId: string) => {
    setIsCompletingEvent(true);
    try {
      await axiosInstance.post("/events/complete/", { eventId });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isCompleted: true } : e))
      );
      toast.success("Event marked as completed");
    } finally {
      setIsCompletingEvent(false);
    }
  };

  const endEventApplications = async (eventId: string) => {
    setIsEndingApplications(true);
    try {
      await axiosInstance.post("/events/end-applications/", { eventId });
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, isApplicationEnded: true } : e
        )
      );
      toast.success("Applications closed");
    } finally {
      setIsEndingApplications(false);
    }
  };

  const updateEventDate = async (eventId: string, proposedDate: string) => {
    setIsUpdatingEventDate(true);
    try {
      await axiosInstance.post("/events/update-date/", {
        proposedDate,
        eventId,
      });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, proposedDate } : e))
      );
      toast.success("Date updated");
    } finally {
      setIsUpdatingEventDate(false);
    }
  };

  const updateMaxApplicants = async (
    eventId: string,
    maxApplicants: number
  ) => {
    setIsUpdatingMaxApplicants(true);
    try {
      await axiosInstance.post("/events/update-spots/", {
        maxApplicants,
        eventId,
      });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, maxApplicants } : e))
      );
      toast.success("Capacity updated");
    } finally {
      setIsUpdatingMaxApplicants(false);
    }
  };

  /* ================= APPLICANT MANAGEMENT ================= */
  const fetchApplicants = async () => {
    setIsFetchingApplicants(true);
    try {
      const res = await axiosInstance.get("/events/applicants/all");
      setApplicants(res.data || []);
    } finally {
      setIsFetchingApplicants(false);
    }
  };

  const approveApplicant = async (applicantId: string, eventId: string) => {
    setIsApprovingApplicant(true);
    try {
      await axiosInstance.post("/events/applicant/approve", {
        applicantId,
      });

      toast.success("Applicant approved");
    } finally {
      setIsApprovingApplicant(false);
    }
  };

  const rejectApplicant = async (
    applicantId: string,
    rejectionReason: string
  ) => {
    setIsRejectingApplicant(true);
    try {
      await axiosInstance.post("/events/applicant/reject", {
        applicantId,
        rejectionReason, // make sure this is a plain string!
      });

      toast.success("Applicant rejected");
    } finally {
      setIsRejectingApplicant(false);
    }
  };

  /* ================= COMMENTS & REPLIES ================= */
  const addComment = async (
    eventID: string,
    text: string,
    modalContentRef?: React.RefObject<HTMLDivElement>
  ) => {
    setCommentLoading(true);
    try {
      const res = await axiosInstance.post("/events/comment", {
        eventID,
        text,
      });
      const newComment = res.data.comment;
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventID
            ? { ...e, comments: [newComment, ...(e.comments || [])] }
            : e
        )
      );
      setTimeout(
        () =>
          modalContentRef?.current?.scrollTo({ top: 0, behavior: "smooth" }),
        100
      );
      toast.success("Comment added");
    } finally {
      setCommentLoading(false);
    }
  };

  const updateComment = async (commentId: string, text: string) => {
    setCommentLoading(true);
    try {
      await axiosInstance.put(`/events/comment/${commentId}`, { text });
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          comments: e.comments?.map((c) =>
            c._id === commentId ? { ...c, text } : c
          ),
        }))
      );
      toast.success("Comment updated");
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setCommentLoading(true);
    try {
      await axiosInstance.delete(`/events/comment/${commentId}`);
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          comments: e.comments?.filter((c) => c._id !== commentId),
        }))
      );
      toast.success("Comment deleted");
    } finally {
      setCommentLoading(false);
    }
  };

  const addReply = async (commentID: string, text: string) => {
    setReplyLoading(true);
    try {
      const res = await axiosInstance.post("/events/reply", {
        commentID,
        text,
      });
      const newReply = res.data.reply;
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          comments: e.comments?.map((c) =>
            c._id === commentID
              ? { ...c, replies: [newReply, ...(c.replies || [])] }
              : c
          ),
        }))
      );
      toast.success("Reply added");
    } finally {
      setReplyLoading(false);
    }
  };

  const updateReply = async (replyId: string, text: string) => {
    setReplyLoading(true);
    try {
      await axiosInstance.put(`/events/reply/${replyId}`, { text });
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          comments: e.comments?.map((c) => ({
            ...c,
            replies: c.replies?.map((r: any) =>
              r._id === replyId ? { ...r, text } : r
            ),
          })),
        }))
      );
      toast.success("Reply updated");
    } finally {
      setReplyLoading(false);
    }
  };

  const deleteReply = async (replyId: string) => {
    setReplyLoading(true);
    try {
      await axiosInstance.delete(`/events/reply/${replyId}`);
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          comments: e.comments?.map((c) => ({
            ...c,
            replies: c.replies?.filter((r: any) => r._id !== replyId),
          })),
        }))
      );
      toast.success("Reply deleted");
    } finally {
      setReplyLoading(false);
    }
  };

  /* ================= UTILS & MISC ================= */
  const countEventView = (eventId: string) => {
    if (!eventId || viewedEventsRef.current.has(eventId)) return;
    viewedEventsRef.current.add(eventId);
    setTimeout(async () => {
      try {
        await axiosInstance.post("/events/view", { eventId });
      } catch {}
    }, 1500);
  };

  const fetchTransactions = async () => {
    setIsListingTransactions(true);
    try {
      const res = await axiosInstance.get("/events/transactions");
      setTransactions(res.data);
      console.log("API RESPONSE:", res.data); // 👈 check this
    } finally {
      setIsListingTransactions(false);
    }
  };

  const fetchNotifications = async () => {
    setIsFetchingNotifications(true);
    try {
      const res = await axiosInstance.get("/events/notifications");
      setNotifications(res.data || []);
    } finally {
      setIsFetchingNotifications(false);
    }
  };

  const markNotificationRead = async (notificationIds: string[] | string) => {
    setIsMarkingNotificationRead(true);
    try {
      await axiosInstance.post("/events/notification/read", {
        notificationIds,
      });
      setNotifications((prev) =>
        prev.map((n) =>
          (
            Array.isArray(notificationIds)
              ? notificationIds.includes(n._id)
              : n._id === notificationIds
          )
            ? { ...n, isRead: true }
            : n
        )
      );
    } finally {
      setIsMarkingNotificationRead(false);
    }
  };

  const fetchClubSessions = async () => {
    setIsFetchingClubSessions(true);
    try {
      const res = await axiosInstance.get("/clubs/club-sessions");
      setClubSessions(res.data || []);
    } finally {
      setIsFetchingClubSessions(false);
    }
  };

  const fetchFeedbacks = async () => {
    setIsFetchingFeedbacks(true);
    try {
      const res = await axiosInstance.get("/feedback");
      setFeedbacks(res.data || []);
    } finally {
      setIsFetchingFeedbacks(false);
    }
  };

  const sendFeedback = async (subject: string, message: string) => {
    setIsSendingFeedback(true);
    try {
      const res = await axiosInstance.post("/feedback", { subject, message });

      // Update local state immediately so it appears in the UI
      setFeedbacks((prev) => [res.data.feedback, ...prev]);
      console.log(res.data.feedback);

      toast.success("Feedback submitted");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to send feedback");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const createLeadershipEvent = async (data: any, requirements: any[]) => {
    setIsCreatingLeadershipEvent(true);

    try {
      const res = await axiosInstance.post("/events/leadership", {
        ...data,
        requirements,
      });

      setEvents((prev) => [res.data.event, ...prev]);

      toast.success("Leadership event created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed creating event");
    } finally {
      setIsCreatingLeadershipEvent(false);
    }
  };

  const approveEvent = async (
    eventId: string,
    amount: number,
    bonusGiven: number,
    deductedMark: number,
    description?: string
  ) => {
    setIsApprovingEvent(true);

    try {
      await axiosInstance.post("/events/approve", {
        eventId,
        amount,
        bonusGiven,
        deductedMark,
        description,
      });

      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: "approved" } : e))
      );

      toast.success("Event approved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Approval failed");
    } finally {
      setIsApprovingEvent(false);
    }
  };

  const rejectEvent = async (eventId: string, rejectionReason: string) => {
    setIsRejectingEvent(true);

    try {
      await axiosInstance.post("/events/reject", {
        eventId,
        rejectionReason,
      });

      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, status: "rejected", rejectionReason } : e
        )
      );

      toast.success("Event rejected");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reject failed");
    } finally {
      setIsRejectingEvent(false);
    }
  };

  /* ================= ANNOUNCEMENTS ================= */

  const createAnnouncement = async (data: any) => {
    setIsCreatingAnnouncement(true);

    try {
      const res = await axiosInstance.post("/announcements", data);

      setAnnouncements((prev) => [res.data.announcement, ...prev]);

      toast.success("Announcement created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setIsCreatingAnnouncement(false);
    }
  };

  const updateAnnouncement = async (id: string, data: any) => {
    setIsUpdatingAnnouncement(true);

    try {
      const res = await axiosInstance.put(`/announcements/${id}`, data);

      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? res.data.announcement : a))
      );

      toast.success("Announcement updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setIsUpdatingAnnouncement(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setIsDeletingAnnouncement(true);

    try {
      await axiosInstance.delete(`/announcements/${id}`);

      setAnnouncements((prev) => prev.filter((a) => a._id !== id));

      toast.success("Announcement deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeletingAnnouncement(false);
    }
  };

  /* ================= GRADE MAPPING ================= */

  const createGradeMapping = async (data: any) => {
    setIsCreatingGrade(true);

    try {
      await axiosInstance.post("/evaluation/grades", data);

      fetchPublicData();

      toast.success("Grade created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setIsCreatingGrade(false);
    }
  };

  const updateGradeMapping = async (id: string, data: any) => {
    setIsUpdatingGrade(true);

    try {
      await axiosInstance.put(`/evaluation/grades/${id}`, data);

      fetchPublicData();

      toast.success("Grade updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setIsUpdatingGrade(false);
    }
  };

  const deleteGradeMapping = async (id: string) => {
    setIsDeletingGrade(true);

    try {
      await axiosInstance.delete(`/evaluation/grades/${id}`);

      fetchPublicData();

      toast.success("Grade deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeletingGrade(false);
    }
  };

  /* ================= FIXED EVENTS ================= */

  const createFixedEvent = async (data: any) => {
    setIsCreatingFixedEvent(true);

    try {
      const res = await axiosInstance.post("/evaluation/fixed-events", data);

      setEvents((prev) => [res.data.event, ...prev]);

      toast.success("Fixed event created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setIsCreatingFixedEvent(false);
    }
  };

  const updateFixedEvent = async (id: string, data: any) => {
    setIsUpdatingFixedEvent(true);

    try {
      const res = await axiosInstance.put(
        `/evaluation/fixed-events/${id}`,
        data
      );

      setEvents((prev) => prev.map((e) => (e._id === id ? res.data.event : e)));

      toast.success("Fixed event updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setIsUpdatingFixedEvent(false);
    }
  };

  const deleteFixedEvent = async (id: string) => {
    setIsDeletingFixedEvent(true);

    try {
      await axiosInstance.delete(`/evaluation/fixed-events/${id}`);

      setEvents((prev) => prev.filter((e) => e._id !== id));

      toast.success("Fixed event deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeletingFixedEvent(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
    fetchRequirements();
    fetchTransactions();
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (isStudentAuthenticated) {
      fetchNotifications();
    }
  }, [isStudentAuthenticated]);

  return (
    <PublicDataContext.Provider
      value={{
        announcements,
        events,
        evaluationGrades,
        requirements,
        isLoading,
        applyLoading,
        commentLoading,
        replyLoading,
        isTrimesterEnded,
        isProfileAllowed,
        applyRefreshing,
        transactions,
        applicants,
        notifications,
        clubSessions,
        feedbacks,
        isListingTransactions,
        isCreatingStudentEvent,
        isFetchingApplicants,
        isUpdatingEventDate,
        isUpdatingMaxApplicants,
        isCancelingEvent,
        isCompletingEvent,
        isEndingApplications,
        isApprovingApplicant,
        isRejectingApplicant,
        isFetchingNotifications,
        isFetchingClubSessions,
        isFetchingFeedbacks,
        isSendingFeedback,
        isMarkingNotificationRead,
        isListingReqs,
        adminSettings,
        applyToEvent,
        addComment,
        updateComment,
        deleteComment,
        addReply,
        updateReply,
        deleteReply,
        countEventView,
        fetchTransactions,
        createStudentEvent,
        fetchApplicants,
        approveApplicant,
        rejectApplicant,
        updateEventDate,
        updateMaxApplicants,
        cancelEvent,
        completeEvent,
        endEventApplications,
        fetchNotifications,
        markNotificationRead,
        fetchClubSessions,
        fetchFeedbacks,
        sendFeedback,
        createLeadershipEvent,
        approveEvent,
        rejectEvent,

        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,

        createGradeMapping,
        updateGradeMapping,
        deleteGradeMapping,

        createFixedEvent,
        updateFixedEvent,
        deleteFixedEvent,

        isCreatingLeadershipEvent,
        isApprovingEvent,
        isRejectingEvent,

        isCreatingAnnouncement,
        isUpdatingAnnouncement,
        isDeletingAnnouncement,

        isCreatingGrade,
        isUpdatingGrade,
        isDeletingGrade,

        isCreatingFixedEvent,
        isUpdatingFixedEvent,
        isDeletingFixedEvent,
      }}
    >
      {children}
    </PublicDataContext.Provider>
  );
};

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context)
    throw new Error("usePublicData must be used within PublicDataProvider");
  return context;
};
