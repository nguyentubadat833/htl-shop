import { AuthProvider } from "@prisma/client";

export class UserService {
  constructor() {}

  async registerUserProvider(provider: AuthProvider, providerUserId: string, email: string, name: string, picture?: string) {
    return await prisma.user.upsert({
      where: {
        provider_providerAccountId: {
          provider: provider,
          providerAccountId: providerUserId,
        },
      },
      create: {
        provider: provider,
        providerAccountId: providerUserId,
        email: email,
        name: name,
        image: picture,
      },
      update: {},
    });
  }
}
