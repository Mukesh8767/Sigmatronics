import  Input  from "./input";
import { Button } from "./button";
import { User, Mail, X, Phone } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  formData: { name: string; email: string, phoneNumber: string };
  loading: boolean;
  error: string | null;
  success: string | null;
  isEditMode: boolean;
  children?: React.ReactNode;
}

export const UserModal = ({
  isOpen,
  onClose,
  onChange,
  onSubmit,
  formData,
  loading,
  error,
  success,
  isEditMode,
}: UserModalProps) => {
  if (!isOpen) return null;

  
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-100/50 z-50 flex items-center justify-center p-4 text-black"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit User" : "Add New User"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                type="text"
                placeholder="Enter user's full name"
                value={formData.name}
                onChange={onChange}
                icon={User}
                name="name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter user's email address"
                value={formData.email}
                onChange={onChange}
                icon={Mail}
                name="email"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter user's phone number"
                value={formData.phoneNumber}
                onChange={onChange}
                icon={Phone}
                name="phoneNumber"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={loading} size="sm" className="flex items-center gap-2">
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEditMode ? 'Update' : 'Invite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

