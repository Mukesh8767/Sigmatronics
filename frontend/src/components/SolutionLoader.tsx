import React from 'react';

const SolutionCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-36 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="w-16 h-3 bg-gray-100 rounded mb-5 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          {[
            { width: 'w-28' },
            { width: 'w-36' },
            { width: 'w-32' },
            { width: 'w-24' },
            { width: 'w-28' }
          ].map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-3" />
              <div className={`${item.width} h-4 bg-gray-100 rounded animate-pulse`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="w-16 h-3 bg-gray-100 rounded mb-5 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          {[
            { width: 'w-32' },
            { width: 'w-20' },
            { width: 'w-24' },
            { width: 'w-28' },
            { width: 'w-36' }
          ].map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-3" />
              <div className={`${item.width} h-4 bg-gray-100 rounded animate-pulse`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="w-16 h-3 bg-gray-100 rounded mb-5 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          {[
            { width: 'w-24' },
            { width: 'w-32' },
            { width: 'w-28' },
            { width: 'w-36' }
          ].map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-3" />
              <div className={`${item.width} h-4 bg-gray-100 rounded animate-pulse`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-44 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="w-16 h-3 bg-gray-100 rounded mb-5 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          {[
            { width: 'w-28' },
            { width: 'w-24' },
            { width: 'w-40' },
            { width: 'w-32' },
            { width: 'w-36' }
          ].map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-3" />
              <div className={`${item.width} h-4 bg-gray-100 rounded animate-pulse`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionCardSkeleton;
