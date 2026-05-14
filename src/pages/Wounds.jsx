import { useState } from 'react';
import { commonWounds } from '../data/ifsData';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';

const Wounds = () => {
  const [expandedWound, setExpandedWound] = useState(null);

  const toggleWound = (id) => {
    setExpandedWound(expandedWound === id ? null : id);
  };

  const woundColors = [
    'from-red-400 to-red-600',
    'from-orange-400 to-orange-600',
    'from-yellow-400 to-yellow-600',
    'from-green-400 to-green-600',
    'from-teal-400 to-teal-600',
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-amber-600',
    'from-amber-400 to-amber-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600'
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-emerald-600 bg-clip-text text-transparent">
            10 Common Wounds of the Inner Child
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The "wounds" of the inner child refer to unresolved emotional pain, unmet needs, or traumatic experiences 
            from childhood that continue to affect us. Below are 10 common inner child wounds and their manifestations.
          </p>
        </div>

        {/* Introduction Card */}
        <div className="card mb-12 bg-gradient-to-br from-red-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Understanding Your Wounds</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These wounds are not signs of weakness or failure. They are natural responses to difficult experiences 
            that shaped your protective parts. By understanding these wounds, you can begin to heal them with 
            compassion and care.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Each wound has a <strong>Root Cause</strong> (what created it), <strong>Child Manifestations</strong> (how 
            it showed up in childhood), and <strong>Adult Manifestations</strong> (how it affects you today).
          </p>
        </div>

        {/* Wounds Grid */}
        <div className="space-y-6">
          {commonWounds.map((wound, index) => (
            <div
              key={wound.id}
              className="card hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => toggleWound(wound.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-16 h-16 bg-gradient-to-br ${woundColors[index]} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                    {wound.id}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{wound.title}</h3>
                    <p className="text-gray-600">{wound.rootCause}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  {expandedWound === wound.id ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>

              {expandedWound === wound.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-fadeIn">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-blue-800 mb-2">👶 Child Manifestations</h4>
                    <p className="text-gray-700">{wound.childManifestations}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-amber-800 mb-2">👤 Adult Manifestations</h4>
                    <p className="text-gray-700">{wound.adultManifestations}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Healing Message */}
        <div className="card mt-12 bg-gradient-to-br from-amber-600 to-emerald-600 text-white">
          <h2 className="text-3xl font-bold mb-4">Remember: You Can Heal</h2>
          <p className="text-lg leading-relaxed mb-4 text-amber-100">
            These wounds were created in the past, but they don't have to define your future. Through IFS therapy, 
            you can identify the parts carrying these wounds (your Exiles), understand the protectors that developed 
            to shield you from this pain, and ultimately heal these wounds with compassion and Self-leadership.
          </p>
          <p className="text-lg leading-relaxed text-amber-100">
            Every wound you carry is a testament to your resilience. You survived. Now, you can thrive.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wounds;