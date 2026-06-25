import React, { useState } from "react";
import { MessageSquare, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Raycast-style Integrations & Notifications settings panel.
 * Refactored to cap card rows to exactly h-[90px] and align Icon | Text | Toggle perfectly vertically.
 */
export const ReminderSettings = () => {
  const [whatsappSync, setWhatsappSync] = useState(() => {
    return localStorage.getItem("cf_whatsapp_sync") === "true";
  });
  const [googleCalendarSync, setGoogleCalendarSync] = useState(() => {
    return localStorage.getItem("cf_gcal_sync") === "true";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem("cf_global_reminder_time") || "09:00";
  });

  const handleWhatsappToggle = () => {
    const nextState = !whatsappSync;
    setWhatsappSync(nextState);
    localStorage.setItem("cf_whatsapp_sync", String(nextState));
    if (nextState) {
      toast.success("WhatsApp notifications connected successfully.");
    } else {
      toast.error("WhatsApp notifications disconnected.");
    }
  };

  const handleGcalToggle = () => {
    const nextState = !googleCalendarSync;
    setGoogleCalendarSync(nextState);
    localStorage.setItem("cf_gcal_sync", String(nextState));
    if (nextState) {
      toast.success("Google Calendar synchronization active.");
    } else {
      toast.error("Google Calendar synchronization disconnected.");
    }
  };

  const handleTimeChange = (e) => {
    const timeVal = e.target.value;
    setReminderTime(timeVal);
    localStorage.setItem("cf_global_reminder_time", timeVal);
    toast.success(`Default reminder time updated to ${timeVal}`);
  };

  return (
    <div className="p-6 bg-panel border border-border rounded-lg space-y-5 relative z-10 w-full animate-fade-in">
      {/* Header Panel */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <div className="h-8 w-8 rounded-[4px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
            Integrations & Notifications
          </h2>
          <p className="text-[12px] text-muted">
            Automated alerts and calendar integrations
          </p>
        </div>
      </div>

      {/* Settings list - locked to exactly 64px rows with perfect vertical alignment */}
      <div className="space-y-3 font-body">
        {/* WhatsApp Sync */}
        <div className="h-[64px] px-4 bg-panel2 border border-border rounded-[4px] flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-bold text-txt truncate">
                  WhatsApp Reminders
                </h4>
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 border ${
                    whatsappSync
                      ? "bg-emerald-555 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  {whatsappSync ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-none truncate mt-1">
                Receive daily study task checklists and urgent deadline alerts directly on WhatsApp.
              </p>
            </div>
          </div>

          {/* Switch */}
          <button
            onClick={handleWhatsappToggle}
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 relative ${
              whatsappSync ? "bg-emerald-500" : "bg-border"
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white transform transition-transform duration-205 ${
                whatsappSync ? "translate-x-4.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Google Calendar Sync */}
        <div className="h-[64px] px-4 bg-panel2 border border-border rounded-[4px] flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-bold text-txt truncate">
                  Google Calendar Sync
                </h4>
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 border ${
                    googleCalendarSync
                      ? "bg-emerald-555 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  {googleCalendarSync ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-none truncate mt-1">
                Sync academic milestones and daily study slots into your Google Calendar account.
              </p>
            </div>
          </div>

          {/* Switch */}
          <button
            onClick={handleGcalToggle}
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 relative ${
              googleCalendarSync ? "bg-primary" : "bg-border"
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white transform transition-transform duration-205 ${
                googleCalendarSync ? "translate-x-4.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Preferred Reminder Time Picker */}
        <div className="h-[64px] px-4 bg-panel2 border border-border rounded-[4px] flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h4 className="text-[13px] font-bold text-txt truncate">
                Preferred Reminder Time
              </h4>
              <p className="text-[11px] text-muted leading-none truncate mt-1">
                Default daily hour to push WhatsApp alerts and reminder checklists.
              </p>
            </div>
          </div>

          <input
            type="time"
            value={reminderTime}
            onChange={handleTimeChange}
            className="px-2.5 py-1 rounded-[4px] border border-border bg-panel text-txt focus:outline-none focus:border-primary transition-colors text-xs cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ReminderSettings;
