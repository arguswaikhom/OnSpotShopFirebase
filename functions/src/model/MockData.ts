export class ListData {
  static thoubal = [
    "795135",
    "795149",
    "795135",
    "795149",
    "795130",
    "795103",
    "795138",
    "795138",
    "795149",
    "795135",
    "795101",
    "795130",
    "795149",
    "795138",
    "795135",
    "795135",
    "795148",
    "795103",
    "795138",
    "795149",
    "795130",
    "795149",
    "795130",
    "795148",
    "795148",
    "795103",
    "795149",
    "795149",
    "795138",
    "795101",
    "795103",
    "795101",
    "795103",
    "795103",
    "795103",
    "795135",
    "795149",
    "795149",
    "795149",
    "795148",
    "795149",
    "795138",
    "795103",
    "795101",
    "795138",
    "795135",
    "795135",
    "795138",
    "795135",
    "795149",
    "795148",
    "795149",
    "795101",
    "795135",
    "795103",
    "795135",
    "795135",
    "795138",
    "795138",
    "795135",
    "795130",
    "795135",
    "795135",
    "795135",
    "795103",
    "795135",
    "795103",
    "795138",
    "795130",
    "795135",
    "795101",
    "795149",
    "795149",
    "795101",
    "795135",
    "795101",
    "795103",
    "795103",
    "795132",
    "795135",
    "795138",
    "795135",
    "795149",
    "795135",
    "795149",
    "795135",
    "795103",
    "795149",
    "795130",
    "795138",
    "795103",
    "795138",
    "795149",
    "795130",
    "795148",
    "795138",
    "795148",
    "795103",
    "795138",
    "795135",
    "795148",
    "795148",
    "795101",
    "795148",
    "795148",
    "795149",
    "795101",
    "795101",
    "795135",
    "795149",
    "795135",
    "795103",
    "795148",
    "795148",
    "795135",
    "795130",
    "795138",
    "795138",
    "795138",
    "795138",
    "795138",
    "795103",
    "795148",
    "795149",
    "795130",
    "795130",
    "795103",
    "795103",
    "795138",
    "795148",
    "795103",
    "795149",
    "795149",
    "795149",
  ];
  static imphalWest = [
    "795002",
    "795132",
    "795136",
    "795002",
    "795132",
    "795115",
    "795009",
    "795116",
    "795116",
    "795115",
    "795003",
    "795004",
    "795136",
    "795132",
    "795116",
    "795116",
    "795132",
    "795146",
    "795113",
    "795001",
    "795115",
    "795113",
    "795009",
    "795132",
    "795146",
    "795002",
    "795009",
    "795146",
    "795001",
    "795001",
    "795146",
    "795004",
    "795009",
    "795132",
    "795132",
    "795116",
    "795116",
    "795146",
    "795146",
    "795146",
    "795136",
    "795002",
    "795146",
    "795115",
    "795115",
    "795116",
    "795113",
    "795113",
    "795132",
    "795002",
    "795001",
    "795113",
    "795146",
    "795002",
    "795009",
    "795132",
    "795002",
    "795113",
    "795003",
    "795003",
    "795140",
    "795146",
    "795116",
    "795004",
    "795146",
    "795004",
    "795146",
    "795113",
    "795004",
    "795003",
    "795132",
    "795002",
    "795113",
    "795116",
    "795132",
    "795002",
    "795136",
    "795132",
    "795136",
    "795113",
    "795001",
    "795002",
    "795132",
    "795146",
    "795003",
    "795132",
    "795113",
    "795115",
    "795113",
    "795113",
    "795116",
    "795003",
    "795004",
    "795146",
    "795009",
    "795116",
    "795113",
    "795116",
    "795146",
    "795132",
    "795146",
    "795136",
    "795004",
    "795113",
    "795009",
    "795140",
    "795132",
    "795004",
    "795132",
    "795132",
    "795132",
    "795001",
    "795116",
    "795116",
    "795113",
    "795113",
    "795002",
    "795004",
    "795132",
    "795113",
    "795116",
    "795132",
    "795132",
    "795009",
    "795140",
    "795009",
    "795113",
  ];
  static imphalEast = [
    "795005",
    "795010",
    "795114",
    "795114",
    "795010",
    "795010",
    "795008",
    "795114",
    "795010",
    "795008",
    "795008",
    "795008",
    "795008",
    "795114",
    "795114",
    "795005",
    "795008",
    "795008",
    "795008",
    "795008",
    "795010",
    "795008",
    "795010",
    "795010",
    "795116",
    "795114",
    "795003",
    "795114",
    "795005",
    "795010",
    "795008",
    "795010",
    "795010",
    "795010",
    "795008",
    "795010",
    "795114",
    "795005",
    "795114",
    "795114",
    "795114",
    "795010",
    "795136",
    "795008",
    "795005",
    "795010",
    "795010",
    "795114",
    "795140",
    "795008",
    "795114",
    "795114",
    "795114",
    "795010",
    "795114",
  ];

  public static getLaunchRegions() {
    return this.thoubal.concat(this.imphalEast).concat(this.imphalWest);
  }

  static businessType = [
    "Books & Accessories",
    "Mobiles, Computers & Accessories",
    "Electronics Appliances",
    "Tech Appliances",
    "Fashion",
    "Clothing",
    "Personal Care Appliances",
    "Home Appliances",
    "Grocery",
    "Household supplies",
    "Beauty",
    "Sports & Fitness",
    "Bags & Luggage",
    "Toys",
    "Baby products",
    "Jewellery",
    "Kid's Fashion",
    "Hardware",
    "Automobiles & Accessories",
    "Entertainments",
    "Movies & TV Shows",
    "Furniture",
    "Garden & Outdoor",
    "Watches",
    "Vegetables",
    "Meat",
    "Pet Supplies",
    "Health",
    "Sunglasses",
    "Bakery",
    "Food",
    "Restaurants",
  ];

  public static getBusinessType() {
    return this.businessType;
  }
}