import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FiLogOut, FiUsers, FiAward, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CoordinatorDashboard() {
  const [loginId, setLoginId] = useState(localStorage.getItem('coordinatorId') || '');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('coordinatorId'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      fetchDashboardData();
    }
  }, [loggedIn]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const coordinatorId = localStorage.getItem('coordinatorId');
      const response = await axios.get(`${API_BASE_URL}/api/coordinator/dashboard/${coordinatorId}`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard data. Invalid ID or network issue.');
      // Optionally logout if invalid
      if (err.response && err.response.status === 404) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coordinatorId');
    setLoggedIn(false);
    setLoginId('');
    setData(null);
  };

  // Although the user skips this if they come from the main login page, 
  // keeping a premium fallback login if accessed directly without localStorage.
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 text-white">
        <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Coordinator Portal</h2>
          <p className="text-slate-400 mb-8">Access your school's Olympiad performance</p>
          <div className="flex flex-col gap-4">
             <button 
                onClick={() => window.location.href = '/login'}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all"
              >
                Go to Secure Login
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400"
            >
              School Dashboard
            </motion.h1>
            <p className="text-slate-400 mt-2 text-lg">
              {loading ? 'Loading...' : data?.school || 'Coordinator Portal'}
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all backdrop-blur-md"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Registrations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 font-medium">Total Registrations</p>
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <FiUsers size={20} />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white">
              {loading ? '-' : `${data?.totalRegistrations || 0}`}
              <span className="text-sm font-normal text-slate-500 ml-2">/ {data?.expectedRegistrations || 0} expected</span>
            </h2>
          </motion.div>

          {/* Olympiad Completed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 font-medium">Olympiad Completed</p>
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <FiAward size={20} />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white">
              {loading ? '-' : data?.olympiadCompleted || 0}
            </h2>
          </motion.div>

          {/* Daily Engagement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 font-medium">Avg Daily Engagement</p>
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                <FiActivity size={20} />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white">
              {loading ? '-' : `${data?.avgDailyEngagement || 0}%`}
            </h2>
          </motion.div>
        </div>

        {/* Student Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xl font-semibold text-white">Student Progress Overview</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F172A]/80 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Class</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Practice Level</th>
                  <th className="p-4 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="h-4 bg-white/10 rounded w-32"></div></td>
                      <td className="p-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                      <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-24"></div></td>
                      <td className="p-4"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                      <td className="p-4"><div className="h-4 bg-white/10 rounded w-12"></div></td>
                    </tr>
                  ))
                ) : data?.students?.length > 0 ? (
                  data.students.map((s, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-slate-200">{s.name}</td>
                      <td className="p-4 text-slate-400">{s.class}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          s.status === 'Completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : s.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{s.dailyPractice}</td>
                      <td className="p-4">
                        <span className="font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                          {s.examScore}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No students have registered using your school code yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
