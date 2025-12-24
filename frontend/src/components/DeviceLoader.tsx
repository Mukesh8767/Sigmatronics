export const SolutionsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-[#2C2C2E] relative overflow-hidden h-[190px]">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#2C2C2E]" />
            <div className="w-5 h-5 rounded bg-gray-100 dark:bg-[#2C2C2E]" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="h-6 w-3/4 bg-gray-100 dark:bg-[#2C2C2E] rounded-md mb-2" />
              <div className="h-4 w-1/2 bg-gray-100 dark:bg-[#2C2C2E] rounded-md" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-100 dark:bg-[#2C2C2E] rounded" />
                <div className="h-3 w-8 bg-gray-100 dark:bg-[#2C2C2E] rounded" />
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-[#2C2C2E] rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AlertsSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-gray-200 dark:border-[#2C2C2E] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#3A3A3C] shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 w-full">
                  <div className="h-4 w-1/3 bg-gray-100 dark:bg-[#2C2C2E] rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 dark:bg-[#2C2C2E] rounded" />
                </div>
                <div className="w-12 h-5 bg-gray-100 dark:bg-[#2C2C2E] rounded-full" />
              </div>
              <div className="h-3 w-24 bg-gray-100 dark:bg-[#2C2C2E] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SolutionsSkeleton;
