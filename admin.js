let program = require('commander');
let Chain = require("./build/index.node") //在 node 环境使用 TLS 协议
let fs = require("fs")
const currentUserName = 'john' 
const userPemFolder = 'john';
const contractName = 'contractTKManager3'
const accountPassword = "Qwer@1234"
const passphrase = "Qwer@1234"

let accountKey = fs.readFileSync("./certs/" + userPemFolder + "/user.pem",{encoding: "utf8"})
let keyInfo = Chain.utils.getKeyInfo(accountKey, accountPassword)

let opt = {
    host: '47.52.68.93',  //目标区块链网络节点的 IP
    port: 18130,        //端口号
    timeout: 30000,     //连接超时时间配置
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

program.command("install")
    .description("Install new solidity smart contract")
    .action(function(){
        //部署合约，可传递初始化函数需要的参数
        myContract.new(bytecode, {
            from: currentUserName,
        }, (err, contract, data) => {
            console.log(data)
            let original_block_number = data.block_number
            console.log('original_block_number:', original_block_number)
            console.log('Please update the value of parameter "original_block_number" in admin.js to', original_block_number)
            process.exit(0)
        })
    });

program.command("update")
    .description("Update solidity smart contract")
    .action(function(){
        //更新合约
        let original_block_number = 570177
        myContract.new(bytecode, {
            from: currentUserName,
            local: true,  //本地执行合约部署，目的为了模拟合约部署获取`runtime`字节码
            block_number: original_block_number - 1, //防止合约id冲突
            }, (err, contract, data) => {
                myContract.update(data.receipt.output.replace('0x' + chain.EVM, ''), {
                }, (err, contract, data) => {
                    console.log("solidity contract has been updated")  
                    process.exit(0)
                })
            })
    });
program.command("set <userName> <companyName> <companyAddress>")
    .description("Set user information")
    .action(function(userName, companyName, companyAddress){
        process.stdout.write("Set user information")

        if(userName == null || userName == "") {
            console.error("userName cannot be null");
            process.exit(1);
        }

        var role = 3;

        switch(userName)
        {
            case 'm':
                role = 0;
                break;
            case 't1':
            case 't2':
            case 't3':
                role = 1;
                break;
            case 'r':
                role = 2;
                break;
            default:
                break;
        }

        let accountId = Chain.utils.getHash(userName);
        myContract.setUser(accountId, userName, role, companyName, companyAddress, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                console.log('output is:', output.toString())
            }         
            process.exit(0)
        })  
    })
program.command("get <userName>")
    .description("Get user information")
    .action(function(userName){
        process.stdout.write("Set user information")

        if(userName == null || userName == "") {
            console.error("userName cannot be null");
            process.exit(1);
        }
        
        let accountId = Chain.utils.getHash(userName);
        console.log("accountId:", accountId);
        myContract.getUser(accountId, {from: currentUserName}, (err, output, data) => {
            if(typeof(err) != 'undefined') {
                console.log('err is:', err)
            } else {
                var roleName = 'Admin';
                switch(output[2].toString())
                {
                    case "0":
                        roleName = 'Manufacturer';
                        break;
                    case "1":
                        roleName = 'Transporter';
                        break;
                    case "2":
                        roleName = 'Retailer';
                        break;
                }

                //console.log('output is:', output.toString())
                console.log('Identity:', output[0].toString())
                console.log('Account:', output[1])
                console.log('Role:', roleName)
                console.log('Company:', output[3])
                console.log('Address:', output[4])
            }

            process.exit(0)
        })  
    })
program.parse(process.argv);