export default function ProgressRing({ percent }: { percent: number }) {

    const clamped = Math.min(100, Math.max(0, percent))
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - clamped / 100)
    return (
        <div className="relative h-16 w-16">
            <svg viewBox="0 0 64 64" className="relative z-1 h-16 w-16">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                    fill="none"
                />
                {/* 主进度环 */}
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="url(#ringGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                />
                {/* 闪烁高光环 */}
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="url(#ringGradientBright)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    className="animate-pulse opacity-50"
                />
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="ringGradientBright" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="pointer-events-none absolute inset-1 grid place-items-center rounded-full bg-slate-950 text-[11px] font-semibold text-slate-50">
                <span className={`${clamped < 100 ? "animate-pulse" : ""}`}>
                    {clamped}%
                </span>
            </div>
        </div>
    )
}
