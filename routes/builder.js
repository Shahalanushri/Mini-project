var express = require("express");
var builderHelper = require("../helper/builderHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInBuilder) {
    next();
  } else {
    res.redirect("/builder/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let builder = req.session.builder;
  res.render("builder/home", { builder: true, layout: "layout", builder });
});


///////ALL builder/////////////////////                                         
// router.get("/all-workspaces", verifySignedIn, function (req, res) {
//   let builder = req.session.builder;
//   builderHelper.getAllworkspaces().then((workspaces) => {
//     res.render("builder/builder/all-workspaces", { builder: true, layout: "layout", workspaces, workspace });
//   });
// });

///////ADD builder/////////////////////                                         
// router.get("/add-workspace", verifySignedIn, function (req, res) {
//   let builder = req.session.builder;
//   res.render("builder/builder/add-workspace", { builder: true, layout: "layout", workspace });
// });

///////ADD builder/////////////////////                                         
// router.post("/add-workspace", function (req, res) {
//   builderHelper.addworkspace(req.body, (id) => {
//     let image = req.files.Image;
//     image.mv("./public/images/builder-images/" + id + ".png", (err, done) => {
//       if (!err) {
//         res.redirect("/builder/builder/all-workspaces");
//       } else {
//         console.log(err);
//       }
//     });
//   });
// });

///////EDIT builder/////////////////////                                         
// router.get("/edit-builder/:id", verifySignedIn, async function (req, res) {
//   let builder = req.session.builder;
//   let builderId = req.params.id;
//   let builders = await builderHelper.getworkspaceDetails(workspaceId);
//   console.log(workspace);
//   res.render("builder/builder/edit-workspace", { builder: true, layout: "layout", workspace, workspaces });
// });

///////EDIT builder/////////////////////                                         
// router.post("/edit-builder/:id", verifySignedIn, function (req, res) {
//   let builderId = req.params.id;
//   builderHelper.updateworkspace(workspaceId, req.body).then(() => {
//     if (req.files) {
//       let image = req.files.Image;
//       if (image) {
//         image.mv("./public/images/builder-images/" + workspaceId + ".png");
//       }
//     }
//     res.redirect("/builder/builder/all-workspaces");
//   });
// });

///////DELETE builder/////////////////////                                         
// router.get("/delete-builder/:id", verifySignedIn, function (req, res) {
//   let builderId = req.params.id;
//   builderHelper.deleteworkspace(workspaceId).then((response) => {
//     res.redirect("/builder/builder/all-workspaces");
//   });
// });

///////DELETE ALL builder/////////////////////                                         
// router.get("/delete-all-workspaces", verifySignedIn, function (req, res) {
//   builderHelper.deleteAllworkspaces().then(() => {
//     res.redirect("/builder/builder/all-workspaces");
//   });
// });

// router.get("/all-products", verifySignedIn, function (req, res) {
//   let builder = req.session.builder;
//   builderHelper.getAllProducts().then((products) => {
//     res.render("builder/all-products", { builder: true, layout: "layout", products, workspace });
//   });
// });


router.get("/signup", function (req, res) {
  if (req.session.signedInBuilder) {
    res.redirect("/builder");
  } else {
    res.render("builder/signup", {
      builder: true, layout: "empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.get("/pending-approval", function (req, res) {
  if (!req.session.signedInBuilder || req.session.builder.approved) {
    res.redirect("/builder");
  } else {
    res.render("builder/pending-approval", {
      builder: true, layout: "empty",
    });
  }
});

router.post("/signup", function (req, res) {
  builderHelper.dosignup(req.body).then((response) => {
    if (!response) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/builder/signup");
    } else {
      req.session.signedInBuilder = true;
      req.session.builder = response;
      res.redirect("/builder/pending-approval"); // Redirect to pending approval page
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInBuilder) {
    res.redirect("/builder");
  } else {
    res.render("builder/signin", {
      builder: true, layout: "empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  builderHelper.doSignin(req.body).then((response) => {
    if (response.status === true) {
      req.session.signedInBuilder = true;
      req.session.builder = response.builder;
      res.redirect("/builder");
    } else if (response.status === "pending") {
      req.session.signInErr = "This user is not approved by admin, please wait.";
      res.redirect("/builder/signin");
    } else if (response.status === "rejected") {
      req.session.signInErr = "This user is rejected by admin.";
      res.redirect("/builder/signin");
    } else {
      req.session.signInErr = "Invalid Email/Password for registration approval.";
      res.redirect("/builder/signin");
    }
  }).catch((error) => {
    console.error(error);
    req.session.signInErr = "An error occurred. Please try again.";
    res.redirect("/builder/signin");
  });
});




router.get("/signout", function (req, res) {
  req.session.signedInBuilder = false;
  req.session.builder = null;
  res.redirect("/builder");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  res.render("builder/add-product", { builder: true, layout: "layout", workspace });
});

router.post("/add-product", function (req, res) {
  builderHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/builder/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let builder = req.session.builder;
  let productId = req.params.id;
  let product = await builderHelper.getProductDetails(productId);
  console.log(product);
  res.render("builder/edit-product", { builder: true, layout: "layout", product, workspace });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  builderHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/builder/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  builderHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/builder/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  builderHelper.deleteAllProducts().then(() => {
    res.redirect("/builder/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  builderHelper.getAllUsers().then((users) => {
    res.render("builder/users/all-users", { builder: true, layout: "layout", workspace, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  builderHelper.removeUser(userId).then(() => {
    res.redirect("/builder/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  builderHelper.removeAllUsers().then(() => {
    res.redirect("/builder/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let builder = req.session.builder;
  let orders = await builderHelper.getAllOrders();
  res.render("builder/all-orders", {
    builder: true, layout: "layout",
    workspace,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let builder = req.session.builder;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("builder/order-products", {
      builder: true, layout: "layout",
      workspace,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  builderHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/builder/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  builderHelper.cancelOrder(orderId).then(() => {
    res.redirect("/builder/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  builderHelper.cancelAllOrders().then(() => {
    res.redirect("/builder/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  builderHelper.searchProduct(req.body).then((response) => {
    res.render("builder/search-result", { builder: true, layout: "layout", workspace, response });
  });
});


module.exports = router;
