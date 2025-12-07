"use client"

import Link from "next/link"
import { useMemo, useState } from 'react'
import { mockVoters } from "@/mocks/mock"

type Voter = {
    id: string
    name: string
    address: string
    email: string
    phone: string
    note?: string
}

export default function AdminPage() {
    const [voters, setVoters] = useState<Voter[]>(mockVoters)
    const [filter, setFilter] = useState('')
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [showModal, setShowModal] = useState(false)
    const [newVoter, setNewVoter] = useState<Voter>({
        id: '',
        name: '',
        address: '',
        email: '',
        phone: '',
        note: '',
    })

    const filteredVoters = useMemo(
        () =>
            voters.filter((v) => {
                const q = filter.toLowerCase()
                return (
                    v.name.toLowerCase().includes(q) ||
                    v.address.toLowerCase().includes(q) ||
                    v.email.toLowerCase().includes(q) ||
                    v.id.toLowerCase().includes(q)
                )
            }),
        [filter, voters],
    )

    function addVoter() {
        if (!newVoter.name || !newVoter.address || !newVoter.id) return
        setVoters((prev) => [...prev, { ...newVoter }])
        setNewVoter({ id: '', name: '', address: '', email: '', phone: '', note: '' })
        setShowModal(false)
    }

    function removeVoter(id: string) {
        setVoters((prev) => prev.filter((v) => v.id !== id))
    }

    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Admin</p>
                    <h1 className="text-3xl font-bold text-slate-50">Voter Management</h1>
                    <p className="text-sm text-slate-400">
                        Manage voter profiles. Connect to your API/contracts to persist.
                    </p>
                </div>
                <Link
                    href="/admin/create-vote"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                >
                    + Create vote
                </Link>
            </header>

            <section className="space-y-6  rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-50">Voters</h2>
                        <p className="text-sm text-slate-400">{filteredVoters.length} listed</p>
                    </div>
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search by name, address, email"
                        className="w-64 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                </div>

                <VoterList
                    voters={filteredVoters}
                    expanded={expanded}
                    onToggle={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
                    onRemove={removeVoter}
                />
            </section>

            {showModal && (
                <AddNewVoterModal
                    voter={newVoter}
                    onChange={setNewVoter}
                    onClose={() => setShowModal(false)}
                    onSave={addVoter}
                />
            )}

            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-2xl font-bold text-slate-900 shadow-xl shadow-indigo-500/40 transition hover:scale-105 hover:shadow-2xl"
                aria-label="Add voter"
            >
                +
            </button>
        </main>
    )
}

function VoterList({
    voters,
    expanded,
    onToggle,
    onRemove,
}: {
    voters: Voter[]
    expanded: Record<string, boolean>
    onToggle: (id: string) => void
    onRemove: (id: string) => void
}) {
    return (
        <div className="h-[65vh] space-y-3 overflow-y-auto pr-1">
            {voters.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                    No voters match this filter.
                </div>
            )}
            {voters.map((voter) => {
                const isOpen = expanded[voter.id]
                return (
                    <div
                        key={voter.id}
                        className="rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-white/20 hover:bg-slate-900/80"
                    >
                        <button
                            type="button"
                            onClick={() => onToggle(voter.id)}
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
                                <p>
                                    ID: <span className="text-slate-300">{voter.id}</span>
                                </p>
                                {voter.note && <p className="text-slate-300">Note: {voter.note}</p>}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(voter.id)}
                                        className="rounded-lg border border-white/10 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function AddNewVoterModal({
    voter,
    onChange,
    onClose,
    onSave,
}: {
    voter: Voter
    onChange: (v: Voter) => void
    onClose: () => void
    onSave: () => void
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-50">Add Voter</h3>
                    <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-200">
                        Close
                    </button>
                </div>
                <div className="mt-4 grid gap-3">
                    <input
                        value={voter.name}
                        onChange={(e) => onChange({ ...voter, name: e.target.value })}
                        placeholder="Name"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <input
                        value={voter.address}
                        onChange={(e) => onChange({ ...voter, address: e.target.value })}
                        placeholder="Address"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <input
                        value={voter.email}
                        onChange={(e) => onChange({ ...voter, email: e.target.value })}
                        placeholder="Email"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <input
                        value={voter.phone}
                        onChange={(e) => onChange({ ...voter, phone: e.target.value })}
                        placeholder="Phone number"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <input
                        value={voter.id}
                        onChange={(e) => onChange({ ...voter, id: e.target.value })}
                        placeholder="ID"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <textarea
                        value={voter.note}
                        onChange={(e) => onChange({ ...voter, note: e.target.value })}
                        placeholder="Note"
                        rows={3}
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
