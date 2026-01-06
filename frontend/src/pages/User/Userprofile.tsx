import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import {
  Trash2,
  UserCircle,
  Edit,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSubUsers } from '../../hooks/useSubUsers';
import { UserModal } from '../../components/UserModal';
import UserWrapper from '../Wrappers/UserWrapper';
import axiosInstance from '../../../utils/axiosInstance';
import EditProfileForm from '../../components/EditProfileForm';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';
import { transformMachineCode } from '../../components/machineCodeEncoder';

type Device = {
  machineId: string;
  name?: string;
  status?: string;
};

const IOSRow = ({
  label,
  value,
  icon: Icon,
  isLink = false,
  onClick,
  className = ""
}: {
  label: string,
  value?: string | React.ReactNode,
  icon?: any,
  isLink?: boolean,
  onClick?: () => void,
  className?: string
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E]' : ''} ${className}`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-7 h-7 rounded-md bg-[#0071E3] flex items-center justify-center text-white shrink-0">
          <Icon size={16} fill="currentColor" />
        </div>
      )}
      <span className="text-[17px] text-black dark:text-white font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-[17px] text-[#8E8E93]">{value}</span>}
      {isLink && <ChevronRight size={20} className="text-[#C7C7CC]" />}
    </div>
  </div>
);

export const UserProfile: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const parentId = localStorage.getItem("parentId");
  const isSubUser = parentId && parentId !== "null" && userId !== parentId;
//@ts-ignore
const { user, loading: profileLoading, error: profileError } = useUserProfile(userId!);
//@ts-ignore
  const { subUsers, loading: subUsersLoading, error: subUsersError } = useSubUsers(1, 10, userId!);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
//@ts-ignore
  const [assignModeUserId, setAssignModeUserId] = useState<string | null>(null);
  const [userMachines, setUserMachines] = useState<any[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      const res = await axiosInstance.get(`/api/device/by-user/${userId}`);
      setUserMachines(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch machines", err);
    }
  };

  useEffect(() => {
    if (!isSubUser) fetchMachines();
  }, []);

  const toggleAssignMachine = (machineId: string) => {
    setSelectedMachines((prev) =>
      prev.includes(machineId) ? prev.filter((id) => id !== machineId) : [...prev, machineId]
    );
  };

  const handleAssignSubmit = async (subuserId: string) => {
    try {
      await Promise.all(
        selectedMachines.map((machineId) =>
          axiosInstance.put(`/api/device/addSubuserdevice/${machineId}`, { subuserId })
        )
      );
      alert("Machines assigned successfully!");
      setSelectedMachines([]);
      setAssignModeUserId(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign machines.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditProfile = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email, password: "", phoneNumber: user.phoneNumber || "" });
      setIsEditingProfile(true);
      setIsModalOpen(true);
    }
  };

  const handleCreateSubUser = () => {
    if (isSubUser) {
      alert("Sub-users are not allowed to create new sub-users.");
      return;
    }
    setFormData({ name: "", email: "", password: "", phoneNumber: "" });
    setIsEditingProfile(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this sub-user?")) return;
    try {
      await axiosInstance.delete(`/api/user/deleteUser/${id}`);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete sub-user");
    }
  };

  const handleSubmit = async () => {
    const { name, email, password, phoneNumber } = formData;
    if (!name || !email || !phoneNumber) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      if (isEditingProfile) {
        await axiosInstance.put(`/api/user/update`, {
          name,
          email,
          phoneNumber,
          ...(password && { password }),
        });
        setFormSuccess("Profile updated successfully!");
      } else {
        await axiosInstance.post(`/api/user/signup`, {
          name,
          email,
          phoneNumber,
          parentUser: userId,
        });
        setFormSuccess("Sub-user created successfully!");
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Submission failed");
    } finally {
      setFormLoading(false);
    }
  };

  // SubUser List Item Component
  //@ts-ignore
  const SubUserItem = ({ subUser }) => {
    const isExpanded = expandedUser === subUser._id;

    const handleDeleteMachine = async (machineId: string) => {
      try {
        await axiosInstance.delete(`api/device/deletedevices/${machineId}/subusers`, {
          data: { subuserId: subUser._id },
        });
        toast.success(`Machine removed from ${subUser.name}`);
        window.location.reload();
      } catch (err) {
        toast.error("Failed to remove machine.");
      }
    };

    return (
      <div className="bg-white dark:bg-[#1C1C1E] overflow-hidden">
        <div
          onClick={() => setExpandedUser(isExpanded ? null : subUser._id)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#333] dark:to-[#444] flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg">
              {subUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-[17px] font-medium text-black dark:text-white leading-tight">{subUser.name}</h4>
              <p className="text-[14px] text-[#8E8E93]">{subUser.devices?.length || 0} Machines Access</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleDelete(subUser._id, e)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <ChevronRight size={20} className={`text-[#C7C7CC] transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="bg-[#F2F2F7] dark:bg-black p-4 space-y-4 border-t border-gray-100 dark:border-[#2C2C2E]">
            {/* Assigned List */}
            {subUser.devices?.length > 0 && (
              <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-[#2C2C2E]">
                {subUser.devices.map((device: Device) => (
                  <div key={device.machineId} className="flex items-center justify-between p-3 px-4">
                    <span className="text-[15px] font-medium dark:text-gray-200">{transformMachineCode(device.machineId)}</span>
                    <button onClick={() => handleDeleteMachine(device.machineId)} className="text-red-500 text-sm font-medium">Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* Assign New */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl p-4 space-y-3">
              <h5 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wide">Assign Access</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {userMachines.filter((machine) => machine.assignedTo?.length === 1).map((machine) => (
                  <label key={machine.machineId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMachines.includes(machine.machineId)}
                      onChange={() => toggleAssignMachine(machine.machineId)}
                      className="w-4 h-4 text-[#0071E3] rounded focus:ring-[#0071E3]"
                    />
                    <span className="text-sm font-medium dark:text-gray-200">{transformMachineCode(machine.machineId)}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => handleAssignSubmit(subUser._id)}
                disabled={selectedMachines.length === 0}
                className="w-full py-2 bg-[#0071E3] text-white font-medium rounded-lg text-sm disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black pb-12 font-sans transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 space-y-8">

          {/* Profile Header */}
          {user && (
            <div className="flex flex-col items-center gap-4 text-center pb-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center text-4xl font-medium text-[#8E8E93] overflow-hidden shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleEditProfile}
                  className="absolute bottom-0 right-0 p-2 bg-[#0071E3] text-white rounded-full hover:bg-blue-600 shadow-sm transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">{user.name}</h1>
                <p className="text-[#86868B] text-lg">{user.email}</p>
              </div>
            </div>
          )}

          {/* Info Section */}
          {user && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#6E6E73] uppercase tracking-wide ml-4">Personal Information</h3>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2C2C2E] divide-y divide-gray-100 dark:divide-[#2C2C2E]">
                <IOSRow label="Full Name" value={user.name} icon={UserCircle} />
                <IOSRow label="Email" value={user.email} icon={Mail} />
                <IOSRow label="Phone" value={user.phoneNumber || "Not set"} icon={Phone} />
                <IOSRow label="Member Since" value={formatUpdatedAt(user.createdAt.toString())} icon={Calendar} />
              </div>
            </div>
          )}

          {/* Team Section */}
          {!isSubUser && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-sm font-semibold text-[#6E6E73] uppercase tracking-wide">Team Members</h3>
                <button onClick={handleCreateSubUser} className="text-[#0071E3] text-sm font-medium hover:underline">
                  + Add Member
                </button>
              </div>

              {subUsersLoading ? (
                <div className="p-8 text-center text-[#86868B]">Loading team...</div>
              ) : subUsers.length === 0 ? (
                <div className="bg-white dark:bg-[#1C1C1E] rounded-xl p-8 text-center border border-gray-200 dark:border-[#2C2C2E]">
                  <p className="text-[#86868B] mb-4">No team members added yet.</p>
                  <button onClick={handleCreateSubUser} className="text-[#0071E3] font-medium">Add your first member</button>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2C2C2E] divide-y divide-gray-100 dark:divide-[#2C2C2E]">
                  {subUsers.map(u => <SubUserItem key={u._id} subUser={u} />)}
                </div>
              )}
            </div>
          )}

          {/* Account Actions */}
          <div className="space-y-2">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2C2C2E]">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                className="w-full flex items-center justify-center p-4 text-[#FF3B30] font-medium hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors"
              >
                Sign Out
              </button>
            </div>
            <div className="text-center pt-2">
              <p className="text-xs text-[#86868B]">Sigmatronics v2.1.0 • Build 2405</p>
            </div>
          </div>

          {/* Modals */}
          {isModalOpen && isEditingProfile ? (
            <EditProfileForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={formLoading}
              error={formError}
              success={formSuccess}
              onClose={() => {
                setIsModalOpen(false);
                setFormError(null);
                setFormSuccess(null);
              }}
            />
          ) : (
            <UserModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setFormError(null);
                setFormSuccess(null);
              }}
              onChange={handleChange}
              onSubmit={handleSubmit}
              formData={{ name: formData.name, email: formData.email, phoneNumber: formData.phoneNumber || "" }}
              loading={formLoading}
              error={formError}
              success={formSuccess}
              isEditMode={false}
            />
          )}
        </div>
      </div>
    </UserWrapper>
  );
};
