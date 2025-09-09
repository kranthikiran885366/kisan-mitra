'use client';

import { useState } from 'react';
import { Camera, Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const farmingTypes = [
  { id: 'crops', name: 'Crops', icon: '🌾', desc: 'Rice, Wheat, Corn, etc.' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕', desc: 'Tomato, Onion, Potato, etc.' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', desc: 'Apple, Mango, Orange, etc.' },
  { id: 'livestock', name: 'Livestock', icon: '🐄', desc: 'Cattle, Goat, Poultry, etc.' },
  { id: 'fish', name: 'Fish Farming', icon: '🐟', desc: 'Aquaculture, Pond farming' },
  { id: 'mixed', name: 'Mixed Farming', icon: '🚜', desc: 'Multiple types' }
];

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bangla', native: 'বাংলা' }
];

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    photo: null,
    farmingTypes: [],
    landSize: '',
    location: { state: '', district: '', village: '' },
    language: 'en',
    experience: '',
    soilType: '',
    irrigationType: ''
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfile({ ...profile, photo: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  const toggleFarmingType = (type) => {
    const types = profile.farmingTypes.includes(type)
      ? profile.farmingTypes.filter(t => t !== type)
      : [...profile.farmingTypes, type];
    setProfile({ ...profile, farmingTypes: types });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '507f1f77bcf86cd799439011',
          ...profile,
          farmingType: profile.farmingTypes.join(','),
          landSize: { value: parseFloat(profile.landSize), unit: 'acres' }
        })
      });

      if (response.ok) {
        setStep(5); // Success screen
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setProfile({ ...profile, language: lang.code })}
                      className={`p-3 border rounded-lg text-left ${
                        profile.language === lang.code ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-gray-600">{lang.native}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
              <p className="text-gray-600">Add a profile picture for verification</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div className="flex gap-4">
                <label className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Farming Type</h2>
              <p className="text-gray-600">Select your farming activities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmingTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleFarmingType(type.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    profile.farmingTypes.includes(type.id)
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                    {profile.farmingTypes.includes(type.id) && (
                      <Check className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Details</h2>
              <p className="text-gray-600">Tell us about your farm</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={profile.location.state}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, state: e.target.value }
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">District</label>
                  <input
                    type="text"
                    value={profile.location.district}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, district: e.target.value }
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="District"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Village</label>
                  <input
                    type="text"
                    value={profile.location.village}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, village: e.target.value }
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Village"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Land Size (acres)</label>
                  <input
                    type="number"
                    value={profile.landSize}
                    onChange={(e) => setProfile({ ...profile, landSize: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Soil Type</label>
                  <select
                    value={profile.soilType}
                    onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="alluvial">Alluvial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Irrigation Type</label>
                  <select
                    value={profile.irrigationType}
                    onChange={(e) => setProfile({ ...profile, irrigationType: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select irrigation</option>
                    <option value="rainfed">Rainfed</option>
                    <option value="canal">Canal</option>
                    <option value="borewell">Borewell</option>
                    <option value="drip">Drip</option>
                    <option value="sprinkler">Sprinkler</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Profile Setup Complete!</h2>
              <p className="text-gray-600 mb-6">Your farmer profile has been successfully created and verified.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Explore the marketplace for seeds and tools</li>
                  <li>• Get weather updates for your location</li>
                  <li>• Connect with agricultural experts</li>
                  <li>• Join farmer communities</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
              <span className="text-sm text-gray-600">{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStep()}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() => step === 4 ? handleSubmit() : setStep(step + 1)}
                disabled={
                  (step === 1 && !profile.name) ||
                  (step === 3 && profile.farmingTypes.length === 0) ||
                  (step === 4 && (!profile.location.state || !profile.landSize))
                }
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 4 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}