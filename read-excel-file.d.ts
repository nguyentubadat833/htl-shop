declare module 'read-excel-file' {
  import readXlsxFile from 'read-excel-file/node';
  export default readXlsxFile;
}

declare module 'read-excel-file/browser' {
  const readXlsxFile: any;
  export default readXlsxFile;
}