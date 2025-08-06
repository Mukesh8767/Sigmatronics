
import React from 'react';
import Input from './input';
import { Button } from './button';
import { Mail, User, Lock, Phone, X } from 'lucide-react';

interface EditProfileFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  onClose: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-gray-100/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black" 
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Your full name"
                icon={User}
                value={formData.name}
                onChange={onChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="Your email address"
                icon={Mail}
                value={formData.email}
                onChange={onChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="Your phone number"
                icon={Phone}
                value={formData.phoneNumber || ''}
                onChange={onChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="New password (optional)"
                icon={Lock}
                value={formData.password}
                onChange={onChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={loading} size="sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
