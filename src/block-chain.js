/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

import { Transaction } from './transaction'
import { Block } from './block'
import BigNumber from 'bignumber.js'
import stored from './stored.json'
import fs from 'fs'

const difficulty = 4
const state = {
  nodeId: 0,
  blocks: stored || [],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, ''),
  target: 2 ** (256 - difficulty)
}

export const BlockChain = {
  init (id) {
    state.nodeId = id
    return this.getIns()
  },
  submitTransaction: (send, rec, val) => {
    state.transactionPool.push(Transaction.generate(send, rec, val))
  },
  clearTransactions () {
    state.transactionPool = 0
  },
  getIns () {
    return state
  },
  append (block) {
    state.blocks.push(block)
    fs.writeFileSync('stored.json', JSON.stringify(state.blocks), {
      flag: 'w'
    })
  },
  isPowValid (pow) {
    try {
      if (!pow.startswitch('0x')) {
        pow = '0x' + pow
      }
      return new BigNumber(pow).lessThanOrEqual(target)
    } catch (e) {
      return false
    }
  },
  mine (transactions = []) {
    let prevBlock = state.blocks.slice(-1)[0] || {}
    const newBlock = Block.generate(prevBlock.blockNumber !== undefined ? prevBlock.blockNumber + 1 : 0, transactions.slice(), 0, Block.computeSha256(prevBlock))
    while (true) {
      let hash = Block.computeSha256(newBlock)
      console.log(`mine with nonce ${newBlock.nonce}`)
      if (this.isPowValid(hash) || newBlock.nonce > 4) {
        console.log('found valid pow', hash)
        break
      }
      newBlock.nonce ++
    }

    this.append(newBlock)
    this.clearTransactions()
    console.log(this.getIns().blocks)
    return newBlock
  }
}
