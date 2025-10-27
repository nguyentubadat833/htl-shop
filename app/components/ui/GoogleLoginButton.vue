<template>
    <UButton label="Sign in" color="neutral" variant="ghost" icon="ic:baseline-log-in" size="md"
        @click="signInWithGoogle" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
const { googleId } = usePublicVariables()
let client: any = null

onMounted(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
})

function initGoogle() {
    client = (window as any).google.accounts.oauth2.initCodeClient({
        client_id: googleId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: any) => {
            console.log('Google OAuth Response:', response)

            await $fetch('/api/auth/google/verifyToken', {
                method: 'POST',
                body: {
                    token: response.code,
                },
            })
        },
    })
}

function signInWithGoogle() {
    if (!client) {
        console.warn('Google chưa sẵn sàng')
        return
    }
    client.requestCode() // mở popup
}
</script>
