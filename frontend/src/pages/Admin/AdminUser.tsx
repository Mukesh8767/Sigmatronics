import AdminWrapper from "../Wrappers/AdminWrapper";
import { Button } from "../../components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFetchUser } from "../../hooks/useFetchadminUsers";
import axiosInstance from "../../../utils/axiosInstance";
import { UserTable } from "../../components/tables/UserTable";
import { UserModal } from "../../components/UserModal";
import UserDevicePopup from "../../components/UserDevicePopup";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { users = [], totalPages = 1, loading, error } = useFetchUser(currentPage, 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  const filteredUsers = users.filter((user: User) =>
    [user.name, user.email, user.phoneNumber ?? ""]
      .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const refreshUsers = () => {
    setCurrentPage((prev) => prev); // triggers re-fetch without full reload
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/api/user/deleteUser/${id}`);
      refreshUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phoneNumber) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      if (isEditMode && editingUserId) {
        await axiosInstance.put(`/api/user/update/${editingUserId}`, formData);
        setSuccess("User updated successfully!");
      } else {
        await axiosInstance.post(`/api/user/signup`, formData);
        setSuccess("User invited successfully!");
      }

      setFormData({ name: "", email: "", phoneNumber: "" });
      setTimeout(() => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingUserId(null);
        refreshUsers();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to submit form.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminWrapper>
      <div className="p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center gap-4 sticky top-0 bg-white z-10 py-3">
  <div className="flex-1 min-w-[200px]">
    <h1 className="text-lg sm:text-2xl font-semibold">Manage Users</h1>
    <p className="text-xs sm:text-sm text-gray-500">View and manage all of your users here.</p>
  </div>
  <Button
    onClick={() => {
      setFormData({ name: "", email: "", phoneNumber: "" });
      setIsEditMode(false);
      setEditingUserId(null);
      setIsModalOpen(true);
    }}
    size="sm"
    className="flex items-center gap-2 w-full sm:w-auto justify-center"
  >
    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
    Add User
  </Button>
</div>


        {/* Table */}
        <UserTable
          users={filteredUsers}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          onView={(id) => setViewUserId(id)}
          onEdit={(user) => {
            const u = user as User;
            setFormData({
              name: u.name,
              email: u.email,
              phoneNumber: u.phoneNumber ?? "",
            });
            setIsEditMode(true);
            setEditingUserId(u._id);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteUser}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      <UserModal
        key={editingUserId || "new"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingUserId(null);
        }}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        formData={formData}
        loading={formLoading}
        error={formError}
        success={success}
        isEditMode={isEditMode}
      />

      {/* Device Popup */}
      {viewUserId && (
        <UserDevicePopup
          isOpen={!!viewUserId}
          userId={viewUserId}
          onClose={() => setViewUserId(null)}
        />
      )}
    </AdminWrapper>
  );
};
