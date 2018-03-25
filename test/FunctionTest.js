import { BlockChain } from '../src/block-chain'
import { Block } from '../src/block'

// test pow
const testPow = () => {
  console.log('验证工作量')
  const block = BlockChain.getIns().genesisBlock
  const hash = Block.computeSha256(block)
  console.log('计算得到的哈希值（16进制） ：' + hash)
  console.log('工作量证明目标为（16进制） ：' + Number(BlockChain.getIns().target).toString(16))
  console.log('工作量是否有效：' + BlockChain.isPowValid(hash))
}

// test mine
const testMine = () => {
  console.log('挖矿')
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
