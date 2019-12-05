pragma solidity ^0.4.20;
pragma experimental ABIEncoderV2;
///
contract TKManager {
    enum UserRole {
        manufacturer,
        transporter,
        retailer,
        admin
    }

    enum OrderState {
        created,
        transporting,
        finished
    }

    struct User {
        identity account;
        string name;
        UserRole role;
        string companyName;
        string companyAddress;
    }

    struct Product {
        string name;
        string modelNumber;
        string manufacturerName;
        string description;
    }

    struct Batch {
        string batchNumber;
        string modelNumber;
        uint32 quantity;
        uint256 timestamp;
    }

    struct Order {
        string orderNumber;
        string manufacturerName;
        string retailerName;
        OrderState state;
        string batchNumber;
        string modelNumber;
        uint32 quantity;
        uint256 timestamp;
    }

    struct OrderStatus {
        string orderNumber;
        OrderState status;
        uint256 timestamp;
        string userAccount;
        string companyName;
        string companyAddress;
    }

    struct Inventory {
        string batchNumber;
        string modelNumber;
        string orderNumber;
        uint64 quantity;
        uint256 timestamp;
    }

    struct SaleRecord {
        string batchNumber;
        string modelNumber;
        uint64 quantity;
        uint256 timestamp;
        string userAccount;
    }

    struct MyOrderStatus {
        mapping(uint => OrderStatus) statusList;
        uint statusSize;
    }

    struct MySoldList {
        mapping(uint => SaleRecord) saleRecordList;
        uint soldSize;
    }


    identity admin; 
    mapping(identity => User) userList;
    mapping(string => Product) productList;
    mapping(string => Batch) batchList;
    mapping(string => Order) orderList;
    mapping(string => string) batchOrderList;
    mapping(string => MyOrderStatus) myOrderStatusList;
    mapping(identity => mapping(string => Inventory)) inventoryList;
    mapping(identity => mapping(string => MySoldList)) mySoldList;

    constructor() public{
        admin = msg.sender;
    }


    // modifier
    modifier onlyAdmin() {
        require(msg.sender == admin,"Permission denied");
        _;
    }

    modifier onlyValidUser() {
        require(keccak256(userList[msg.sender].name) != keccak256(""), "Invalid user");
        _;
    }

    modifier onlyRetailer() {
        require(keccak256(userList[msg.sender].name) != keccak256("") && userList[msg.sender].role == UserRole.retailer, "Permission denied");
        _;
    }

    function setUser(identity _account, string _name, UserRole _role, string _companyName, string _companyAddress) public onlyAdmin returns(identity) {
        userList[_account] = User(_account, _name, _role, _companyName, _companyAddress);
        return _account;
    }

    function getUser(identity _account) public onlyAdmin returns(identity, string, UserRole, string, string) {
        var user = userList[_account];
        return (user.account, user.name, user.role, user.companyName, user.companyAddress);
        //return (user.name);
    }

    function AddProduct(string _name, string _modelNumber, string _description) public returns(bool) {
        var user = userList[msg.sender];
        productList[_modelNumber] = Product(_name, _modelNumber, user.companyName, _description);

        return true;
    }

    function AddBatch(string _batchNumber, string _modelNumber, uint32 _quantity) public returns(bool) {
        require(keccak256(productList[_modelNumber].name) != keccak256(""), "Product is not existed");
        batchList[_batchNumber].batchNumber = _batchNumber;
        batchList[_batchNumber].modelNumber = _modelNumber;
        batchList[_batchNumber].quantity = _quantity;
        batchList[_batchNumber].timestamp = now;
        return true;
    }

    function CreateOrder(string _batchNumber, string _orderNumber, string _manufacturerName, string _retailerName) public returns(bool) {
        var user = userList[msg.sender];
        var batch = batchList[_batchNumber];
        require(keccak256(batch.modelNumber) != keccak256(""), "Batch is not existed");

        orderList[_orderNumber].orderNumber = _orderNumber;
        orderList[_orderNumber].batchNumber = _batchNumber;
        orderList[_orderNumber].modelNumber = batch.modelNumber;
        orderList[_orderNumber].quantity = batch.quantity;
        orderList[_orderNumber].manufacturerName = _manufacturerName;
        orderList[_orderNumber].retailerName = _retailerName;
        orderList[_orderNumber].state = OrderState.created;
        orderList[_orderNumber].timestamp = now;

        batchOrderList[_batchNumber] = _orderNumber;
        var size = myOrderStatusList[_orderNumber].statusSize;
        myOrderStatusList[_orderNumber].statusList[size] = OrderStatus(_orderNumber, OrderState.created, now, user.name, user.companyName, user.companyAddress);
        myOrderStatusList[_orderNumber].statusSize++;
        return true;
    }

    function OrderTransport(string _orderNumber) public returns(bool) {
        var user = userList[msg.sender];
        //require(order.state < OrderState.finished, "Order has been finished");
        orderList[_orderNumber].state = OrderState.transporting;
        orderList[_orderNumber].timestamp = now;

        var newStatus = OrderStatus(_orderNumber, OrderState.transporting, now, user.name, user.companyName, user.companyAddress);
        var size = myOrderStatusList[_orderNumber].statusSize;
        myOrderStatusList[_orderNumber].statusList[size] = newStatus;
        myOrderStatusList[_orderNumber].statusSize++;
        return true;
    }

    function OrderSignin(string _orderNumber) public returns(bool) {
        var user = userList[msg.sender];
        var order = orderList[_orderNumber];
        require(order.state < OrderState.finished, "Order has been finished");

        if (user.role != UserRole.retailer) {
            orderList[_orderNumber].state = OrderState.transporting;
            orderList[_orderNumber].timestamp = now;
            orderList[_orderNumber] = order;
        } else {          
            orderList[_orderNumber].state = OrderState.finished;
            orderList[_orderNumber].timestamp = now;

            var inventory = Inventory(order.batchNumber, order.modelNumber, order.orderNumber, order.quantity, now);
            inventoryList[msg.sender][order.batchNumber] = inventory;
        }

        var newStatus = OrderStatus(_orderNumber, OrderState.finished, now, user.name, user.companyName, user.companyAddress);
        var size = myOrderStatusList[_orderNumber].statusSize;
        myOrderStatusList[_orderNumber].statusList[size] = newStatus;
        myOrderStatusList[_orderNumber].statusSize++;

        return true;
    }

    function ProductSold(string _batchNumber, uint64 quantity) public returns(bool) {
        var inventory = inventoryList[msg.sender][_batchNumber];
        require(inventory.quantity >= quantity, "Insufficient inventory ");
        inventoryList[msg.sender][_batchNumber].quantity -= quantity;

        var user = userList[msg.sender];
        var saleRecord = SaleRecord(inventory.batchNumber, inventory.modelNumber, quantity, now, user.name);
        var size = mySoldList[msg.sender][_batchNumber].soldSize;
        mySoldList[msg.sender][_batchNumber].saleRecordList[size] = saleRecord;
        mySoldList[msg.sender][_batchNumber].soldSize++;

       return true;
    }

    function InventoryQuery(string _batchNumber) public returns(uint64) {
        return inventoryList[msg.sender][_batchNumber].quantity;
    }

    function OrderQuery(string _orderNumber) public returns(string, string, string, OrderState, string, string, uint32, uint256) {
        var order = orderList[_orderNumber];
        return (order.orderNumber, order.manufacturerName, order.retailerName, order.state, 
        order.batchNumber, order.modelNumber, order.quantity, order.timestamp);
    }

    function GetProductTrackingDataSize(string _batchNumber) public returns(uint) {
        var orderNumber = batchOrderList[_batchNumber];
        return myOrderStatusList[orderNumber].statusSize;
    }

    function GetProductTracking(string _batchNumber, uint trackIndex) public returns(string,OrderState,uint256,string,string,string) {
        var orderNumber = batchOrderList[_batchNumber];
        var status = myOrderStatusList[orderNumber].statusList[trackIndex];
        return(status.orderNumber, status.status, status.timestamp, 
        status.userAccount, status.companyName, status.companyAddress);
    }
}