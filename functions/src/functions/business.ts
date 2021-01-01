import admin = require("firebase-admin");
import * as functions from "firebase-functions";
import * as str from "../resources/string";
import * as bu from "../utils/business-utils";
import { TextUtils } from "../utils/textutil";
import { ListUtils } from "../utils/listutils";
import * as utils from "../utils/utils";
import { DistanceUtil } from "../model/DistanceUtil";
import { OSAPOnSpotHomeHODFilter } from "../utils/enum";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { BusinessV4 } from "../model/business/businessV4";

const firestore = admin.firestore();
const updatedBuss = "updatedBuss";
const updatedProduct = "updatedProduct";
const updateBuss = "updateBuss";
const updateProduct = "updateProduct";

function updateKeywords(before, after, res) {
  const oldName = before[str.fieldDisplayName];
  const newName = after[str.fieldDisplayName];
  const newBusinessType = after[str.fieldBusinessType];
  const oldBusinessType = before[str.fieldBusinessType];

  if (oldName != newName || oldBusinessType != newBusinessType) {
    res[updateBuss] = true;
    res[updatedBuss][str.fieldKeywords] = utils.getKeywords(after);
  }
  return res;
}

function updateVisibility(after, res) {
  const isVisible = bu.isVisible(after);
  const isVisibleInDB = after[str.fieldIsVisible];
  if (isVisibleInDB != isVisible) {
    res[updateBuss] = true;
    res[updatedBuss][str.fieldIsVisible] = isVisible;

    res[updateProduct] = true;
    res[updatedProduct][str.fieldIsVisible] = isVisible;
  }
  return res;
}

function updateProductIsActive(after, res) {
  const isActive = bu.isActive(after);
  const isActiveInDB = after[str.fieldIsActive];
  if (isActive != isActiveInDB) {
    res[updateBuss] = true;
    res[updatedBuss][str.fieldIsActive] = isActive;
  }
  return res;
}

exports.onCreateBusiness = functions.firestore
  .document(str.refBusiness + "/{id}")
  .onCreate(async (doc, context) => {
    const business = doc.data();

    business[str.fieldAdminBlocked] = false;
    business[str.fieldCreatedOn] = utils.getTimeNow();
    business[str.fieldDeviceToken] = [];
    business[str.fieldHodAvailable] = false;
    business[str.fieldFsAvailable] = false;
    business[str.fieldIsActive] = bu.isActive(business);
    business[str.fieldIsVisible] = bu.isVisible(business);
    business[str.fieldIsOpen] = true;
    business[str.fieldMinOrder] = 0;
    business[str.fieldProductCount] = 0;
    business[str.fieldSellableProductCount] = 0;
    business[str.fieldKeywords] = bu.getKeywords(business);

    await firestore.collection(str.refBusiness).doc(doc.id).update(business);
  });

exports.onUpdateBusiness = functions.firestore
  .document(str.refBusiness + "/{id}")
  .onUpdate(async (change, context) => {
    let res = {};
    res[updatedBuss] = {};
    res[updatedProduct] = {};

    const before = change?.before?.data() ?? {};
    const after = change?.after?.data() ?? {};

    await firestore.runTransaction(async (t) => {
      res = updateKeywords(before, after, res);
      res = updateVisibility(after, res);
      res = updateProductIsActive(after, res);

      if (res[updateProduct]) {
        const products = await t.get(
          firestore
            .collection(str.refItem)
            .where(str.fieldBusinessRefId, "==", change.after.id)
        );
        products.forEach((doc) =>
          t.update(
            firestore.collection(str.refItem).doc(doc.id),
            res[updatedProduct]
          )
        );
      }

      if (res[updateBuss]) {
        t.update(
          firestore.collection(str.refBusiness).doc(change.after.id),
          res[updatedBuss]
        );
      }

      console.log(JSON.stringify(res));
    });
  });

/**
 * Get all the business relavent to the user's current location
 */
export const getUserBusiness = functions.https.onRequest(
  async (request, response) => {
    try {
      const centerGP = JSON.parse(
        request.body.userLocation
      ) as admin.firestore.GeoPoint;
      const filter = request.body.filter;

      // get common delivery range from the database
      let radius, limit;
      if (filter == OSAPOnSpotHomeHODFilter.OPEN_ALL_BUSINESS) {
        radius = 100;
        limit = 50;
      } else {
        limit = 100;
        radius = (
          await firestore
            .collection(str.refOnSpotShop)
            .doc(str.fieldDeliveRange)
            .get()
        ).get("value");
      }

      /** find all the business which are in the common delivery range from the user's location */
      const box = DistanceUtil.boundingBoxCoordinates(centerGP, radius);
      const lesserGP = new admin.firestore.GeoPoint(
        box.swCorner.latitude,
        box.swCorner.longitude
      );
      const greaterGP = new admin.firestore.GeoPoint(
        box.neCorner.latitude,
        box.neCorner.longitude
      );

      const fieldPath = new admin.firestore.FieldPath("location", "geoPoint");
      const query = firestore
        .collection(str.refBusiness)
        .where(fieldPath, ">", lesserGP)
        .where(fieldPath, "<", greaterGP)
        .where(str.fieldIsOpen, "==", true)
        .where(str.fieldIsVisible, "==", true);

      const businessList: any[] = [];
      if (filter == OSAPOnSpotHomeHODFilter.ONLY_HOD_BUSINESS) {
        const snapshot = await query
          .where(str.fieldHodAvailable, "==", true)
          .limit(limit)
          .get();
        snapshot.forEach((business) => {
          /** Find the distance between user and business location */
          const businessGP = business.get("location").geoPoint;
          const distance = DistanceUtil.distance(businessGP, centerGP);

          /** If the distance is more than business's delivery range, do not include */
          const deliveryRange =
            business.get("deliveryRange") == null
              ? null
              : business.get("deliveryRange");
          if (deliveryRange == null || distance <= deliveryRange)
            businessList.push(
              new BusinessV4(business.data() as DocumentSnapshot)
            );
        });
      } else {
        const snapshot = await query.limit(limit).get();
        snapshot.forEach((business) =>
          businessList.push(new BusinessV4(business.data() as DocumentSnapshot))
        );
      }

      console.log("Total: ", businessList.length);
      response.status(200).send({ filter: filter, data: businessList });
      return;
    } catch (error) {
      console.error(error);
      console.log(JSON.stringify(request.body));
      response.status(400).send();
      return;
    }
  }
);
