"use client"

import { useMemo, useState } from "react"

type Person = { id: string; name: string; address?: string; email?: string }

export default function CreateVotePage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [start, setStart] = useState("")
    const [end, setEnd] = useState("")
    const [image, setImage] = useState<File | null>(null)

    const [activeTab, setActiveTab] = useState<"voters" | "candidates">("voters")
    const [voters, setVoters] = useState<Person[]>([])
    const [candidates, setCandidates] = useState<Person[]>([])
    const [newEntry, setNewEntry] = useState({ name: "", address: "", email: "" })

    const list = useMemo(
        () => (activeTab === "voters" ? voters : candidates),
        [activeTab, voters, candidates],
    )

    function addEntry() {
        if (!newEntry.name.trim()) return
        const item: Person = {
            id: crypto.randomUUID(),
            name: newEntry.name.trim(),
            address: newEntry.address.trim() || undefined,
            email: newEntry.email.trim() || undefined,
        }
        if (activeTab === "voters") setVoters((prev) => [...prev, item])
        else setCandidates((prev) => [...prev, item])
        setNewEntry({ name: "", address: "", email: "" })
    }

    function removeEntry(id: string) {
        if (activeTab === "voters") setVoters((prev) => prev.filter((p) => p.id !== id))
        else setCandidates((prev) => prev.filter((p) => p.id !== id))
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) setImage(file)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        alert(
            `Created vote "${title || "Untitled"}" with ${voters.length} voters and ${candidates.length} candidates`,
        )
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
                            {activeTab === "voters" ? `${voters.length} voter(s)` : `${candidates.length} candidate(s)`}
                        </div>
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={addEntry}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 text-lg font-bold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
                            aria-label="Add entry"
                        >
                            +
                        </button>
                    </div>
                </div>
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
