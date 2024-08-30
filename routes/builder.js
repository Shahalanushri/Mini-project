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


///////ALL workspace/////////////////////                                         
router.get("/all-workspaces", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  builderHelper.getAllworkspaces(req.session.builder._id).then((workspaces) => {
    res.render("builder/all-workspaces", { admin: true, layout: "layout", workspaces, builder });
  });
});

///////ADD workspace/////////////////////                                         
router.get("/add-workspace", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  res.render("builder/add-workspace", { admin: true, layout: "layout", builder });
});

///////ADD workspace/////////////////////                                         
router.post("/add-workspace", function (req, res) {
  // Ensure the builder is signed in and their ID is available
  if (req.session.signedInBuilder && req.session.builder && req.session.builder._id) {
    const builderId = req.session.builder._id; // Get the builder's ID from the session

    // Pass the builderId to the addworkspace function
    builderHelper.addworkspace(req.body, builderId, (workspaceId, error) => {
      if (error) {
        console.log("Error adding workspace:", error);
        res.status(500).send("Failed to add workspace");
      } else {
        let image = req.files.Image;
        image.mv("./public/images/workspace-images/" + workspaceId + ".png", (err) => {
          if (!err) {
            res.redirect("/builder/all-workspaces");
          } else {
            console.log("Error saving workspace image:", err);
            res.status(500).send("Failed to save workspace image");
          }
        });
      }
    });
  } else {
    // If the builder is not signed in, redirect to the sign-in page
    res.redirect("/builder/signin");
  }
});


///////EDIT workspace/////////////////////                                         
router.get("/edit-workspace/:id", verifySignedIn, async function (req, res) {
  let builder = req.session.builder;
  let workspaceId = req.params.id;
  let workspace = await builderHelper.getworkspaceDetails(workspaceId);
  console.log(workspace);
  res.render("builder/edit-workspace", { admin: true, layout: "layout", workspace, builder });
});

///////EDIT workspace/////////////////////                                         
router.post("/edit-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  builderHelper.updateworkspace(workspaceId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/workspace-images/" + workspaceId + ".png");
      }
    }
    res.redirect("/builder/all-workspaces");
  });
});

///////DELETE workspace/////////////////////                                         
router.get("/delete-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  builderHelper.deleteworkspace(workspaceId).then((response) => {
    fs.unlinkSync("./public/images/workspace-images/" + workspaceId + ".png");
    res.redirect("/builder/all-workspaces");
  });
});

///////DELETE ALL workspace/////////////////////                                         
router.get("/delete-all-workspaces", verifySignedIn, function (req, res) {
  builderHelper.deleteAllworkspaces().then(() => {
    res.redirect("/builder/all-workspaces");
  });
});










router.get("/all-users", verifySignedIn, function (req, res) {
  let builder = req.session.builder;
  builderHelper.getAllUsers().then((users) => {
    res.render("builder/all-users", { builder: true, layout: "layout", users, builder });
  });
});




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
      req.session.signInErr = `Invalid Email/Password`;
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
