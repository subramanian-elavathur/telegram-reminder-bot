import { SimpleLocalDB } from "./local-db";

interface Tracker {
  id: number;
  duration: number;
  reminderText: string;
  timezone: string;
}

const tracker = new SimpleLocalDB<Tracker[]>(process.env.TRACKER_DB_DIRECTORY);
const id = new SimpleLocalDB<number>(`${process.env.TRACKER_DB_DIRECTORY}/id`);

const getNextId = async (user: string): Promise<number> => {
  const existingId = await id.get(user);
  let nextId = 1;
  if (existingId > 0) {
    nextId = existingId + 1;
  }
  await id.set(user, nextId);
  return Promise.resolve(nextId);
};

export const getTrackers = async (user: string): Promise<Tracker[]> => {
  return await tracker.get(user);
};

export const updateTracker = async (
  user: string,
  durations: number[],
  reminderText: string,
  timezone: string
): Promise<boolean> => {
  try {
    const existingTrackersForUser = await tracker.get(user);
    const updatedTrackers =
      existingTrackersForUser?.length > 0 ? [...existingTrackersForUser] : [];
    for (const duration of durations) {
      const nextId = await getNextId(user);
      updatedTrackers.push({
        id: nextId,
        reminderText: reminderText,
        duration,
        timezone,
      });
    }
    await tracker.set(user, updatedTrackers);
    return Promise.resolve(true);
  } catch (e) {
    console.error(`Could not update user tracker due to error ${e}`);
    Promise.resolve(false);
  }
};

export const deactivateTracker = async (
  user: string,
  duration: number
): Promise<boolean> => {
  try {
    const existingTrackersForUser = await tracker.get(user);
    if (existingTrackersForUser?.length) {
      const updatedTrackersForUser = existingTrackersForUser.filter(
        (each) => each.duration !== duration
      );
      await tracker.set(user, updatedTrackersForUser);
      return Promise.resolve(true);
    }
  } catch (e) {
    console.error(`Could not update user tracker due to error ${e}`);
    Promise.resolve(false);
  }
};
