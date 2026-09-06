import {
  initializeApp,
  applicationDefault,
  getApps,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: "pet-pal-ef9a3",
  });
}

const db = getFirestore();

export { db };