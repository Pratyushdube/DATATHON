import React, { useState, useEffect } from 'react';

// HELPER: Mock Data (for demonstration purposes)
const initialStats = [
  { id: 1, title: 'Total Threats', value: '1,234', change: '+12.5%', changeType: 'increase', icon: 'ShieldAlert' },
  { id: 2, title: 'High-Risk Alerts', value: '56', change: '-2.8%', changeType: 'decrease', icon: 'Siren' },
  { id: 3, title: 'Systems Affected', value: '789', change: '+5.2%', changeType: 'increase', icon: 'Laptop' },
  { id: 4, title: 'Incidents Resolved', value: '1,123', change: '+15.0%', changeType: 'decrease', icon: 'CheckCircle' },
];

const threatData = [
  { name: 'Jan', threats: 4000 }, { name: 'Feb', threats: 3000 },
  { name: 'Mar', threats: 2000 }, { name: 'Apr', threats: 2780 },
  { name: 'May', threats: 1890 }, { name: 'Jun', threats: 2390 },
  { name: 'Jul', threats: 3490 }, { name: 'Aug', threats: 3600 },
];

const threatTypes = [
  { name: 'Malware', value: 400, fill: '#8884d8' },
  { name: 'Phishing', value: 300, fill: '#82ca9d' },
  { name: 'DDoS', value: 300, fill: '#ffc658' },
  { name: 'SQL Injection', value: 200, fill: '#ff8042' },
];

const recentAlerts = [
  { id: 'ALERT-001', system: 'auth-service-prod', severity: 'Critical', time: '2 min ago', status: 'Unresolved' },
  { id: 'ALERT-002', system: 'payment-gateway-v2', severity: 'High', time: '15 min ago', status: 'Unresolved' },
  { id: 'ALERT-003', system: 'user-database-replica', severity: 'Medium', time: '1 hr ago', status: 'Resolved' },
  { id: 'ALERT-004', system: 'cdn-edge-node-eu', severity: 'High', time: '3 hr ago', status: 'Unresolved' },
  { id: 'ALERT-005', system: 'api-main-cluster', severity: 'Low', time: '5 hr ago', status: 'Resolved' },
];


// ICONS: Using Lucide-React inspired inline SVGs for simplicity
// In a real project, you would `import { IconName } from 'lucide-react';`
const Icon = ({ name, className }) => {
  const icons = {
    ShieldAlert: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
    Siren: <><path d="M5.5 9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5z" /><path d="M3 12v3c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M12 17v5" /><path d="M8.5 17h7" /><path d="M7 9a5 5 0 0 1 10 0" /></>,
    Laptop: <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.7 20H3.3a1 1 0 0 1-.58-1.45L4 16" />,
    CheckCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    Menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
    Bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    Search: <><path d="m21 21-4.3-4.3" /><circle cx="10.5" cy="10.5" r="7.5" /></>,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};


// To use Recharts, you'd typically install it.
// For this single-file component, we'll assume it's available.
// If this were an HTML file, you'd add:
// <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
// We'll define dummy components to make the JSX valid.
const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
  typeof window.Recharts === 'undefined' ?
  {
    LineChart: ({ children }) => <div className="bg-gray-800 p-4 rounded-lg text-white">Chart Placeholder: {children}</div>,
    Line: () => null, BarChart: () => null, Bar: () => null, PieChart: () => null, Pie: () => null, Cell: () => null,
    XAxis: () => <div className="text-xs text-gray-400">X-Axis</div>, YAxis: () => <div className="text-xs text-gray-400">Y-Axis</div>,
    CartesianGrid: () => null, Tooltip: () => <div>Tooltip</div>, Legend: () => <div>Legend</div>,
    ResponsiveContainer: ({ children }) => <div className="w-full h-64">{children}</div>
  } : window.Recharts;


// Sub-components for the Dashboard
const StatCard = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'increase' ? 'text-red-400' : 'text-green-400';
  const changeIcon = changeType === 'increase' ? '↑' : '↓';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-400">{title}</h3>
        <Icon name={icon} className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <div className={`flex items-center text-sm ${changeColor}`}>
          <span>{changeIcon} {change}</span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
};

const ThreatsOverTimeChart = () => (
  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4">Threats Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={threatData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis dataKey="name" stroke="#a0aec0" />
        <YAxis stroke="#a0aec0" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        <Line type="monotone" dataKey="threats" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ThreatBreakdownChart = () => (
  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4">Threat Breakdown</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={threatTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {threatTypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
        <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const RecentAlerts = () => {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusClass = (status) => {
    return status === 'Resolved' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-300';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 col-span-1 lg:col-span-2">
      <h3 className="text-lg font-bold text-white mb-4">Recent High-Priority Alerts</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-400">Alert ID</th>
              <th className="p-3 text-sm font-semibold text-gray-400">System</th>
              <th className="p-3 text-sm font-semibold text-gray-400">Severity</th>
              <th className="p-3 text-sm font-semibold text-gray-400">Timestamp</th>
              <th className="p-3 text-sm font-semibold text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.map(alert => (
              <tr key={alert.id} className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-sm text-gray-300 font-mono">{alert.id}</td>
                <td className="p-3 text-sm text-gray-300">{alert.system}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getSeverityClass(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-400">{alert.time}</td>
                <td className="p-3">
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(alert.status)}`}>
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  return (
    <div className="bg-cover bg-center text-gray-200 min-h-screen font-sans" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-military.png')"}}>
      <div className="bg-black/50 min-h-screen">
        <div className="flex">
          <div className="flex-1">
            <main className="p-4 md:p-8">
              {/* Stat cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {initialStats.map(stat => (
                  <StatCard key={stat.id} {...stat} />
                ))}
              </div>

              {/* Charts and recent alerts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <ThreatsOverTimeChart />
                </div>
                <div>
                  <ThreatBreakdownChart />
                </div>
              </div>
              
               <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                  <RecentAlerts />
              </div>

            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


