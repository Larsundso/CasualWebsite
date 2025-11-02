import type { GETUser } from "../../routes/api/user/+server";

let userData: GETUser | null = $state(null);

export const userStore = {
 get data(): GETUser | null {
  return userData;
 },
 set(data: GETUser) {
  userData = data;
 },
};
