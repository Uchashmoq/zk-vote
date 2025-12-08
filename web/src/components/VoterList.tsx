'use client'

import React, { useMemo, useState } from 'react'
import { Voter } from '../../prisma/src/lib/prisma/client'
import { deleteVoterAction } from '@/actions'
import { useRouter } from 'next/navigation'
const VoterList = ({ voters, deleteVoter }: { voters: Voter[], deleteVoter: (i: number) => void }) => {
    const [filter, setFilter] = useState('')
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const router = useRouter()
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

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-50">Voters</h2>
                    <p className="text-sm text-slate-400">{filteredVoters.length} listed</p>
                </div>
                <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search by name, address, email..."
                    className="w-64 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                />
            </div>


            <div className="h-[65vh] space-y-3 overflow-y-auto pr-1">
                {filteredVoters.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                        No voters match this filter.
                    </div>
                )}
                {filteredVoters.map((voter) => {
                    const isOpen = expanded[voter.id]
                    return (
                        <div
                            key={voter.id}
                            className="rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-white/20 hover:bg-slate-900/80"
                        >
                            <button
                                type="button"
                                onClick={() => { setExpanded((prev) => ({ ...prev, [voter.id]: !prev[voter.id] })) }}
                                className="flex w-full items-center justify-between gap-3 text-left"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-50">{voter.name}</p>
                                    <p className="truncate text-xs text-slate-400">{voter.address}</p>
                                </div>
                                <span className="text-xs text-slate-400">{isOpen ? 'Hide' : 'Details'}</span>
                            </button>
                            {isOpen && (
                                <div className="mt-3 space-y-1 text-sm text-slate-200">
                                    <p>
                                        Email: <span className="text-slate-300">{voter.email || '-'}</span>
                                    </p>
                                    <p>
                                        Phone: <span className="text-slate-300">{voter.phone || '-'}</span>
                                    </p>

                                    {voter.note && <p className="text-slate-300">Note: {voter.note}</p>}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                //console.log("delete id:", voter.id)
                                                setDeletingId(voter.id)
                                                deleteVoter(voter.id)

                                                const res = await deleteVoterAction(voter.id)
                                                if (!res?.error) {
                                                    router.refresh()
                                                }
                                                setDeletingId(null)
                                            }}
                                            disabled={deletingId === voter.id}
                                            className="rounded-lg border border-white/10 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
                                        >
                                            {deletingId === voter.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default VoterList
