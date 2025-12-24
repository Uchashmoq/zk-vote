"use client"

import Image from "next/image"
import { Search } from "lucide-react"
import { startTransition, useEffect, useState } from "react"
import { Voter } from "../../../../prisma/src/lib/prisma/client"
import { getVoters, uploadImageAction } from "@/actions"
import VoterPickerModal from "@/components/VoterPickerModal"
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { zkVoteFactoryAddress } from "@/address"
import { zkVoteFactoryAbi } from "@/abi"
import { toast } from "react-hot-toast"

type CandidateMeta = { name: string, imageUrl: string, imageCid: string, description: string }



export default function CreateVotePage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [start, setStart] = useState("")
    const [end, setEnd] = useState("")
    const [imageUrl, setImageUrl] = useState<string>()
    const [imageCid, setImageCid] = useState<string>()
    const [activeTab, setActiveTab] = useState<"voters" | "candidates">("voters")
    const [candidates, setCandidates] = useState<CandidateMeta[]>([])

    const [voterPicked, setVoterPicked] = useState<Record<number, boolean>>({})
    const addCandidate = (candidate: CandidateMeta) => {
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

    const [voters, setVoters] = useState<Voter[]>([])
    useEffect(() => {
        getVoters().then(setVoters)
    }, [])
    const [showVoterPicker, setShowVoterPicker] = useState(false)
    const [showAddCandidateModal, setShowCandidateModal] = useState(false)
    const publicClient = usePublicClient()
    const { writeContractAsync, data: hash, error } = useWriteContract()
    const { isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    const [buttonLoading, setButtonLoading] = useState(false)

    useEffect(() => {
        if (error) {
            const userFriendlyMessage = (error as { shortMessage?: string })?.shortMessage || "Something went wrong while creating the vote. Please try again."
            toast.error(userFriendlyMessage)
        }
    }, [error]);


    useEffect(() => {
        if (isSuccess) {
            toast.success("Transaction success")
        } else if (isError) {
            toast.error("Transaction failed")
        }
        setButtonLoading(false)
    }, [isSuccess, isError])

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            const fd = new FormData()
            fd.append('file', file)
            startTransition(async () => {
                const res = await uploadImageAction(fd)
                if (!('error' in res)) {
                    setImageUrl(res.url)
                    setImageCid(res.cid)
                } else {
                    setImageUrl("")
                    setImageCid("")
                }
            })

        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setButtonLoading(true)
        if (!title.trim()) {
            setButtonLoading(false)
            toast.error("Please enter a title.")
            return
        }
        if (!start) {
            setButtonLoading(false)
            toast.error("Please select a start time.")
            return
        }
        if (!end) {
            setButtonLoading(false)
            toast.error("Please select an end time.")
            return
        }
        const startSeconds = Math.floor(new Date(start).getTime() / 1000)
        const endSeconds = Math.floor(new Date(end).getTime() / 1000)
        if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
            setButtonLoading(false)
            toast.error("Invalid start or end time.")
            return
        }
        const startTime = BigInt(startSeconds)
        const endTime = BigInt(endSeconds)
        if (endTime <= startTime) {
            setButtonLoading(false)
            toast.error("End time must be after start time.")
            return
        }
        const client = publicClient
        if (!client) {
            setButtonLoading(false)
            toast.error("No public client available.")
            return
        }
        const block = await client.getBlock()
        if (endTime <= block.timestamp) {
            setButtonLoading(false)
            toast.error("End time must be after current block time.")
            return
        }
        const voteMeta = JSON.stringify({ title: title, description: description, imageUrl: imageUrl, imageCid: imageCid })

        const pickedVoterAddress = voters.reduce<string[]>((acc, voter) => {
            if (voterPicked[voter.id] && voter.address) {
                acc.push(voter.address)
            }
            return acc
        }, [])

        if (pickedVoterAddress.length < 1) {
            setButtonLoading(false)
            toast.error("Please add at least one voter.")
            return
        }

        const candidateMetas = candidates.map((c) => {
            return JSON.stringify(c)
        })

        if (candidateMetas.length < 1) {
            setButtonLoading(false)
            toast.error("Please add at least one candidate.")
            return
        }

        const args = [
            voteMeta,
            candidateMetas,
            pickedVoterAddress,
            startTime,
            endTime
        ]

        writeContractAsync({
            address: zkVoteFactoryAddress,
            abi: zkVoteFactoryAbi,
            functionName: 'createVote',
            args: args
        }).catch(() => setButtonLoading(false))

    }

    function getActiveListLen() {
        if (activeTab === "voters") {
            return Object.values(voterPicked).filter(v => v).length
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
                    <div className="relative flex aspect-square w-60 h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-4 text-sm text-slate-300 overflow-hidden">
                        {imageUrl ? (
                            <>
                                <Image src={imageUrl} alt="Cover preview" fill className="rounded-lg object-cover" sizes="240px" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageUrl("")
                                        setImageCid("")
                                    }}
                                    className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white shadow-lg transition hover:bg-black/80"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <p className="text-center">Upload cover image</p>
                        )}
                        <label className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 opacity-70 transition hover:opacity-100 hover:bg-white/30 hover:border-white/30">
                            Choose file
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                    <div className="flex-1  flex-col ">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Vote title"
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-lg font-semibold text-slate-50 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Vote description"
                            rows={3}
                            className="w-full h-33.5 mt-2  rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        />

                        <div className="flex flex-row items-center">
                            <span className="text-sm px-4 text-slate-200">From: </span>
                            <input
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                            />
                            <span className="text-sm px-4 text-slate-200">to: </span>
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
                        {activeTab === "voters" ? voters.map((v) => (
                            <div
                                key={v.id}
                                className={`rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 ${voterPicked[v.id] ? "" : "hidden"} `}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{v.name}</p>
                                        {v.address && <p className="truncate text-xs text-slate-400">{v.address}</p>}
                                        {v.email && <p className="truncate text-xs text-slate-500">{v.email}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setVoterPicked((prev) => ({ ...prev, [v.id]: false })) }}
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
                                            {candidate.imageUrl ? (
                                                <img
                                                    src={candidate.imageUrl}
                                                    alt={candidate.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400">No image</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{candidate.name}</p>
                                            {candidate.description && (
                                                <p className="truncate text-xs text-slate-400">{candidate.description}</p>
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
                        voters={voters}
                        voterPicked={voterPicked}
                        setVoterPicked={setVoterPicked}
                        onClose={() => { setShowVoterPicker(false) }}
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
                disabled={buttonLoading}
            >
                {buttonLoading ? <span className="loading loading-dots loading-md"></span> : "Create vote"}
            </button>
        </main>
    )
}

function AddCandidateModal({
    addCandidate,
    onClose,
}: { addCandidate: (candidate: CandidateMeta) => void, onClose: () => void }) {
    const [name, setName] = useState("")
    const [description, setDeacription] = useState("")
    const [imageUrl, setImageUrl] = useState<string>("")
    const [imageCid, setImageCid] = useState<string>("")
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const fd = new FormData()
            fd.append('file', file)
            startTransition(async () => {
                const res = await uploadImageAction(fd)
                if (!('error' in res)) {
                    setImageUrl(res.url)
                    setImageCid(res.cid)
                } else {
                    setImageUrl("")
                    setImageCid("")
                }
            })

        }
    }

    const onSave = () => {
        if (!name.trim()) return
        addCandidate({ name: name.trim(), imageUrl: imageUrl.trim(), imageCid: imageCid.trim(), description: description.trim() })
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
                                {!imageUrl && "Upload image (optional)"}
                            </div>
                            <div className="flex items-center gap-2">
                                {imageUrl && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageUrl("")
                                            setImageCid("")
                                        }}
                                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                                    >
                                        Remove
                                    </button>
                                )}
                                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/20">
                                    Choose file
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        {imageUrl && (
                            <div className="relative mt-3 h-40 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                                <Image
                                    src={imageUrl}
                                    alt={name || "candidate"}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                />
                            </div>
                        )}
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDeacription(e.target.value)}
                        placeholder="description"
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
