'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Send, Phone, Video, Calendar, Star, CheckCircle, Clock, AlertCircle, TrendingUp, FileText, Plus } from 'lucide-react';

export default function ConsultationDetailPage() {
  const params = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    category: 'treatment',
    title: '',
    description: '',
    priority: 'medium',
    actionRequired: false,
    cost: { estimated: 0 },
    products: []
  });
  const [rating, setRating] = useState({ score: 0, feedback: '' });

  useEffect(() => {
    if (params.id) {
      fetchConsultation();
    }
  }, [params.id]);

  const fetchConsultation = async () => {
    try {
      const response = await fetch(`/api/consultations/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setConsultation(data.data);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/consultations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: '507f1f77bcf86cd799439011',
          message: newMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setConsultation(prev => ({
          ...prev,
          messages: [...prev.messages, data.data]
        }));
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const addRecommendation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/consultations/${params.id}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecommendation)
      });

      const data = await response.json();
      if (data.success) {
        setConsultation(prev => ({
          ...prev,
          recommendations: [...prev.recommendations, data.data]
        }));
        setShowRecommendationForm(false);
        setNewRecommendation({
          category: 'treatment',
          title: '',
          description: '',
          priority: 'medium',
          actionRequired: false,
          cost: { estimated: 0 },
          products: []
        });
      }
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  };

  const addDiagnosis = async (diagnosis) => {
    try {
      const response = await fetch(`/api/consultations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_diagnosis',
          data: diagnosis
        })
      });

      const data = await response.json();
      if (data.success) {
        setConsultation(data.data);
      }
    } catch (error) {
      console.error('Error adding diagnosis:', error);
    }
  };

  const addMarketInsights = async (insights) => {
    try {
      const response = await fetch(`/api/consultations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_market_insights',
          data: insights
        })
      });

      const data = await response.json();
      if (data.success) {
        setConsultation(data.data);
      }
    } catch (error) {
      console.error('Error adding market insights:', error);
    }
  };

  const rateConsultation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/consultations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate',
          data: {
            score: rating.score,
            feedback: rating.feedback,
            aspects: {
              expertise: rating.score,
              communication: rating.score,
              timeliness: rating.score,
              helpfulness: rating.score
            }
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setConsultation(data.data);
        setRating({ score: 0, feedback: '' });
      }
    } catch (error) {
      console.error('Error rating consultation:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultation not found</h2>
          <p className="text-gray-600">The consultation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultation Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{consultation.subject}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize">{consultation.type.replace('_', ' ')}</span>
                    <span className="capitalize">{consultation.priority} priority</span>
                    <span>{formatDate(consultation.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    consultation.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    consultation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {consultation.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{consultation.description}</p>
              
              {consultation.cropDetails?.cropName && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Crop Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Crop:</span>
                      <div className="font-medium">{consultation.cropDetails.cropName}</div>
                    </div>
                    {consultation.cropDetails.variety && (
                      <div>
                        <span className="text-green-600">Variety:</span>
                        <div className="font-medium">{consultation.cropDetails.variety}</div>
                      </div>
                    )}
                    {consultation.cropDetails.area && (
                      <div>
                        <span className="text-green-600">Area:</span>
                        <div className="font-medium">{consultation.cropDetails.area} acres</div>
                      </div>
                    )}
                    {consultation.cropDetails.stage && (
                      <div>
                        <span className="text-green-600">Stage:</span>
                        <div className="font-medium capitalize">{consultation.cropDetails.stage}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            {consultation.diagnosis && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Diagnosis
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{consultation.diagnosis.condition}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      consultation.diagnosis.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      consultation.diagnosis.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                      consultation.diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {consultation.diagnosis.severity} severity
                    </span>
                  </div>
                  
                  {consultation.diagnosis.symptoms?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Symptoms:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {consultation.diagnosis.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {consultation.diagnosis.treatment && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Treatment:</h4>
                      <p className="text-gray-600">{consultation.diagnosis.treatment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {consultation.marketInsights && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Market Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">₹{consultation.marketInsights.currentPrice}</div>
                    <div className="text-sm text-blue-600">Current Price</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-900 capitalize flex items-center gap-1">
                      {consultation.marketInsights.trend === 'rising' ? '📈' : 
                       consultation.marketInsights.trend === 'falling' ? '📉' : '➡️'}
                      {consultation.marketInsights.trend}
                    </div>
                    <div className="text-sm text-green-600">Price Trend</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-purple-900">{consultation.marketInsights.bestSellingTime}</div>
                    <div className="text-sm text-purple-600">Best Selling Time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommendations ({consultation.recommendations?.length || 0})
                </h2>
                {consultation.expert && (
                  <button
                    onClick={() => setShowRecommendationForm(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Recommendation
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {consultation.recommendations?.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    
                    {rec.cost?.estimated > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        Estimated cost: ₹{rec.cost.estimated}
                      </div>
                    )}
                    
                    {rec.products?.length > 0 && (
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="font-medium text-gray-700 mb-2">Recommended Products:</h4>
                        <div className="space-y-2">
                          {rec.products.map((product, pIndex) => (
                            <div key={pIndex} className="text-sm">
                              <span className="font-medium">{product.name}</span>
                              {product.dosage && <span className="text-gray-600"> - {product.dosage}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-sm ${rec.isImplemented ? 'text-green-600' : 'text-gray-500'}`}>
                        {rec.isImplemented ? '✅ Implemented' : '⏳ Pending'}
                      </span>
                      {!rec.isImplemented && (
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Mark as Implemented
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!consultation.recommendations || consultation.recommendations.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No recommendations yet
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {consultation.messages?.map((message, index) => (
                  <div key={index} className={`flex ${message.sender._id === '507f1f77bcf86cd799439011' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === '507f1f77bcf86cd799439011'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <div className="text-sm font-medium mb-1">{message.sender.name}</div>
                      <p>{message.message}</p>
                      <div className={`text-xs mt-1 ${
                        message.sender._id === '507f1f77bcf86cd799439011' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expert Info */}
            {consultation.expert && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Expert</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {consultation.expert.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{consultation.expert.name}</div>
                    <div className="text-sm text-gray-600">{consultation.expert.qualification}</div>
                  </div>
                </div>
                
                {consultation.expert.specialization?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Specialization:</div>
                    <div className="flex flex-wrap gap-1">
                      {consultation.expert.specialization.map((spec, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                </div>
              </div>
            )}

            {/* Analytics */}
            {consultation.analytics && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages:</span>
                    <span className="font-medium">{consultation.analytics.messagesExchanged}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recommendations:</span>
                    <span className="font-medium">{consultation.analytics.recommendationsGiven}</span>
                  </div>
                  {consultation.analytics.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{consultation.analytics.duration}h</span>
                    </div>
                  )}
                  {consultation.analytics.satisfactionScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Satisfaction:</span>
                      <span className="font-medium">{consultation.analytics.satisfactionScore}/5</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rating */}
            {consultation.status === 'resolved' && !consultation.rating && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Rate this consultation</h3>
                <form onSubmit={rateConsultation} className="space-y-4">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating({ ...rating, score: star })}
                          className={`text-2xl ${star <= rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={rating.feedback}
                    onChange={(e) => setRating({ ...rating, feedback: e.target.value })}
                    placeholder="Share your feedback..."
                    className="w-full p-3 border rounded-lg h-20"
                  />
                  <button
                    type="submit"
                    disabled={rating.score === 0}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Submit Rating
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Add Recommendation Modal */}
        {showRecommendationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Add Recommendation</h2>
                <form onSubmit={addRecommendation} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={newRecommendation.category}
                        onChange={(e) => setNewRecommendation({ ...newRecommendation, category: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="treatment">Treatment</option>
                        <option value="fertilizer">Fertilizer</option>
                        <option value="pesticide">Pesticide</option>
                        <option value="irrigation">Irrigation</option>
                        <option value="harvesting">Harvesting</option>
                        <option value="market_timing">Market Timing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={newRecommendation.priority}
                        onChange={(e) => setNewRecommendation({ ...newRecommendation, priority: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newRecommendation.title}
                      onChange={(e) => setNewRecommendation({ ...newRecommendation, title: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newRecommendation.description}
                      onChange={(e) => setNewRecommendation({ ...newRecommendation, description: e.target.value })}
                      className="w-full p-3 border rounded-lg h-24"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Cost (₹)</label>
                    <input
                      type="number"
                      value={newRecommendation.cost.estimated}
                      onChange={(e) => setNewRecommendation({
                        ...newRecommendation,
                        cost: { ...newRecommendation.cost, estimated: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRecommendation.actionRequired}
                      onChange={(e) => setNewRecommendation({ ...newRecommendation, actionRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm">Immediate action required</label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Add Recommendation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRecommendationForm(false)}
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