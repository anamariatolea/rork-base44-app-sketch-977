import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import listCommunitiesProcedure from "./routes/communities/list/route";
import createCommunityProcedure from "./routes/communities/create/route";
import joinCommunityProcedure from "./routes/communities/join/route";
import leaveCommunityProcedure from "./routes/communities/leave/route";
import listPostsProcedure from "./routes/communities/posts/list/route";
import createPostProcedure from "./routes/communities/posts/create/route";
import reactToPostProcedure from "./routes/communities/posts/react/route";
import upsertProfileProcedure from "./routes/users/profile/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  communities: createTRPCRouter({
    list: listCommunitiesProcedure,
    create: createCommunityProcedure,
    join: joinCommunityProcedure,
    leave: leaveCommunityProcedure,
    posts: createTRPCRouter({
      list: listPostsProcedure,
      create: createPostProcedure,
      react: reactToPostProcedure,
    }),
  }),
  users: createTRPCRouter({
    profile: upsertProfileProcedure,
  }),
});

export type AppRouter = typeof appRouter;
