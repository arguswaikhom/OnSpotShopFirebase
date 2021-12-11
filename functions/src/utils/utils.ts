import { TextUtils } from "./textutil";
import admin = require("firebase-admin");

export function getKeywords(txt: string) {
  if (TextUtils.isEmpty(txt)) return [];
  const keywords: string[] = [];
  const txtLowerCase = txt.trim().toLowerCase();
  keywords.push.apply(keywords, Utils.buttomBiteSubString(txtLowerCase));
  keywords.push.apply(keywords, Utils.topBiteSubString(txtLowerCase));
  txtLowerCase
    .split(" ")
    .forEach((word) =>
      keywords.push.apply(keywords, Utils.buttomBiteSubString(word))
    );
  return keywords;
}

export function getTimeNow() {
  return admin.firestore.Timestamp.fromDate(new Date());
}

export function isDefine(obj) {
  return !(obj == undefined || obj == null);
}
export function isEmptyObject(obj) {
  return (
    !isDefine(obj) ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  );
}
export class Utils {
  public static isEmpty(obj) {
    return (
      obj == undefined ||
      obj == null ||
      (Object.keys(obj).length === 0 && obj.constructor === Object)
    );
  }

  public static topBiteSubString(txt: string) {
    const charList: string[] = [];
    for (let i = 0; i < txt.length - 1; i++) {
      if (txt[i] != " ") charList.push(txt.substring(i, txt.length));
    }
    return charList;
  }

  public static buttomBiteSubString(txt: string) {
    const charList: string[] = [];
    for (let i = 1; i < txt.length + 1; i++) {
      if (txt[i - 1] != " ") charList.push(txt.substring(0, i));
    }
    return charList;
  }

  public static getTimeNow() {
    return admin.firestore.Timestamp.fromDate(new Date());
  }
}
