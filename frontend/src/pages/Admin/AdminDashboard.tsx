import React, { useEffect, useState } from "react";
import AdminWrapper from "../Wrappers/AdminWrapper";
import {
  Users,
  Monitor,
  Award,
  TrendingUp,
  Clock,
  Activity,
  Layers,
} from "lucide-react";
import {
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  BarChart,
} from "recharts";

import Greet from "../../components/Greet";
import SummaryCard from "../../components/SummaryCard";
import ChartCard from "../../components/ChartCard";
import TopListCard from "../../components/TopListCard";
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

  const userCountMap = devices.reduce((acc, d) => {
    acc[d.assignedTo] = (acc[d.assignedTo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dateMap = devices.reduce((acc, d) => {
    const date = d.createdAt.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopular =
    Object.entries(solutionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const totalSolutions = Object.keys(solutionCount).length;

  const pieData = Object.entries(solutionCount).map(([name, value]) => ({
    name,
    value,
    fill: "#3B82F6",
  }));

  const lineData = Object.entries(dateMap)
    .map(([date, devices]) => ({ date, devices }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const topUsers = Object.entries(userCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

    console.log(userCountMap);

  const recent = [...devices]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 3);

  return (
    <AdminWrapper>
      <div className="bg-white text-gray-900 min-h-screen p-6 space-y-8">
        <Greet name={greetingName} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard
            title="Total Users"
            value={users.length}
            icon={Users}
            loading={userLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          <SummaryCard
            title="Machines Allotted"
            value={devices.length}
            icon={Monitor}
            loading={deviceLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
          <SummaryCard
            title="Popular Solution"
            value={mostPopular}
            icon={Award}
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
          <SummaryCard
            title="Total Solutions"
            value={totalSolutions}
            icon={Layers}
            loading={deviceLoading}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow hover:shadow-lg transition rounded-xl"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            title="Registrations Over Time"
            className="bg-white border border-gray-200 shadow rounded-xl"
          >
            <div className="h-80 flex justify-center items-center">
              {lineData.length ? (
                <AreaChart
                  width={500}
                  height={300}
                  data={lineData}
                  margin={{ top: 20, right: 30 }}
                >
                  <defs>
                    <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280" }}
                  />
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="devices"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorDev)"
                  />
                </AreaChart>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Machine Distribution"
            className="bg-white border border-gray-200 shadow rounded-xl"
          >
            <div className="h-80 flex justify-center items-center">
              {pieData.length ? (
                <BarChart
                  width={400}
                  height={300}
                  data={pieData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
                  <YAxis tick={{ fill: "#6B7280" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopListCard
            title="Top 3 Users by Machines"
            items={topUsers}
            className="bg-white border border-gray-200 shadow rounded-xl"
            renderItem={([userId, cnt], idx) => (
              <>
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold 
                      ${
                        idx === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : idx === 1
                          ? "bg-gray-200 text-gray-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{userId}</p>
                    <p className="text-sm text-gray-500">{cnt} devices</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </>
            )}
          />

          <TopListCard
            title="Recent Registrations"
            items={recent}
            className="bg-white border border-gray-200 shadow rounded-xl"
            renderItem={(d) => (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                    <Monitor className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{d.machineId}</p>
                    <p className="text-sm text-gray-500">{d.solutionType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          />
        </div>
      </div>
    </AdminWrapper>
  );
};

export default AdminDashboard;
