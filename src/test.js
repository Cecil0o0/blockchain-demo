import { BlockChain } from './block-chain'
import { Block } from './block'

// test pow
const testPow = () => {
  const block = BlockChain.getIns().genesisBlock
  const hash = Block.computeSha256(block)
  console.log(hash)
  console.log(Number(BlockChain.getIns().target).toString(16))
  console.log(BlockChain.isPowValid(hash))
}

// test mine
const testMine = () => {
  const bc = BlockChain.init(1000)

  BlockChain.submitTransaction('甲', '乙', 1)
  BlockChain.submitTransaction('丙', '丁', .5)
  BlockChain.submitTransaction('甲', '丁', .5)

  BlockChain.mine(bc.transactionPool)
}

testPow()
testMine()

export {
  testPow,
  testMine
}
