'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isEmpty } from 'lodash'

import { supabase } from '@/lib/supabase/server'

import {
  LoginFormType,
  RegisterFormType,
  UpdateProfileInformationFormType,
  InboxesPreferencesType
} from '@/lib/definitions'

export const login = async (form: LoginFormType) => {
  const cookieStore = cookies()

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password
  })

  cookieStore.set('access-token', data?.session?.access_token ?? '', {
    sameSite: true,
    secure: true
  })
  cookieStore.set('refresh-token', data?.session?.refresh_token ?? '', {
    sameSite: true,
    secure: true
  })

  if (signInError) throw new Error(`An error occurred while signin: ${signInError.message}`)

  revalidatePath('/', 'layout')
  redirect('/')
}

export const register = async (form: RegisterFormType) => {
  if (form.password !== form.confirmPassword) throw new Error('Passwords do not match')

  const { data } = await supabase.from('users').select('*').eq('username', form.username)

  if (Array.isArray(data) && data.length > 0) throw new Error('Username already taken')

  const { error: signUpError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        name: form.name,
        username: form.username
      }
    }
  })

  if (signUpError) throw new Error(`An error occurred while signup: ${signUpError.message}`)

  revalidatePath('/auth/login', 'layout')
  redirect('/auth/login')
}

export const logout = async () => {
  const supaCookies = cookies().getAll()

  const { error } = await supabase.auth.signOut()

  if (error) throw error

  supaCookies.map((cookie) => cookies().delete(cookie.name))

  revalidatePath('/', 'layout')
  redirect('/')
}

export const getUser = async () => {
  let user = null
  const cookieStore = cookies()

  const accessToken = cookieStore.get('access-token')
  const refreshToken = cookieStore.get('refresh-token')

  const { error: getAuthUserError, data } = await supabase.auth.getUser()

  if (!data.user || getAuthUserError) {
    const {
      data: { user: sessionUser }
    } = await supabase.auth.setSession({
      access_token: accessToken?.value ?? '',
      refresh_token: refreshToken?.value ?? ''
    })

    user = sessionUser
  } else {
    user = data.user
  }

  const { data: getUserData, error: getUserError } = await supabase
    .from('users')
    .select()
    .eq('id', user?.id)
    .limit(1)

  if (getUserError || !getUserData)
    throw new Error(`An error occurred while fetching user: ${getUserError?.message}`)

  user = getUserData[0]

  if (isEmpty(user)) {
    const supaCookies = cookies().getAll()
    supaCookies.map((cookie) => cookies().delete(cookie.name))
  }

  return user
}

export const getUserRoles = async () => {
  const user = await getUser()

  const { data, error: getUserRolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user?.id)
    .limit(1)

  if (getUserRolesError || !data)
    throw new Error(`An error occurred while fetching user roles: ${getUserRolesError.message}`)

  return data
}

export const updateProfileInformation = async (form: UpdateProfileInformationFormType) => {
  const user = await getUser()

  const { error: updateAuthUserError } = await supabase.auth.updateUser({
    email: form.email,
    data: {
      name: form.name,
      username: form.username
    }
  })

  if (updateAuthUserError)
    throw new Error(`An error occurred while updating auth user: ${updateAuthUserError.message}`)

  const { data, error: updateUserError } = await supabase
    .from('users')
    .update({ name: form.name, username: form.username, email: form.email })
    .eq('id', user?.id)

  if (updateUserError)
    throw new Error(`An error occurred while updating user: ${updateUserError.message}`)

  return data
}

export const getUserInboxesPreferences = async () => {
  const user = await getUser()

  const { data, error } = await supabase
    .from('inboxes_preferences')
    .select('preference')
    .eq('user_id', user.id)
    .limit(1)

  if (error)
    throw new Error(`An error occurred while getting user inboxes preferences: ${error.message}`)

  return data
}

export const updateUserInboxesPreferences = async (preference: string) => {
  const user = await getUser()

  const { data, error } = await supabase
    .from('inboxes_preferences')
    .update({ preference })
    .eq('user_id', user?.id)

  if (error)
    throw new Error(`An error occurred while updating user inboxes preferences: ${error.message}`)

  return data
}
