/** Data both the phone (app/) and the watch (watch/) import: plain TS, no UI. */
export interface PackingList {
  id: string;
  name: string;
  items: string[];
}

export const LISTS: readonly PackingList[] = [
  { id: "hike", name: "Day hike", items: ["Water", "Snacks", "Rain jacket"] },
  { id: "gym", name: "Gym", items: ["Towel", "Shoes", "Lock"] },
];

export function findList(id: string): PackingList | undefined {
  return LISTS.find((list) => list.id === id);
}
