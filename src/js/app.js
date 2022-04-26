App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("ProductTracking.json", function(productTracking) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.ProductTracking = TruffleContract(productTracking);
      // Connect provider to interact with contract
      App.contracts.ProductTracking.setProvider(App.web3Provider);
  
      App.listenForEvents();
  
      return App.render();
    });
  },

  render: function() {
    var productTrackingInstance;
    var loader = $("#loader");
    var content = $("#content");
  
    loader.show();
    content.hide();

    if(web3.currentProvider.enable){
      //For metamask
      web3.currentProvider.enable().then(function(acc){
          App.account = acc[0];
          $("#accountAddress").html("Your Account: " + App.account);
      });
    } else{
      App.account = web3.eth.accounts[0];
      $("#accountAddress").html("Your Account: " + App.account);
    }
  
    // Load contract data
    App.contracts.ProductTracking.deployed().then(function(instance) {
      productTrackingInstance = instance;
      return productTrackingInstance.productsCount();
    }).then(function(productsCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
  
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
  
      for (var i = 1; i <= productsCount; i++) {
        productTrackingInstance.products(i).then(function(product) {
          var id = product[0];
          var name = product[1];
          var voteCount = product[2];
          // if(voteCount == 0)
          //   voteCount = 'IN-WAREHOUSE';
          // else if(voteCount > 0)
          //   voteCount = 'IN-TRANSIT';
  
          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
  
          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return productTrackingInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        //$('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function(e) {
    console.log("reaching");
    var candidateId = $('#candidatesSelect').val();
    App.contracts.ProductTracking.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  listenForEvents: function() {
    App.contracts.ProductTracking.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});