'use client'
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { Voter } from "../../prisma/src/lib/prisma/client"

export default function VoterPickerModal({
    voters,
    voterPicked,
    setVoterPicked,
    onClose
}: {
    voters: Voter[],
    voterPicked: Record<number, boolean>,
    setVoterPicked: Dispatch<SetStateAction<Record<number, boolean>>>,
    onClose: () => void
}) {

    const [filter, setFilter] = useState('')
    const filteredVoters = useMemo(
        () =>
            voters.filter((v) => {
                const q = filter.toLowerCase()
                return (
                    v.name.toLowerCase().includes(q) ||
                    v.address.toLowerCase().includes(q) ||
                    v.phone?.toLowerCase().includes(q) ||
                    v.email?.toLowerCase().includes(q) ||
                    v.note?.toLowerCase().includes(q)
                )
            }),
        [filter, voters],
    )
    function notFoundShow(): boolean {
        return Object.values(filteredVoters).filter(v => v).length == 0 && filter.length != 0
    }

    return (
        <div className="fixed  inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <div className="w-[720px] max-w-[720px] rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-50">Select voters</h3>
                </div>
                <div className="mt-3 flex gap-2">
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search voters..."
                        className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />

                </div>
                <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {notFoundShow() && (
                        <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                            No voters found.
                        </div>
                    )}
                    {filteredVoters.map((v) => {
                        return (
                            <label
                                key={v.id}
                                className={`flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 `}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{v.name}</p>
                                    {v.address && <p className="truncate text-xs text-slate-400">{v.address}</p>}
                                    {v.email && <p className="truncate text-xs text-slate-500">{v.email}</p>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={voterPicked[v.id] ?? false}
                                    onChange={() => {
                                        setVoterPicked((prev) => ({ ...prev, [v.id]: !prev[v.id] }))
                                    }}
                                    className="h-4 w-4 accent-cyan-400"
                                />
                            </label>
                        )
                    })}
                </div>
                <div className="mt-4 flex justify-end gap-2">

                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        Add selected
                    </button>
                </div>
            </div>
        </div>
    )
}
