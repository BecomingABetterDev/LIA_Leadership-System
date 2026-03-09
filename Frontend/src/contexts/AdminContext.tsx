import { createContext, useContext, useState, ReactNode } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

interface AdminContextProps {
  // Transactions
  distributeTokensToStudent: (data: DistributeStudentData) => Promise<void>;
  distributeTokensToGroup: (data: DistributeGroupData) => Promise<void>;

  // CM Groups
  createCMGroup: (data: CMGroupData) => Promise<void>;
  updateCMGroup: (groupId: string, data: CMGroupData) => Promise<void>;
  deleteCMGroup: (groupId: string) => Promise<void>;
  fetchCMGroups: () => Promise<void>;

  // State
  cmGroups: CMGroup[];
  loadingDistribute: boolean;
  loadingCMGroups: boolean;
  loadingCreateGroup: boolean;
  loadingUpdateGroup: boolean;
  loadingDeleteGroup: boolean;
}

interface DistributeStudentData {
  studentId: string;
  amount: number;
  bonusGiven?: number;
  deductedMark?: number;
  description?: string;
}

interface DistributeGroupData {
  studentIds: string[];
  amount: number;
  bonusGiven?: number;
  deductedMark?: number;
  description?: string;
}

interface CMGroupData {
  name: string;
  studentIds?: string[];
}

interface CMGroup {
  _id: string;
  name: string;
  students: {
    _id: string;
    name: string;
    schoolId: string;
    profileImage?: string;
  }[];
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [cmGroups, setCMGroups] = useState<CMGroup[]>([]);

  // Loading states
  const [loadingDistribute, setLoadingDistribute] = useState(false);
  const [loadingCMGroups, setLoadingCMGroups] = useState(false);
  const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);
  const [loadingUpdateGroup, setLoadingUpdateGroup] = useState(false);
  const [loadingDeleteGroup, setLoadingDeleteGroup] = useState(false);

  // ====== Transactions ======
  const distributeTokensToStudent = async (data: DistributeStudentData) => {
    try {
      setLoadingDistribute(true);
      const res = await axiosInstance.post(
        "/transaction/distribute/student",
        data
      );
      toast.success(res.data.message || "Tokens distributed to student");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to distribute tokens");
    } finally {
      setLoadingDistribute(false);
    }
  };

  const distributeTokensToGroup = async (data: DistributeGroupData) => {
    try {
      setLoadingDistribute(true);
      const res = await axiosInstance.post(
        "/transaction/distribute/group",
        data
      );
      toast.success(res.data.message || "Tokens distributed to group");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to distribute tokens");
    } finally {
      setLoadingDistribute(false);
    }
  };

  // ====== Community Meeting Groups ======
  const fetchCMGroups = async () => {
    try {
      setLoadingCMGroups(true);
      const res = await axiosInstance.get("/cm-groups");
      setCMGroups(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch groups");
    } finally {
      setLoadingCMGroups(false);
    }
  };

  const createCMGroup = async (data: CMGroupData) => {
    try {
      setLoadingCreateGroup(true);
      const res = await axiosInstance.post("/cm-groups/create", data);
      toast.success(res.data.message || "Group created");
      setCMGroups((prev) => [...prev, res.data.group]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoadingCreateGroup(false);
    }
  };

  const updateCMGroup = async (groupId: string, data: CMGroupData) => {
    try {
      setLoadingUpdateGroup(true);
      const res = await axiosInstance.put(`/cm-groups/update/${groupId}`, data);
      toast.success(res.data.message || "Group updated");
      setCMGroups((prev) =>
        prev.map((g) => (g._id === groupId ? res.data.group : g))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update group");
    } finally {
      setLoadingUpdateGroup(false);
    }
  };

  const deleteCMGroup = async (groupId: string) => {
    try {
      setLoadingDeleteGroup(true);
      const res = await axiosInstance.delete(`/cm-groups/delete/${groupId}`);
      toast.success(res.data.message || "Group deleted");
      setCMGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete group");
    } finally {
      setLoadingDeleteGroup(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        distributeTokensToStudent,
        distributeTokensToGroup,
        createCMGroup,
        updateCMGroup,
        deleteCMGroup,
        fetchCMGroups,
        cmGroups,
        loadingDistribute,
        loadingCMGroups,
        loadingCreateGroup,
        loadingUpdateGroup,
        loadingDeleteGroup,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// ====== Hook for easy usage ======
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
};
