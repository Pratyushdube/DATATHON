import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const initialStats = [
  { id: 1, title: 'Total Threats', value: '1,234', change: '+12.5%', changeType: 'increase', icon: 'ShieldAlert' },
  { id: 2, title: 'High-Risk Alerts', value: '56', change: '-2.8%', changeType: 'decrease', icon: 'Siren' },
  { id: 3, title: 'Systems Affected', value: '789', change: '+5.2%', changeType: 'increase', icon: 'Laptop' },
  { id: 4, title: 'Incidents Resolved', value: '1,123', change: '+15.0%', changeType: 'decrease', icon: 'CheckCircle' },
];

const recentAlerts = [
  { id: 'ALERT-001', system: 'auth-service-prod', severity: 'Critical', time: '2 min ago', status: 'Unresolved' },
  { id: 'ALERT-002', system: 'payment-gateway-v2', severity: 'High', time: '15 min ago', status: 'Unresolved' },
  { id: 'ALERT-003', system: 'user-database-replica', severity: 'Medium', time: '1 hr ago', status: 'Resolved' },
  { id: 'ALERT-004', system: 'cdn-edge-node-eu', severity: 'High', time: '3 hr ago', status: 'Unresolved' },
  { id: 'ALERT-005', system: 'api-main-cluster', severity: 'Low', time: '5 hr ago', status: 'Resolved' },
];


// --- MOCKED DATA FOR CHARTS ---
// This data remains for demonstration as the API doesn't have chart endpoints.
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

// --- API CONFIGURATION ---
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- SVG ICONS ---
const Icon = ({ name, className }) => {
    const icons = {
        ShieldAlert: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
        Siren: <><path d="M5.5 9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5z" /><path d="M3 12v3c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M12 17v5" /><path d="M8.5 17h7" /><path d="M7 9a5 5 0 0 1 10 0" /></>,
        Laptop: <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.7 20H3.3a1 1 0 0 1-.58-1.45L4 16" />,
        CheckCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name]}
        </svg>
    );
};


// --- DASHBOARD SUB-COMPONENTS ---

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


// --- FEATURE 1: Live Hybrid Analysis Tool ---
const HybridAnalysisTool = () => {
    // State to hold the form inputs, pre-filled with the example from your API
    const [formState, setFormState] = useState({
        duration: 0.009,
        proto: "tcp",
        service: "http",
        conn_state: "SF",
        orig_bytes: 3,
        resp_bytes: 0,
        missed_bytes: 2,
        orig_pkts: 4,
        orig_ip_bytes: 40,
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/predict/hybrid-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Prediction failed:", error);
            setResult({ error: "Could not connect to the model." });
        } finally {
            setIsLoading(false);
        }
    };

    const getResultUI = () => {
        if (isLoading) {
            return <div className="text-center text-gray-400 animate-pulse">Analyzing traffic log...</div>;
        }
        if (!result) {
            return <p className="text-center text-gray-500">Enter traffic log data to run a hybrid analysis.</p>;
        }
        if (result.error) {
            return <p className="text-center text-yellow-400 font-semibold">⚠️ {result.error}</p>;
        }

        const verdictStyles = {
            "Confirmed Known Threat": {
                bgColor: 'bg-red-900/50 border-red-500',
                textColor: 'text-red-300',
                icon: '🚨'
            },
            "Unknown Anomaly Detected (Potential Zero-Day)": {
                bgColor: 'bg-orange-700/50 border-orange-400',
                textColor: 'text-orange-300',
                icon: '⚠️'
            },
            "Known Threat Pattern Detected (Low-and-Slow Activity)": {
                bgColor: 'bg-yellow-700/50 border-yellow-400',
                textColor: 'text-yellow-300',
                icon: '🔎'
            },
            "Normal Traffic": {
                bgColor: 'bg-green-800/50 border-green-500',
                textColor: 'text-green-300',
                icon: '✅'
            },
        };

        const style = verdictStyles[result.verdict] || verdictStyles["Normal Traffic"];

        return (
            <div className={`p-4 rounded-lg border ${style.bgColor} transition-all`}>
                <div className={`text-center font-bold text-lg mb-2 ${style.textColor}`}>
                    {style.icon} {result.verdict}
                </div>
                <div className="text-center text-sm text-gray-400 flex justify-center items-center space-x-4">
                    <span>Anomaly Score: <b className="text-white">{result.anomaly_score.toFixed(4)}</b></span>
                    <span className="text-gray-600">|</span>
                    <span>Known Threat: <b className={result.is_known_threat ? 'text-red-400' : 'text-green-400'}>{result.is_known_threat ? 'Yes' : 'No'}</b></span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Live Hybrid Threat Analysis</h3>
            <form onSubmit={handlePredict}>
                {/* Inputs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {Object.entries(formState).map(([key, value]) => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-xs font-medium text-gray-400 mb-1 capitalize">{key.replace('_', ' ')}</label>
                            <input
                                type={typeof value === 'number' ? 'number' : 'text'}
                                id={key}
                                name={key}
                                value={value}
                                onChange={handleInputChange}
                                step={key === 'duration' ? "0.001" : "1"}
                                required
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mb-6">
                    <button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </form>
            <div className="mt-4">
                {getResultUI()}
            </div>
        </div>
    );
};

// --- FEATURE 2: Live Anomaly Detector ---
const LiveAnomalyDetector = () => {
    // State to hold all 32 feature inputs
    const [features, setFeatures] = useState(() => {
        const initialFeatures = {};
        // Pre-fill with an example for convenience
        const example = {"feature_1":1.9901,"feature_10":-0.1789,"feature_11":0.0406,"feature_12":-0.2658,"feature_13":0.9586,"feature_14":0.1734,"feature_15":0.6826,"feature_16":0.5192,"feature_17":0.1271,"feature_18":-1.4251,"feature_19":-2.0184,"feature_2":-0.5092,"feature_20":0.0729,"feature_21":-0.2575,"feature_22":-0.0374,"feature_23":0.4007,"feature_24":0.2273,"feature_25":0.0788,"feature_26":1.2154,"feature_27":-1.1556,"feature_28":-0.4729,"feature_29":0.8462,"feature_3":0.2132,"feature_30":-0.7632,"feature_31":1.2559,"feature_32":-1.4375,"feature_4":-1.0537,"feature_5":-0.9658,"feature_6":-0.8571,"feature_7":0.4944,"feature_8":0.5057,"feature_9":-0.5355};
        for (let i = 1; i <= 32; i++) {
            initialFeatures[`feature_${i}`] = example[`feature_${i}`] || 0;
        }
        return initialFeatures;
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Single handler to update any feature input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFeatures(prevFeatures => ({
            ...prevFeatures,
            [name]: value
        }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        // Convert all feature values to numbers before sending
        const payload = Object.fromEntries(
            Object.entries(features).map(([key, value]) => [key, parseFloat(value) || 0])
        );

        try {
            const response = await fetch(`${API_BASE_URL}/predictanomaly`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Prediction failed:", error);
            setResult({ error: "Could not connect to the model." });
        } finally {
            setIsLoading(false);
        }
    };

    const getResultUI = () => {
        if (isLoading) {
            return <div className="text-center text-gray-400 animate-pulse">Analyzing...</div>;
        }
        if (!result) {
            return <p className="text-center text-gray-500">Enter feature values to run a prediction.</p>;
        }
        if (result.error) {
            return <p className="text-center text-yellow-400 font-semibold">⚠️ {result.error}</p>;
        }
        
        const isAnomaly = result.is_anomaly;
        const bgColor = isAnomaly ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500';
        const textColor = isAnomaly ? 'text-red-300' : 'text-green-300';

        return (
            <div className={`p-4 rounded-lg border ${bgColor} transition-all`}>
                <div className={`text-center font-bold text-lg mb-2 ${textColor}`}>
                    {isAnomaly ? '🚨 Anomaly Detected' : '✅ System Normal'}
                </div>
                <div className="text-center text-sm text-gray-400 space-x-4">
                    <span>Reconstruction Error: <b className="text-white">{result.reconstruction_error.toFixed(4)}</b></span>
                    <span>Threshold: <b className="text-white">{result.threshold.toFixed(4)}</b></span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Live Anomaly Detector</h3>
            <form onSubmit={handlePredict}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                    {Object.keys(features).map(key => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-xs font-medium text-gray-400 mb-1">{key.replace('_', ' ').replace('feature', 'F')}</label>
                            <input
                                type="number"
                                id={key}
                                name={key}
                                value={features[key]}
                                onChange={handleInputChange}
                                step="any"
                                required
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
                            />
                        </div>
                    ))}
                </div>
                 <div className="flex justify-center mb-6">
                     <button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                         {isLoading ? 'Analyzing...' : 'Analyze'}
                     </button>
                 </div>
            </form>
            <div className="mt-4">
                {getResultUI()}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
    // Mock state for stats and alerts as these endpoints are not available
    const [stats, setStats] = useState([
        { id: 1, title: 'Total Threats', value: '1,420', change: '+12.5%', changeType: 'increase', icon: 'ShieldAlert' },
        { id: 2, title: 'High-Risk Alerts', value: '89', change: '-2.8%', changeType: 'decrease', icon: 'Siren' },
        { id: 3, title: 'Systems Affected', value: '23', change: '+5.2%', changeType: 'increase', icon: 'Laptop' },
        { id: 4, title: 'Threats Logged for Audit', value: '1,280', change: '+15.0%', changeType: 'increase', icon: 'CheckCircle' },
    ]);

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <main className="p-4 md:p-8">
                <h1 className="text-3xl font-bold text-white mb-6">Hybrid Threat Intelligence Dashboard</h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map(stat => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                {/* Live Hybrid Analysis Tool */}
                <div className="mb-8">
                    <HybridAnalysisTool />
                </div>

                {/* Live Anomaly Detector Component */}
                <div className="mb-8">
                    <LiveAnomalyDetector />
                </div>

                {/* Charts Grid */}
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
    );
}

export default Dashboard;