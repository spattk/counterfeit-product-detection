pragma solidity >=0.4.22 <0.9.0;


contract ProductTracking {
    // Model a Product
    struct Product {
        uint id;
        string name;
        string currentStatus;
    }

    event votedEvent (
        uint indexed _productId
    );

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write products
    mapping(uint => Product) public products;
    // Store Products Count
    uint public productsCount;

    constructor() public {
        addProduct("Product 1");
        addProduct("Product 2");
        addProduct("Product 3");
        addProduct("Product 4");
        addProduct("Product 5");
        addProduct("Product 6");
    }

    function addProduct (string memory _name) private {
        productsCount ++;
        products[productsCount] = Product(productsCount, _name, "IN-WAREHOUSE");
    }

    function vote (uint _productId) public {
    // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid product
        require(_productId > 0 && _productId <= productsCount);

        // record that product has been updated
        voters[msg.sender] = true;

        // update product status
        products[_productId].currentStatus = 'IN-TRANSIT';

        // trigger update event
        emit votedEvent(_productId);
    }
}