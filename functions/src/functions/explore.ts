import admin = require("firebase-admin");
import * as functions from "firebase-functions";
import * as str from "../resources/string";
import { ListUtils } from "../utils/listutils";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { Utils } from "../utils/utils";

const firestore = admin.firestore();

exports.getExplore = functions.https.onRequest(async (request, response) => {
  try {
    const responseLength = 50;
    const promises: any[] = [];
    const businessCol = firestore
      .collection(str.refBusiness)
      .where(str.fieldIsVisible, "==", true);
    const itemCol = firestore
      .collection(str.refItem)
      .where(str.fieldIsVisible, "==", true);
    let searchKeywords = request.body.keywords;
    if (Utils.isEmpty(searchKeywords)) {
      promises.push(businessCol.limit(responseLength).get());
      promises.push(itemCol.limit(responseLength).get());
    } else {
      searchKeywords = searchKeywords.trim().toLowerCase();
      promises.push(
        businessCol
          .where(str.keyKeywords, "array-contains", searchKeywords)
          .limit(responseLength)
          .get()
      );
      promises.push(
        itemCol
          .where(str.keyKeywords, "array-contains", searchKeywords)
          .limit(responseLength)
          .get()
      );
    }
    const result = await Promise.all(promises);
    let bussNItems: DocumentSnapshot[] = [];
    result.forEach((snapshot) => {
      if (!Utils.isEmpty(snapshot) && !snapshot.empty) {
        bussNItems.push.apply(bussNItems, snapshot.docs);
      }
    });

    bussNItems = ListUtils.shuffle(bussNItems);
    const responseList: any = [];
    for (
      let i = 0;
      responseList.length < responseLength && i < bussNItems.length;
      i++
    ) {
      const doc = bussNItems[i];
      const imageUrls = doc.get(str.fieldImageUrls);
      if (!ListUtils.isEmpty(imageUrls)) {
        responseList.push({
          id: doc.id,
          osClass: doc.get(str.fieldOsClass),
          imageUrl: imageUrls[0],
        });
      }
    }
    console.log("Total items response: ", responseList.length);
    response.status(200).send(JSON.stringify(responseList));
    return;
  } catch (error) {
    console.error(error);
    response.status(400).send();
    return;
  }
});
