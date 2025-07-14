import React from 'react';

interface TopListCardProps {
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

const TopListCard: React.FC<TopListCardProps> = ({ title, items, renderItem }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
          {renderItem(item, idx)}
        </div>
      ))}
    </div>
  </div>
);

export default TopListCard;
