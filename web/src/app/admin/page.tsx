"use client"

import Link from "next/link"
import { useMemo, useState } from 'react'

type Voter = {
    id: string
    name: string
    address: string
    email: string
    phone: string
    note?: string
}

export default function AdminPage() {
    const [voters, setVoters] = useState<Voter[]>([
        {
            id: 'ID-001',
            name: 'Alice',
            address: '0x3Da763C42E438eB17880fB6A83040d6cf13eF03b',
            email: 'alice@example.com',
            phone: '+1 555-0001',
            note: 'Early tester',
        },
        {
            id: 'ID-002',
            name: 'Bob',
            address: '0x3Da763C42E438eB17880fB6A83040d6cf13eF03b',
            email: 'bob@example.com',
            phone: '+1 555-0002',
            note: 'Flagged for spam',
        },
        {
            id: 'ID-003',
            name: 'Charlie',
            address: '0x4Ef89b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9a',
            email: 'charlie@example.com',
            phone: '+1 555-0003',
            note: 'VIP customer',
        },
        {
            id: 'ID-004',
            name: 'David',
            address: '0x5Fa90b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9b',
            email: 'david@example.com',
            phone: '+44 20 7946 0958',
            note: 'UK resident',
        },
        {
            id: 'ID-005',
            name: 'Eva',
            address: '0x6Gb01b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9c',
            email: 'eva@example.com',
            phone: '+1 555-0005',
            note: 'Inactive for 3 months',
        },
        {
            id: 'ID-006',
            name: 'Frank',
            address: '0x7Hc12b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9d',
            email: 'frank@example.com',
            phone: '+1 555-0006',
            note: 'Beta program',
        },
        {
            id: 'ID-007',
            name: 'Grace',
            address: '0x8Id23b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9e',
            email: 'grace@example.com',
            phone: '+1 555-0007',
            note: 'Support ticket pending',
        },
        {
            id: 'ID-008',
            name: 'Henry',
            address: '0x9Je34b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9f',
            email: 'henry@example.com',
            phone: '+1 555-0008',
            note: 'Referred by Alice',
        },
        {
            id: 'ID-009',
            name: 'Ivy',
            address: '0x1Kf45b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9g',
            email: 'ivy@example.com',
            phone: '+61 2 9876 5432',
            note: 'Australian customer',
        },
        {
            id: 'ID-010',
            name: 'Jack',
            address: '0x2Lg56b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9h',
            email: 'jack@example.com',
            phone: '+1 555-0010',
            note: 'Payment overdue',
        },
        {
            id: 'ID-011',
            name: 'Karen',
            address: '0x3Mh67b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9i',
            email: 'karen@example.com',
            phone: '+1 555-0011',
            note: 'Enterprise plan',
        },
        {
            id: 'ID-012',
            name: 'Leo',
            address: '0x4Ni78b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9j',
            email: 'leo@example.com',
            phone: '+1 555-0012',
            note: 'New signup',
        },
        {
            id: 'ID-013',
            name: 'Mona',
            address: '0x5Oj89b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9k',
            email: 'mona@example.com',
            phone: '+1 555-0013',
            note: 'Requested refund',
        },
        {
            id: 'ID-014',
            name: 'Nathan',
            address: '0x6Pk90b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9l',
            email: 'nathan@example.com',
            phone: '+1 555-0014',
            note: 'Technical support',
        },
        {
            id: 'ID-015',
            name: 'Olivia',
            address: '0x7Ql01b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9m',
            email: 'olivia@example.com',
            phone: '+1 555-0015',
            note: 'Whitelisted address',
        },
        {
            id: 'ID-016',
            name: 'Paul',
            address: '0x8Rm12b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9n',
            email: 'paul@example.com',
            phone: '+33 1 23 45 67 89',
            note: 'French user',
        },
        {
            id: 'ID-017',
            name: 'Quinn',
            address: '0x9Sn23b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9o',
            email: 'quinn@example.com',
            phone: '+1 555-0017',
            note: 'Ambassador program',
        },
        {
            id: 'ID-018',
            name: 'Rachel',
            address: '0x1To34b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9p',
            email: 'rachel@example.com',
            phone: '+1 555-0018',
            note: 'Suspended account',
        },
        {
            id: 'ID-019',
            name: 'Sam',
            address: '0x2Up45b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9q',
            email: 'sam@example.com',
            phone: '+1 555-0019',
            note: 'Trial expired',
        },
        {
            id: 'ID-020',
            name: 'Tina',
            address: '0x3Vq56b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9r',
            email: 'tina@example.com',
            phone: '+1 555-0020',
            note: 'Premium subscriber',
        },
        {
            id: 'ID-021',
            name: 'Ursula',
            address: '0x4Wr67b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9s',
            email: 'ursula@example.com',
            phone: '+49 30 1234567',
            note: 'German market',
        },
        {
            id: 'ID-022',
            name: 'Victor',
            address: '0x5Xs78b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9t',
            email: 'victor@example.com',
            phone: '+1 555-0022',
            note: 'API key limit reached',
        },
        {
            id: 'ID-023',
            name: 'Wendy',
            address: '0x6Yt89b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9u',
            email: 'wendy@example.com',
            phone: '+1 555-0023',
            note: 'Content creator',
        },
        {
            id: 'ID-024',
            name: 'Xander',
            address: '0x7Zu90b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9v',
            email: 'xander@example.com',
            phone: '+81 3 1234 5678',
            note: 'Japanese user',
        },
        {
            id: 'ID-025',
            name: 'Yvonne',
            address: '0x8Av01b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9w',
            email: 'yvonne@example.com',
            phone: '+1 555-0025',
            note: 'Affiliate partner',
        },
        {
            id: 'ID-026',
            name: 'Zack',
            address: '0x9Bw12b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9x',
            email: 'zack@example.com',
            phone: '+1 555-0026',
            note: 'Bug bounty hunter',
        },
        {
            id: 'ID-027',
            name: 'Aria',
            address: '0x1Cx23b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9y',
            email: 'aria@example.com',
            phone: '+1 555-0027',
            note: 'Moderator',
        },
        {
            id: 'ID-028',
            name: 'Blake',
            address: '0x2Dy34b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F9z',
            email: 'blake@example.com',
            phone: '+1 555-0028',
            note: 'Community manager',
        },
        {
            id: 'ID-029',
            name: 'Cora',
            address: '0x3Ez45b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F90',
            email: 'cora@example.com',
            phone: '+1 555-0029',
            note: 'Documentation contributor',
        },
        {
            id: 'ID-030',
            name: 'Dante',
            address: '0x4Fa56b7c1C5D3f8a6B2C9d1E0f3A4B5C6D7E8F91',
            email: 'dante@example.com',
            phone: '+1 555-0030',
            note: 'Security auditor',
        }
    ])
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
                <AddVoterModal
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

function AddVoterModal({
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
