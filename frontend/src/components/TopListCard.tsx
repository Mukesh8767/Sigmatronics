import React from 'react';

interface TopListCardProps {
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}


const TopListCard: React.FC<TopListCardProps> = ({ title, items, renderItem }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-5">{title}</h3>
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition"
        >
          {renderItem(item, idx)}
        </div>
      ))}
    </div>
  </div>
);

export default TopListCard;
