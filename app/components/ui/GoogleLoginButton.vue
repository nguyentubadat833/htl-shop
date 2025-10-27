<template>
    <div>
        <UUser v-if="userAuth" :name="userAuth?.name ?? userAuth?.email" :avatar="{
            src: userAuth?.picture ?? '',
            icon: 'i-lucide-image'
        }" />
        <UButton v-else label="Sign in" color="neutral" variant="ghost" icon="ic:baseline-log-in" size="md"
            @click="signInWithGoogle" />
    </div>
</template>

<script setup lang="ts">
import { VerifyCodeRequestSchema } from '#shared/schemas/auth'
import type z from 'zod'
import type { UserAuthClient } from '#shared/types/auth'
import session from '~/utils/session.ts'

type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>

const { authSession } = session()
const { googleId } = usePublicVariables()
const googleClient = ref<any>(null)
const userAuth = ref<UserAuthClient | null>(null)

onMounted(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
    
    userAuth.value = authSession().get()
})

function initGoogle() {
    googleClient.value = (window as any).google.accounts.oauth2.initCodeClient({
        client_id: googleId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: any) => {
            // console.log('Google OAuth Response:', response)

            await $fetch('/api/auth/google/verify-code', {
                method: 'POST',
                body: <VerifyCodeRequest>{
                    code: response.code,
                },
                onResponse({ response }) {
                    if (response.ok && response._data) {
                        userAuth.value = response._data
                        authSession().set(userAuth.value!)
                    }
                },
            })
        },
    })
}

function signInWithGoogle() {
    if (!googleClient.value) {
        console.warn('Google chưa sẵn sàng')
        return
    }
    googleClient.value.requestCode()
}
</script>
