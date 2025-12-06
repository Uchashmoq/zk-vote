'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export type FormState = { error?: string }

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn('credentials', {
      password: formData.get('password'),
      redirectTo: '/',
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Incorrect password.' }
    }
    return { error: 'Login failed.' }
  }
}
