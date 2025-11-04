import type { GETUser } from "../api/fetchUserData";

let userData: GETUser | null = $state(null);

export const userStore = {
 get data(): GETUser | null {
  return userData;
 },
 set(data: GETUser) {
  userData = data;
 },
};
