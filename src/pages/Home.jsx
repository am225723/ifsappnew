import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Sparkles, 
  Play, 
  ArrowRight, 
  Star,
  Shield,
  Users,
  Zap,
  Target,
  Award,
  Clock,
  BookOpen,
  Activity,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Compass,
  Moon,
  Sun,
  MessageCircle,
  MessageSquare,
  Trophy,
  BarChart3,
  Smile,
  Share2,
  Feather,
  Library
} from 'lucide-react';
import { supabaseHelpers, supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const Home = ({ clientId, client }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userProgress, setUserProgress] = useState({});
  const [animateHero, setAnimateHero] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(true);
  useEffect(() => {
    setAnimateHero(true);
    
    const loadProgress = async () => {
      if (clientId) {
        try {
          const allProgress = await supabaseHelpers.getAllModuleProgress(clientId);
          const progressObj = {};
          (allProgress || []).forEach(p => {
            progressObj[p.module_id] = p;
          });
          setUserProgress(progressObj);
        } catch (err) {
          console.error('Error loading progress:', err);
        }
      }
    };
    loadProgress();
    
    const loadSavedAssessment = async () => {
      if (clientId) {
        try {
          const { data } = await supabase
            .from('ifs_interactive_data')
            .select('data, updated_at')
            .eq('client_id', clientId)
            .eq('module_id', 'assessment_wounds')
            .maybeSingle();
          if (data?.data) {
            const wd = data.data;
            setSavedAssessment({
              primary_wound: wd.primary,
              secondary_wound: wd.secondary,
              abandonment_score: wd.scores?.abandonment?.total || 0,
              shame_score: wd.scores?.shame?.total || 0,
              neglect_score: wd.scores?.neglect?.total || 0,
              betrayal_score: wd.scores?.betrayal?.total || 0,
              helplessness_score: wd.scores?.helplessness?.total || 0,
              assessment_date: wd.completedAt || data.updated_at
            });
          }
        } catch (error) {
          console.error('Error loading assessment:', error);
        }
      }
      setLoadingAssessment(false);
    };
    
    loadSavedAssessment();
  }, [clientId]);

  const healingModules = [
    {
      icon: Heart,
      title: "Inner Child Healing",
      description: "Connect with and heal your wounded inner child",
      duration: "6 weeks",
      level: "Foundation",
      color: "from-emerald-400 to-emerald-600",
      progress: 0
    },
    {
      icon: Brain,
      title: "Parts Understanding",
      description: "Learn to identify and communicate with your internal parts",
      duration: "4 weeks", 
      level: "Intermediate",
      color: "from-amber-400 to-amber-600",
      progress: 0
    },
    {
      icon: Shield,
      title: "Self-Leadership",
      description: "Develop your Self energy to lead your internal system",
      duration: "8 weeks",
      level: "Advanced", 
      color: "from-blue-400 to-blue-600",
      progress: 0
    },
    {
      icon: Sparkles,
      title: "Unburdening Practice",
      description: "Release the burdens your parts carry",
      duration: "5 weeks",
      level: "Advanced",
      color: "from-yellow-400 to-yellow-600",
      progress: 0
    }
  ];

  const woundColors = {
    abandonment: { bg: 'from-blue-400 to-blue-600', light: 'bg-blue-100', text: 'text-blue-700' },
    shame: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-100', text: 'text-amber-800' },
    neglect: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-100', text: 'text-amber-700' },
    betrayal: { bg: 'from-red-400 to-red-600', light: 'bg-red-100', text: 'text-red-700' }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getWoundRecommendations = (wound) => {
    const recommendations = {
      abandonment: {
        exercises: ['Self-Soothing Meditation', 'Inner Child Dialogue'],
        modules: ['Module 2: Abandonment Healing', 'Module 4: Secure Attachment'],
        affirmation: "I am worthy of love and belonging, just as I am."
      },
      shame: {
        exercises: ['Self-Compassion Practice', 'Mirror Work Exercise'],
        modules: ['Module 2: Shame Release', 'Module 4: Self-Worth Building'],
        affirmation: "I accept myself fully, including my imperfections."
      },
      neglect: {
        exercises: ['Needs Identification', 'Reparenting Meditation'],
        modules: ['Module 2: Recognizing Needs', 'Module 4: Self-Nurturing'],
        affirmation: "My needs matter and I deserve care and attention."
      },
      betrayal: {
        exercises: ['Trust Building Practice', 'Boundary Setting Exercise'],
        modules: ['Module 2: Trust Recovery', 'Module 4: Healthy Boundaries'],
        affirmation: "I am safe to trust myself and choose trustworthy people."
      },
      helplessness: {
        exercises: ['Empowerment Meditation', 'Agency-Building Practice'],
        modules: ['Module 2: Helplessness Healing', 'Module 4: Reclaiming Power'],
        affirmation: "I have the power to create change. My choices matter and I am capable."
      }
    };
    return recommendations[wound] || recommendations.abandonment;
  };

  if (loadingAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'}`}>Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Personalized Dashboard for Returning Users */}
      {savedAssessment && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Personalized Welcome */}
          <div className="mb-8">
            <h1 className={`text-3xl md:text-4xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-2`}>
              {getGreeting()}, {client?.name?.split(' ')[0] || 'there'} ✨
            </h1>
            <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'}`}>Continue your healing journey where you left off</p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wound Profile Card */}
            <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-sm border ${theme.isDark ? 'border-slate-700' : 'border-gray-100'} p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Your Wound Profile</h3>
                <Link to="/profile" className="text-amber-700 text-sm hover:underline">View Details</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${woundColors[savedAssessment.primary_wound]?.bg || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Primary Focus</p>
                    <p className={`font-semibold capitalize ${theme.isDark ? 'text-slate-100' : 'text-gray-900'}`}>{savedAssessment.primary_wound}</p>
                  </div>
                </div>
                {savedAssessment.secondary_wound && (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${woundColors[savedAssessment.secondary_wound]?.bg || 'from-gray-400 to-gray-600'} flex items-center justify-center opacity-70`}>
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Secondary</p>
                      <p className={`font-medium capitalize ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>{savedAssessment.secondary_wound}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Learning Card */}
            <div className="bg-gradient-to-br from-amber-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Continue Learning</h3>
              <p className="text-amber-100 text-sm mb-4">Your personalized curriculum is ready</p>
              <Link
                to="/curriculum"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resume Curriculum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Daily Practice Card */}
            <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-sm border ${theme.isDark ? 'border-slate-700' : 'border-gray-100'} p-6 hover:shadow-lg transition-shadow`}>
              <h3 className={`font-semibold ${theme.isDark ? 'text-slate-200' : 'text-gray-700'} mb-2`}>Daily Practice</h3>
              <p className={`${theme.isDark ? 'text-slate-400' : 'text-gray-500'} text-sm mb-4`}>Strengthen your Self energy</p>
              <div className="space-y-2">
                <Link to="/exercises" className="flex items-center gap-2 text-amber-700 hover:text-amber-800">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Guided Exercises</span>
                </Link>
                <Link to="/journal" className="flex items-center gap-2 text-amber-700 hover:text-amber-800">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Journal Entry</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Personalized Recommendations */}
          {savedAssessment.primary_wound && (
            <div className={`${theme.isDark ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100'} rounded-2xl border p-6 mb-8`}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`w-5 h-5 ${theme.isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <h3 className={`font-semibold ${theme.isDark ? 'text-slate-100' : 'text-gray-800'}`}>Personalized for Your {savedAssessment.primary_wound} Healing</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm ${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-3`}>Recommended exercises for you:</p>
                  <div className="space-y-2">
                    {getWoundRecommendations(savedAssessment.primary_wound).exercises.map((exercise, i) => (
                      <Link 
                        key={i}
                        to="/exercises"
                        className={`flex items-center gap-2 p-3 ${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg hover:shadow-md transition-all group`}
                      >
                        <Play className="w-4 h-4 text-indigo-500" />
                        <span className={`text-sm ${theme.isDark ? 'text-slate-200' : 'text-gray-700'} group-hover:text-indigo-600`}>{exercise}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-indigo-500" />
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className={`text-sm ${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-3`}>Your daily affirmation:</p>
                  <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 border-l-4 border-indigo-400`}>
                    <p className={`${theme.isDark ? 'text-slate-200' : 'text-gray-700'} italic`}>"{getWoundRecommendations(savedAssessment.primary_wound).affirmation}"</p>
                  </div>
                  <p className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'} mt-2`}>Repeat this affirmation daily to support your healing</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-sm border ${theme.isDark ? 'border-slate-700' : 'border-gray-100'} p-6 mb-8`}>
            <h3 className={`font-semibold ${theme.isDark ? 'text-slate-200' : 'text-gray-700'} mb-4`}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/curriculum" className="flex flex-col items-center p-4 rounded-xl hover:bg-amber-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Curriculum</span>
              </Link>
              <Link to="/exercises" className="flex flex-col items-center p-4 rounded-xl hover:bg-emerald-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
                  <Play className="w-6 h-6 text-emerald-700" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Exercises</span>
              </Link>
              <Link to="/parts-mapping" className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Parts Map</span>
              </Link>
              <Link to="/journal" className="flex flex-col items-center p-4 rounded-xl hover:bg-amber-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Journal</span>
              </Link>
            </div>
          </div>

          {/* Assessments Card */}
          <div className={`${theme.isDark ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100'} rounded-2xl border p-6 mb-8`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${theme.isDark ? 'text-slate-100' : 'text-gray-800'} flex items-center gap-2`}>
                <CheckCircle className="w-5 h-5 text-amber-700" />
                Self-Assessments
              </h3>
              <Link to="/assessments" className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className={`text-sm ${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4`}>
              Gain deeper insights into your inner world with structured assessments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/assessments" className={`flex items-center gap-3 p-3 rounded-xl ${theme.isDark ? 'bg-slate-800/70' : 'bg-white/70'} hover:bg-white transition-colors`}>
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.isDark ? 'text-slate-100' : 'text-gray-800'}`}>IFS Wound Assessment</p>
                  <p className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Inner child wounds</p>
                </div>
              </Link>
              <Link to="/assessments" className={`flex items-center gap-3 p-3 rounded-xl ${theme.isDark ? 'bg-slate-800/70' : 'bg-white/70'} hover:bg-white transition-colors`}>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.isDark ? 'text-slate-100' : 'text-gray-800'}`}>Protective Parts</p>
                  <p className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Your protector system</p>
                </div>
              </Link>
              <Link to="/assessments" className={`flex items-center gap-3 p-3 rounded-xl ${theme.isDark ? 'bg-slate-800/70' : 'bg-white/70'} hover:bg-white transition-colors`}>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme.isDark ? 'text-slate-100' : 'text-gray-800'}`}>Self-Energy</p>
                  <p className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>The 8 C's of Self</p>
                </div>
              </Link>
            </div>
          </div>

          {/* New Features Section */}
          <div className={`${theme.isDark ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100'} rounded-2xl border p-6 mb-8`}>
            <h3 className={`font-semibold ${theme.isDark ? 'text-slate-100' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Healing Tools
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/parts-studio" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Parts Studio</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Visual mapping</span>
              </Link>
              <Link to="/micro-learning" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Micro-Learning</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>2-min exercises</span>
              </Link>
              <Link to="/affirmations" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-2 group-hover:bg-rose-200 transition-colors">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Affirmations</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Personalized</span>
              </Link>
              <Link to="/therapy" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-2 group-hover:bg-cyan-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-cyan-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Therapy Notes</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Session tracking</span>
              </Link>
              <Link to="/inbox" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Messages</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Advisor chat</span>
              </Link>
              <Link to="/my-homework" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Homework</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Assignments</span>
              </Link>
              <Link to="/parts-relationships" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Parts Map</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Relationships</span>
              </Link>
              <Link to="/unburdening" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-2 group-hover:bg-teal-200 transition-colors">
                  <Feather className="w-6 h-6 text-teal-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Unburdening</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Release ritual</span>
              </Link>
              <Link to="/meditation" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
                  <Moon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Meditations</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Guided practice</span>
              </Link>
              <Link to="/milestones" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Milestones</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Achievements</span>
              </Link>
              <Link to="/weekly-reflection" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-2 group-hover:bg-sky-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-sky-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Weekly Review</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Reflection</span>
              </Link>
              <Link to="/healing-tracker" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-2 group-hover:bg-rose-200 transition-colors">
                  <Compass className="w-6 h-6 text-rose-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Healing Map</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Journey tracker</span>
              </Link>
              <Link to="/resource-library" className={`flex flex-col items-center p-4 rounded-xl ${theme.isDark ? 'bg-slate-800/60' : 'bg-white/60'} hover:bg-white transition-colors group`}>
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-2 group-hover:bg-cyan-200 transition-colors">
                  <Library className="w-6 h-6 text-cyan-600" />
                </div>
                <span className={`text-sm font-medium ${theme.isDark ? 'text-slate-200' : 'text-gray-700'}`}>Library</span>
                <span className={`text-xs ${theme.isDark ? 'text-slate-400' : 'text-gray-500'}`}>Healing resources</span>
              </Link>
            </div>
          </div>

          {/* Retake Assessment Option */}
          <div className="text-center">
            <button
              onClick={() => navigate('/assessments')}
              className={`${theme.isDark ? 'text-slate-400' : 'text-gray-500'} hover:text-amber-700 text-sm underline`}
            >
              Retake wound assessment
            </button>
          </div>
        </div>
      )}

      {/* Hero Section for New Users (no assessment yet) */}
      {!savedAssessment && !loadingAssessment && (
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-700 via-emerald-800 to-stone-800">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center transition-all duration-1000 ${animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-amber-200 mb-4">Welcome, {client?.name?.split(' ')[0] || 'there'}</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Heal Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300">
                Inner Child
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-amber-100 max-w-3xl mx-auto">
              Discover your inner wounds and begin your transformative healing journey with Internal Family Systems
            </p>
            
            {/* Main CTA - Assessment */}
            <button
              onClick={() => navigate('/assessments')}
              className={`group relative inline-flex items-center px-8 py-6 ${theme.isDark ? 'bg-slate-800' : 'bg-white'} text-amber-800 rounded-2xl font-bold text-xl hover:bg-amber-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 mb-8`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <Brain className="mr-3 w-8 h-8" />
                <span>Take the IFS Wound Assessment</span>
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Assessment Description */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto mb-8">
              <p className="text-white text-sm leading-relaxed">
                The IFS Wound Assessment is a professional IFS-based tool to help you identify 
                which inner child wounds may be affecting your daily life. This isn't about labeling - it's about 
                creating trailheads for compassionate healing.
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/curriculum" 
                className="inline-flex items-center px-6 py-3 bg-amber-700/50 backdrop-blur text-white rounded-full font-semibold hover:bg-amber-700/70 transition-all duration-300"
              >
                <BookOpen className="mr-2 w-5 h-5" />
                Browse Curriculum
              </Link>
              <Link 
                to="/exercises" 
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur text-white rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Try Exercises
              </Link>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Healing Modules Grid */}
      <div className={`py-20 ${theme.isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-4`}>Your Healing Pathway</h2>
            <p className={`text-xl ${theme.isDark ? 'text-slate-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Step-by-step modules designed to guide you through complete Inner Child healing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healingModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div key={index} className="group relative">
                  <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border ${theme.isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'}`}>{module.title}</h3>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                        {module.level}
                      </span>
                    </div>
                    
                    <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>{module.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center ${theme.isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {module.duration}
                      </div>
                      {module.progress > 0 && (
                        <span className="text-sm font-medium text-amber-700">{module.progress}%</span>
                      )}
                    </div>

                    {module.progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-emerald-700 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    )}

                    <Link
                      to="/curriculum"
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-emerald-800 transition-all duration-300 text-center"
                    >
                      {module.progress > 0 ? 'Continue' : 'Start Module'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Features */}
      <div className={`py-20 ${theme.isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 to-amber-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-4`}>Interactive Healing Tools</h2>
            <p className={`text-xl ${theme.isDark ? 'text-slate-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Engage with your inner world through guided exercises and activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/parts-mapping"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Parts Mapping</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Interactive tool to identify, understand, and connect with your internal family of parts
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                <span>Explore Your Parts</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/exercises"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Guided Exercises</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Meditations and practices to strengthen your Self energy and heal your parts
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                <span>Start Practice</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/journal"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Healing Journal</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Sacred space to document your journey and insights from your inner world
              </p>
              <div className="flex items-center text-emerald-700 font-semibold">
                <span>Begin Journaling</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/parts-dialogue"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>AI Parts Dialogue</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Have guided conversations with your inner parts using AI-powered dialogue
              </p>
              <div className="flex items-center text-amber-700 font-semibold">
                <span>Start Dialogue</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/parts-cards"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Parts Check-In Cards</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Draw a daily card featuring one of your parts with a reflective prompt
              </p>
              <div className="flex items-center text-rose-600 font-semibold">
                <span>Draw a Card</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/mood-tracker"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smile className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Mood & Energy</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Track your daily mood and energy levels to discover patterns in your healing
              </p>
              <div className="flex items-center text-amber-600 font-semibold">
                <span>Check In</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/progress-timeline"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Progress Timeline</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                View your healing journey milestones and track your growth over time
              </p>
              <div className="flex items-center text-teal-600 font-semibold">
                <span>View Timeline</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/gamification"
              className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Badges & Streaks</h3>
              <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                Earn achievements and maintain daily streaks as you progress on your journey
              </p>
              <div className="flex items-center text-yellow-600 font-semibold">
                <span>View Achievements</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Healing Principles */}
      <div className={`py-20 ${theme.isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-6`}>
                The IFS Healing Principles
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-2`}>No Bad Parts</h3>
                    <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} leading-relaxed`}>
                      Every part of you has a positive intention and is trying to help in the only way it knows how.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-2`}>Self-Leadership</h3>
                    <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} leading-relaxed`}>
                      You have a core Self that is calm, compassionate, and capable of leading your internal system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-2`}>Unburdening</h3>
                    <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'} leading-relaxed`}>
                      Parts can release the burdens they carry when they feel safe and connected to Self.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${theme.isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-amber-100 to-stone-100'} rounded-3xl p-8`}>
              <div className="space-y-4">
                <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 border border-amber-200`}>
                  <h3 className={`font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Moon className="w-5 h-5 mr-2 text-amber-700" />
                    Your Inner Child
                  </h3>
                  <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'}`}>The vulnerable, authentic part holding your core emotions and needs</p>
                </div>
                
                <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 border border-blue-200`}>
                  <h3 className={`font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Your Protectors
                  </h3>
                  <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'}`}>Parts that work to keep you safe from pain and overwhelming emotions</p>
                </div>
                
                <div className={`${theme.isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 border border-green-200`}>
                  <h3 className={`font-bold ${theme.isDark ? 'text-slate-100' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Sun className="w-5 h-5 mr-2 text-green-600" />
                    Your Self
                  </h3>
                  <p className={`${theme.isDark ? 'text-slate-300' : 'text-gray-600'}`}>The calm, compassionate core that can heal and lead your internal system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-r from-amber-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Begin Your Healing Journey
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Take the first step toward healing and wholeness with our professional IFS assessment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/assessments')}
              className={`inline-flex items-center px-8 py-4 ${theme.isDark ? 'bg-slate-800' : 'bg-white'} text-amber-800 rounded-full font-bold text-lg hover:bg-amber-50 transition-all duration-300 shadow-xl`}
            >
              <Brain className="mr-2 w-6 h-6" />
              Take IFS Assessment
            </button>
            <Link 
              to="/curriculum" 
              className="inline-flex items-center px-8 py-4 bg-amber-700 text-white rounded-full font-bold text-lg hover:bg-amber-800 transition-all duration-300"
            >
              <BookOpen className="mr-2 w-6 h-6" />
              View Curriculum
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
