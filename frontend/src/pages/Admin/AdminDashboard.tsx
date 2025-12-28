import React, { useEffect, useState } from "react";
import AdminWrapper from "../Wrappers/AdminWrapper";
import { AdminUsers } from "./AdminUser";
import {
  Users,
  Monitor,
  
  Activity,
  Layers,
} from "lucide-react";


import Greet from "../../components/Greet";
import SummaryCard from "../../components/SummaryCard";

import { useAllFetchRootUsers } from "../../hooks/useFetchadminUsers";
import { useAllFetchDevices } from "../../hooks/useFetchAdminDevices";
import axiosInstance from "../../../utils/axiosInstance";
import { useParams } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { users, loading: userLoading } = useAllFetchRootUsers();
  const { devices, loading: deviceLoading } = useAllFetchDevices();
  const { adminId } = useParams();
  const [greetingName, setGreetingName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/getUser/${adminId}`);
        setGreetingName(response.data.user.name || "Admin");
      } catch {
        setGreetingName("Admin");
      }
    };
    fetchName();
  }, [adminId]);

  const solutionCount = devices.reduce((acc, d) => {
    acc[d.solutionType] = (acc[d.solutionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);



  

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const totalSolutions = Object.keys(solutionCount).length;

  

  return (
    <AdminWrapper>
      <div className="bg-white text-gray-900 min-h-screen p-6 space-y-8">
        <Greet name={greetingName} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
            title="Total Solutions"
            value={totalSolutions}
            icon={Layers}
            loading={deviceLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          <SummaryCard
            title="Total Users"
            value={users.length}
            icon={Users}
            loading={userLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          <SummaryCard
            title="Devices Allotted"
            value={devices.length}
            icon={Monitor}
            loading={deviceLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          
          <SummaryCard
            title="Active Devices"
            value={activeDevices}
            icon={Activity}
            loading={deviceLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          
        </div>

        
        <AdminUsers />
        
      </div>
    </AdminWrapper>
  );
};

export default AdminDashboard;
