
import { Button } from "../../components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFetchUser } from "../../hooks/useFetchadminUsers";
import axiosInstance from "../../../utils/axiosInstance";
import { UserTable } from "../../components/tables/UserTable";
import { UserModal } from "../../components/UserModal";
import UserDevicePopup from "../../components/UserDevicePopup";
import DeviceAssignmentForm from "../../components/forms/AssignMachineForm";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

export const AdminUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { users = [], totalPages = 1, loading, error } =
    useFetchUser(currentPage, 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  const [assignDeviceUser, setAssignDeviceUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshUsers = () => {
    setCurrentPage((p) => p);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    await axiosInstance.delete(`/api/user/deleteUser/${id}`);
    refreshUsers();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      if (isEditMode && editingUserId) {
        await axiosInstance.put(`/api/user/update/${editingUserId}`, formData);
      } else {
        await axiosInstance.post(`/api/user/signup`, formData);
      }
      setIsModalOpen(false);
      refreshUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Manage Users</h1>
            <p className="text-sm text-gray-500">
              View, edit and assign devices
            </p>
          </div>
          <Button
            onClick={() => {
              setIsEditMode(false);
              setEditingUserId(null);
              setFormData({ name: "", email: "", phoneNumber: "" });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>

        <UserTable
          users={filteredUsers}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          onView={(id) => setViewUserId(id)}
          onEdit={(user) => {
            setFormData({
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber ?? "",
            });
            setEditingUserId(user._id);
            setIsEditMode(true);
            setIsModalOpen(true);
          }}
          onAssignDevice={(user) => setAssignDeviceUser(user)}
          onDelete={handleDeleteUser}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        formData={formData}
        loading={formLoading}
        error={formError}
        success={success}
        isEditMode={isEditMode}
      />

      {viewUserId && (
        <UserDevicePopup
          isOpen={true}
          userId={viewUserId}
          onClose={() => setViewUserId(null)}
        />
      )}

      {assignDeviceUser && (
        <DeviceAssignmentForm
          assignedUserId={assignDeviceUser._id}
          assignedUserName={assignDeviceUser.name}
          onClose={() => setAssignDeviceUser(null)}
          onRefresh={refreshUsers}
        />
      )}
      </>
    
  );
};
