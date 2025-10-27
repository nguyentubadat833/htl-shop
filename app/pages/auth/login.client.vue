<template>
  <div>
    <!-- <div id="g_id_onload" data-auto_prompt="false" 
    data-login_uri="/api/auth/google/verify-token"
    :data-client_id="googleId" >
    </div> -->
    <div id="g_id_onload" data-auto_prompt="false" data-callback="handleCredentialResponse" :data-client_id="googleId">
    </div>
    <div class="g_id_signin"></div>
  </div>
</template>

<script lang="ts" setup>
// import { GoogleVerifyTokenRequestSchema } from '#shared/schemas/auth'
import z from 'zod';

// type VerifyTokenReq = z.infer<typeof GoogleVerifyTokenRequestSchema>
useHead({
  script: [
    {
      src: 'https://accounts.google.com/gsi/client',
      async: true
    },
  ],
})

const { googleId } = usePublicVariables()

// function decodeJWT(token: any) {

//   let base64Url = token.split(".")[1];
//   let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   let jsonPayload = decodeURIComponent(
//     atob(base64)
//       .split("")
//       .map(function (c) {
//         return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//       })
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

function handleCredentialResponse(response: any) {

  console.log("Encoded JWT ID token: " + response.credential);

  // $fetch('/api/auth/google/verifyToken', {
  //   method: 'POST',
  //   body: <VerifyTokenReq>{
  //     token: response.credential
  //   },
  //   onResponse({response}){
  //     if(response.ok){
  //       console.log(response._data)
  //     }
  //   }
  // })

  // const responsePayload = decodeJWT(response.credential);

  // console.log("Decoded JWT ID token fields:");
  // console.log("  Full Name: " + responsePayload.name);
  // console.log("  Given Name: " + responsePayload.given_name);
  // console.log("  Family Name: " + responsePayload.family_name);
  // console.log("  Unique ID: " + responsePayload.sub);
  // console.log("  Profile image URL: " + responsePayload.picture);
  // console.log("  Email: " + responsePayload.email);
}

onMounted(() => {

  (window as any).handleCredentialResponse = handleCredentialResponse;
});
</script>

<style></style>