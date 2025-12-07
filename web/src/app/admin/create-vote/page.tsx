"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { mockVoters, Voter } from "@/mocks/mock"
type VoterRecord = { voter: Voter, selected: boolean, display: boolean }
type Candidate = { name: string, img: string, notes: string }



export default function CreateVotePage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [start, setStart] = useState("")
    const [end, setEnd] = useState("")
    const [image, setImage] = useState<File | null>(null)

    const [activeTab, setActiveTab] = useState<"voters" | "candidates">("voters")

    const [candidates, setCandidates] = useState<Candidate[]>([])
    const addCandidate = (candidate: Candidate) => {
        setCandidates((prev) => {
            const next = prev.slice()
            next.push(candidate)
            return next
        })
    }
    const removeCandidate = (i: number) => {
        setCandidates((prev) => {
            if (i < 0 || i >= prev.length) return prev
            const next = prev.slice()
            next.splice(i, 1)
            return next
        })
    }

    const voterRecordsStates = mockVoters.map((v) => {
        const vr = { voter: v, selected: false, display: true }
        return useState<VoterRecord>(vr)
    })

    const [showVoterPicker, setShowVoterPicker] = useState(false)
    const [showAddCandidateModal, setShowCandidateModal] = useState(false)

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) setImage(file)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        alert(
            `Created vote`,
        )
    }

    function getActiveListLen() {
        if (activeTab === "voters") {
            let len = 0
            for (let i = 0; i < voterRecordsStates.length; i++) {
                const state = voterRecordsStates[i][0]
                if (state.selected) len++;
            }
            return len
        } else {
            return candidates.length
        }
    }





    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-slate-100">
            <header className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Admin · Create Vote</p>
                <h1 className="text-3xl font-bold">New Vote</h1>

            </header>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
                <div className="gap-4 flex flex-row h-60">
                    <div className="flex aspect-square w-60 h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-4 text-sm text-slate-300">
                        {image ? (
                            <p className="text-center text-xs text-emerald-300">Image selected: {image.name}</p>
                        ) : (
                            <p className="text-center">Upload cover image</p>
                        )}
                        <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/20">
                            Choose file
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                    <div className="flex-1  flex-col ">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Vote name"
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-lg font-semibold text-slate-50 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Vote description"
                            rows={3}
                            className="w-full h-33.5 mt-2  rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        />

                        <div className="flex flex-row">
                            <input
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                            />
                            <input
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                            />
                        </div>
                    </div>

                </div>

                <div className="rounded-2xl min-h-90  border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
                    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("voters")}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${activeTab === "voters"
                                    ? "bg-white/20 text-slate-50"
                                    : "text-slate-300 hover:bg-white/10"
                                    }`}
                            >
                                Voters
                            </button>
                            <span className="text-slate-500">|</span>
                            <button
                                type="button"
                                onClick={() => setActiveTab("candidates")}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${activeTab === "candidates"
                                    ? "bg-white/20 text-slate-50"
                                    : "text-slate-300 hover:bg-white/10"
                                    }`}
                            >
                                Candidates
                            </button>
                        </div>
                        <div className="text-xs text-slate-400">
                            {activeTab === "voters" ? `${getActiveListLen()} voter(s)` : `${getActiveListLen()} candidate(s)`}
                        </div>
                        <div className="flex-1" />
                        {activeTab === "voters" ? (
                            <button
                                type="button"
                                onClick={() => setShowVoterPicker(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 text-lg font-bold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                                aria-label="Add voter from list"
                            >
                                +
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowCandidateModal(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 text-lg font-bold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                                aria-label="Add candidate"
                            >
                                +
                            </button>
                        )}
                    </div>
                    <div className="mt-4 space-y-3">
                        {getActiveListLen() === 0 && (
                            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                                No {activeTab}.
                            </div>
                        )}
                        {activeTab === "voters" ? voterRecordsStates.map((s, i) => (
                            <div
                                key={i}
                                className={`rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 ${s[0].selected ? "" : "hidden"}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{s[0].voter.name}</p>
                                        {s[0].voter.address && <p className="truncate text-xs text-slate-400">{s[0].voter.address}</p>}
                                        {s[0].voter.email && <p className="truncate text-xs text-slate-500">{s[0].voter.email}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { s[1]({ voter: s[0].voter, selected: false, display: s[0].display }) }}
                                        className="text-xs font-semibold text-red-200 hover:text-red-100"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="space-y-3">
                                {candidates.map((candidate, i) => (
                                    <div
                                        key={`${candidate.name}-${i}`}
                                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-800">
                                            {candidate.img ? (
                                                <img
                                                    src={candidate.img}
                                                    alt={candidate.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400">No image</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{candidate.name}</p>
                                            {candidate.notes && (
                                                <p className="truncate text-xs text-slate-400">{candidate.notes}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeCandidate(i)}
                                            className="text-xs font-semibold text-red-200 hover:text-red-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showVoterPicker && activeTab === "voters" && (
                    <VoterPickerModal
                        states={voterRecordsStates}
                        onAdd={() => { setShowVoterPicker(false) }}
                    />
                )}

                {showAddCandidateModal && activeTab === "candidates" && (
                    <AddCandidateModal
                        addCandidate={(c) => {
                            addCandidate(c)
                            setShowCandidateModal(false)
                        }}
                        onClose={() => setShowCandidateModal(false)}
                    />
                )}
            </form>

            <button
                type="submit"
                form=""
                onClick={handleSubmit}
                className="fixed bottom-8 right-8 z-40 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-indigo-500/40 transition hover:scale-105 hover:shadow-2xl"
            >
                Create vote
            </button>
        </main>
    )
}

function AddCandidateModal({
    addCandidate,
    onClose,
}: { addCandidate: (candidate: Candidate) => void, onClose: () => void }) {
    const [name, setName] = useState("")
    const [notes, setNotes] = useState("")
    const [img, setImg] = useState("")
    const [fileName, setFileName] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFileName(file.name)
        setImg(URL.createObjectURL(file))
    }

    const onSave = () => {
        if (!name.trim()) return
        addCandidate({ name: name.trim(), img, notes: notes.trim() })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <div className="w-[520px] max-w-[520px] rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-50">Add candidate</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-slate-300 hover:text-slate-100"
                    >
                        Close
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <div className="rounded-lg border border-dashed border-white/15 bg-slate-900/70 px-4 py-3">
                        <p className="text-xs text-slate-400">Candidate image</p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-300">
                                {fileName ? `Selected: ${fileName}` : "Upload image (optional)"}
                            </div>
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/20">
                                Choose file
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        {img && (
                            <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                                <img src={img} alt={name || "candidate"} className="h-40 w-full object-cover" />
                            </div>
                        )}
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes"
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!name.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}


function VoterPickerModal({
    states,
    onAdd,
}: {
    states: [VoterRecord, React.Dispatch<React.SetStateAction<VoterRecord>>][]
    onAdd: () => void
}) {
    const [searchInput, setSearchInput] = useState("")
    function search() {
        const query = searchInput.trim().toLowerCase()
        states.forEach((s) => {
            const voter = s[0].voter;
            const satisfied =
                query === "" ||
                Object.values(voter).some((value) =>
                    value?.toString().toLowerCase().includes(query),
                )
            s[1]({ voter: voter, selected: s[0].selected, display: satisfied })
        })
    }


    function getVisibleStatesLen() {
        let len = 0;
        for (let i = 0; i < states.length; i++) {
            if (states[i][0].display) len++;
        }
        return len
    }

    function onAddDisplayAll() {
        states.forEach((s) => {
            s[1]({ voter: s[0].voter, selected: s[0].selected, display: true })
        })
        onAdd()
    }


    return (
        <div className="fixed  inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <div className="w-[720px] max-w-[720px] rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-50">Select voters</h3>
                </div>
                <div className="mt-3 flex gap-2">
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search voters..."
                        className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <button
                        type="button"
                        onClick={search}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                </div>
                <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {getVisibleStatesLen() === 0 && (
                        <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                            No voters found.
                        </div>
                    )}
                    {states.map((s, i) => {
                        const record = s[0];
                        const setRecord = s[1];
                        const voter = record.voter;
                        return (
                            <label
                                key={i}
                                className={`flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 ${record.display ? "" : "hidden"}`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{voter.name}</p>
                                    {voter.address && <p className="truncate text-xs text-slate-400">{voter.address}</p>}
                                    {voter.email && <p className="truncate text-xs text-slate-500">{voter.email}</p>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={record.selected}
                                    onChange={() => {
                                        setRecord({ voter: voter, selected: !record.selected, display: record.display })
                                    }}
                                    className="h-4 w-4 accent-cyan-400"
                                />
                            </label>
                        )
                    })}
                </div>
                <div className="mt-4 flex justify-end gap-2">

                    <button
                        onClick={onAddDisplayAll}
                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                    >
                        Add selected
                    </button>
                </div>
            </div>
        </div>
    )
}
