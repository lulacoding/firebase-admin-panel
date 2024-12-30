import { auth, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export const checkIsAdmin = async () => {
  await auth.currentUser?.getIdToken(true);
  const token = await auth.currentUser?.getIdTokenResult();
  return token?.claims?.admin === true;
};

export const makeUserAdmin = async (uid) => {
  const setAdminRole = httpsCallable(functions, "setAdminRole");
  return setAdminRole({ uid });
}; 