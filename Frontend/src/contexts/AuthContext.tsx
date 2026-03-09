import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

/* ================= TYPES ================= */

interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Club {
  _id: string;
  clubName: string;
}

interface Admin {
  _id: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface UpdateData {
  email?: string;
  password?: string;
  profileImage?: string;
}

interface AuthContextType {
  userStudent: Student | null;
  authenticatedClub: Club | null;
  authenticatedAdmin: Admin | null;

  isStudentAuthenticated: boolean;
  isClubAuthenticated: boolean;
  isAdminAuthenticated: boolean;

  isCheckingAuth: boolean;
  isStudentLogging: boolean;
  isClubLogging: boolean;
  isAdminLogging: boolean;

  isCheckingClubAuth: boolean;
  isCheckingAdminAuth: boolean;

  isUpdatingAccount: boolean;
  isUpdatingAdminPassword: boolean;

  students: any[];
  isListingStudents: boolean;
  fetchStudents: () => Promise<void>;

  loginStudent: (credentials: Credentials) => Promise<void>;
  loginClub: (credentials: Credentials) => Promise<void>;
  loginAdmin: (password: string) => Promise<void>;

  logoutStudent: () => Promise<void>;
  logoutClub: () => Promise<void>;
  logoutAdmin: () => Promise<void>;

  checkClubAuth: () => Promise<boolean>;
  checkAdminAuth: () => Promise<boolean>;

  updateStudentAccount: (data: UpdateData) => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<void>;
}

interface ProviderProps {
  children: ReactNode;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: ProviderProps) => {
  const [userStudent, setUserStudent] = useState<Student | null>(null);
  const [authenticatedClub, setAuthenticatedClub] = useState<Club | null>(null);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<Admin | null>(
    null
  );

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [isStudentLogging, setIsStudentLogging] = useState(false);
  const [isClubLogging, setIsClubLogging] = useState(false);
  const [isAdminLogging, setIsAdminLogging] = useState(false);

  const [isCheckingClubAuth, setIsCheckingClubAuth] = useState(false);
  const [isCheckingAdminAuth, setIsCheckingAdminAuth] = useState(false);

  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isUpdatingAdminPassword, setIsUpdatingAdminPassword] = useState(false);

  const [students, setStudents] = useState<any[]>([]);
  const [isListingStudents, setIsListingStudents] = useState(false);

  /* ================= STUDENT LIST ================= */

  const fetchStudents = async () => {
    setIsListingStudents(true);
    try {
      const res = await axiosInstance.get("/auth/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setIsListingStudents(false);
    }
  };

  /* ================= STUDENT LOGIN ================= */

  const loginStudent = async (credentials: Credentials) => {
    setIsStudentLogging(true);
    try {
      const { data } = await axiosInstance.post(
        "/auth/students/login",
        credentials
      );
      setUserStudent(data.student);
      toast.success("Login successful");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setIsStudentLogging(false);
    }
  };

  /* ================= STUDENT UPDATE ================= */

  const updateStudentAccount = async (data: UpdateData) => {
    setIsUpdatingAccount(true);
    try {
      const res = await axiosInstance.put("/auth/students/update", data);
      setUserStudent(res.data.student);
      toast.success("Account updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
      throw err;
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  /* ================= CLUB LOGIN ================= */

  const loginClub = async (credentials: Credentials) => {
    setIsClubLogging(true);
    try {
      const { data } = await axiosInstance.post(
        "/auth/clubs/login",
        credentials
      );
      setAuthenticatedClub(data.club);
      toast.success("Club login successful");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setIsClubLogging(false);
    }
  };

  /* ================= ADMIN LOGIN ================= */

  const loginAdmin = async (password: string) => {
    setIsAdminLogging(true);
    try {
      const { data } = await axiosInstance.post("/auth/admin/login", {
        password,
      });

      setAuthenticatedAdmin(data.admin);
      toast.success("Admin login successful");
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Admin login failed");
      throw err;
    } finally {
      setIsAdminLogging(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logoutStudent = async () => {
    try {
      await axiosInstance.post("/auth/students/logout");
      setUserStudent(null);
      toast.success("Logged out");
    } catch (err) {
      console.error(err);
    }
  };

  const logoutClub = async () => {
    try {
      await axiosInstance.post("/auth/clubs/logout");
      setAuthenticatedClub(null);
      toast.success("Club logged out");
    } catch (err) {
      console.error(err);
    }
  };

  const logoutAdmin = async () => {
    try {
      await axiosInstance.post("/auth/admin/logout");
      setAuthenticatedAdmin(null);
      toast.success("Admin logged out");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= AUTH CHECKS ================= */

  useEffect(() => {
    const checkStudentAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/students/check");
        setUserStudent(res.data.student || res.data);
      } catch {
        setUserStudent(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkStudentAuth();
  }, []);

  const checkClubAuth = async () => {
    setIsCheckingClubAuth(true);
    try {
      const res = await axiosInstance.get("/auth/clubs/check");
      setAuthenticatedClub(res.data.club || res.data);
      return true;
    } catch {
      setAuthenticatedClub(null);
      return false;
    } finally {
      setIsCheckingClubAuth(false);
    }
  };

  const checkAdminAuth = async () => {
    setIsCheckingAdminAuth(true);
    try {
      const res = await axiosInstance.get("/auth/admin/check");
      setAuthenticatedAdmin(res.data.admin);
      return true;
    } catch {
      setAuthenticatedAdmin(null);
      return false;
    } finally {
      setIsCheckingAdminAuth(false);
    }
  };

  /* ================= ADMIN PASSWORD ================= */

  const updateAdminPassword = async (newPassword: string) => {
    setIsUpdatingAdminPassword(true);
    try {
      await axiosInstance.put("/auth/admin/update-password", {
        newPassword,
      });

      toast.success("Admin password updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
      throw err;
    } finally {
      setIsUpdatingAdminPassword(false);
    }
  };

  /* ================= HELPERS ================= */

  const isStudentAuthenticated = Boolean(userStudent);
  const isClubAuthenticated = Boolean(authenticatedClub);
  const isAdminAuthenticated = Boolean(authenticatedAdmin);

  const value = {
    userStudent,
    authenticatedClub,
    authenticatedAdmin,

    isStudentAuthenticated,
    isClubAuthenticated,
    isAdminAuthenticated,

    isCheckingAuth,
    isStudentLogging,
    isClubLogging,
    isAdminLogging,

    isCheckingClubAuth,
    isCheckingAdminAuth,

    isUpdatingAccount,
    isUpdatingAdminPassword,

    students,
    isListingStudents,

    loginStudent,
    loginClub,
    loginAdmin,

    logoutStudent,
    logoutClub,
    logoutAdmin,

    checkClubAuth,
    checkAdminAuth,

    updateStudentAccount,
    updateAdminPassword,

    fetchStudents,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
