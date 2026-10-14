import React, { useState } from 'react';
import { Bell, Clock, Check, Plus, Trash2, Droplet, Sparkles, Volume2 } from 'lucide-react';
import { SmartReminder, WaterCategory } from '../types/water';

interface SmartReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: SmartReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<SmartReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export const SmartReminderModal: React.FC<SmartReminderModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // New reminder form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WaterCategory>('shower');
  const [triggerTime, setTriggerTime] = useState('08:00 AM');
  const [potentialSavings, setPotentialSavings] = useState(25);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title,
      description,
      category,
      triggerTime,
      frequency: 'daily',
      isActive: true,
      litersSavedPotential: potentialSavings,
    });

    setShowAddForm(false);
    setTitle('');
    setDescription('');
  };

  const handleTestAlert = (reminder: SmartReminder) => {
    setTestNotification(`AquaSave Alert: "${reminder.title}" — ${reminder.description}`);
    setTimeout(() => {
      setTestNotification(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Bell className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Smart Water-Saving Reminders
              </h3>
              <p className="text-xs text-slate-500">
                Automated habit nudges to keep your water consumption within SDG 6 goals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Test Alert Banner if fired */}
        {testNotification && (
          <div className="mt-4 p-3 bg-sky-600 text-white rounded-xl shadow-md text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 shrink-0 text-sky-200" />
              <span>{testNotification}</span>
            </div>
            <button
              onClick={() => setTestNotification(null)}
              className="text-white hover:text-sky-200 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {reminder.title}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {reminder.description}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Cadence: {reminder.triggerTime}</span>
                    <span>·</span>
                    <span className="text-emerald-600 font-medium">~{reminder.litersSavedPotential}L saved/trigger</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleReminder(reminder.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors shrink-0 ${
                    reminder.isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {reminder.isActive ? 'Active' : 'Off'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => handleTestAlert(reminder)}
                  className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test Trigger Alert</span>
                </button>

                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Reminder Form */}
        {showAddForm ? (
          <form onSubmit={handleCreate} className="mt-4 p-4 border border-sky-200 bg-sky-50/40 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">New Smart Reminder</h4>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Turn tap off while brushing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Save 12 litres twice a day by using cup rinse"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                >
                  <option value="shower">Shower</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="toilet">Toilet</option>
                  <option value="garden">Garden</option>
                  <option value="laundry">Laundry</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trigger Cadence</label>
                <input
                  type="text"
                  placeholder="e.g. 07:30 AM or During flow"
                  value={triggerTime}
                  onChange={(e) => setTriggerTime(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
              >
                Save Reminder
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            + Create Custom Reminder
          </button>
        )}

        <div className="pt-4 mt-4 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
