const contractName = 'contractTKManager1'
const Chain = require("./build/index.node") //在 node 环境使用 TLS 协议user.pem
const fs = require("fs")
var evmCode = "";

module.exports = {
    solidityCompile: function(){
        let solc = require('@alipay/solc')
        let contract = fs.readFileSync('./TKManager.sol', {encoding: 'ascii'})
        let output = solc.compile(contract, 1)
        return output
    },
    initContract: function (userFolder, abi){
        const accountKey = fs.readFileSync("./certs/" + userFolder + "/user.pem",{encoding: "utf8"})
        const accountPassword = "Qwer@1234"
        const keyInfo = Chain.utils.getKeyInfo(accountKey, accountPassword)
        const passphrase = "Qwer@1234"
        //可打印私钥和公钥，使用 16 进制
        console.log('private key:', keyInfo.privateKey.toString('hex'))
        console.log('public key:', keyInfo.publicKey.toString('hex'))
        //配置选项
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
        evmCode = chain.EVM

        //初始化一个合约实例
        let myContract = chain.ctr.contract(contractName, abi)
        return myContract
    },
    getUserIdentity: function(userName){
        return Chain.utils.getHash(userName)
    },
    getEvmCode: function(){
        return evmCode;
    },
}