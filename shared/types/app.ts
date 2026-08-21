export type ErrorResponse = {
    error: boolean
    statusCode: number
    statusMessage: string
    message?: string
}

export interface BackupFileItem {
  name: string
  size: number
  lastModified: Date
}