const MyChain = require('./build/index')

if (typeof window !== 'undefined' && !window.MyChain) {
  window.MyChain = MyChain
}
module.exports = MyChain
