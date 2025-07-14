import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full ${className}`}>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{title}</h3>
    
    <div className="w-full overflow-x-auto">
      <div className="min-w-[300px]">
        {children}
      </div>
    </div>
  </div>
);

export default ChartCard;
