import { useActionState, useState } from "react"
import { Voter } from "../../prisma/src/lib/prisma/client"
import { createVoterAction } from "@/actions"
import { isAddress } from "viem";


export default function AddNewVoterModal({
    onClose,
    addVoter,
}: {
    onClose: () => void,
    addVoter: (v: Voter) => void
}) {
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [note, setNote] = useState("")

    function clearInputs() {
        setName("")
        setAddress("")
        setEmail("")
        setPhone("")
        setNote("")
    }




    const [state, formAction, isPending] = useActionState(
        async (_prevState: { error?: string }, formData: FormData) => {
            try {
                const res = await createVoterAction(formData)
                if (!('error' in res)) {
                    addVoter(res)
                    clearInputs()
                    onClose()
                    return { error: undefined }
                }
                return res
            } catch (error: any) {
                return { error: error?.message || "unexpected error" }
            }
        },
        { error: undefined },
    )


    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <form
                action={formAction}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-50">Add Voter</h3>
                </div>
                {state?.error && (
                    <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                        🚨 {state.error}
                    </div>
                )}
                <div className="mt-4 grid gap-3">
                    <input
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        required
                    />
                    <input
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                        required
                    />
                    <input
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <input
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />

                    <textarea
                        name="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Note"
                        rows={3}
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            onClose()
                            clearInputs()
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}

                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    )
}

function createVoter(
    name: string,
    address: string,
    email?: string,
    phone?: string,
    note?: string,
): Voter | null {
    const trimmedName = name.trim()
    const trimmedAddress = address.trim()
    const isValidEthAddress = isAddress(trimmedAddress)

    if (!trimmedName || !trimmedAddress || !isValidEthAddress) return null

    return {
        id: 0,
        name: trimmedName,
        address: trimmedAddress,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        note: note?.trim() || null,
        additional: null,
    }
}
