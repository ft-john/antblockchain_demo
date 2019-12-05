"use strict";var _require=require("./rlpBase"),hash=_require.hash,timestamp=_require.timestamp,gas_used=_require.gas_used,version=_require.version,block_number={name:"block_number",type:"decimal"},parent_hash={name:"parent_hash",type:"hash"},transaction_root={name:"transaction_root",type:"bytes"},receipt_root={name:"receipt_root",type:"bytes"},state_root={name:"state_root",type:"bytes"},log_bloom={name:"log_bloom",type:"bytes"},transaction_list={name:"transaction_list"},receipt_list={name:"receipt_list"},consensus_proof={name:"consensus_proof",type:"bytes"},BlockHeader=[hash,version,block_number,parent_hash,transaction_root,receipt_root,state_root,gas_used,timestamp,log_bloom];BlockHeader.name="block_header";var BlockBody=[transaction_list,receipt_list,consensus_proof];BlockBody.name="block_body";var Block=[BlockHeader,BlockBody];Block.name="block",module.exports={block_number:block_number,parent_hash:parent_hash,transaction_root:transaction_root,receipt_root:receipt_root,state_root:state_root,log_bloom:log_bloom,transaction_list:transaction_list,receipt_list:receipt_list,consensus_proof:consensus_proof,BlockHeader:BlockHeader,BlockBody:BlockBody,Block:Block};