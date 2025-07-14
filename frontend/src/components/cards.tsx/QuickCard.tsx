// components/cards/QuickCard.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface QuickCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickCard: React.FC<QuickCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 cursor-pointer hover:bg-gray-800 transition-all"
    >
      <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
      <div className="mt-4 flex items-center text-sm text-gray-400 hover:text-white">
        Explore <TrendingUp className="ml-2" size={16} />
      </div>
    </div>
  );
};

export default QuickCard;
