export default function () {
  function createPresinedUploadTask(file: File, uri: string, onProgress?: (percent: number) => void) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uri, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          resolve("sucess");
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error"));
      };
      xhr.onabort = () => reject(new Error("Upload aborted"));

      xhr.send(file);
    });
  }
  return {
    createPresinedUploadTask,
  };
}
