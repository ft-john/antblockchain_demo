const MyChain = require('./build/index.node')

if (typeof window !== 'undefined' && !window.MyChain) {
  window.MyChain = MyChain
}
module.exports = MyChain
