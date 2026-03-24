import { getChoicesOfAddress } from "@/actions";
import { Comment } from "@/types";
import { useEffect, useState } from "react";

export function CommentCard({ voteAddress, comment }: { voteAddress: string, comment: Comment }) {
    const [choicesOfSender, setChoicesOfSender] = useState<string[]>([]);
    const choiceColorClasses = [
        "bg-cyan-500/20 text-cyan-200",
        "bg-emerald-500/20 text-emerald-200",
        "bg-amber-500/20 text-amber-200",
        "bg-fuchsia-500/20 text-fuchsia-200",
        "bg-sky-500/20 text-sky-200",
    ];
    const shortSender = `${comment.sender.slice(0, 6)}...${comment.sender.slice(-4)}`;
    const sepoliaScanUrl = `https://sepolia.etherscan.io/address/${comment.sender}`;

    useEffect(() => {
        let cancelled = false;

        getChoicesOfAddress(voteAddress, comment.sender)
            .then((choices) => {
                if (cancelled) return;
                setChoicesOfSender(choices.map((choice) => choice.meta.name).filter(Boolean));
            })
            .catch(() => {
                if (cancelled) return;
                setChoicesOfSender([]);
            });

        return () => {
            cancelled = true;
        };
    }, [voteAddress, comment.sender]);

    return (
        <article className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                    <a
                        href={sepoliaScanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on blockcain browser"
                        className="underline-offset-2 hover:underline"
                    >
                        <span className="sm:hidden">{shortSender}</span>
                        <span className="hidden sm:inline">{comment.sender}</span>
                    </a>
                </p>
                {choicesOfSender.length > 0 && (
                    <div className="flex max-w-[70%] flex-wrap items-center justify-end gap-1.5">
                        <span className="text-[11px] font-medium text-cyan-300/80">voted for</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium sm:hidden ${choiceColorClasses[0]}`}
                        >
                            {choicesOfSender[0]}
                        </span>
                        {choicesOfSender.length > 1 && (
                            <span className="text-[11px] font-medium text-cyan-300/80 sm:hidden">...</span>
                        )}
                        {choicesOfSender.map((choice, index) => (
                            <span
                                key={`${comment.sender}-${choice}-${index}`}
                                className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${choiceColorClasses[index % choiceColorClasses.length]}`}
                            >
                                {choice}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{comment.content}</p>
        </article>
    )
}
