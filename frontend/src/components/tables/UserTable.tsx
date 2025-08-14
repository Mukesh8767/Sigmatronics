import Input from "../input";
import { Button } from "../button";
import { Search, User, Mail, Phone } from "lucide-react";

interface UserType {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserTableProps {
  users: UserType[];
  onSearch: (term: string) => void;
  searchTerm: string;
  onView: (id: string) => void;
  onEdit: (user: UserType) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const UserTable = ({
  users,
  onSearch,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) => {
  return (
    <>
      {/* Search Bar */}
      <div className="w-full sm:max-w-md mb-4 px-4 sm:px-0">
        <Input
          type="text"
          name="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          icon={Search}
          className="bg-white border-gray-300 w-full"
        />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mx-4 sm:mx-0">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            User List ({users.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
  {users.length > 0 ? (
    users.map((user) => (
      <div
        key={user._id}
        className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* User Info */}
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 break-words">{user.name}</h3>
              <div className="flex items-center space-x-1 mt-1 min-w-0">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-500 break-all">{user.email}</p>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-500 break-all">{user.phoneNumber}</p>
              </div>
              {user.updatedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Last Updated: {new Date(user.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onView(user._id)}>
              View
            </Button>
            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => onEdit(user)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => onDelete(user._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="p-12 text-center">
      <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-500">Try adjusting your search terms</p>
    </div>
  )}
</div>


            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 border-t border-gray-200 gap-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
