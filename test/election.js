var ProductTracking = artifacts.require("./ProductTracking.sol");

contract("ProductTracking", function (accounts) {
  var productTrackingInstance;

  it("initializes with six Products", function () {
    return ProductTracking.deployed()
      .then(function (instance) {
        return instance.productsCount();
      })
      .then(function (count) {
        assert.equal(count, 6);
      });
  });

  it("it initializes the prducts with the correct values", function () {
    return ProductTracking.deployed()
      .then(function (instance) {
        productTrackingInstance = instance;
        return productTrackingInstance.products(1);
      })
      .then(function (product) {
        assert.equal(product[0], 1, "contains the correct id");
        assert.equal(product[1], "Product 1", "contains the correct name");
        assert.equal(product[2], 'IN-WAREHOUSE', "contains the correct state value");
        return productTrackingInstance.products(2);
      })
  });

  it("allows a voter to cast a vote", function () {
    return ProductTracking.deployed()
      .then(function (instance) {
        productTrackingInstance = instance;
        productId = 1;
        return productTrackingInstance.vote(productId, { from: accounts[0] });
      })
      .then(function (receipt) {
        return productTrackingInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, "the voter was marked as voted");
        return productTrackingInstance.products(productId);
      })
      .then(function (product) {
        var productState = product[2];
        assert.equal(productState, 'IN-TRANSIT', "increments the produc's vote count");
      });
  });

  it("throws an exception for invalid products", function () {
    return ProductTracking.deployed()
      .then(function (instance) {
        productTrackingInstance = instance;
        return productTrackingInstance.vote(99, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return productTrackingInstance.products(1);
      })
      .then(function (product1) {
        var productState = product1[2];
        assert.equal(productState, 'IN-WAREHOUSE', "product 1 did not receive any votes");
        return productTrackingInstance.products(2);
      })
      .then(function (product2) {
        var productState = product2[2];
        assert.equal(productState, 'IN-WAREHOUSE', "product 2 did not receive any votes");
      });
  });

  it("allows a voter to cast a vote", function () {
    return ProductTracking.deployed()
      .then(function (instance) {
        productTrackingInstance = instance;
        productId = 1;
        return productTrackingInstance.vote(productId, { from: accounts[0] });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "an event was triggered");
        assert.equal(
          receipt.logs[0].event,
          "votedEvent",
          "the event type is correct"
        );
        assert.equal(
          receipt.logs[0].args._productId.toNumber(),
          productId,
          "the product id is correct"
        );
        return productTrackingInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, "the voter was marked as voted");
        return productTrackingInstance.products(productId);
      })
      .then(function (product) {
        var productState = product[2];
        assert.equal(productState, 'IN-TRANSIT', "increments the product's vote count");
      });
  });
});
