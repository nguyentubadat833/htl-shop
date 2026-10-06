import { $fetch as apiFetch } from "ofetch";

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  const clientApi = apiFetch.create({
    onResponseError({ response }) {
      if (!response.ok) {
        toast.add({ title: response._data?.message ?? "Error", color: "error" });
      }
    },
  });

  const userApi = apiFetch.create({
    credentials: "include",
    async onResponseError({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/"));
      } else {
        let message = "Error";
        if (response._data && typeof response._data === "object" && "error" in response._data && response._data.error === true && "message" in response._data) {
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
