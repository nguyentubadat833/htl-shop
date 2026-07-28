export function logInfoColor(message: string) {
  console.log(`\x1b[42m\x1b[30m INFO \x1b[0m  ${message}`);
}

export function logErrorColor(message: string) {
  console.log(`\x1b[41m\x1b[37m ERROR \x1b[0m ${message}`);
}