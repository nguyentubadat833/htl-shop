import prisma from "~~/lib/prisma";
import { UserItem } from "#shared/types/user";

export default defineWrappedResponseHandler(async (event) => {
  UserAuthContext.hasAdminOrThrowInline(event);
  const users: UserItem[] = await prisma.user.findMany({
    select: {
      publicId: true,
      provider: true,
      email: true,
      name: true,
      status: true,
      image: true,
      createdAt: true,
    },
  });
  return users;
});
