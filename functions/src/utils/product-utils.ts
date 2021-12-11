import * as str from "../resources/string";
import { TextUtils } from "../utils/textutil";
import { ListUtils } from "../utils/listutils";
import { Utils } from "../utils/utils";
import * as bu from "../utils/business-utils";
import { OSDiscountType } from "./enum";

export function getFinalPrice(price) {
  return price[str.fieldPrice] + getTaxPrice(price) - getDiscountPrice(price);
}

export function getDiscountPrice(price) {
  let discountPrice = 0;
  switch (price[str.fieldDiscount][str.fieldType]) {
    case OSDiscountType.PERCENT:
      discountPrice =
        (price[str.fieldPrice] * price[str.fieldDiscount][str.fieldValue]) /
        100;
      break;
    case OSDiscountType.PRICE:
      discountPrice = price[str.fieldPrice];
      break;
    case OSDiscountType.NO_DISCOUNT:
    default:
      discountPrice = 0;
      break;
  }
  return discountPrice;
}

export function getTaxPrice(price) {
  return (price[str.fieldPrice] * price[str.fieldTax]) / 100;
}

export function isProductSellable(product) {
  return isActive(product) && !product[str.fieldArchived];
}

export function isProductVisible(product, business) {
  return isVisible(product) && bu.isVisible(business);
}

/**
 * Check whether a product is visible to the customer or not
 *
 * @param product: the product to vertify the visibility
 */
export function isVisible(product) {
  if (
    product[str.fieldArchived] ||
    product[str.fieldAdminBlocked] ||
    !isActive(product)
  ) {
    return false;
  }
  return true;
}

/**
 * Check whether the product is satisfy to be active
 *
 * Required fields: imageUrls (min length 1), itemName, price
 * price -> price, quantity, unit
 *
 * @param product: the product to vertify the visibility
 */
export function isActive(product) {
  if (
    ListUtils.isEmpty(product[str.fieldImageUrls]) ||
    TextUtils.isEmpty(product[str.fieldItemName]) ||
    Utils.isEmpty(product[str.fieldPrice])
  ) {
    return false;
  } else {
    const productPrice = product[str.fieldPrice];
    if (
      Utils.isEmpty(productPrice) ||
      Utils.isEmpty(productPrice[str.fieldPrice]) ||
      Utils.isEmpty(productPrice[str.fieldQuantity]) ||
      Utils.isEmpty(productPrice[str.fieldUnit])
    ) {
      return false;
    }
  }

  return true;
}
