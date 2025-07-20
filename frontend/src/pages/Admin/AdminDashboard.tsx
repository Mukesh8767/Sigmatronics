import React, { useEffect, useState } from 'react';
import AdminWrapper from '../Wrappers/AdminWrapper';
import { Users, Monitor, Award, TrendingUp, Clock } from 'lucide-react';
import { Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart } from 'recharts';

import Greet from '../../components/Greet';
import SummaryCard from '../../components/SummaryCard';
import ChartCard from '../../components/ChartCard';
import TopListCard from '../../components/TopListCard';
import { useAllFetchRootUsers } from '../../hooks/useFetchadminUsers';
import { useAllFetchDevices } from '../../hooks/useFetchAdminDevices';
import axiosInstance from '../../../utils/axiosInstance';


const AdminDashboard: React.FC = () => {
    const { users, loading: userLoading } = useAllFetchRootUsers();
    const { devices, loading: deviceLoading } = useAllFetchDevices();
   
    const [greetingName, setGreetingName] = useState('');
    
    useEffect(() => {
    const fetchName = async () => {
        try {
            const response = await axiosInstance.get('/api/user/getUser');
            
            setGreetingName(response.data.user.name || 'Admin');
        } catch (err) {
            console.error("Failed to fetch greeting name", err);
            setGreetingName('Admin');
        }
    };

    fetchName(); 
}, []);



    const solutionCount = devices.reduce((acc, d) => {
        acc[d.solutionType] = (acc[d.solutionType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const userCountMap = devices.reduce((acc, d) => {
        acc[d.assignedTo] = (acc[d.assignedTo] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dateMap = devices.reduce((acc, d) => {
        const date = d.createdAt.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostPopular = Object.entries(solutionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const pieData = Object.entries(solutionCount).map(([name, value]) => ({
        name, value,
        fill: '#000000'
    }));

    const lineData = Object.entries(dateMap)
        .map(([date, devices]) => ({ date, devices }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const topUsers = Object.entries(userCountMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 3);


    const recent = [...devices]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 3);

    return (
        <AdminWrapper>
            <Greet name={greetingName} />
            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SummaryCard title="Total Users" value={users.length} icon={Users} loading={userLoading} />
                    <SummaryCard title="Machines Allotted" value={devices.length} icon={Monitor} loading={deviceLoading} />
                    <SummaryCard title="Popular Solution" value={mostPopular} icon={Award} loading={deviceLoading} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartCard title="Registrations Over Time">
                        <div className="h-80">
                            {lineData.length ? (
                                <AreaChart width={500} height={300} data={lineData} margin={{ top: 20, right: 30 }}>
                                    <defs>
                                        <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="devices" stroke="#6366F1" fillOpacity={1} fill="url(#colorDev)" />
                                </AreaChart>
                            ) : <p className="text-center text-gray-500">Loading...</p>}
                        </div>
                    </ChartCard>

                    <ChartCard title="Machine Distribution">
                        <div className="h-80 flex justify-center items-center">
                            {pieData.length ? (
                                <BarChart width={400} height={300} data={pieData}  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                    <YAxis tick={{ fill: '#6B7280' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <p className="text-center text-gray-500">Loading...</p>
                            )}
                        </div>
                    </ChartCard>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopListCard
                        title="Top 3 Users by Machines"
                        items={topUsers}
                        renderItem={([userId, cnt], idx) => (
                            <>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-800' : idx === 1 ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">ID: {userId}</p>
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
                        renderItem={(d) => (
                            <>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                                        <Monitor className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{d.machineId}</p>
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
