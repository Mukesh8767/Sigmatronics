import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'black' | "";
  loading?: boolean;
}

type ColorKey = 'black' | '';

const colorMap: Record<ColorKey, { text: string; bg?: string }> = {
  black: { text: 'text-black' },
  '': { text: '', bg: '' }
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title, value, icon: Icon, color = '', loading = false
}) => {
  const colors = colorMap[color] || { text: '', bg: '' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? <span className="animate-pulse bg-gray-200 h-8 w-16 block rounded"></span> : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
