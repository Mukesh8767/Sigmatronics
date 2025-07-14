export const SolutionTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mx-4 sm:mx-0">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="px-6 py-4 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolutionTableSkeleton;
