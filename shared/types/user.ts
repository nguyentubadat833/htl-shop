export interface UserItem {
  publicId: string
  provider: string
  email: string
  name: string
  status: string
  image:string | null,
  createdAt: Date
}