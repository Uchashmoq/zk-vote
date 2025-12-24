'use client'

import { zkVoteAbi } from '@/abi'
import { getAllCommitments } from '@/actions'
import { calculateMerkleRootAndPath, calculateMerkleRootAndZKProof, Commitment } from '@/lib/zk-auth-client'
import { Candidate, Vote } from '@/types'
import { ethers } from 'ethers'
import Image from 'next/image'
import { useEffect, useState, useTransition, type ChangeEvent } from 'react'
import { getAddress } from 'viem'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

function deserializeCommitmentFromBase64(base64: string): Commitment {
  const binString = atob(base64)
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0))
  const json = new TextDecoder().decode(bytes)

  return JSON.parse(json) as Commitment
}


export default function CandidateCard({
  candidate,
  totalVotes,
  vote,
  address,
}: {
  candidate: Candidate
  totalVotes: number
  vote: Vote
  address: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [commitmentInput, setCommitmentInput] = useState('')
  const [dialogState, setDialogState] = useState<'idle' | 'loading' | 'success'>('idle')
  const percent =
    totalVotes === 0 ? 0 : Math.round((candidate.votes / Math.max(totalVotes, 1)) * 100)
  const barWidth = totalVotes === 0 ? '0%' : `${Math.max(6, (candidate.votes / totalVotes) * 100)}%`
  const { status } = useAccount()

  const nowSeconds = Math.floor(Date.now() / 1000)
  const startTime = Number(vote.startTime)
  const endTime = Number(vote.endTime)
  const voteDisabledTooltip =
    status !== 'connected'
      ? 'Connect your wallet first'
      : nowSeconds < startTime
        ? 'Voting has not started yet'
        : nowSeconds >= endTime
          ? 'Voting has ended'
          : undefined
  const voteDisabled = Boolean(voteDisabledTooltip)


  function onVote() {
    setDialogState('idle')
    setShowDialog(true)
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCommitmentInput(reader.result.trim())
      }
    }
    reader.readAsText(file)
  }

  const [, startTransition] = useTransition()
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isConfirming) {
      setDialogState('loading')
    } else if (isSuccess) {
      setDialogState('success')
    } else if (isError) {
      alert('Transaction failed or was cancelled')
      setDialogState('idle')
    }
  }, [isConfirming, isSuccess, isError])

  function handleDialogVote() {
    setDialogState('loading')
    startTransition(async () => {
      try {
        const commitment = deserializeCommitmentFromBase64(commitmentInput.trim())
        const commitments = await getAllCommitments(address)

        const rootAndPath = await calculateMerkleRootAndPath(
          commitments,
          commitment.commitment
        );

        const proofData = await calculateMerkleRootAndZKProof(
          rootAndPath,
          commitment
        );
        const nullifierHex = ethers.toBeHex(BigInt(proofData.nullifier), 32);
        const rootHex = ethers.toBeHex(BigInt(proofData.root), 32);

        const args = [
          BigInt(candidate.index),
          nullifierHex,
          rootHex,
          proofData.proof_a,
          proofData.proof_b,
          proofData.proof_c
        ]

        await writeContractAsync({
          abi: zkVoteAbi,
          address: getAddress(address),
          functionName: "vote",
          args: args
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to vote'
        alert(message)
        setDialogState('idle')
      }
    })
  }

  function handleDialogCancel() {
    setShowDialog(false)
    setCommitmentInput('')
    setDialogState('idle')
  }

  function handleSuccessConfirm() {
    handleDialogCancel()
  }
  //console.log("img: ", candidate.meta.imageUrl ? true : false)
  return (
    <article className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition duration-200 ${showDialog ? '' : 'hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/40'}`}>
      <div className="flex items-start gap-4">
        {candidate.meta.imageUrl && <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
          <Image
            src={candidate.meta.imageUrl}
            alt={candidate.meta.name}
            fill
            sizes="56px"
            className={"object-cover transition duration-200 group-hover:scale-[1.03]"}
          />
        </div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 break-words text-base font-semibold leading-tight text-slate-50">
                {candidate.meta.name}
              </h3>
              <p className={`mt-1 text-sm text-slate-300 ${expanded ? '' : 'line-clamp-2'}`}>
                {candidate.meta.description}
              </p>
              {candidate.meta.description.length > 80 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: barWidth }}
          />
        </div>

        <button
          className={`flex-shrink-0 w-20 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition duration-150 ${voteDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:translate-y-[1px]'
            }`}
          disabled={voteDisabled}
          title={voteDisabledTooltip}
          onClick={onVote}
        >
          Vote
        </button>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span className="tabular-nums text-slate-100 font-semibold">{candidate.votes} votes</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
            <h4 className="text-lg font-semibold text-slate-50">Submit Commitment</h4>
            <p className="mt-1 text-sm text-slate-300">
              Paste your commitment (base64). You can also select a file containing the base64
              string.
            </p>
            <textarea
              value={commitmentInput}
              onChange={(e) => setCommitmentInput(e.target.value)}
              placeholder="Paste commitment base64 here"
              className="mt-4 h-32 w-full resize-none rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                <input
                  type="file"
                  accept="text/plain"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={dialogState !== 'idle'}
                />
                <span className={`rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 ${dialogState !== 'idle' ? 'pointer-events-none opacity-60' : ''}`}>
                  Choose base64 file
                </span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleDialogCancel}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/30 hover:text-white"
                disabled={dialogState !== 'idle'}
              >
                Cancel
              </button>
              <button
                onClick={handleDialogVote}
                className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition duration-150 hover:brightness-110 active:translate-y-[1px]"
                disabled={dialogState !== 'idle'}
              >
                Vote
              </button>
            </div>
            {dialogState !== 'idle' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-900/85">
                {dialogState === 'loading' ? (
                  <span className="loading loading-spinner loading-xl text-slate-100"></span>
                ) : (
                  <>
                    <p className="text-center text-lg font-semibold text-slate-50">
                      You successfully voted for {candidate.meta.name}.
                    </p>
                    <button
                      onClick={handleSuccessConfirm}
                      className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition duration-150 hover:brightness-110 active:translate-y-[1px]"
                    >
                      Confirm
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
