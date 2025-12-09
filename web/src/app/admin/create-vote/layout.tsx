import '@/app/globals.css'

import { type ReactNode } from 'react'


import WalletNav from '@/components/WalletNav'


export default function RootLayout(props: { children: ReactNode }) {
    return (

        <div className="font-sans antialiased">

            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                <WalletNav />
                {props.children}
            </div>

        </div>

    )
}
