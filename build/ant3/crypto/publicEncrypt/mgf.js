"use strict";var createHash=require("create-hash"),Buffer=require("safe-buffer").Buffer;function i2ops(e){var r=Buffer.allocUnsafe(4);return r.writeUInt32BE(e,0),r}module.exports=function(e,r){for(var a,f=Buffer.alloc(0),t=0;f.length<r;)a=i2ops(t++),f=Buffer.concat([f,createHash("sha256").update(e).update(a).digest()]);return f.slice(0,r)};