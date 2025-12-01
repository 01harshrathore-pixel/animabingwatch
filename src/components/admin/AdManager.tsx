 // src/components/admin/AdManager.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../../../components/Spinner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

interface AdSlot {
  _id: string;
  name: string;
  position: string;
  adCode: string;
  isActive: boolean;
  earnings: number;
  impressions: number;
  clicks: number;
  displayRules: {
    maxPerPage: number;
    devices: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AnalyticsData {
  totalAnimes: number;
  totalMovies: number;
  totalEpisodes: number;
  todayUsers: number;
  totalUsers: number;
  todayEarnings: number;
  totalEarnings: number;
  todayPageViews: number;
  totalPageViews: number;
  adPerformance: {
    totalImpressions: number;
    totalClicks: number;
    totalRevenue: number;
    ctr: number;
    activeAds?: number;
  };
  weeklyStats: Array<{
    date: string;
    users: number;
    earnings: number;
    pageViews: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserStats: {
    Chrome: number;
    Firefox: number;
    Safari: number;
    Edge: number;
    Unknown: number;
  };
}

const AdManager: React.FC = () => {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAnimes: 0,
    totalMovies: 0,
    totalEpisodes: 0,
    todayUsers: 0,
    totalUsers: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    todayPageViews: 0,
    totalPageViews: 0,
    adPerformance: {
      totalImpressions: 0,
      totalClicks: 0,
      totalRevenue: 0,
      ctr: 0
    },
    weeklyStats: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
    browserStats: { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Unknown: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'ads' | 'performance'>('analytics');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken') || '';
  };

  useEffect(() => {
    fetchAdSlots();
    fetchAnalytics();
  }, [timeRange]);

  const fetchAdSlots = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/admin/protected/ad-slots`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📢 Fetched ad slots:', data);
      
      if (data && Array.isArray(data)) {
        setAdSlots(data);
      } else {
        console.warn('⚠️ No ad slots data returned, using defaults');
        setAdSlots(defaultAdSlots);
      }
    } catch (err: any) {
      console.error('❌ Failed to load ad slots:', err.response?.data || err.message);
      
      // Show error but use default slots
      if (err.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
        window.location.href = '/admin';
      }
      
      setAdSlots(defaultAdSlots);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/admin/protected/analytics`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { range: timeRange }
      });
      
      console.log('📊 Analytics data:', data);
      
      if (data) {
        setAnalytics({
          ...analytics,
          ...data,
          adPerformance: data.adPerformance || analytics.adPerformance,
          weeklyStats: data.weeklyStats || analytics.weeklyStats,
          deviceStats: data.deviceStats || analytics.deviceStats,
          browserStats: data.browserStats || analytics.browserStats
        });
      }
    } catch (err: any) {
      console.error('❌ Failed to load analytics:', err.response?.data || err.message);
      
      // Don't break on analytics error
      if (err.response?.status === 401) {
        console.warn('⚠️ Unauthorized for analytics');
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSaveAdCode = async () => {
    if (!editingSlot) return;

    try {
      const token = getToken();
      const { data } = await axios.put(
        `${API_BASE}/admin/protected/ad-slots/${editingSlot._id}`,
        { 
          adCode: editingSlot.adCode,
          isActive: editingSlot.isActive,
          name: editingSlot.name
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Save response:', data);
      
      if (data.success) {
        alert('✅ Ad Code Saved Successfully!');
        
        // Update local state
        setAdSlots(prev => prev.map(slot => 
          slot._id === editingSlot._id ? { ...slot, ...data.adSlot } : slot
        ));
        
        setEditingSlot(null);
      } else {
        alert(`❌ ${data.error || 'Failed to save ad code'}`);
      }
    } catch (err: any) {
      console.error('❌ Save error:', err.response?.data || err.message);
      alert(`❌ Failed to save ad code: ${err.response?.data?.error || err.message}`);
    }
  };

  const toggleAdActive = async (slot: AdSlot) => {
    try {
      const token = getToken();
      const { data } = await axios.put(
        `${API_BASE}/admin/protected/ad-slots/${slot._id}`,
        { 
          adCode: slot.adCode,
          isActive: !slot.isActive,
          name: slot.name
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Toggle response:', data);
      
      if (data.success) {
        // Update local state
        setAdSlots(prev => prev.map(s => 
          s._id === slot._id ? { ...s, isActive: !s.isActive } : s
        ));
        
        alert(`✅ Ad ${!slot.isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert(`❌ ${data.error || 'Failed to update ad status'}`);
      }
    } catch (err: any) {
      console.error('❌ Toggle error:', err.response?.data || err.message);
      alert(`❌ Failed to update ad status: ${err.response?.data?.error || err.message}`);
    }
  };

  const simulateAdClick = async (slotId: string) => {
    try {
      const token = getToken();
      const { data } = await axios.post(
        `${API_BASE}/admin/protected/track-ad-click`,
        { slotId, earnings: 0.5 },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('🎯 Track click response:', data);
      
      if (data.success) {
        // Update local state
        setAdSlots(prev => prev.map(slot => 
          slot._id === slotId 
            ? { 
                ...slot, 
                clicks: (slot.clicks || 0) + 1,
                earnings: (slot.earnings || 0) + 0.5,
                impressions: (slot.impressions || 0) + 1
              } 
            : slot
        ));
        
        // Refresh analytics
        fetchAnalytics();
        
        alert('✅ Ad click simulated and tracked!');
      }
    } catch (err: any) {
      console.error('❌ Track click error:', err.response?.data || err.message);
      alert(`❌ Failed to track ad click: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleIncrementImpression = async (slotId: string) => {
    try {
      const token = getToken();
      const { data } = await axios.post(
        `${API_BASE}/admin/protected/increment-impression/${slotId}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('👁️ Impression increment response:', data);
      
      if (data.success) {
        // Update local state
        setAdSlots(prev => prev.map(slot => 
          slot._id === slotId 
            ? { 
                ...slot, 
                impressions: (slot.impressions || 0) + 1
              } 
            : slot
        ));
      }
    } catch (err: any) {
      console.error('❌ Impression error:', err.response?.data || err.message);
    }
  };

  const handleCopyAdCode = (adCode: string) => {
    navigator.clipboard.writeText(adCode)
      .then(() => alert('✅ Ad code copied to clipboard!'))
      .catch(() => alert('❌ Failed to copy ad code'));
  };

  const handleRefreshAll = () => {
    fetchAdSlots();
    fetchAnalytics();
    alert('🔄 Data refreshed!');
  };

  if (loading && adSlots.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <span className="ml-3 text-white">Loading ad slots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Ad Management & Analytics</h2>
          <p className="text-slate-400 text-sm">Manage advertisements and track performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quick Actions */}
          <button
            onClick={handleRefreshAll}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            🔄 Refresh Dashboard
          </button>
          
          {/* Main Tabs */}
          <div className="flex gap-1 bg-slate-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'performance'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              📈 Performance
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'ads'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              🎯 Ad Slots
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-700/50 p-1 rounded-lg">
            {['today', 'week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-slate-400 text-sm">
          Showing data for: <span className="text-white font-medium">{timeRange}</span>
        </div>
      </div>

      {activeTab === 'analytics' && (
        /* ANALYTICS DASHBOARD */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
              <h3 className="text-blue-400 text-sm font-medium">Today's Users</h3>
              <p className="text-2xl font-bold text-white">{analytics.todayUsers.toLocaleString()}</p>
              <p className="text-blue-300 text-xs">Active Visitors</p>
            </div>
            
            <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
              <h3 className="text-green-400 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-bold text-white">{analytics.totalUsers.toLocaleString()}</p>
              <p className="text-green-300 text-xs">All Time</p>
            </div>
            
            <div className="bg-purple-600/20 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-purple-400 text-sm font-medium">Today's Earnings</h3>
              <p className="text-2xl font-bold text-white">₹{analytics.todayEarnings.toFixed(2)}</p>
              <p className="text-purple-300 text-xs">Revenue</p>
            </div>
            
            <div className="bg-orange-600/20 p-4 rounded-lg border border-orange-500/30">
              <h3 className="text-orange-400 text-sm font-medium">Total Earnings</h3>
              <p className="text-2xl font-bold text-white">₹{analytics.totalEarnings.toLocaleString()}</p>
              <p className="text-orange-300 text-xs">All Time</p>
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📺 Content Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Animes</span>
                  <span className="text-white font-semibold">{analytics.totalAnimes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Movies</span>
                  <span className="text-white font-semibold">{analytics.totalMovies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Episodes</span>
                  <span className="text-white font-semibold">{analytics.totalEpisodes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Today's Page Views</span>
                  <span className="text-white font-semibold">{analytics.todayPageViews.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* User Device Stats */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📱 User Devices</h3>
              <div className="space-y-3">
                {Object.entries(analytics.deviceStats || {}).map(([device, count]) => (
                  <div key={device} className="flex justify-between items-center">
                    <span className="text-slate-300 capitalize">{device}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ 
                            width: `${(Number(count) / Math.max(1, Object.values(analytics.deviceStats || {}).reduce((a: number, b: number) => a + b, 0))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold text-sm">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        /* PERFORMANCE DASHBOARD */
        <div className="space-y-6">
          {/* Ad Performance Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-indigo-600/20 p-4 rounded-lg border border-indigo-500/30">
              <h3 className="text-indigo-400 text-sm font-medium">Total Impressions</h3>
              <p className="text-2xl font-bold text-white">{analytics.adPerformance.totalImpressions.toLocaleString()}</p>
              <p className="text-indigo-300 text-xs">Ad Views</p>
            </div>
            
            <div className="bg-pink-600/20 p-4 rounded-lg border border-pink-500/30">
              <h3 className="text-pink-400 text-sm font-medium">Total Clicks</h3>
              <p className="text-2xl font-bold text-white">{analytics.adPerformance.totalClicks.toLocaleString()}</p>
              <p className="text-pink-300 text-xs">User Clicks</p>
            </div>
            
            <div className="bg-teal-600/20 p-4 rounded-lg border border-teal-500/30">
              <h3 className="text-teal-400 text-sm font-medium">Click Rate</h3>
              <p className="text-2xl font-bold text-white">{analytics.adPerformance.ctr.toFixed(2)}%</p>
              <p className="text-teal-300 text-xs">CTR</p>
            </div>
            
            <div className="bg-amber-600/20 p-4 rounded-lg border border-amber-500/30">
              <h3 className="text-amber-400 text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl font-bold text-white">₹{analytics.adPerformance.totalRevenue.toLocaleString()}</p>
              <p className="text-amber-300 text-xs">All Time</p>
            </div>
          </div>

          {/* Browser Statistics */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🌐 Browser Usage</h3>
            <div className="space-y-3">
              {Object.entries(analytics.browserStats || {}).map(([browser, count]) => (
                <div key={browser} className="flex justify-between items-center">
                  <span className="text-slate-300">{browser}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ 
                          width: `${(Number(count) / Math.max(1, Object.values(analytics.browserStats || {}).reduce((a: number, b: number) => a + b, 0))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Stats */}
          {analytics.weeklyStats && analytics.weeklyStats.length > 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📅 Weekly Overview</h3>
              <div className="space-y-3">
                {(analytics.weeklyStats || []).slice(-7).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300 text-sm">{stat.date}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-400">{stat.users} users</span>
                      <span className="text-green-400">{stat.pageViews} views</span>
                      <span className="text-yellow-400">₹{stat.earnings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📅 Weekly Overview</h3>
              <p className="text-slate-400 text-center py-4">No weekly data available yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ads' && (
        /* AD MANAGEMENT */
        <div className="grid gap-6">
          {adSlots.map(slot => {
            const ctr = slot.impressions > 0 ? ((slot.clicks / slot.impressions) * 100).toFixed(2) : '0.00';

            return (
              <div key={slot._id || slot.position} className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{slot.name}</h3>
                    <p className="text-slate-400 text-sm">{slot.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${slot.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        {slot.isActive ? '● Active' : '○ Inactive'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        Created: {slot.createdAt ? new Date(slot.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => simulateAdClick(slot._id)}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-2"
                    >
                      🖱️ Test Click
                    </button>
                    <button
                      onClick={() => handleIncrementImpression(slot._id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-2"
                    >
                      👁️ Add Impression
                    </button>
                    <button
                      onClick={() => toggleAdActive(slot)}
                      className={`px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                        slot.isActive
                          ? 'bg-orange-600 hover:bg-orange-500 text-white'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {slot.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => setEditingSlot(slot)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                    >
                      ✏️ Edit Ad Code
                    </button>
                  </div>
                </div>

                {/* Ad Preview */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-slate-300 font-medium">Ad Code Preview</h4>
                    {slot.adCode && (
                      <button
                        onClick={() => handleCopyAdCode(slot.adCode)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        📋 Copy Code
                      </button>
                    )}
                  </div>
                  
                  {slot.adCode ? (
                    <div className="text-slate-300">
                      <pre className="text-xs bg-slate-900 p-3 rounded overflow-x-auto max-h-40">
                        {slot.adCode.length > 300 ? `${slot.adCode.substring(0, 300)}...` : slot.adCode}
                      </pre>
                      <div className="text-slate-500 text-xs mt-2">
                        Code length: {slot.adCode.length} characters
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400">No ad code configured</p>
                      <p className="text-slate-500 text-sm mt-1">Add ad code to start displaying ads</p>
                    </div>
                  )}
                </div>

                {/* Edit Modal */}
                {editingSlot?._id === slot._id && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Edit Ad Code - {editingSlot.name}</h3>
                        <button
                          onClick={() => setEditingSlot(null)}
                          className="text-slate-400 hover:text-white text-2xl"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Ad Slot Name
                          </label>
                          <input
                            type="text"
                            value={editingSlot.name}
                            onChange={(e) => setEditingSlot({ ...editingSlot, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter ad slot name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Ad Code (HTML/JavaScript)
                          </label>
                          <textarea
                            value={editingSlot.adCode}
                            onChange={(e) => setEditingSlot({ ...editingSlot, adCode: e.target.value })}
                            className="w-full h-64 bg-slate-800 border border-slate-600 text-white rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Paste your ad code here..."
                          />
                          <div className="text-slate-500 text-xs mt-1">
                            Supports HTML, JavaScript, and iframe codes
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={editingSlot.isActive}
                            onChange={(e) => setEditingSlot({ ...editingSlot, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="isActive" className="ml-2 text-sm text-slate-300">
                            Activate this ad slot
                          </label>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveAdCode}
                            className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                          >
                            💾 Save Ad Code
                          </button>
                          <button
                            onClick={() => setEditingSlot(null)}
                            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                          <h4 className="text-blue-400 font-semibold mb-2">💡 Ad Code Examples:</h4>
                          <pre className="text-xs text-blue-300 overflow-x-auto">
{`<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID"></script>
<ins class="adsbygoogle" 
     style="display:block" 
     data-ad-client="ca-pub-YOUR_CLIENT_ID" 
     data-ad-slot="YOUR_AD_SLOT"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

<!-- Direct Banner Ad -->
<a href="https://example.com" target="_blank">
  <img src="https://example.com/banner.jpg" alt="Advertisement" />
</a>

<!-- Simple Text Ad -->
<div style="background: #1a202c; color: white; padding: 15px; text-align: center; border-radius: 8px;">
  <h4>Sponsored Content</h4>
  <p>This is a sample advertisement</p>
  <a href="https://example.com" style="color: #63b3ed;">Visit Website</a>
</div>`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-600">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{slot.impressions || 0}</div>
                    <div className="text-slate-400 text-sm">Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{slot.clicks || 0}</div>
                    <div className="text-slate-400 text-sm">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{ctr}%</div>
                    <div className="text-slate-400 text-sm">CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">₹{slot.earnings?.toFixed(2) || '0.00'}</div>
                    <div className="text-slate-400 text-sm">Earnings</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {(loading || analyticsLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg flex items-center gap-3">
            <Spinner />
            <span className="text-white">Loading data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Default ad slots
const defaultAdSlots: AdSlot[] = [
  {
    _id: '1',
    name: 'Header Banner',
    position: 'header',
    adCode: '',
    isActive: false,
    earnings: 0,
    impressions: 0,
    clicks: 0,
    displayRules: { maxPerPage: 1, devices: ['desktop', 'mobile'] }
  },
  {
    _id: '2', 
    name: 'Sidebar Ad',
    position: 'sidebar',
    adCode: '',
    isActive: false,
    earnings: 0,
    impressions: 0,
    clicks: 0,
    displayRules: { maxPerPage: 1, devices: ['desktop', 'mobile'] }
  },
  {
    _id: '3',
    name: 'In-Content Ad', 
    position: 'in_content',
    adCode: '',
    isActive: false,
    earnings: 0,
    impressions: 0,
    clicks: 0,
    displayRules: { maxPerPage: 1, devices: ['desktop', 'mobile'] }
  },
  {
    _id: '4',
    name: 'Sticky Footer',
    position: 'sticky_footer',
    adCode: '',
    isActive: false,
    earnings: 0,
    impressions: 0,
    clicks: 0,
    displayRules: { maxPerPage: 1, devices: ['mobile'] }
  },
  {
    _id: '5',
    name: 'Popup Ad',
    position: 'popup',
    adCode: '',
    isActive: false,
    earnings: 0,
    impressions: 0,
    clicks: 0,
    displayRules: { maxPerPage: 1, devices: ['desktop', 'mobile'] }
  }
];

export default AdManager;
