// ═════════════════════════════════════════════════════════════════════════
//   <FindSwimmer /> — onboarding step 3
//
//   Two-stage flow: pick the school first, then pick the swimmer.
//   Swimmer step has a live-filter search box. "Other / Add manually"
//   path opens a free-form entry form.
//
//   In production: replace `schools` and `swimmerDatabase` with
//   `GET /schools` and `GET /schools/:id/swimmers?search=` calls.
// ═════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useRef, useEffect } from 'react';
import { schools, swimmerDatabase } from '../../data.js';

export default function FindSwimmer({ onNext }) {
  const [stage, setStage] = useState('school'); // 'school' | 'swimmer' | 'manual'
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [search, setSearch] = useState('');

  if (stage === 'school') {
    return (
      <SchoolStage
        onSelect={(school) => {
          setSelectedSchool(school);
          setStage(school.id === 'other' ? 'manual' : 'swimmer');
        }}
      />
    );
  }

  if (stage === 'manual') {
    return (
      <ManualStage
        onBack={() => {
          setSelectedSchool(null);
          setStage('school');
        }}
        onSubmit={(data) =>
          onNext({ swimmer: { ...data, schoolId: 'other', id: 'manual_' + Date.now() } })
        }
      />
    );
  }

  return (
    <SwimmerStage
      school={selectedSchool}
      search={search}
      onSearchChange={setSearch}
      onBack={() => {
        setSelectedSchool(null);
        setStage('school');
      }}
      onSelect={(swimmer) =>
        onNext({ swimmer: { ...swimmer, schoolName: selectedSchool.name } })
      }
    />
  );
}

// ─── Stage 1: pick a school ─────────────────────────────────────────────────
function SchoolStage({ onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 shrink-0">
        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          Which <span className="italic text-cyan-deep">school</span> does your swimmer go to?
        </h1>
        <p className="text-sm text-mid leading-snug mb-6">
          Pick the school or club they compete for. We'll find them in the next step.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mid">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools…"
            className="w-full bg-white border border-surface-2 rounded-md pl-10 pr-4 py-3 text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 placeholder:text-mid"
          />
        </div>
      </div>

      {/* School list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="space-y-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className="w-full bg-white border border-surface-2 rounded-md p-3 flex items-center justify-between text-left active:bg-cyan-pale transition-colors"
            >
              <div>
                <p className="font-medium text-sm text-ink leading-tight">{s.name}</p>
                {s.location && <p className="text-xs text-mid mt-0.5">{s.location}</p>}
              </div>
              <div className="flex items-center gap-2 text-mid">
                {s.swimmers > 0 && (
                  <span className="text-xs tabular-nums">{s.swimmers}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-mid text-sm">
              <p>No school matches "{search}".</p>
              <p className="text-xs mt-2">Tap "Other / Add manually" to enter it yourself.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stage 2: pick a swimmer in that school ───────────────────────────────
function SwimmerStage({ school, search, onSearchChange, onBack, onSelect }) {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const swimmers = useMemo(() => {
    return swimmerDatabase.filter((s) => s.schoolId === school.id);
  }, [school.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return swimmers;
    return swimmers.filter((s) => s.name.toLowerCase().includes(q));
  }, [swimmers, search]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs text-cyan-deep font-semibold mb-3"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {school.name}
        </button>

        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          Find your <span className="italic text-cyan-deep">swimmer</span>.
        </h1>
        <p className="text-sm text-mid leading-snug mb-6">
          Search by name. If they're not listed, tap "Add manually" at the bottom.
        </p>

        <div className="relative mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mid">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search swimmers…"
            className="w-full bg-white border border-surface-2 rounded-md pl-10 pr-4 py-3 text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 placeholder:text-mid"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="space-y-1.5">
          {filtered.map((s) => {
            const initials = s.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('');
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                className="w-full bg-white border border-surface-2 rounded-md p-3 flex items-center gap-3 text-left active:bg-cyan-pale transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-pale text-cyan-deep flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink leading-tight">{s.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-mid mt-0.5">Age {s.age}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-mid">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}

          {filtered.length === 0 && search && (
            <div className="text-center py-8 text-mid text-sm">
              <p className="mb-2">No swimmer named "{search}" at {school.name}.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelect({ id: 'manual', name: search || 'New swimmer', age: null, schoolId: school.id })}
            className="w-full mt-3 border-2 border-dashed border-cyan-deep/40 text-cyan-deep rounded-md p-3 text-sm font-semibold active:bg-cyan-pale transition-colors"
          >
            + Add {search || 'new swimmer'} manually
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manual entry (for schools not yet using AquaTrack) ───────────────────
function ManualStage({ onBack, onSubmit }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const isValid = name.trim().length > 1 && age && schoolName.trim().length > 1;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs text-cyan-deep font-semibold mb-3"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Schools
        </button>

        <h1 className="font-serif font-medium text-3xl leading-tight text-ink tracking-tight mb-2">
          Tell us about <span className="italic text-cyan-deep">your swimmer</span>.
        </h1>
        <p className="text-sm text-mid leading-snug mb-8">
          We'll add them to your account. Once their school joins AquaTrack,
          we'll match them automatically.
        </p>

        <div className="space-y-5">
          <Field label="Swimmer's full name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Kimani"
              className="w-full bg-white border border-surface-2 rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            />
          </Field>

          <Field label="Age">
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white border border-surface-2 rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            >
              <option value="">Select age</option>
              {Array.from({ length: 13 }, (_, i) => i + 6).map((a) => (
                <option key={a} value={a}>
                  {a} years
                </option>
              ))}
            </select>
          </Field>

          <Field label="School or club">
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Riara Springs Academy"
              className="w-full bg-white border border-surface-2 rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            />
          </Field>
        </div>

        <p className="text-xs text-mid mt-6 leading-snug">
          The next time we run a gala at this school, your swimmer's profile
          will activate automatically.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3 bg-surface shrink-0">
        <button
          type="button"
          onClick={() =>
            onSubmit({
              name: name.trim(),
              age: parseInt(age, 10),
              schoolName: schoolName.trim(),
            })
          }
          disabled={!isValid}
          className={`w-full font-semibold text-sm uppercase tracking-wider py-4 rounded-md transition-all ${
            isValid
              ? 'bg-ink text-surface active:scale-[0.98]'
              : 'bg-surface-2 text-mid cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-mid mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}
