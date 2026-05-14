import { useState, useEffect } from 'react';
import { 
  Smile, Frown, Meh, Sun, Moon, Battery, BatteryLow, BatteryMedium, BatteryFull,
  TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight,
  Heart, Cloud, CloudRain, CloudSun, Zap, Save, Plus, BarChart3
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabaseHelpers } from '../lib/supabase';
import { clientAuth } from '../lib/supabasePersonalization';

const moodOptions = [
  { value: 5, label: 'Great', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-100', darkBg: 'bg-yellow-900/30', ring: 'ring-yellow-400' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-green-500', bg: 'bg-green-100', darkBg: 'bg-green-900/30', ring: 'ring-green-400' },
  { value: 3, label: 'Okay', icon: CloudSun, color: 'text-blue-500', bg: 'bg-blue-100', darkBg: 'bg-blue-900/30', ring: 'ring-blue-400' },
  { value: 2, label: 'Low', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-100', darkBg: 'bg-gray-700/30', ring: 'ring-gray-400' },
  { value: 1, label: 'Struggling', icon: CloudRain, color: 'text-stone-500', bg: 'bg-stone-100', darkBg: 'bg-indigo-900/30', ring: 'ring-indigo-400' },
];

const emotionTags = ['Calm', 'Anxious', 'Hopeful', 'Sad', 'Angry', 'Grateful', 'Peaceful', 'Overwhelmed'];

const moodColors = {
  5: '#EAB308',
  4: '#22C55E',
  3: '#3B82F6',
  2: '#6B7280',
  1: '#6366F1',
};

const partsConnections = [
  { moodRange: [1, 2], message: 'Your exile parts may need attention. Consider a gentle check-in with the wounded parts that carry pain and sadness.', icon: Heart },
  { moodRange: [3, 3], message: 'You seem balanced today. This is a good time to practice Self-energy and notice which parts are present.', icon: Meh },
  { moodRange: [4, 5], message: 'Your Self-energy feels strong today. This could be a great time for deeper parts work or unburdening.', icon: Sun },
];

function getEnergyColor(level) {
  if (level <= 3) return '#EF4444';
  if (level <= 5) return '#F59E0B';
  if (level <= 7) return '#22C55E';
  return '#10B981';
}

export default function MoodTracker() {
  const { theme } = useTheme();
  const isDark = theme.isDark;

  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState([]);
  const [viewRange, setViewRange] = useState('7');
  const [selectedBarDay, setSelectedBarDay] = useState(null);
  const [savedToday, setSavedToday] = useState(false);

  useEffect(() => {
    const loadEntries = async () => {
      const client = clientAuth.getCurrentClient();
      const clientId = client?.id;
      if (!clientId) return;
      try {
        const data = await supabaseHelpers.getMoodEntries(clientId);
        if (data && data.length > 0) {
          setEntries(data);
          const today = new Date().toDateString();
          const todayEntry = data.find(e => new Date(e.date).toDateString() === today);
          if (todayEntry) {
            setMood(todayEntry.mood);
            setEnergy(todayEntry.energy);
            setSelectedEmotions(todayEntry.emotions || []);
            setNotes(todayEntry.notes || '');
            setSavedToday(true);
          }
        }
      } catch { /* ignore */ }
    };
    loadEntries();
  }, []);

  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSave = async () => {
    if (mood === null) return;
    const client = clientAuth.getCurrentClient();
    const clientId = client?.id;
    if (!clientId) return;
    const entry = {
      mood,
      energy,
      emotions: selectedEmotions,
      notes,
      date: new Date().toISOString(),
    };
    const saved = await supabaseHelpers.saveMoodEntry(clientId, entry);
    if (saved) {
      const today = new Date().toDateString();
      const filtered = entries.filter(e => new Date(e.date).toDateString() !== today);
      const updated = [saved, ...filtered];
      setEntries(updated);
      setSavedToday(true);
    }
  };

  const days = parseInt(viewRange);
  const chartData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const entry = entries.find(e => new Date(e.date).toDateString() === dayStr);
    chartData.push({
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      shortLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      entry,
    });
  }

  const recentEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d >= new Date(Date.now() - 7 * 86400000);
  });
  const avgMood = recentEntries.length > 0 ? (recentEntries.reduce((s, e) => s + e.mood, 0) / recentEntries.length).toFixed(1) : '--';
  const avgEnergy = recentEntries.length > 0 ? (recentEntries.reduce((s, e) => s + e.energy, 0) / recentEntries.length).toFixed(1) : '--';
  const emotionCounts = {};
  recentEntries.forEach(e => (e.emotions || []).forEach(em => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; }));
  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);

  const journalDays = recentEntries.filter(e => e.notes && e.notes.trim().length > 0);
  const nonJournalDays = recentEntries.filter(e => !e.notes || e.notes.trim().length === 0);
  let pattern = '';
  if (journalDays.length >= 2 && nonJournalDays.length >= 1) {
    const avgEnergyJournal = journalDays.reduce((s, e) => s + e.energy, 0) / journalDays.length;
    const avgEnergyNoJournal = nonJournalDays.reduce((s, e) => s + e.energy, 0) / nonJournalDays.length;
    if (avgEnergyJournal > avgEnergyNoJournal) {
      pattern = 'Your energy tends to be higher on days you journal';
    }
  }

  const currentMoodConnection = partsConnections.find(pc => mood !== null && mood >= pc.moodRange[0] && mood <= pc.moodRange[1]);

  const getMoodOption = (val) => moodOptions.find(m => m.value === val);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mood Tracker</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Check in with yourself daily</p>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Calendar className="w-5 h-5" /> Daily Check-in
          {savedToday && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-700">Saved today</span>}
        </h2>

        <div className="mb-5">
          <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>How are you feeling?</p>
          <div className="flex justify-between gap-2">
            {moodOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = mood === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMood(opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all flex-1 ${
                    selected
                      ? `${isDark ? opt.darkBg : opt.bg} ring-2 ${opt.ring} scale-105`
                      : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? (isDark ? opt.darkBg : opt.bg) : isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${opt.color}`} />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Energy Level</p>
            <div className="flex items-center gap-1.5">
              {energy <= 3 ? <BatteryLow className="w-4 h-4 text-red-500" /> : energy <= 6 ? <BatteryMedium className="w-4 h-4 text-yellow-500" /> : <BatteryFull className="w-4 h-4 text-green-500" />}
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{energy}/10</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #EF4444 0%, #F59E0B 40%, #22C55E 70%, #10B981 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Low</span>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>High</span>
          </div>
        </div>

        <div className="mb-5">
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>What emotions are present?</p>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((emotion) => {
              const selected = selectedEmotions.includes(emotion);
              return (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? isDark ? 'bg-amber-900/40 text-amber-300 border-amber-600' : 'bg-amber-100 text-amber-700 border-amber-300'
                      : isDark ? 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {emotion}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Notes (optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind today..."
            rows={3}
            className={`w-full rounded-xl px-4 py-3 text-sm border resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isDark ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={mood === null}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mood !== null
              ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white hover:from-amber-600 hover:to-emerald-600 shadow-lg'
              : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {savedToday ? 'Update Today\'s Check-in' : 'Save Check-in'}
        </button>
      </div>

      <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-5 h-5" /> Mood Trends
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewRange('7')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewRange === '7'
                  ? isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                  : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setViewRange('30')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewRange === '30'
                  ? isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                  : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="flex items-end gap-1" style={{ height: '160px' }}>
          {chartData.map((day, i) => {
            const hasEntry = !!day.entry;
            const heightPct = hasEntry ? (day.entry.energy / 10) * 100 : 0;
            const barColor = hasEntry ? moodColors[day.entry.mood] || '#6B7280' : isDark ? '#334155' : '#E5E7EB';
            const isSelected = selectedBarDay === i;

            return (
              <div key={i} className="flex flex-col items-center flex-1 min-w-0 relative group">
                <div
                  className="w-full rounded-t-sm cursor-pointer transition-all hover:opacity-80 relative"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    backgroundColor: barColor,
                    opacity: hasEntry ? 1 : 0.3,
                    minHeight: '4px',
                  }}
                  onClick={() => setSelectedBarDay(isSelected ? null : i)}
                  title={day.label}
                />
                {days <= 7 && (
                  <span className={`text-[9px] mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {day.shortLabel}
                  </span>
                )}

                {isSelected && hasEntry && (
                  <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 p-3 rounded-xl shadow-lg border min-w-[160px] ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`}>
                    <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.label}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Mood: {getMoodOption(day.entry.mood)?.label} · Energy: {day.entry.energy}/10
                    </p>
                    {day.entry.emotions?.length > 0 && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {day.entry.emotions.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <TrendingUp className="w-5 h-5" /> Weekly Summary
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Avg Mood</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgMood}<span className="text-xs font-normal">/5</span></p>
          </div>
          <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Avg Energy</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgEnergy}<span className="text-xs font-normal">/10</span></p>
          </div>
        </div>
        {topEmotions.length > 0 && (
          <div className="mb-2">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mb-1`}>Most Common Emotions</p>
            <div className="flex gap-2">
              {topEmotions.map(em => (
                <span key={em} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>{em}</span>
              ))}
            </div>
          </div>
        )}
        {pattern && (
          <div className={`mt-3 p-3 rounded-xl flex items-start gap-2 ${isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'}`}>
            <Zap className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{pattern}</p>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-5 h-5" /> History
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {entries.slice(0, 30).map((entry) => {
              const opt = getMoodOption(entry.mood);
              const Icon = opt?.icon || Meh;
              return (
                <div key={entry.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'} transition-all`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? opt?.darkBg : opt?.bg}`}>
                    <Icon className={`w-4 h-4 ${opt?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{opt?.label}</span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" style={{ color: getEnergyColor(entry.energy) }} />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{entry.energy}/10</span>
                      </div>
                      {entry.notes && (
                        <span className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>· {entry.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mood !== null && currentMoodConnection && (
        <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Heart className="w-5 h-5 text-emerald-500" /> Parts Connection
          </h2>
          <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
            {(() => {
              const ConnIcon = currentMoodConnection.icon;
              return <ConnIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />;
            })()}
            <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{currentMoodConnection.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}