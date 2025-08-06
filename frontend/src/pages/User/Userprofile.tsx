import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  UserCircle, 
  ChevronDown, 
  Edit3, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  Users,
  Shield,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSubUsers } from '../../hooks/useSubUsers';
import { UserModal } from '../../components/UserModal';
import UserWrapper from '../Wrappers/UserWrapper';
import axiosInstance from '../../../utils/axiosInstance';
import EditProfileForm from '../../components/EditProfileForm';
import { formatUpdatedAt } from '../../components/tables/MachineOverviewTable';

const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-slate-700 rounded-full"></div>
        <div className="space-y-3">
          <div className="h-6 bg-slate-700 rounded-lg w-48"></div>
          <div className="h-4 bg-slate-600 rounded-lg w-64"></div>
          <div className="h-3 bg-slate-600 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

const SubUserSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const UserProfile: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const parentId = localStorage.getItem("parentId");
  const isSubUser = parentId && parentId !== "null" && userId !== parentId;

  const { user, loading: profileLoading, error: profileError } = useUserProfile(userId!);
  const { subUsers, loading: subUsersLoading, error: subUsersError } = useSubUsers(1, 10, userId!);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [assignModeUserId, setAssignModeUserId] = useState<string | null>(null);
  const [userMachines, setUserMachines] = useState<any[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

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

  const handleDelete = async (id: string) => {
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
      }, 30000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Submission failed");
    } finally {
      setFormLoading(false);
    }
  };
  //@ts-ignore
  const SubUserCard = ({ subUser }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{subUser.name}</h4>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Mail className="w-4 h-4" />
              <span>{subUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="w-3 h-3" />
              <span>Added {formatUpdatedAt(subUser.createdAt)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleDelete(subUser._id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Delete Sub-user"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <button
          className="flex items-center justify-between w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={() =>
            setAssignModeUserId(assignModeUserId === subUser._id ? null : subUser._id)
          }
        >
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Manage Machine Access</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              assignModeUserId === subUser._id ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {assignModeUserId === subUser._id && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Assign Machine Access
            </h5>
            
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {userMachines.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No machines available</p>
              ) : (
                userMachines.map((machine) => (
                  <label 
                    key={machine.machineId} 
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMachines.includes(machine.machineId)}
                      onChange={() => toggleAssignMachine(machine.machineId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Monitor className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{machine.machineId}</span>
                  </label>
                ))
              )}
            </div>
            
            <button
              className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleAssignSubmit(subUser._id)}
              disabled={selectedMachines.length === 0}
            >
              Assign Selected Machines ({selectedMachines.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <UserWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex">Account Management</h1>
          <p className="text-lg text-gray-600 flex">Manage your profile and team members</p>
        </div>

        {/* Profile Section */}
        {profileLoading ? (
          <ProfileSkeleton />
        ) : profileError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800 font-medium">{profileError}</p>
            </div>
          </div>
        ) : user && (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-2xl p-8 mb-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <UserCircle className="w-12 h-12 lg:w-14 lg:h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">{user.name}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatUpdatedAt(user.createdAt.toString())}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Sub Users Section */}
        {!isSubUser && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h3>
                <p className="text-gray-600">Manage sub-users and their machine access permissions</p>
              </div>
              
              <button
                onClick={handleCreateSubUser}
                className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-black transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Team Member
              </button>
            </div>

            {subUsersLoading ? (
              <SubUserSkeleton />
            ) : subUsersError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-800 font-medium">{subUsersError}</p>
                </div>
              </div>
            ) : subUsers.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Yet</h4>
                <p className="text-gray-600 mb-4">Get started by adding your first team member</p>
                <button
                  onClick={handleCreateSubUser}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-medium px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subUsers.map((subUser) => (
                  <SubUserCard key={subUser._id} subUser={subUser} />
                ))}
              </div>
            )}
          </div>
        )}

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
    </UserWrapper>
  );
};