'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import ProgressRing from '@/components/ProgressRing'
import CandidateCard from '@/components/CandidateCard'

const voteCover = '/poll-cover.svg'
const voteDescription =
  'Most people know that fruits and vegetables are good for us. Both fruits and vegetables are high in dietary fibre as well as vitamins and minerals, and other bioactive plant compounds, including many with antioxidant properties such as polyphenols or beta-carotene. Fruits and vegetables contain, for example, vitamin A, B5, folate, C, E & K and are a rich source of calcium, iron, magnesium, manganese and potassium.2 The amounts and types of nutrients vary between different types of fruits and vegetables. Fruits and vegetables are also high in water, ranging from 75-90% of their weight. This fact explains their low energy content. Fruits and vegetables usually contain traces of fats and protein, with a few exceptions such as avocados, which have a high fat content. There is no evidence that organic fruits and vegetables are more nutritious compared to conventional varieties.3-5 Eating a lot of fruits and vegetables is strongly associated with a lower risk of premature deaths and non-communicable diseases; particularly, cardiovascular diseases, such as coronary heart disease and stroke, and certain cancers i.e., of the mouth, pharynx, larynx, oesophagus and colorectum.6-8 A meta-analysis looking at 95 prospective studies found that each additional 200 grams of fruits and vegetables per day was associated with an 8% lower risk of coronary heart disease, 16% lower risk of stroke, 8% lower risk of cardiovascular disease, 3% lower risk of cancer and 10% lower risk of premature death.9 Eating fruits and vegetables was associated with these reduced risks up to intakes of 800 grams per day except cancer, where no further reductions in risk were observed above 600 grams per day.'

const mockCandidates = [
  {
    name: `Banana: The banana plant is the largest herbaceous flowering plant.[2] All the above-ground parts of a banana plant grow from a structure called a corm.[3] Plants are normally tall and fairly sturdy with a treelike appearance, but what appears to be a trunk is actually a pseudostem composed of multiple leaf-stalks (petioles). Bananas grow in a wide variety of soils, as long as it is at least 60 centimetres (2.0 ft) deep, has good drainage and is not compacted.[4] They are fast-growing plants, with a growth rate of up to 1.6 metres (5.2 ft) per day.[5]`,
    votes: 38,
    bio: `A banana is an elongated, edible fruit—botanically a berry[1]—produced by several kinds of large treelike herbaceous flowering plants in the genus Musa. In some countries, cooking bananas are called plantains, distinguishing them from dessert bananas. The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in starch covered with a peel, which may have a variety of colors when ripe. It grows upward in clusters near the top of the plant. Almost all modern edible seedless (parthenocarp) cultivated bananas come from two wild species – Musa acuminata and Musa balbisiana, or their hybrids. Musa species are native to tropical Indomalaya and Australia; they were probably domesticated in New Guinea. They are grown in 135 countries, primarily for their fruit, and to a lesser extent to make banana paper and textiles, while some are grown as ornamental plants. The world's largest producers of bananas in 2022 were India and China, which together accounted for approximately 26% of total production. Bananas are eaten raw or cooked in recipes varying from curries to banana chips, fritters, fruit preserves, or simply baked or steamed. Worldwide, there is no sharp distinction between dessert "bananas" and cooking "plantains": this distinction works well enough in the Americas and Europe, but it breaks down in Southeast Asia where many more kinds of bananas are grown and eaten. The term "banana" is applied also to other members of the Musa genus, such as the scarlet banana (Musa coccinea), the pink banana (Musa velutina), and the Fe'i bananas. Members of the genus Ensete, such as the snow banana (Ensete glaucum) and the economically important false banana (Ensete ventricosum) of Africa are sometimes included. Both genera are in the banana family, Musaceae. `,
    image: '/poll-cover.svg',
  },
  {
    name: 'Apple',
    votes: 24,
    bio: 'Crisp and refreshing, perfect for pies, snacks, and a boost of fiber.',
    image: '/poll-cover.svg',
  },
  {
    name: 'Grape',
    votes: 21,
    bio: 'Juicy little flavor bombs, great fresh or as juice and wine.',
    image: '/poll-cover.svg',
  },
  {
    name: 'Mango (very juicy and sweet with a long name)',
    votes: 12,
    bio: 'Rich, fragrant, and tropical. Long names deserve love too—this one wraps to test truncation.',
    image: '/poll-cover.svg',
  },
]

export default function PollPage() {
  const params = useParams<{ address: string }>()
  const address = params?.address ?? ''
  const sorted = [...mockCandidates].sort((a, b) => b.votes - a.votes)
  const totalVotes = sorted.reduce((sum, c) => sum + c.votes, 0)
  const leaderVotes = sorted[0]?.votes || 1
  const goal = 120
  const progressPercent = Math.min(100, Math.round((totalVotes / goal) * 100))
  const [showFullDesc, setShowFullDesc] = useState(false)

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="flex flex-col gap-3 justify-start items-start">
        <div className='flex w-full items-center justify-between gap-4 sm:gap-6'>
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <Image
              src={voteCover}
              alt="Poll cover"
              width={64}
              height={64}
              className="h-18 w-18 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 object-cover"
              priority
            />
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-xl font-semibold leading-tight text-slate-50 sm:text-2xl">
                What is your favorite fruit? The genus Musa was created by Carl Linnaeus in 1753.[18] The name may be derived from Antonius Musa, physician to the Emperor Augustus, or Linnaeus may have adapted the Arabic word for banana, mauz.[19] The ultimate origin of musa may be in the Trans–New Guinea languages, which have words similar to "#muku"; from there the name was borrowed into the Austronesian languages and across Asia, accompanying the cultivation of the banana as it was brought to new areas, via the Dravidian languages of India, into Arabic as a Wanderwort.[20] The word "banana" is thought to be of West African origin, possibly from the Wolof word banaana, and passed into English via Spanish or Portuguese.[21]
              </h1>
              <p className="truncate text-xs text-slate-300">Contract: {address}</p>
              <p className="text-xs text-slate-400">10/10~10/12</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-18 h-18">
            <ProgressRing percent={progressPercent} />
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p className={`${showFullDesc ? '' : 'line-clamp-3'}`}>{voteDescription}</p>
          <button
            onClick={() => setShowFullDesc((v) => !v)}
            className="text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline"
          >
            {showFullDesc ? 'Show less' : 'Read more'}
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Candidates</div>
        <div className="grid gap-4">
          {sorted.map((candidate) => (
            <CandidateCard
              key={candidate.name}
              candidate={candidate}
              totalVotes={totalVotes}
              onVote={(name) => console.log('Vote for', name)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
