'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Clock, CheckCircle, AlertCircle, User, Calendar, MessageSquare, TrendingUp, Stethoscope } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  follow_up_required: 'bg-purple-100 text-purple-800'
};

const typeIcons = {
  crop_disease: Stethoscope,
  market_advisory: TrendingUp,
  soil_management: '🌱',
  pest_control: '🐛',
  irrigation: '💧',
  fertilizer: '🧪',
  harvesting: '🌾',
  general: MessageSquare
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });
  const [aggregates, setAggregates] = useState({ byStatus: [], byType: [] });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium',
    cropDetails: {
      cropName: '',
      variety: '',
      stage: '',
      area: '',
      currentIssues: []
    }
  });

  useEffect(() => {
    fetchConsultations();
  }, [filters]);

  const fetchConsultations = async () => {
    try {
      const params = new URLSearchParams();
      params.append('farmerId', '507f1f77bcf86cd799439011'); // Mock farmer ID
      params.append('analytics', 'true');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/consultations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setConsultations(data.data);
        setAggregates(data.aggregates);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newConsultation,
          farmerId: '507f1f77bcf86cd799439011',
          cropDetails: {
            ...newConsultation.cropDetails,
            currentIssues: newConsultation.cropDetails.currentIssues.filter(Boolean)
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setConsultations([data.data, ...consultations]);
        setShowCreateModal(false);
        setNewConsultation({
          type: '',
          subject: '',
          description: '',
          priority: 'medium',
          cropDetails: {
            cropName: '',
            variety: '',
            stage: '',
            area: '',
            currentIssues: []
          }
        });
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expert Consultations</h1>
              <p className="text-gray-600">Get professional advice from agricultural experts</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              New Consultation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {aggregates.byStatus.map(stat => (
              <div key={stat._id} className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-sm text-gray-600 capitalize">{stat._id.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search consultations..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="crop_disease">Crop Disease</option>
              <option value="market_advisory">Market Advisory</option>
              <option value="soil_management">Soil Management</option>
              <option value="pest_control">Pest Control</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizer">Fertilizer</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-4">
          {consultations.map(consultation => {
            const TypeIcon = typeIcons[consultation.type] || MessageSquare;
            
            return (
              <Link key={consultation._id} href={`/consultations/${consultation._id}`}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        {typeof TypeIcon === 'string' ? (
                          <span className="text-xl">{TypeIcon}</span>
                        ) : (
                          <TypeIcon className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{consultation.subject}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[consultation.status]}`}>
                            {consultation.status.replace('_', ' ')}
                          </span>
                          {consultation.priority === 'urgent' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{consultation.description}</p>
                        
                        {consultation.cropDetails?.cropName && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>🌾 {consultation.cropDetails.cropName}</span>
                            {consultation.cropDetails.variety && (
                              <span>Variety: {consultation.cropDetails.variety}</span>
                            )}
                            {consultation.cropDetails.area && (
                              <span>Area: {consultation.cropDetails.area} acres</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(consultation.createdAt)}
                          </div>
                          
                          {consultation.expert && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {consultation.expert.name}
                            </div>
                          )}
                          
                          {consultation.analytics && (
                            <>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {consultation.analytics.messagesExchanged} messages
                              </div>
                              
                              {consultation.analytics.recommendationsGiven > 0 && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  {consultation.analytics.recommendationsGiven} recommendations
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {consultation.rating?.score && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{consultation.rating.score}</span>
                      </div>
                    )}
                  </div>
                  
                  {consultation.activeRecommendations?.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600 mb-2">Active Recommendations:</div>
                      <div className="flex flex-wrap gap-2">
                        {consultation.activeRecommendations.slice(0, 3).map((rec, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            {rec.title}
                          </span>
                        ))}
                        {consultation.activeRecommendations.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{consultation.activeRecommendations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {consultations.length === 0 && (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations yet</h3>
              <p className="text-gray-500 mb-4">Start your first consultation with an expert</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Create Consultation
              </button>
            </div>
          )}
        </div>

        {/* Create Consultation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">New Consultation</h2>
                <form onSubmit={handleCreateConsultation} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={newConsultation.type}
                        onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="crop_disease">Crop Disease</option>
                        <option value="market_advisory">Market Advisory</option>
                        <option value="soil_management">Soil Management</option>
                        <option value="pest_control">Pest Control</option>
                        <option value="irrigation">Irrigation</option>
                        <option value="fertilizer">Fertilizer</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={newConsultation.priority}
                        onChange={(e) => setNewConsultation({ ...newConsultation, priority: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={newConsultation.subject}
                      onChange={(e) => setNewConsultation({ ...newConsultation, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newConsultation.description}
                      onChange={(e) => setNewConsultation({ ...newConsultation, description: e.target.value })}
                      placeholder="Detailed description of your problem or question"
                      className="w-full p-3 border rounded-lg h-32"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Crop Name</label>
                      <input
                        type="text"
                        value={newConsultation.cropDetails.cropName}
                        onChange={(e) => setNewConsultation({
                          ...newConsultation,
                          cropDetails: { ...newConsultation.cropDetails, cropName: e.target.value }
                        })}
                        placeholder="e.g., Rice, Wheat, Tomato"
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Area (acres)</label>
                      <input
                        type="number"
                        value={newConsultation.cropDetails.area}
                        onChange={(e) => setNewConsultation({
                          ...newConsultation,
                          cropDetails: { ...newConsultation.cropDetails, area: e.target.value }
                        })}
                        placeholder="Farm area"
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Create Consultation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}