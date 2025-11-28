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
import { recordMoodProcedure } from "./routes/moods/record/route";
import { getMoodHistoryProcedure } from "./routes/moods/history/route";
import { getLatestMoodProcedure } from "./routes/moods/latest/route";
import generateCodeProcedure from "./routes/partners/generate-code/route";
import acceptCodeProcedure from "./routes/partners/accept-code/route";
import getPartnershipProcedure from "./routes/partners/get-partnership/route";
import unlinkPartnerProcedure from "./routes/partners/unlink/route";
import getPartnerMoodsProcedure from "./routes/partners/get-partner-moods/route";

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
  moods: createTRPCRouter({
    record: recordMoodProcedure,
    history: getMoodHistoryProcedure,
    latest: getLatestMoodProcedure,
  }),
  partners: createTRPCRouter({
    generateCode: generateCodeProcedure,
    acceptCode: acceptCodeProcedure,
    getPartnership: getPartnershipProcedure,
    unlink: unlinkPartnerProcedure,
    getPartnerMoods: getPartnerMoodsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
