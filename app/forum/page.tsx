'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, Eye, ThumbsUp, ThumbsDown, Pin, Lock, CheckCircle } from 'lucide-react';

export default function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum?type=categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/forum?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTopic,
          tags: newTopic.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          userId: '507f1f77bcf86cd799439011'
        })
      });

      const data = await response.json();
      if (data.success) {
        setTopics([data.data, ...topics]);
        setNewTopic({ title: '', content: '', categoryId: '', tags: '' });
        setShowCreateTopic(false);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Forum</h1>
            <button
              onClick={() => setShowCreateTopic(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              New Topic
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {!selectedCategory && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {categories.map(category => (
              <div
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${category.color || 'bg-green-500'}`}></div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{category.postCount || 0} topics</span>
                  <span>{formatDate(category.lastActivity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Topic Modal */}
        {showCreateTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Create New Topic</h2>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newTopic.categoryId}
                      onChange={(e) => setNewTopic({ ...newTopic, categoryId: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      placeholder="Enter topic title..."
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      placeholder="Describe your topic in detail..."
                      className="w-full p-3 border rounded-lg h-32"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newTopic.tags}
                      onChange={(e) => setNewTopic({ ...newTopic, tags: e.target.value })}
                      placeholder="farming, irrigation, organic"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Create Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTopic(false)}
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

        {/* Topics List */}
        <div className="space-y-4">
          {topics.map(topic => (
            <div key={topic._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {topic.author?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                    {topic.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                    {topic.isSolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                    <h3 className="font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                      {topic.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      topic.category?.color || 'bg-gray-100'
                    }`}>
                      {topic.category?.name}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{topic.content}</p>

                  {topic.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {topic.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {topic.replies?.length || 0}
                      </span>
                      <span>By {topic.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(topic.createdAt)}</span>
                      {topic.lastReply && (
                        <span className="text-green-600">
                          Last reply {formatDate(topic.lastReply.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {topics.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to start a discussion!'
                }
              </p>
              <button
                onClick={() => setShowCreateTopic(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Create First Topic
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}