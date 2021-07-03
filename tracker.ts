import { SimpleLocalDB } from "./local-db";

interface Tracker {
  duration: number;
  reminderText: string;
  timezone: string;
}

const tracker = new SimpleLocalDB<Tracker[]>(process.env.TRACKER_DB_DIRECTORY);

export const updateTracker = async (
  user: string,
  durations: number[],
  reminderText: string,
  timezone: string
): Promise<boolean> => {
  try {
    const existingTrackersForUser = await tracker.get(user);
    const newTrackers = durations.map((each) => ({
      duration: each,
      reminderText: reminderText,
      timezone,
    }));
    const updatedTrackers =
      existingTrackersForUser?.length > 0
        ? [...existingTrackersForUser, ...newTrackers]
        : newTrackers;
    await tracker.set(user, updatedTrackers);
    return Promise.resolve(true);
  } catch (e) {
    console.error(`Could not update user tracker due to error ${e}`);
    Promise.resolve(false);
  }
};
