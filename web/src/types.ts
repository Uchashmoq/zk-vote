export interface VoteMeta {
  title: string;
  description: string;
  imageUrl: string;
  imageCid: string;
  original: string;
}
export interface CandidateMeta {
  name: string;
  imageUrl: string;
  imageCid: string;
  description: string;
  orginal: string;
}

export interface Candidate {
  index: number;
  votes: number;
  meta: CandidateMeta;
}

export interface Vote {
  meta: VoteMeta;
  startTime: BigInt;
  endTime: BigInt;
  candidates: Candidate[];
  voters: string[];
}

export function stringToCandidateMeta(meta: string): CandidateMeta {
  const fallbackMeta: CandidateMeta = {
    name: "???",
    imageUrl: "???",
    imageCid: "???",
    description: "???",
    orginal: meta,
  };

  try {
    const parsed = JSON.parse(meta) as Partial<CandidateMeta>;
    return {
      name: typeof parsed?.name === "string" ? parsed.name : fallbackMeta.name,
      imageUrl:
        typeof parsed?.imageUrl === "string"
          ? parsed.imageUrl
          : fallbackMeta.imageUrl,
      imageCid:
        typeof parsed?.imageCid === "string"
          ? parsed.imageCid
          : fallbackMeta.imageCid,
      description: (() => {
        const description =
          typeof parsed?.description === "string" ? parsed.description : null;
        const notes =
          typeof (parsed as { notes?: unknown })?.notes === "string"
            ? (parsed as { notes?: string }).notes
            : null;
        if (description || notes) {
          return [description, notes].filter(Boolean).join("\n");
        }
        return fallbackMeta.description;
      })(),
      orginal: meta,
    };
  } catch {
    return fallbackMeta;
  }
}

export function stringToVoteMeta(meta: string): VoteMeta {
  const fallbackMeta: VoteMeta = {
    title: "???",
    description: "???",
    imageUrl: "???",
    imageCid: "???",
    original: meta,
  };
  const voteMeta: VoteMeta = (() => {
    try {
      const parsed = JSON.parse(meta) as Partial<VoteMeta>;
      return {
        title:
          typeof parsed?.title === "string" ? parsed.title : fallbackMeta.title,
        description:
          typeof parsed?.description === "string"
            ? parsed.description
            : fallbackMeta.description,
        imageUrl:
          typeof parsed?.imageUrl === "string"
            ? parsed.imageUrl
            : fallbackMeta.imageUrl,
        imageCid:
          typeof parsed?.imageCid === "string"
            ? parsed.imageCid
            : fallbackMeta.imageCid,
        original: meta,
      };
    } catch {
      return fallbackMeta;
    }
  })();
  return voteMeta;
}
