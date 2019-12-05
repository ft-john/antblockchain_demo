let program = require('commander');
let Chain = require("./build/index.node") //在 node 环境使用 TLS 协议
let fs = require("fs")
const currentUserName = 'm' 
const userPemFolder = 'manufacturer';
const contractName = 'contractTKManager3'
const accountPassword = "Qwer@1234"
const passphrase = "Qwer@1234"

let accountKey = fs.readFileSync("./certs/" + userPemFolder + "/user.pem",{encoding: "utf8"})
let keyInfo = Chain.utils.getKeyInfo(accountKey, accountPassword)

let opt = {
    host: '47.52.68.93',  //目标区块链网络节点的 IP
    port: 18130,        //端口号
    timeout: 30000,     //连接超时时间配置
    //tx_querytime: 1000000,
    cert: fs.readFileSync('./certs/client.crt', {encoding: 'utf8'}),
    ca: fs.readFileSync('./certs/ca.crt', {encoding: 'utf8'}),
    key: fs.readFileSync("./certs/client.key", {encoding: "utf8"}),
    userPublicKey: keyInfo.publicKey,
    userPrivateKey: keyInfo.privateKey,
    userRecoverPublicKey: keyInfo.publicKey,
    userRecoverPrivateKey: keyInfo.privateKey,
    passphrase: passphrase
}

//初始化一个连接实例
let chain = Chain(opt)
let solc = require('@alipay/solc')

let contract = fs.readFileSync('./TKManager.sol', {encoding: 'ascii'})
// 第二个参数设定为"1"，会开启编译优化 optimiser
let output = solc.compile(contract, 1)
let abi = JSON.parse(output.contracts[':TKManager'].interface)
let bytecode = output.contracts[':TKManager'].bytecode
let myContract = chain.ctr.contract(contractName, abi)

program.command("AddProduct <productName> <modelName> [description]")
    .description("Add a new product")
    .action(function(productName, modelName, description){
        process.stdout.write("Add a new product")

        if(modelName == null || modelName == "") {
            console.error("modelName cannot be null");
            process.exit(1);
        }

        
        myContract.AddProduct(productName, modelName, description, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                console.log('output is:', output.toString())
            }         
            process.exit(0)
        })  
    })

program.command("AddBatch <batchNumber> <modelName> <quantity>")
    .description("Add a new product batch")
    .action(function(batchNumber, modelName, quantity){
        process.stdout.write("Add a new product batch")

        if(modelName == null || modelName == "") {
            console.error("modelName cannot be null");
            process.exit(1);
        }

        
        myContract.AddBatch(batchNumber, modelName, parseInt(quantity), {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                console.log('output is:', output.toString())
            }         
            process.exit(0)
        })  
    })
program.command("CreateOrder <batchNumber> <orderNumber> <manufacturerName> <retailerName>")
    .description("Create a new order")
    .action(function(batchNumber, orderNumber, manufacturerName, retailerName){
        process.stdout.write("Create a new order")

        if(orderNumber == null || orderNumber == "") {
            console.error("orderNumber cannot be null");
            process.exit(1);
        }

        if(batchNumber == null || batchNumber == "") {
            console.error("batchNumber cannot be null");
            process.exit(1);
        }
        
        
        myContract.CreateOrder(batchNumber, orderNumber, manufacturerName, retailerName, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                console.log('output is:', output.toString())
            }

            process.exit(0)
        })  
    })

    program.command("OrderQuery <orderNumber>")
    .description("Query order status")
    .action(function(orderNumber){
        process.stdout.write("Query order status")

        if(orderNumber == null || orderNumber == "") {
            console.error("orderNumber cannot be null");
            process.exit(1);
        }

        
        myContract.OrderQuery(orderNumber, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                var statusName = 'created';
                switch(output[3].toString())
                {
                    case "1":
                        statusName = 'transporting';
                        break;
                    case "2":
                        statusName = 'finished';
                        break;
                }
                //console.log('output is:', output.toString())
                console.log('orderNumber:', output[0]);
                console.log('manufacturerName:', output[1])
                console.log('retailerName:', output[2])
                console.log('state:', statusName)
                console.log('batchNumber:', output[4])
                console.log('modelNumber:', output[5])
                console.log('quantity:', output[6].toString())
                console.log('timestamp:', output[7].toString())

            }         
            process.exit(0)
        })  
    })

program.command("GetTrackerSize <batchNumber>")
    .description("Get totally track size from product history")
    .action(function(batchNumber){
        process.stdout.write("Track the product history")

        if(batchNumber == null || batchNumber == "") {
            console.error("batchNumber cannot be null");
            process.exit(1);
        }

      
        myContract.GetProductTrackingDataSize(batchNumber, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                console.log("Totally track size is", output.toString())
            }         
            process.exit(0)
        })  
    })

    program.command("GetTrackerData <batchNumber> <trackerIndex>")
    .description("Get one product tracker record from product history")
    .action(function(batchNumber, trackerIndex){
       console.log("Start get product tracker data (inex:", trackerIndex + ")")

        if(batchNumber == null || batchNumber == "") {
            console.error("batchNumber cannot be null");
            process.exit(1);
        }

        if(trackerIndex < 0){
            console.error("trackerIndex must be equal or greater than 0");
            process.exit(1);
        }

        myContract.GetProductTracking(batchNumber, trackerIndex, {from: currentUserName}, (err, output, data) => {
            //console.log('data:',data);
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
                return;
            } else{
                var statusName = 'created';
                switch(output[1].toString())
                {
                    case "1":
                        statusName = 'transporting';
                        break;
                    case "2":
                        statusName = 'finished';
                        break;
                }

                console.log('batchNumber:', batchNumber)            
                console.log('orderNumber:', output[0])
                console.log('status:', statusName)
                console.log('timestamp:', output[2].toString())
                console.log('userAccount:', output[3])
                console.log('company:', output[4])
                console.log('address:', output[5])    
                
                process.exit(0);
            }
        }); 
    })

program.parse(process.argv);