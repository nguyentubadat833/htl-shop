export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  const clientApi = $fetch.create({
    onResponseError({ response }) {
      if (!response.ok) {
        toast.add({ title: response._data?.message ?? "Error", color: "error" });
      }
    },
  });

  const userApi = $fetch.create({
    credentials: "include",
    async onResponseError({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/auth/login"));
      } else {
        let message = "Error";
        if ("error" in response._data && response._data.error === true && "message" in response._data) {
          message = response._data.message;
        }
        toast.add({
          title: message,
          color: "error",
        });
      }
    },
  });

  return {
    provide: {
      userApi,
      clientApi,
    },
  };
});
