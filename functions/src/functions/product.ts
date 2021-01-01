import admin = require("firebase-admin");
import * as functions from "firebase-functions";
import * as str from "../resources/string";
import * as pu from "../utils/product-utils";
import { TextUtils } from "../utils/textutil";
import { ListUtils } from "../utils/listutils";
import * as utils from "../utils/utils";

const updatedBuss = "updatedBuss";
const updatedProduct = "updatedProduct";
const updateBuss = "updateBuss";
const updateProduct = "updateProduct";
const firestore = admin.firestore();

function updateProductCategories(before, after, business, res) {
  const oldPCategory = before[str.fieldCategory];
  const newPCategory = after[str.fieldCategory];

  // If there is no changes in the category; no need to update
  if (oldPCategory === newPCategory) return res;

  if (!TextUtils.isEmpty(newPCategory)) {
    // Product category modified
    res[updateBuss] = true;

    // List of product categories from the business document
    const categories = business[str.fieldProductCategories];

    if (ListUtils.isEmpty(categories)) {
      // If the category list was empty; add a new with the new category
      res[updatedBuss][str.fieldProductCategories] = [newPCategory];
    } else {
      // If the category list already exist; find whether the new category is in the list or not
      // If the category exist; categoryExist = "the category" otherwise undefine
      const categoryExist = categories.find(
        (c) => c.toLocaleLowerCase() == newPCategory.toLocaleLowerCase()
      );

      // If the category is not in the category list; add the category
      if (utils.Utils.isEmpty(categoryExist)) {
        res[updatedBuss][
          str.fieldProductCategories
        ] = admin.firestore.FieldValue.arrayUnion(newPCategory);
      }
    }
  }
  return res;
}

function updateProductKeywords(before, after, res) {
  const newPName = after[str.fieldItemName];
  const oldPName = before[str.fieldItemName];
  const newPCategory = after[str.fieldCategory];
  const oldPCategory = before[str.fieldCategory];

  // Update product keywords if product name or caegory changes
  if (oldPName != newPName || oldPCategory != newPCategory) {
    res[updateProduct] = true;

    const keywords: string[] = [];
    keywords.push.apply(keywords, utils.getKeywords(newPName));
    keywords.push.apply(keywords, utils.getKeywords(newPCategory));

    res[updatedProduct][str.fieldKeywords] = ListUtils.removeDuplicate(
      keywords
    );
  }
  return res;
}

function updatePruductVisibility(before, after, business, res) {
  const isVisible = pu.isProductVisible(after, business);
  const isVisibleInDB = after[str.fieldIsVisible];
  // Product visibility is false if the product or the business is not visible
  if (isVisibleInDB != isVisible) {
    // Product visibility needs to update
    res[updateProduct] = true;
    res[updatedProduct][str.fieldIsVisible] = isVisible;
  }
  return res;
}

function updateProductIsActive(before, after, res) {
  const isActive = pu.isActive(after);
  const isActiveInDB = after[str.fieldIsActive];
  if (isActive != isActiveInDB) {
    res[updateProduct] = true;
    res[updatedProduct][str.fieldIsActive] = isActive;
  }
  return res;
}

function updateProductCount(before, after, business, res) {
  // Sellable product should be active and not archived
  const isSellable = pu.isProductSellable(after);
  const sellableProductCount = business[str.fieldSellableProductCount];
  const isSellableInDBBefore =
    before[str.fieldIsActive] && !before[str.fieldArchived];

  if (isSellableInDBBefore != isSellable) {
    // Product visibility has changed
    res[updateBuss] = true;

    if (isSellable)
      res[updatedBuss][str.fieldSellableProductCount] =
        sellableProductCount + 1;
    else
      res[updatedBuss][str.fieldSellableProductCount] =
        sellableProductCount - 1;
  }
  return res;
}

exports.onCreateProduct = functions.firestore
  .document(str.refItem + "/{id}")
  .onCreate(async (doc, context) => {
    await firestore.runTransaction(async (t) => {
      const product = doc.data();
      const business = await t.get(
        firestore
          .collection(str.refBusiness)
          .doc(product[str.fieldBusinessRefId])
      );

      product[str.fieldIsActive] = pu.isActive(product);
      product[str.fieldIsVisible] = pu.isProductVisible(
        product,
        business.data()
      );
      product[str.fieldAdminBlocked] = false;
      product[str.fieldArchived] = false;

      const updatedBusiness = {};
      updatedBusiness[str.fieldProductCount] =
        business.get(str.fieldProductCount) + 1;
      if (pu.isProductSellable(product)) {
        updatedBusiness[str.fieldSellableProductCount] =
          business.get(str.fieldSellableProductCount) + 1;
      }

      t.update(
        firestore.collection(str.refBusiness).doc(business.id),
        updatedBusiness
      );
      t.update(firestore.collection(str.refItem).doc(doc.id), product);

      console.debug("On create product: ", JSON.stringify(product));
    });
  });

exports.onUpdateProduct = functions.firestore
  .document(str.refItem + "/{id}")
  .onUpdate(async (change, context) => {
    console.debug("On update product");
    await firestore.runTransaction(async (t) => {
      let res: any = {};
      res[updatedBuss] = {};
      res[updatedProduct] = {};
      /**
       * res = {
       *    updateBuss: true || false,
       *    updateProduct: true || false,
       *    updatedBuss: {},
       *    updatedProduct: {}
       * }
       */

      const before = change?.before?.data() ?? {};
      const after = change?.after?.data() ?? {};

      const business = (
        await t.get(
          firestore
            .collection(str.refBusiness)
            .doc(after[str.fieldBusinessRefId])
        )
      ).data();

      const product = (
        await t.get(firestore.collection(str.refItem).doc(change.after.id))
      ).data();

      res = updateProductIsActive(before, after, res);
      //res = updateProductCount(before, after, business, res);
      res = updatePruductVisibility(before, after, business, res);
      res = updateProductKeywords(before, after, res);
      res = updateProductCategories(before, after, business, res);

      console.log(JSON.stringify(res));

      // Update business
      if (res[updateBuss])
        t.update(
          firestore
            .collection(str.refBusiness)
            .doc(after[str.fieldBusinessRefId]),
          res[updatedBuss]
        );

      // Update product
      if (res[updateProduct])
        t.update(
          firestore.collection(str.refItem).doc(change.after.id),
          res[updatedProduct]
        );
    });
  });

exports.updateProductSellable = functions.firestore
  .document(str.refItem + "/{id}")
  .onUpdate(async (change, context) => {
    const before = change?.before?.data() ?? {};
    const after = change?.after?.data() ?? {};

    const isSellable = pu.isProductSellable(after);
    const isSellableInDBBefore =
      before[str.fieldIsActive] && !before[str.fieldArchived];

    if (isSellableInDBBefore != isSellable) {
      // Product visibility has changed
      const products = await firestore
        .collection(str.refItem)
        .where(str.fieldBusinessRefId, "==", after[str.fieldBusinessRefId])
        .where(str.fieldIsActive, "==", true)
        .where(str.fieldArchived, "==", false)
        .get();

      const updatedBusiness = {};
      updatedBusiness[str.fieldSellableProductCount] = products.size;
      await firestore
        .collection(str.refBusiness)
        .doc(after[str.fieldBusinessRefId])
        .update(updatedBusiness);
    }
  });
