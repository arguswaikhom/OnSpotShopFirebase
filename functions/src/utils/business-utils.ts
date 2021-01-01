import * as str from "../resources/string";
import { TextUtils } from "../utils/textutil";
import { ListUtils } from "../utils/listutils";
import * as utils from "../utils/utils";

export function getKeywords(business) {
  const keywords: string[] = [];
  keywords.push.apply(
    keywords,
    utils.getKeywords(business[str.fieldDisplayName])
  );
  keywords.push.apply(
    keywords,
    utils.getKeywords(business[str.fieldBusinessType])
  );
  return ListUtils.removeDuplicate(keywords);
}

/**
 * Check whether a business is visible to the customer or not
 *
 * @param business: the business to vertify the visibility
 */
export function isVisible(business) {
  if (business[str.fieldAdminBlocked] || !isActive(business)) {
    return false;
  }
  return true;
}

/**
 * Check whether the business is satisfy to be active
 *
 * required fields {display name, 1 image min, 1 min active product, hod availability,
 * delivery range, location, mobile no, shipping charge}
 *
 * @param business: the business to vertify the visibility
 */
export function isActive(business) {
  console.log("Sellable: ", business[str.fieldSellableProductCount]);
  console.log("Sellable: ", business[str.fieldSellableProductCount] < 1);

  if (
    TextUtils.isEmpty(business[str.fieldDisplayName]) ||
    ListUtils.isEmpty(business[str.fieldImageUrls]) ||
    utils.Utils.isEmpty(business[str.fieldHodAvailable]) ||
    utils.Utils.isEmpty(business[str.fieldLocation]) ||
    utils.Utils.isEmpty(business[str.fieldMobileNumber]) ||
    utils.Utils.isEmpty(business[str.fieldSellableProductCount]) ||
    business[str.fieldSellableProductCount] < 1
  )
    return false;

  // if hod, available delivery range is requiered
  if (business[str.fieldHodAvailable]) {
    if (utils.Utils.isEmpty(business[str.fieldDeliveRange])) return false;

    // If free shipping is not available, shipping charge is require
    if (business[str.fieldFsAvailable] == false) {
      const shippingCharge = business[str.fieldShippingCharges];
      if (utils.Utils.isEmpty(shippingCharge)) return false;
      else if (utils.Utils.isEmpty(shippingCharge[str.fieldPerOrder]))
        return false;
    }
  }
  return true;
}
