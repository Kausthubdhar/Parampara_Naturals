import React, { useState } from 'react';
import { Trash2, Plus, Filter, Calendar, TrendingDown, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import AddWasteEntryForm from './forms/AddWasteEntryForm';

interface WasteEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: 'expired' | 'damaged' | 'spoiled' | 'other';
  date: Date;
  cost: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const WasteManagement: React.FC = () => {
  const { state } = useApp();
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterReason, setFilterReason] = useState<'all' | 'expired' | 'damaged' | 'spoiled' | 'other'>('all');

  // Calculate waste statistics
  const totalWasteValue = wasteEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const pendingEntries = wasteEntries.filter(entry => entry.status === 'pending').length;
  const approvedEntries = wasteEntries.filter(entry => entry.status === 'approved').length;
  const thisMonthWaste = wasteEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }).reduce((sum, entry) => sum + entry.cost, 0);

  // Filter waste entries
  const filteredEntries = wasteEntries.filter(entry => {
    const matchesSearch = entry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesReason = filterReason === 'all' || entry.reason === filterReason;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const addWasteEntry = (entry: Omit<WasteEntry, 'id'>) => {
    const newEntry: WasteEntry = {
      ...entry,
      id: `waste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setWasteEntries(prev => [...prev, newEntry]);
    setShowAddForm(false);
  };

  const updateWasteStatus = (id: string, status: 'approved' | 'rejected') => {
    setWasteEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, status } : entry
    ));
  };

  const deleteWasteEntry = (id: string) => {
    setWasteEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark">Waste Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage product waste to reduce losses</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add Waste Entry</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{totalWasteValue.toFixed(2)}</p>
          <p className="text-gray-600 dark:text-gray-400">Total Waste Value</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingEntries}</p>
          <p className="text-gray-600 dark:text-gray-400">Pending Approval</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedEntries}</p>
          <p className="text-gray-600 dark:text-gray-400">Approved Entries</p>
        </div>

        <div className="card text-center">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">₹{thisMonthWaste.toFixed(2)}</p>
          <p className="text-gray-600 dark:text-gray-400">This Month</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search waste entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-field py-2 min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value as any)}
              className="input-field py-2 min-w-[150px]"
            >
              <option value="all">All Reasons</option>
              <option value="expired">Expired</option>
              <option value="damaged">Damaged</option>
              <option value="spoiled">Spoiled</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Waste Entries List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Cost</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-text dark:text-text-dark">{entry.productName}</p>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-text dark:text-text-dark">{entry.quantity} {entry.unit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.reason === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      entry.reason === 'damaged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      entry.reason === 'spoiled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {entry.reason.charAt(0).toUpperCase() + entry.reason.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-red-600 dark:text-red-400">₹{entry.cost.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      entry.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {entry.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateWasteStatus(entry.id, 'approved')}
                            className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 p-1 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateWasteStatus(entry.id, 'rejected')}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteWasteEntry(entry.id)}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <Trash2 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-4">No waste entries found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' || filterReason !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Start tracking waste to reduce losses and improve inventory management'
              }
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn-primary px-8 py-3"
            >
              Add First Waste Entry
            </button>
          </div>
        )}
      </div>

      {/* Add Waste Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border/50 dark:border-border-dark/50 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AddWasteEntryForm 
                onClose={() => setShowAddForm(false)}
                onSave={addWasteEntry}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagement;
