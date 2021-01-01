import admin = require("firebase-admin");
import * as functions from "firebase-functions";
import * as str from "../resources/string";
import * as utils from "../utils/utils";

const firestore = admin.firestore();

/**
 * Set up initial value of user document on create user
 */
export const onCreateUser = functions.auth.user().onCreate(async (user) => {
  try {
    /* if (!utils.Utils.isEmpty(user.phoneNumber)) {
      // User created account using phone number
      const ph = [user.phoneNumber, user.phoneNumber?.replace("+91", "")];
      console.debug("Phone number: ", ph);
      const userExist = await firestore
        .collection(str.refUser)
        .where(str.fieldPhoneNumber, "in", ph)
        .get();

      console.debug("No existing user found: ", userExist.empty);
      if (!userExist.empty) {
        // Already has a user doc with the same phone number
        // Delete the user account created
        await admin.auth().deleteUser(user.uid);
        return;
      }
    } */

    console.debug("Creating user document: ", user.uid);
    await firestore.collection(str.refUser).doc(user.uid).set({
      displayName: user.displayName,
      email: user.email,
      hasEmailVerified: user.emailVerified,
      profileImageUrl: user.photoURL,
      userId: user.uid,
      phoneNumber: user.phoneNumber,
      hasOnSpotAccount: false,
      hasOnSpotBusinessAccount: false,
      hasOnSpotDeliveryAccount: false,
    });
  } catch (error) {
    console.error(error);
  }
});
