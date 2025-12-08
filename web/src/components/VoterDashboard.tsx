'use client'
import Link from 'next/link'
import React, { startTransition, useOptimistic, useState } from 'react'
import VoterList from './VoterList'
import AddNewVoterModal from './AddNewVoterModal'
import { Voter } from '../../prisma/src/lib/prisma/client'

const VoterDashboard = ({ initialVoters }: { initialVoters: Voter[] }) => {
    const [showModal, setShowModal] = useState(false)
    const [voters, setVoters] = useState<Voter[]>(initialVoters)

    function addVoter(voter: Voter) {
        setVoters((prev) => [...prev, voter])
    }

    function deleteVoter(id: number) {
        setVoters((prev) => prev.filter((voter) => voter.id !== id))
    }


    return (
        <>
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Admin</p>
                    <h1 className="text-3xl font-bold text-slate-50">Voter Management</h1>

                </div>
                <div className="flex flex-row justify-end gap-3">
                    <Link
                        href="/admin/create-vote"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        + Create vote
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        + Add voter
                    </button>
                </div>

            </header>

            <div className="space-y-6  rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
                <VoterList voters={voters} deleteVoter={deleteVoter} />
            </div>

            {showModal && (
                <AddNewVoterModal
                    onClose={() => { setShowModal(false) }}
                    addVoter={addVoter}
                />
            )}

        </>
    )
}

export default VoterDashboard
