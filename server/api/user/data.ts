import { UserItem } from "#shared/types/user";

export default defineWrappedRequiredAdminHandler(async (event) => {
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
