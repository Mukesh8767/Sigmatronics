// ...imports remain the same
import React, { useState } from 'react';
import { Trash2, UserCircle } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSubUsers } from '../../hooks/useSubUsers';
import { UserModal } from '../../components/UserModal';
import UserWrapper from '../Wrappers/UserWrapper';
import axiosInstance from '../../../utils/axiosInstance';
import EditProfileForm from '../../components/EditProfileForm';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";

export default function Animations() {
  return (
    <Box sx={{ width: 300 }}>
      <Skeleton sx={{ bgcolor: 'grey.800' }} />
      <Skeleton animation="wave" sx={{ bgcolor: 'grey.700' }} />
      <Skeleton animation={false} sx={{ bgcolor: 'grey.600' }} />
    </Box>
  );
}
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
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Submission failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <UserWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-black">
        {/* Profile Info */}
        <div className="bg-neutral-900 text-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          {profileLoading ? (
            <Animations />
          ) : profileError ? (
            <p className="text-red-400">{profileError}</p>
          ) : user && (
            <>
              <div className="flex items-center gap-4">
                <UserCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">{user.name}</h2>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditProfile}
                className="text-sm bg-white text-black font-medium px-4 py-2 rounded-md shadow hover:bg-gray-100"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Sub-users */}
        {!isSubUser && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800">Sub Users</h3>
              <button
                onClick={handleCreateSubUser}
                className="bg-neutral-800 text-white text-sm px-4 py-2 rounded-md hover:bg-black"
              >
                + Add Sub-user
              </button>
            </div>

            {subUsersLoading ? (
              <Animations />
            ) : subUsersError ? (
              <p className="text-red-500">{subUsersError}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subUsers.map((subUser) => (
                  <div
                    key={subUser._id}
                    className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-black" />
                        <div>
                          <h4 className="font-medium text-black">{subUser.name}</h4>
                          <p className="text-gray-500 text-sm">{subUser.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(subUser._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Assign Machines */}
                    <div>
                      <button
                        className="text-sm text-blue-600 underline"
                        onClick={() =>
                          setAssignModeUserId(assignModeUserId === subUser._id ? null : subUser._id)
                        }
                      >
                        Assign Machines <ChevronDown className="inline w-4 h-4" />
                      </button>

                      {assignModeUserId === subUser._id && (
                        <div className="mt-3 border rounded-md p-3 bg-gray-50">
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {userMachines.map((machine) => (
                              <label key={machine.machineId} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedMachines.includes(machine.machineId)}
                                  onChange={() => toggleAssignMachine(machine.machineId)}
                                />
                                <span className="text-sm">{machine.machineId}</span>
                              </label>
                            ))}
                          </div>
                          <button
                            className="mt-3 text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleAssignSubmit(subUser._id)}
                          >
                            Assign Selected
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal */}
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
