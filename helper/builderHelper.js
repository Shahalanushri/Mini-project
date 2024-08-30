var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {

  ///////ADD builder/////////////////////                                         
  addbuilder: (builder, callback) => {
    console.log(builder);
    builder.Price = parseInt(builder.Price);
    db.get()
      .collection(collections.BUILDER_COLLECTION)
      .insertOne(builder)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL builder/////////////////////                                            
  getAllbuilders: () => {
    return new Promise(async (resolve, reject) => {
      let builders = await db
        .get()
        .collection(collections.BUILDER_COLLECTION)
        .find()
        .toArray();
      resolve(builders);
    });
  },

  ///////ADD builder DETAILS/////////////////////                                            
  getbuilderDetails: (builderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BUILDER_COLLECTION)
        .findOne({
          _id: objectId(builderId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE builder/////////////////////                                            
  deletebuilder: (builderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BUILDER_COLLECTION)
        .removeOne({
          _id: objectId(builderId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE builder/////////////////////                                            
  updatebuilder: (builderId, builderDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BUILDER_COLLECTION)
        .updateOne(
          {
            _id: objectId(builderId)
          },
          {
            $set: {
              Name: builderDetails.Name,
              Category: builderDetails.Category,
              Price: builderDetails.Price,
              Description: builderDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL builder/////////////////////                                            
  deleteAllbuilders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BUILDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  addProduct: (product, callback) => {
    console.log(product);
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne(product)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  dosignup: (builderData) => {
    return new Promise(async (resolve, reject) => {
      try {
        builderData.Password = await bcrypt.hash(builderData.Password, 10);
        builderData.approved = false; // Set approved to false initially
        const data = await db.get().collection(collections.BUILDER_COLLECTION).insertOne(builderData);
        resolve(data.ops[0]);
      } catch (error) {
        reject(error);
      }
    });
  },


  doSignin: (builderData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let builder = await db
        .get()
        .collection(collections.BUILDER_COLLECTION)
        .findOne({ Email: builderData.Email });
      if (builder) {
        if (builder.rejected) {
          console.log("User is rejected");
          resolve({ status: "rejected" });
        } else {
          bcrypt.compare(builderData.Password, builder.Password).then((status) => {
            if (status) {
              if (builder.approved) {
                console.log("Login Success");
                response.builder = builder;
                response.status = true;
              } else {
                console.log("User not approved");
                response.status = "pending";
              }
              resolve(response);
            } else {
              console.log("Login Failed - Incorrect Password");
              resolve({ status: false });
            }
          });
        }
      } else {
        console.log("Login Failed - Email not found");
        resolve({ status: false });
      }
    });
  },


  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Category: productDetails.Category,
              Price: productDetails.Price,
              Description: productDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve();
        });
    });
  },

  removeAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },

  changeStatus: (status, orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": status,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },

  cancelAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" }).then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        })

    });
  },
};
