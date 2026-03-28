import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { recordMoodProcedure } from "./routes/moods/record/route";
import { getMoodHistoryProcedure } from "./routes/moods/history/route";
import { getLatestMoodProcedure } from "./routes/moods/latest/route";
import generateCodeProcedure from "./routes/partners/generate-code/route";
import acceptCodeProcedure from "./routes/partners/accept-code/route";
import getPartnershipProcedure from "./routes/partners/get-partnership/route";
import unlinkPartnerProcedure from "./routes/partners/unlink/route";
import getPartnerMoodsProcedure from "./routes/partners/get-partner-moods/route";
import { createEventProcedure } from "./routes/calendar/create-event/route";
import { getEventsProcedure } from "./routes/calendar/get-events/route";
import { updateEventProcedure } from "./routes/calendar/update-event/route";
import { deleteEventProcedure } from "./routes/calendar/delete-event/route";
import { getPartnerEventsProcedure } from "./routes/calendar/get-partner-events/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
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
  calendar: createTRPCRouter({
    createEvent: createEventProcedure,
    getEvents: getEventsProcedure,
    updateEvent: updateEventProcedure,
    deleteEvent: deleteEventProcedure,
    getPartnerEvents: getPartnerEventsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
