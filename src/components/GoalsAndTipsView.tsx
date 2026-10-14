import React, { useState } from 'react';
import { 
  Target, 
  Award, 
  Lightbulb, 
  CheckCircle2, 
  Plus, 
  Flame, 
  Droplet, 
  Globe, 
  ShieldCheck, 
  Wrench, 
  Calculator, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { WaterGoal, AchievementBadge, ConservationTip, HouseholdProfile } from '../types/water';
import { triggerCelebration } from '../utils/waterCalculations';

interface GoalsAndTipsViewProps {
  goals: WaterGoal[];
  achievements: AchievementBadge[];
  tips: ConservationTip[];
  profile: HouseholdProfile;
  onAddGoal: (goal: Omit<WaterGoal, 'id' | 'completed'>) => void;
  onToggleGoalComplete: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onToggleTipImplemented: (id: string) => void;
}

export const GoalsAndTipsView: React.FC<GoalsAndTipsViewProps> = ({
  goals,
  achievements,
  tips,
  profile,
  onAddGoal,
  onToggleGoalComplete,
  onDeleteGoal,
  onToggleTipImplemented,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'tips' | 'sdg6'>('goals');
  const [showGoalModal, setShowGoalModal] = useState(false);

  // New Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [targetLitres, setTargetLitres] = useState<number>(120);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filter tips by category
  const [tipCategoryFilter, setTipCategoryFilter] = useState<string>('all');

  const filteredTips = tips.filter(
    (t) => tipCategoryFilter === 'all' || t.category === tipCategoryFilter
  );

  // Calculate potential savings from implemented tips vs all tips
  const implementedTips = tips.filter((t) => t.implemented);
  const implementedAnnualSavings = implementedTips.reduce((sum, t) => sum + t.annualSavingsLitres, 0);
  const implementedAnnualDollars = ((implementedAnnualSavings / 1000) * profile.costPer1000L).toFixed(2);

  const totalPotentialAnnualSavings = tips.reduce((sum, t) => sum + t.annualSavingsLitres, 0);
  const totalPotentialAnnualDollars = ((totalPotentialAnnualSavings / 1000) * profile.costPer1000L).toFixed(2);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    onAddGoal({
      title: goalTitle,
      targetLitres,
      currentLitres: 0,
      period,
      category: 'total',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    setShowGoalModal(false);
    setGoalTitle('');
    setTargetLitres(120);
    triggerCelebration();
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-sky-600" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-emerald-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-indigo-600" />;
      default: return <Award className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Level Segmented Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Water-Saving Goals, Habits & SDG 6 Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empower conservation habits, complete milestones, and advance sustainable water targets.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('goals')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all ${
              activeSubTab === 'goals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conservation Goals & Badges
          </button>
          <button
            onClick={() => setActiveSubTab('tips')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all ${
              activeSubTab === 'tips'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practical Tips & Savings Calc
          </button>
          <button
            onClick={() => setActiveSubTab('sdg6')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all ${
              activeSubTab === 'sdg6'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SDG 6 Mission
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Goals and Badges */}
      {activeSubTab === 'goals' && (
        <div className="space-y-8">
          {/* Active Goals Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Household Water Goals
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keep usage below your targets to unlock badges and maximize domestic savings.
                </p>
              </div>

              <button
                onClick={() => setShowGoalModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Set New Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {goals.map((goal) => {
                const progressPct = Math.min(100, Math.round((goal.currentLitres / goal.targetLitres) * 100));
                const isOver = goal.currentLitres > goal.targetLitres;

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {goal.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                          {goal.period}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between text-xs">
                        <span className="text-slate-500">Current / Target:</span>
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {goal.currentLitres.toFixed(1)} / {goal.targetLitres} L
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-rose-500' : progressPct > 80 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          onToggleGoalComplete(goal.id);
                          if (!goal.completed) triggerCelebration();
                        }}
                        className={`inline-flex items-center gap-1 font-semibold ${
                          goal.completed
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-slate-500 hover:text-sky-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{goal.completed ? 'Goal Achieved!' : 'Mark Complete'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-slate-400 hover:text-rose-600 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conservation Badges & Achievements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Conservation Milestones & Badges
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {achievements.filter(a => a.progressPercent >= 100).length} of {achievements.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
              {achievements.map((badge) => {
                const isUnlocked = badge.progressPercent >= 100;

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border text-center flex flex-col justify-between transition-all ${
                      isUnlocked
                        ? 'border-sky-200 bg-sky-50/30 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center border border-slate-200 mb-2">
                        {getBadgeIcon(badge.iconName)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px]">
                      {isUnlocked ? (
                        <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{badge.unlockedAt || 'Unlocked'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">
                          {badge.criteria}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Tips & Interactive Calculator */}
      {activeSubTab === 'tips' && (
        <div className="space-y-8">
          {/* Savings Potential Calculator Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    My Household Water Savings Potential Calculator
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off the eco-friendly actions below to see your cumulative annual water and financial savings.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase">Currently Implemented</span>
                <span className="text-xl font-bold text-emerald-600 font-mono-numbers">
                  {implementedAnnualSavings.toLocaleString()} Litres / year
                </span>
                <span className="text-xs text-slate-500 block">
                  saving approx. {profile.currencySymbol}{implementedAnnualDollars} annually
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 p-4 bg-sky-50/50 rounded-xl border border-sky-100 text-xs">
              <div>
                <span className="text-slate-500 block">Max Potential Annual Savings:</span>
                <span className="text-lg font-bold text-sky-900 font-mono-numbers">
                  {totalPotentialAnnualSavings.toLocaleString()} Litres
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Max Annual Financial Savings:</span>
                <span className="text-lg font-bold text-sky-900 font-mono-numbers">
                  {profile.currencySymbol}{totalPotentialAnnualDollars}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Implemented Habits:</span>
                <span className="text-lg font-bold text-sky-900 font-mono-numbers">
                  {implementedTips.length} of {tips.length} actions
                </span>
              </div>
            </div>
          </div>

          {/* Tips Filter & Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Practical Water Conservation Actions
              </h3>

              {/* Category Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {['all', 'shower', 'kitchen', 'toilet', 'garden'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTipCategoryFilter(cat)}
                    className={`py-1 px-2.5 rounded-md capitalize font-medium transition-colors ${
                      tipCategoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'All Tips' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTips.map((tip) => (
                <div
                  key={tip.id}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    tip.implemented
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {tip.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize shrink-0">
                        {tip.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {tip.description}
                    </p>

                    <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Savings per event:</span>
                        <span className="font-semibold text-sky-700 font-mono-numbers">
                          ~{tip.potentialSavingsLiters} Litres
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Annual impact:</span>
                        <span className="font-bold text-slate-800 font-mono-numbers">
                          {tip.annualSavingsLitres.toLocaleString()} L / yr
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        {tip.sdgImpact}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onToggleTipImplemented(tip.id);
                        if (!tip.implemented) triggerCelebration();
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        tip.implemented
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{tip.implemented ? 'Active in Household' : 'Mark as Implemented'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SDG 6 Global Mission */}
      {activeSubTab === 'sdg6' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-6">
          <div className="relative h-56 bg-slate-100 overflow-hidden">
            <img
              src="/src/assets/images/sustainable_home_water_1792011316626.jpg"
              alt="Sustainable home water harvesting and conservation"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-sky-300">
                  United Nations Sustainable Development Goal 6
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Clean Water and Sanitation for All
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Target 6.4: Water-Use Efficiency
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  By 2030, substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals and supply of freshwater to address water scarcity.
                </p>
                <div className="text-[11px] text-sky-700 font-semibold pt-1">
                  Your home contributes directly by keeping per-capita daily withdrawal under 50 Litres.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Target 6.1: Safe & Affordable Drinking Water
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conserving municipal treated water prevents unnecessary strain on local water treatment plants, reducing chemical purification energy by up to 25%.
                </p>
                <div className="text-[11px] text-sky-700 font-semibold pt-1">
                  Every 1,000 Litres saved preserves clean aquifer supplies for regional communities.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Circular Rainwater & Micro-Drip
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decentralized water harvesting and smart drip irrigation eliminate over-spray evaporation, maintaining healthy biodiversity without depleting the municipal water mains.
                </p>
                <div className="text-[11px] text-sky-700 font-semibold pt-1">
                  Rainwater barrels cut outdoor tap reliance by 80% during summer months.
                </div>
              </div>
            </div>

            {/* Global Water Scarcity Infographic Bar */}
            <div className="p-5 bg-sky-50/70 border border-sky-100 rounded-xl space-y-3">
              <div className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                Why Household Habits Matter
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                Over 2 billion people worldwide live in countries experiencing high water stress. In typical suburban households, up to 30% of potable water is lost to unaddressed toilet flapper leaks and running taps while brushing. Using AquaSave, your household has prevented over <strong>1,400 Litres of water waste this week alone</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Create Water Conservation Goal
                </h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keep Daily Usage Below 120 Litres"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Litres Limit
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={targetLitres}
                    onChange={(e) => setTargetLitres(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cadence / Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                  >
                    <option value="daily">Daily Target</option>
                    <option value="weekly">Weekly Target</option>
                    <option value="monthly">Monthly Target</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Start Tracking Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
