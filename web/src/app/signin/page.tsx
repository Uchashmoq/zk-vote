
"use client";

import { useActionState } from 'react';

import { loginAction } from '@/actions';


export default function SignInPage() {

    const [state, formAction, isPending] = useActionState(
        async (_prevState: { error: string } | undefined, formData: FormData) => {
            try {
                const res = await loginAction(formData);
                return res;
            } catch (err: any) {
                return { error: err?.message || "unexpected error" };
            }
        },
        { error: undefined }
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">

            <form action={formAction} className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-semibold">Admin Login</h1>
                {state && state.error && (
                    <div className="text-red-500 bg-red-100 p-2 rounded border border-red-500">
                        🚨 {state.error}
                    </div>
                )}

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="rounded p-2 text-white bg-gray-700"
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    Sign In
                </button>
            </form>
        </div>
    )
}