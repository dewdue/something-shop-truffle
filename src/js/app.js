App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load weeds.
    $.getJSON('../weeds.json', function(data) {
      var weedsRow = $('#weedsRow');
      var weedTemplate = $('#weedTemplate');

      for (i = 0; i < data.length; i ++) {
        weedTemplate.find('.weed-id').text(data[i].id);
        weedTemplate.find('.panel-title').text(data[i].name);
        weedTemplate.find('img').attr('src', data[i].picture);
        weedTemplate.find('.weed-dominant').text(data[i].dominant);
        weedTemplate.find('.weed-THC').text(data[i].THC);
        weedTemplate.find('.weed-CBD').text(data[i].CBD);
        weedTemplate.find('.weed-by').text(data[i].by);
        weedTemplate.find('.weed-price').text(data[i].price);
        
        weedTemplate.find('.btn-buy').attr('data-id', data[i].id).attr('data-price', data[i].price);

        weedsRow.append(weedTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },


  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted weeds
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleAdopt);
    
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-weed').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var weedId = parseInt($(event.target).data('id'));
    var weedPrice = parseInt($(event.target).data('price'));

    var adoptionInstance;

    
    let gram = document.querySelector("#gram_input").value;
    if(gram==""){setAlert("Please enter the correct amount!","danger");return;}
      window.ethereum.request({
        method:"eth_sendTransaction",
        params: [{
            from:window.ethereum.selectedAddress,
            to:"0xFc102e94230788513F71579B4B863d8fF89BeB25",
            value:convertToWei(Number(gram))// 1eth = 10^18 wei
        }]
    })
    
    
    function convertToWei(gram){
      var eth = (gram*weedPrice)/3000
      return "0x"+Number(eth*1e+18).toString(16);
    };

    function setAlert(txt,alertColor){
      let alertBox = document.querySelector("#alert_box");
      alertBox.style = "display:block";
      alertBox.innerHTML = txt;
      alertBox.className = "alert alert-"+alertColor;
    };

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(weedId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});






