export const ListLoader = () => {
  return (
    <div className="w-full">
      {/* Table View - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(7)].map((_, rowIndex) => (
              <tr key={rowIndex} className="divide-x divide-gray-200">
                {[...Array(6)].map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-4 whitespace-nowrap"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card View - Mobile */}
      <div className="block md:hidden space-y-4">
        {[...Array(7)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 bg-white rounded shadow-sm space-y-2 border border-gray-200"
          >
            {[...Array(6)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-200 rounded animate-pulse w-3/4"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
