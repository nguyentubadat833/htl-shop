function toWebStream(nodeStream: import("stream").Readable): ReadableStream {
  const reader = nodeStream[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.next();
      if (done) return controller.close();
      controller.enqueue(value);
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export { toWebStream };
