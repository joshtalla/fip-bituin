const prisma = require("../prisma");

const searchPostsService = async ({ query, page, limit }) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    content: {
      contains: query,
      mode: "insensitive",
    },
  };

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        content: true,
        anonymous_name: true,
        created_at: true,
      },
    }),

    prisma.posts.count({
      where: whereClause,
    }),
  ]);

  return {
    results: posts,
    total,
    page,
    limit,
    query,
  };
};

module.exports = {
  searchPostsService,
};