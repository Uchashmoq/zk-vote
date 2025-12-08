
import { getVoters } from "@/actions"
import VoterDashboard from "@/components/VoterDashboard"



export default async function AdminPage() {
    const voters = await getVoters();
    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10">
            <VoterDashboard initialVoters={voters} />
        </main>
    )
}
