import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Plus, X, Clock, Edit3,
  AlertTriangle, CheckCircle, TrendingUp, Save,
  Calendar, BookOpen, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchTimetable, createTimetable, updateTimetable,
  markAttendance, editAttendance, fetchAttendanceByDate,
  fetchSummary, fetchHistory,
} from "../services/attendanceService";

// ─── Constants ──────────────────────────────────────────────
const DAYS = ["mon","tue","wed","thu","fri","sat"];
const DAY_LABELS = { mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday" };
const DAY_IDX = { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6 };

const getTodayKey = () => {
  const keys = ["sun","mon","tue","wed","thu","fri","sat"];
  return keys[new Date().getDay()];
};
const todayISO = () => new Date().toISOString().split("T")[0];

// localStorage helpers
const LS_TT   = "cf_attendance_timetable";
const LS_ATT  = "cf_attendance_records";

const loadTT  = () => { try { return JSON.parse(localStorage.getItem(LS_TT) || "null"); } catch { return null; } };
const saveTT  = (tt) => localStorage.setItem(LS_TT, JSON.stringify(tt));
const loadAtt = () => { try { return JSON.parse(localStorage.getItem(LS_ATT) || "[]"); } catch { return []; } };
const saveAtt = (a) => localStorage.setItem(LS_ATT, JSON.stringify(a));

const emptyTT = () => DAYS.reduce((a,d) => ({...a,[d]:[]}), {});

// Colour helper
const pctColors = (pct) => {
  if (pct >= 85) return { border:"border-emerald-500", bg:"bg-emerald-500/10", text:"text-emerald-400", bar:"bg-emerald-500", label:"Safe ✅" };
  if (pct >= 75) return { border:"border-yellow-400",  bg:"bg-yellow-400/10",  text:"text-yellow-400",   bar:"bg-yellow-400",  label:"At Risk ⚠️" };
  return              { border:"border-red-500",        bg:"bg-red-500/10",     text:"text-red-500",                           bar:"bg-red-500",     label:"Danger 🚨" };
};

// Summary computed from localStorage attendance array
const computeSummary = (records) => {
  const map = {};
  for (const day of records) {
    for (const r of day.records) {
      if (!map[r.subject]) map[r.subject] = { total:0, present:0 };
      map[r.subject].total++;
      if (r.status === "present") map[r.subject].present++;
    }
  }
  return Object.entries(map).map(([subject, s]) => {
    const pct = s.total ? Math.round((s.present/s.total)*100) : 0;
    const needed = pct >= 75 ? 0 : Math.ceil((0.75*s.total - s.present)/0.25);
    return { subject, total:s.total, present:s.present, absent:s.total-s.present, percentage:pct, classesNeeded:needed };
  });
};

// ════════════════════════════════════════════════════════════
// TIMETABLE BUILDER
// ════════════════════════════════════════════════════════════
function TimetableBuilder({ initial, onSave, isEdit }) {
  const [tt, setTt]     = useState(initial || emptyTT());
  const [saving, setSaving] = useState(false);

  const addClass    = (d) => setTt(p=>({...p,[d]:[...p[d],{subject:"",start:"",end:""}]}));
  const removeClass = (d,i)=> setTt(p=>({...p,[d]:p[d].filter((_,j)=>j!==i)}));
  const upd         = (d,i,f,v)=> setTt(p=>{const r=[...p[d]];r[i]={...r[i],[f]:v};return{...p,[d]:r};});

  const submit = async () => {
    const hasAny = DAYS.some(d => tt[d].some(c=>c.subject.trim()));
    if (!hasAny) { toast.error("Add at least one class."); return; }
    setSaving(true);
    try { await onSave(tt); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="font-display text-[20px] font-bold text-txt">{isEdit ? "Edit Timetable" : "Setup Your Timetable"}</h2>
        <p className="text-[13px] text-muted mt-1">Mon – Sat. Sunday is always free 🎉</p>
      </div>

      {DAYS.map(day => (
        <div key={day} className="bg-panel border border-border rounded-[4px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-panel2">
            <span className="font-display font-bold text-[12px] uppercase tracking-widest text-txt">{DAY_LABELS[day]}</span>
            <button onClick={()=>addClass(day)} className="flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary/70 transition-colors">
              <Plus className="w-3.5 h-3.5"/> Add Class
            </button>
          </div>

          {tt[day].length === 0
            ? <p className="px-5 py-3 text-[12px] text-muted italic">No classes — click Add Class.</p>
            : tt[day].map((cls,i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-border last:border-0">
                <input type="text" placeholder="Subject name" value={cls.subject}
                  onChange={e=>upd(day,i,"subject",e.target.value)}
                  className="flex-1 min-w-[140px] bg-bg border border-border rounded-[4px] px-3 py-1.5 text-[13px] text-txt placeholder:text-muted focus:outline-none focus:border-primary"/>
                <input type="time" value={cls.start} onChange={e=>upd(day,i,"start",e.target.value)}
                  className="w-[105px] bg-bg border border-border rounded-[4px] px-2 py-1.5 text-[13px] text-txt focus:outline-none focus:border-primary"/>
                <span className="text-muted text-[12px]">→</span>
                <input type="time" value={cls.end} onChange={e=>upd(day,i,"end",e.target.value)}
                  className="w-[105px] bg-bg border border-border rounded-[4px] px-2 py-1.5 text-[13px] text-txt focus:outline-none focus:border-primary"/>
                <button onClick={()=>removeClass(day,i)} className="text-muted hover:text-red-500 transition-colors p-1"><X className="w-4 h-4"/></button>
              </div>
            ))
          }
        </div>
      ))}

      <button onClick={submit} disabled={saving}
        className="flex items-center gap-2 bg-primary text-white rounded-[4px] px-6 py-2.5 text-[14px] font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
        <Save className="w-4 h-4"/>
        {saving ? "Saving…" : isEdit ? "Update Timetable" : "Save & Continue →"}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DAILY ATTENDANCE VIEW
// ════════════════════════════════════════════════════════════
function DailyView({ timetable, onEditTimetable }) {
  const todayKey    = getTodayKey();
  const date        = todayISO();
  const daySubjects = (timetable && timetable[todayKey]) || [];

  // Load existing records from localStorage
  const getExisting = useCallback(() => {
    const all = loadAtt();
    return all.find(a => a.date === date) || null;
  }, [date]);

  const [existing, setExisting]   = useState(() => getExisting());
  const [editMode, setEditMode]   = useState(false);
  const [selections, setSelections] = useState(() => {
    const ex = getExisting();
    if (!ex) return {};
    return ex.records.reduce((a,r)=>({...a,[r.subject]:r.status}), {});
  });
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary]       = useState(() => computeSummary(loadAtt()));

  const isReadOnly = !!(existing && !editMode);

  const toggle = (subject, status) => {
    if (isReadOnly) return;
    setSelections(p => ({...p,[subject]:status}));
  };

  const handleSubmit = async () => {
    const unmarked = daySubjects.filter(c => !selections[c.subject]);
    if (unmarked.length > 0) {
      toast.error(`Mark all subjects first. Missing: ${unmarked.map(c=>c.subject).join(", ")}`);
      return;
    }
    const records = daySubjects.map(c => ({ subject: c.subject, status: selections[c.subject] }));
    setSubmitting(true);
    try {
      // 1. Save to localStorage (primary — always works)
      const all = loadAtt();
      if (existing && editMode) {
        const idx = all.findIndex(a=>a.date===date);
        if (idx !== -1) all[idx] = { date, records, markedAt: all[idx].markedAt, editedAt: new Date().toISOString() };
      } else {
        all.push({ date, records, markedAt: new Date().toISOString() });
      }
      saveAtt(all);
      setSummary(computeSummary(all));
      const updated = all.find(a=>a.date===date);
      setExisting(updated);
      setEditMode(false);
      toast.success(existing ? "Attendance updated!" : "Attendance marked! ✅");

      // 2. Sync to backend (background — non-blocking)
      try {
        if (existing && editMode) await editAttendance(date, records);
        else await markAttendance(date, records);
      } catch { /* backend sync failed, localStorage is source of truth */ }
    } finally { setSubmitting(false); }
  };

  // Sunday or no classes for today
  if (todayKey === "sun" || daySubjects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-panel border border-border rounded-[4px] p-8 text-center">
          <BookOpen className="w-10 h-10 text-muted mx-auto mb-3"/>
          <p className="font-bold text-txt text-[15px]">
            {todayKey === "sun" ? "Sunday — No Classes 🎉" : `No classes scheduled for ${DAY_LABELS[todayKey] || "today"}.`}
          </p>
          <p className="text-[13px] text-muted mt-1">Edit your timetable to add classes.</p>
          <button onClick={onEditTimetable} className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-primary mx-auto">
            <Edit3 className="w-3.5 h-3.5"/> Edit Timetable
          </button>
        </div>
        <SummaryCards summary={summary}/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[20px] font-bold text-txt">{DAY_LABELS[todayKey]}'s Attendance</h2>
          <p className="text-[13px] text-muted flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5"/>
            {new Date().toLocaleDateString("en-IN",{dateStyle:"long"})}
            {existing && !editMode && <span className="ml-2 text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Already marked</span>}
          </p>
        </div>
        <button onClick={onEditTimetable}
          className="flex items-center gap-1.5 text-[12px] font-bold text-muted border border-border rounded-[4px] px-3 py-1.5 hover:bg-panel2 hover:text-txt transition-colors">
          <Edit3 className="w-3.5 h-3.5"/> Edit Timetable
        </button>
      </div>

      {/* Subject Cards */}
      <div className="bg-panel border border-border rounded-[4px] overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-panel2">
          <span className="font-display font-bold text-[11px] uppercase tracking-widest text-muted">
            {daySubjects.length} Subject{daySubjects.length!==1?"s":""} Today
            {isReadOnly && <span className="ml-3 text-muted/60">(read-only — click Edit to change)</span>}
          </span>
        </div>

        <div className="divide-y divide-border">
          {daySubjects.map((cls, i) => {
            const status = selections[cls.subject];
            return (
              <motion.div key={cls.subject} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3"
                initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <div>
                  <p className="font-bold text-[14px] text-txt">{cls.subject}</p>
                  {cls.start && cls.end && (
                    <p className="text-[12px] text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3"/>{cls.start} – {cls.end}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toggle(cls.subject,"present")} disabled={isReadOnly}
                    className={`px-4 py-1.5 rounded-[4px] text-[13px] font-bold border transition-all duration-150 ${
                      status==="present"
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-transparent border-border text-muted hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-default disabled:opacity-50"}`}>
                    ✅ Present
                  </button>
                  <button onClick={()=>toggle(cls.subject,"absent")} disabled={isReadOnly}
                    className={`px-4 py-1.5 rounded-[4px] text-[13px] font-bold border transition-all duration-150 ${
                      status==="absent"
                        ? "bg-red-500 text-white border-red-500 shadow-sm"
                        : "bg-transparent border-border text-muted hover:border-red-400 hover:text-red-500 disabled:cursor-default disabled:opacity-50"}`}>
                    ❌ Absent
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Submit / Edit CTA */}
      <div className="flex items-center gap-3 flex-wrap">
        {existing && !editMode ? (
          <button onClick={()=>setEditMode(true)}
            className="flex items-center gap-2 border border-border rounded-[4px] px-5 py-2.5 text-[13px] font-bold text-muted hover:bg-panel2 hover:text-txt transition-colors">
            <Edit3 className="w-4 h-4"/> Edit Today's Attendance
          </button>
        ) : (
          <>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 bg-primary text-white rounded-[4px] px-6 py-2.5 text-[14px] font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              <CheckSquare className="w-4 h-4"/>
              {submitting ? "Saving…" : existing ? "Update Attendance" : "Submit Attendance"}
            </button>
            {editMode && (
              <button onClick={()=>setEditMode(false)}
                className="text-[13px] font-bold text-muted hover:text-txt transition-colors px-3 py-2.5">
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SUMMARY CARDS  (3-column, colour-coded)
// ════════════════════════════════════════════════════════════
function SummaryCards({ summary }) {
  if (!summary || summary.length === 0) {
    return (
      <div>
        <h3 className="font-display font-bold text-[15px] text-txt mb-3 flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-primary"/> Attendance Summary
        </h3>
        <div className="bg-panel border border-border rounded-[4px] p-6 text-center">
          <p className="text-[13px] text-muted">Mark attendance to see subject-wise summary here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display font-bold text-[15px] text-txt mb-3 flex items-center gap-2">
        <TrendingUp className="w-4.5 h-4.5 text-primary"/> Attendance Summary
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.map((s,i) => {
          const c = pctColors(s.percentage);
          return (
            <motion.div key={s.subject} className={`bg-panel border-2 ${c.border} rounded-[4px] p-5`}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-display font-bold text-[14px] text-txt leading-tight">{s.subject}</p>
                <span className={`shrink-0 px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${c.bg} ${c.text}`}>
                  {c.label}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-muted">Attendance</span>
                  <span className={`${c.text} font-black text-[13px]`}>{s.percentage}%</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{width:`${s.percentage}%`}}/>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted mt-2.5">
                <span>{s.present}/{s.total} classes attended</span>
                {s.classesNeeded > 0
                  ? <span className="flex items-center gap-1 text-red-500 font-semibold"><AlertTriangle className="w-3 h-3"/>Need {s.classesNeeded} more</span>
                  : <span className="flex items-center gap-1 text-emerald-500 font-semibold"><CheckCircle className="w-3 h-3"/>On track</span>
                }
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ALL DAYS VIEW — pick any day and mark attendance
// ════════════════════════════════════════════════════════════
function AllDaysView({ timetable, onEditTimetable }) {
  const todayKey = getTodayKey();

  // Selected day to mark
  const [selectedDay, setSelectedDay] = useState(todayKey === "sun" ? "mon" : todayKey);

  // For each day we track: the ISO date chosen + selections
  const getDateForDay = (dayKey) => {
    const now = new Date();
    const todayIdx = now.getDay(); // 0=Sun
    const targetIdx = DAY_IDX[dayKey];
    const diff = targetIdx - todayIdx;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const [dateForDay, setDateForDay] = useState(() => {
    const init = {};
    DAYS.forEach(d => { init[d] = getDateForDay(d); });
    return init;
  });

  const [selections, setSelections] = useState({});   // dayKey → { subject: status }
  const [existing,   setExisting]   = useState({});   // dayKey → entry | null
  const [editMode,   setEditMode]   = useState({});   // dayKey → bool
  const [submitting, setSubmitting] = useState(false);
  const [summary,    setSummary]    = useState(() => computeSummary(loadAtt()));

  // Load all local records into existing map on mount
  useEffect(() => {
    const all = loadAtt();
    const ex  = {};
    const sel = {};
    DAYS.forEach(day => {
      const iso   = getDateForDay(day);
      const found = all.find(a => a.date === iso);
      ex[day]     = found || null;
      sel[day]    = found ? found.records.reduce((a,r)=>({...a,[r.subject]:r.status}),{}) : {};
    });
    setExisting(ex);
    setSelections(sel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (day, subject, status) => {
    if (existing[day] && !editMode[day]) return;
    setSelections(p => ({...p, [day]: {...(p[day]||{}), [subject]: status}}));
  };

  const handleSubmit = async (day) => {
    const subjects = timetable[day] || [];
    const sel = selections[day] || {};
    const unmarked = subjects.filter(c => !sel[c.subject]);
    if (unmarked.length) { toast.error(`Mark all: ${unmarked.map(c=>c.subject).join(", ")}`); return; }

    const records = subjects.map(c => ({ subject: c.subject, status: sel[c.subject] }));
    const date    = dateForDay[day];
    setSubmitting(true);
    try {
      const all = loadAtt();
      const idx = all.findIndex(a => a.date === date);
      const entry = { date, dayKey: day, records, markedAt: idx !== -1 ? all[idx].markedAt : new Date().toISOString() };
      if (idx !== -1) all[idx] = { ...entry, editedAt: new Date().toISOString() };
      else all.push(entry);
      saveAtt(all);
      setSummary(computeSummary(all));
      setExisting(p => ({...p, [day]: entry}));
      setEditMode(p => ({...p, [day]: false}));
      toast.success(`${DAY_LABELS[day]} attendance saved! ✅`);
      try {
        if (existing[day] && editMode[day]) await editAttendance(date, records);
        else await markAttendance(date, records);
      } catch { /* local saved */ }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[20px] font-bold text-txt">All Days Attendance</h2>
          <p className="text-[13px] text-muted mt-0.5">Mark attendance for any day of the week.</p>
        </div>
        <button onClick={onEditTimetable}
          className="flex items-center gap-1.5 text-[12px] font-bold text-muted border border-border rounded-[4px] px-3 py-1.5 hover:bg-panel2 hover:text-txt transition-colors">
          <Edit3 className="w-3.5 h-3.5"/> Edit Timetable
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-0 border border-border rounded-[4px] overflow-hidden">
        {DAYS.map(day => {
          const marked = !!existing[day];
          return (
            <button key={day} onClick={()=>setSelectedDay(day)}
              className={`flex-1 min-w-[70px] px-3 py-2.5 text-[12px] font-bold border-r border-border last:border-0 transition-colors ${
                selectedDay===day ? "bg-primary text-white" : marked ? "bg-emerald-500/10 text-emerald-400 hover:bg-panel2" : "bg-panel text-muted hover:bg-panel2 hover:text-txt"
              }`}>
              {DAY_LABELS[day].slice(0,3)}
              {marked && <span className="block text-[9px] font-normal opacity-80">✅</span>}
            </button>
          );
        })}
      </div>

      {/* Selected day subjects */}
      {(() => {
        const day      = selectedDay;
        const subjects = timetable[day] || [];
        const sel      = selections[day] || {};
        const isRO     = !!(existing[day] && !editMode[day]);

        if (subjects.length === 0) return (
          <div className="bg-panel border border-border rounded-[4px] p-6 text-center">
            <p className="text-[13px] text-muted">No classes scheduled for {DAY_LABELS[day]}.</p>
            <button onClick={onEditTimetable} className="mt-3 text-[13px] font-bold text-primary flex items-center gap-1 mx-auto">
              <Plus className="w-3.5 h-3.5"/> Add Classes
            </button>
          </div>
        );

        return (
          <div className="bg-panel border border-border rounded-[4px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-panel2">
              <span className="font-display font-bold text-[12px] uppercase tracking-widest text-muted">
                {DAY_LABELS[day]} — {subjects.length} subject{subjects.length!==1?"s":""}
              </span>
              {existing[day] && !editMode[day] && (
                <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5"/> Marked
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {subjects.map((cls,i) => {
                const status = sel[cls.subject];
                return (
                  <motion.div key={cls.subject} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3"
                    initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <div>
                      <p className="font-bold text-[14px] text-txt">{cls.subject}</p>
                      {cls.start&&cls.end&&<p className="text-[12px] text-muted flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/>{cls.start}–{cls.end}</p>}
                    </div>
                    <div className="flex gap-2">
                      {["present","absent"].map(s=>(
                        <button key={s} onClick={()=>toggle(day,cls.subject,s)} disabled={isRO}
                          className={`px-3 py-1.5 rounded-[4px] text-[12px] font-bold border transition-all ${
                            status===s
                              ? s==="present" ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-500 text-white border-red-500"
                              : "bg-transparent border-border text-muted hover:border-primary hover:text-primary disabled:cursor-default disabled:opacity-40"
                          }`}>
                          {s==="present"?"✅ Present":"❌ Absent"}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* CTA */}
            <div className="px-5 py-4 border-t border-border flex gap-3">
              {existing[day] && !editMode[day] ? (
                <button onClick={()=>setEditMode(p=>({...p,[day]:true}))}
                  className="flex items-center gap-2 border border-border rounded-[4px] px-4 py-2 text-[13px] font-bold text-muted hover:bg-panel2 hover:text-txt transition-colors">
                  <Edit3 className="w-4 h-4"/> Edit
                </button>
              ) : (
                <>
                  <button onClick={()=>handleSubmit(day)} disabled={submitting}
                    className="flex items-center gap-2 bg-primary text-white rounded-[4px] px-5 py-2 text-[13px] font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    <CheckSquare className="w-4 h-4"/>
                    {submitting ? "Saving…" : existing[day] ? "Update" : "Submit"}
                  </button>
                  {editMode[day] && <button onClick={()=>setEditMode(p=>({...p,[day]:false}))} className="text-[13px] font-bold text-muted hover:text-txt transition-colors px-3">Cancel</button>}
                </>
              )}
            </div>
          </div>
        );
      })()}

      <SummaryCards summary={summary}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function Attendance() {
  const [view, setView]           = useState("loading");
  const [timetable, setTimetable] = useState(null);
  const [tab, setTab]             = useState("today"); // "today" | "all"

  useEffect(() => {
    const local = loadTT();
    if (local) {
      setTimetable(local);
      setView("daily");
      fetchTimetable().catch(()=>{});
      return;
    }
    fetchTimetable()
      .then(res => {
        if (res.data?.timetable) {
          saveTT(res.data.timetable);
          setTimetable(res.data.timetable);
          setView("daily");
        } else { setView("setup"); }
      })
      .catch(() => setView("setup"));
  }, []);

  const handleCreate = async (tt) => {
    saveTT(tt);
    setTimetable(tt);
    setView("daily");
    toast.success("Timetable saved! Mark today's attendance below 👇");
    try { await createTimetable(tt); } catch {}
  };

  const handleUpdate = async (tt) => {
    saveTT(tt);
    setTimetable(tt);
    setView("daily");
    toast.success("Timetable updated!");
    try { await updateTimetable(tt); } catch {}
  };

  return (
    <div className="bg-panel border border-border rounded-[4px] overflow-hidden font-body transition-colors duration-150">
      {/* Header */}
      <div className="border-b border-border px-6 sm:px-8 py-5 bg-panel flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20">
            <CheckSquare className="w-5 h-5 stroke-[1.75]"/>
          </div>
          <div>
            <h1 className="font-display text-[20px] sm:text-[26px] font-bold text-txt tracking-tight">Attendance Tracker</h1>
            <p className="text-[12px] text-muted">Track classes · Monitor % · Get alerts</p>
          </div>
        </div>
        {view === "daily" && (
          <div className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="cursor-pointer hover:text-txt" onClick={()=>timetable&&setView("daily")}>Attendance</span>
          </div>
        )}
        {(view==="setup"||view==="edit-tt") && (
          <div className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="cursor-pointer hover:text-txt" onClick={()=>timetable&&setView("daily")}>Attendance</span>
            <ChevronRight className="w-3.5 h-3.5"/>
            <span className="text-txt font-semibold">{view==="setup"?"Setup":"Edit"} Timetable</span>
          </div>
        )}
      </div>

      {/* Tab bar — only when timetable exists */}
      {view === "daily" && (
        <div className="flex border-b border-border bg-panel2">
          {[["today","📅 Today"],["all","📆 All Days"]].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-6 py-3 text-[13px] font-bold border-r border-border transition-colors ${tab===t?"bg-panel text-primary border-b-2 border-b-primary":"text-muted hover:bg-panel hover:text-txt"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {view==="loading" && (
            <motion.div key="loading" className="flex items-center justify-center py-16"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
            </motion.div>
          )}
          {view==="setup" && (
            <motion.div key="setup" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <TimetableBuilder onSave={handleCreate} isEdit={false}/>
            </motion.div>
          )}
          {view==="edit-tt" && (
            <motion.div key="edit-tt" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <TimetableBuilder initial={timetable} onSave={handleUpdate} isEdit={true}/>
            </motion.div>
          )}
          {view==="daily" && timetable && tab==="today" && (
            <motion.div key="daily-today" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <DailyView timetable={timetable} onEditTimetable={()=>setView("edit-tt")}/>
            </motion.div>
          )}
          {view==="daily" && timetable && tab==="all" && (
            <motion.div key="daily-all" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <AllDaysView timetable={timetable} onEditTimetable={()=>setView("edit-tt")}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
