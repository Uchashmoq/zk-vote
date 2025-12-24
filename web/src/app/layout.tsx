import '@/app/globals.css'
import type { Metadata } from 'next'
import { type ReactNode } from 'react'
import { Providers } from '@/app/providers'
export const metadata: Metadata = {
    title: 'ZK VOTE',
    description: 'ZK VOTE is a privacy-preserving voting platform based on zero-knowledge proof technology.',
}
export default function RootLayout(props: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="font-sans antialiased">
                <Providers>
                    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                        {props.children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}