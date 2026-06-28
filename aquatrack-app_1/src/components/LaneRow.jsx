// ═════════════════════════════════════════════════════════════════════════
//   <LaneRow />
//
//   A single result row in the live race or event leaderboard. Three
//   visual variants:
//   - default:  white background
//   - first:    cyan-pale → transparent gradient + gold left border (winner)
//   - mine:     dark navy background (the parent's child) — most prominent
// ═════════════════════════════════════════════════════════════════════════

export default function LaneRow({ lane, name, school, time, position, isPB, isMine, isFirst, onClick }) {
  const positionSuffix = ['', 'st', 'nd', 'rd'][position] || 'th';

  const wrapClass = isMine
    ? 'bg-ink text-surface border-l-2 border-cyan'
    : isFirst
    ? 'bg-gradient-to-r from-cyan-pale to-transparent border-l-2 border-sun'
    : 'bg-white';

  const laneClass = isMine
    ? 'text-cyan'
    : isFirst
    ? 'text-sun-deep'
    : 'text-mid';

  const timeClass = isMine ? 'text-cyan' : isFirst ? 'text-sun-deep' : 'text-ink';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`grid grid-cols-[20px_1fr_60px_36px] gap-2 items-center px-2.5 py-2 rounded-md text-sm w-full text-left ${
        onClick ? 'active:scale-[0.99] transition-transform' : ''
      } ${wrapClass}`}
    >
      <span className={`text-center font-bold text-xs ${laneClass}`}>{lane}</span>

      <div className="overflow-hidden">
        <div className={`font-medium text-sm leading-tight truncate ${isMine ? 'text-surface' : 'text-ink'}`}>
          {name}
          {isMine && <span className="ml-1.5 text-cyan">★</span>}
        </div>
        <div className={`text-[10px] uppercase tracking-wider ${isMine ? 'text-mid-soft' : 'text-mid'}`}>
          {isMine ? 'Your child' : school}
          {isPB && !isMine && <span className="ml-2 text-cyan-deep font-semibold">PB</span>}
          {isPB && isMine && <span className="ml-2 text-cyan font-semibold">PB</span>}
        </div>
      </div>

      <span className={`font-serif font-semibold text-base text-right ${timeClass} tabular-nums`}>
        {time}
      </span>

      <span
        className={`text-center text-xs font-semibold ${isMine ? 'text-mid-soft' : 'text-mid'}`}
      >
        {position}
        <sup className="text-[8px]">{positionSuffix}</sup>
      </span>
    </Tag>
  );
}
