'use client'
import Image from 'next/image'
import { use, useEffect, useMemo, useState, useTransition } from 'react'
import ProgressRing from '@/components/ProgressRing'
import CandidateCard from '@/components/CandidateCard'
import { getVoteFullInfo, isCommittedAction } from '@/actions'
import { Vote } from '@/types'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { notFound } from 'next/navigation'
import { Commitment, generateCommitment, serializeSecretAndNullifierToBase64 } from '@/lib/zk-auth-client'
import { ethers } from 'ethers'
import { zkVoteAbi } from '@/abi'
import { getAddress } from 'viem'
import toast, { Toaster } from 'react-hot-toast'
import { Download } from 'lucide-react'


function shortenAddress(addr?: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}..${addr.slice(-4)}`;
}


export default function VotePage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = use(params)
  const [vote, setVote] = useState<Vote>()
  useEffect(() => {
    getVoteFullInfo(address).then(setVote).catch(() => {
      notFound()
    })
  }, [address])

  const [showFullDesc, setShowFullDesc] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const { status, address: userAddress } = useAccount()
  const start = vote ? Number(vote.startTime) : undefined
  const end = vote ? Number(vote.endTime) : undefined

  useEffect(() => {
    if (start === undefined || end === undefined || end <= start) {
      setProgressPercent(0)
      return
    }

    const updateProgress = () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const percent = Math.min(
        100,
        Math.max(0, Math.round(((nowSeconds - start) / (end - start)) * 100))
      )
      setProgressPercent(percent)
    }

    updateProgress()
    const timer = setInterval(updateProgress, 1000)
    return () => clearInterval(timer)
  }, [start, end])

  const sorted = useMemo(() => {
    if (!vote) return []
    return [...vote.candidates].sort((a, b) => b.votes - a.votes)
  }, [vote])

  const totalVotes = useMemo(
    () => sorted.reduce((sum, c) => sum + c.votes, 0),
    [sorted]
  )

  const [isCommitted, setIscommitted] = useState<boolean>()
  useEffect(() => {
    if (address && userAddress) {
      isCommittedAction(address, userAddress).then(setIscommitted)
    }
  }, [address, userAddress])

  const { writeContractAsync, data: hash, error } = useWriteContract()
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash })
  const [commitmentb64, setCommitmentb64] = useState<string>("")
  const [, startTransition] = useTransition();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false)


  useEffect(() => {
    if (error) {
      const userFriendlyMessage = (error as { shortMessage?: string })?.shortMessage || "Something went wrong while committing. Please try again."
      toast.error(userFriendlyMessage)
    }
  }, [error]);


  useEffect(() => {
    if (isSuccess) {
      downloadSecretAndNullifier()
      toast.success("Transaction success")
    } else if (isError) {
      toast.error("Transaction failed")
    }
    setButtonLoading(false)
  }, [isSuccess, isError])

  function downloadSecretAndNullifier() {
    const blob = new Blob([commitmentb64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const shortenedAddress = shortenAddress(address);
    const shortenedUserAddress = shortenAddress(userAddress);
    link.download = `commitment-${shortenedAddress}-${shortenedUserAddress}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function onCommit() {
    setButtonLoading(true)
    startTransition(
      async () => {
        const commitment = await generateCommitment();
        const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
        setCommitmentb64(serializeSecretAndNullifierToBase64(commitment));
        writeContractAsync({
          address: getAddress(address),
          abi: zkVoteAbi,
          functionName: 'commit',
          args: [commitmentHex],
        }).catch(() => setButtonLoading(false))
      }
    );
  }


  const voteCover = vote?.meta.imageUrl || ''
  const voteTitle = vote?.meta.title || ''
  const voteDescription = vote?.meta.description || ''

  const isLongDescription = voteDescription.length > 120
  const dateRange =
    start && end
      ? `${new Date(start * 1000).toLocaleString()} ~ ${new Date(end * 1000).toLocaleString()}`
      : ''

  if (!vote) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <p className="text-slate-300">Loading...</p>
      </main>
    )
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const isBeforeStart = start !== undefined && nowSeconds < start
  const isAfterEnd = end !== undefined && nowSeconds >= end
  const hasVotingRight = userAddress
    ? vote.voters.some(
      (voter) => voter.toLowerCase() === userAddress.toLowerCase()
    )
    : false
  const commitTooltip =
    status !== 'connected' || !userAddress
      ? 'Connect your wallet first'
      : isBeforeStart
        ? 'Voting has not started yet'
        : isAfterEnd
          ? 'Voting has ended'
          : !hasVotingRight
            ? 'You do not have the right to vote'
            : isCommitted
              ? 'You have already committed'
              : undefined
  const isCommitDisabled = Boolean(commitTooltip)
  const modalActive = showImagePreview

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <Toaster />
      <div className={modalActive ? 'pointer-events-none select-none' : ''}>
        <header className="flex flex-col gap-3 justify-start items-start">
          <div className='flex w-full items-center justify-between gap-4 sm:gap-6'>
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              {voteCover && (
                <button
                  type="button"
                  onClick={() => setShowImagePreview(true)}
                  className="group relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                >
                  <Image
                    src={voteCover}
                    alt="Poll cover"
                    fill
                    sizes="72px"
                    className="h-18 w-18 object-cover transition duration-200 group-hover:scale-[1.03]"
                    priority
                  />
                </button>
              )}
              <div className="min-w-0 space-y-1">
                <h1 className="truncate text-xl font-semibold leading-tight text-slate-50 sm:text-2xl">
                  {voteTitle}
                </h1>
                <p className="truncate text-xs text-slate-300">Contract: {address}</p>
                <p className="text-xs text-slate-400">{dateRange}</p>
              </div>
            </div>
            <div className="flex-shrink-0 w-18 h-18">
              <ProgressRing percent={progressPercent} />
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <p className={`${showFullDesc ? '' : 'line-clamp-3'}`}>{voteDescription}</p>
            {isLongDescription && (
              <button
                onClick={() => setShowFullDesc((v) => !v)}
                className="text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </header>

        <section className="space-y-4">
          <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Candidates</div>
          <div className="grid gap-4">
            {sorted.map((candidate) => (
              <CandidateCard
                key={candidate.meta.orginal}
                candidate={candidate}
                totalVotes={totalVotes}
                vote={vote}
                address={address}
              />
            ))}
          </div>
        </section>

        {isSuccess && commitmentb64 && (
          <button
            type="button"
            onClick={downloadSecretAndNullifier}
            className="fixed bottom-1 right-9 flex items-center gap-2 rounded-full bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-100  backdrop-blur transition duration-200 hover:scale-105 hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
        {!isAfterEnd && (
          <button
            type="button"
            disabled={isCommitDisabled || buttonLoading || isSuccess}
            onClick={onCommit}
            title={commitTooltip}
            className="fixed inset-x-0 bottom-8 mx-auto w-50 max-w-md rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 px-6 py-3 text-center text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition duration-200 hover:scale-105 hover:shadow-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLoading ? (
              <span className="loading loading-dots loading-lg"></span>
            ) : (
              'Commit'
            )}
          </button>
        )}
      </div>
      {voteCover && (
        <dialog className="modal" open={showImagePreview} onClose={() => setShowImagePreview(false)}>
          <div className="modal-box max-w-5xl bg-slate-900/95">
            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
            >
              ✕
            </button>
            <Image
              src={voteCover}
              alt="Poll cover enlarged"
              width={1400}
              height={900}
              className="h-full w-full object-contain rounded-xl"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button aria-label="Close" onClick={() => setShowImagePreview(false)} />
          </form>
        </dialog>
      )}
    </main>
  )
}
