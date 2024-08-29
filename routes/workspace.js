var express = require("express");
var workspaceHelper = require("../helper/workspaceHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInWorkspace) {
    next();
  } else {
    res.redirect("/workspace/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let workspace = req.session.workspace;
  res.render("workspace/home", { workspace: true, layout: "layout", workspace });
});


///////ALL workspace/////////////////////                                         
router.get("/all-workspaces", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  workspaceHelper.getAllworkspaces().then((workspaces) => {
    res.render("workspace/workspace/all-workspaces", { workspace: true, layout: "layout", workspaces, workspace });
  });
});

///////ADD workspace/////////////////////                                         
router.get("/add-workspace", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  res.render("workspace/workspace/add-workspace", { workspace: true, layout: "layout", workspace });
});

///////ADD workspace/////////////////////                                         
router.post("/add-workspace", function (req, res) {
  workspaceHelper.addworkspace(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/workspace-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/workspace/workspace/all-workspaces");
      } else {
        console.log(err);
      }
    });
  });
});

///////EDIT workspace/////////////////////                                         
router.get("/edit-workspace/:id", verifySignedIn, async function (req, res) {
  let workspace = req.session.workspace;
  let workspaceId = req.params.id;
  let workspaces = await workspaceHelper.getworkspaceDetails(workspaceId);
  console.log(workspace);
  res.render("workspace/workspace/edit-workspace", { workspace: true, layout: "layout", workspace, workspaces });
});

///////EDIT workspace/////////////////////                                         
router.post("/edit-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  workspaceHelper.updateworkspace(workspaceId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/workspace-images/" + workspaceId + ".png");
      }
    }
    res.redirect("/workspace/workspace/all-workspaces");
  });
});

///////DELETE workspace/////////////////////                                         
router.get("/delete-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  workspaceHelper.deleteworkspace(workspaceId).then((response) => {
    res.redirect("/workspace/workspace/all-workspaces");
  });
});

///////DELETE ALL workspace/////////////////////                                         
router.get("/delete-all-workspaces", verifySignedIn, function (req, res) {
  workspaceHelper.deleteAllworkspaces().then(() => {
    res.redirect("/workspace/workspace/all-workspaces");
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  workspaceHelper.getAllProducts().then((products) => {
    res.render("workspace/all-products", { workspace: true, layout: "layout", products, workspace });
  });
});


router.get("/signup", function (req, res) {
  if (req.session.signedInWorkspace) {
    res.redirect("/workspace");
  } else {
    res.render("workspace/signup", {
      workspace: true, layout: "empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.get("/pending-approval", function (req, res) {
  if (!req.session.signedInWorkspace || req.session.workspace.approved) {
    res.redirect("/workspace");
  } else {
    res.render("workspace/pending-approval", {
      workspace: true, layout: "empty",
    });
  }
});

router.post("/signup", function (req, res) {
  workspaceHelper.dosignup(req.body).then((response) => {
    if (!response) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/workspace/signup");
    } else {
      req.session.signedInWorkspace = true;
      req.session.workspace = response;
      res.redirect("/workspace/pending-approval"); // Redirect to pending approval page
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInWorkspace) {
    res.redirect("/workspace");
  } else {
    res.render("workspace/signin", {
      workspace: true, layout: "empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  workspaceHelper.doSignin(req.body).then((response) => {
    if (response.status === true) {
      req.session.signedInWorkspace = true;
      req.session.workspace = response.workspace;
      res.redirect("/workspace");
    } else if (response.status === "pending") {
      req.session.signInErr = "This user is not approved by admin, please wait.";
      res.redirect("/workspace/signin");
    } else if (response.status === "rejected") {
      req.session.signInErr = "This user is rejected by admin.";
      res.redirect("/workspace/signin");
    } else {
      req.session.signInErr = "Invalid Email/Password for registration approval.";
      res.redirect("/workspace/signin");
    }
  }).catch((error) => {
    console.error(error);
    req.session.signInErr = "An error occurred. Please try again.";
    res.redirect("/workspace/signin");
  });
});




router.get("/signout", function (req, res) {
  req.session.signedInWorkspace = false;
  req.session.workspace = null;
  res.redirect("/workspace");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  res.render("workspace/add-product", { workspace: true, layout: "layout", workspace });
});

router.post("/add-product", function (req, res) {
  workspaceHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/workspace/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let workspace = req.session.workspace;
  let productId = req.params.id;
  let product = await workspaceHelper.getProductDetails(productId);
  console.log(product);
  res.render("workspace/edit-product", { workspace: true, layout: "layout", product, workspace });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  workspaceHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/workspace/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  workspaceHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/workspace/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  workspaceHelper.deleteAllProducts().then(() => {
    res.redirect("/workspace/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  workspaceHelper.getAllUsers().then((users) => {
    res.render("workspace/users/all-users", { workspace: true, layout: "layout", workspace, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  workspaceHelper.removeUser(userId).then(() => {
    res.redirect("/workspace/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  workspaceHelper.removeAllUsers().then(() => {
    res.redirect("/workspace/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let workspace = req.session.workspace;
  let orders = await workspaceHelper.getAllOrders();
  res.render("workspace/all-orders", {
    workspace: true, layout: "layout",
    workspace,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let workspace = req.session.workspace;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("workspace/order-products", {
      workspace: true, layout: "layout",
      workspace,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  workspaceHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/workspace/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  workspaceHelper.cancelOrder(orderId).then(() => {
    res.redirect("/workspace/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  workspaceHelper.cancelAllOrders().then(() => {
    res.redirect("/workspace/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let workspace = req.session.workspace;
  workspaceHelper.searchProduct(req.body).then((response) => {
    res.render("workspace/search-result", { workspace: true, layout: "layout", workspace, response });
  });
});


module.exports = router;
