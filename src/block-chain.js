/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

import { Transaction } from './transaction'
import { Block } from './block'
import BigNumber from 'bignumber.js'
import fs from 'fs'
import path from 'path'

const difficulty = 4
const state = {
  nodeId: 0,
  blocks: [
    Block.generate(100, [], 0, '')
  ],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, ''),
  target: 2 ** (256 - difficulty),
  storagePath: ''
}

export const BlockChain = {
  // 初始化结点
  init (id) {
    state.nodeId = id
    state.storagePath = path.resolve(__dirname, '../data/', `${state.nodeId}.blockchain`)
    return state
  },
  // 加载存储区块链或初始化一个区块链
  load () {
    try {
      state.blocks = JSON.parse(fs.readFileSync(state.storagePath, 'utf-8'))
    } catch (e) {
      console.log('读取失败，初始化区块链')
      state.blocks = [state.genesisBlock]
    } finally {
      BlockChain.verify()
    }
  },
  // 存储区块链到本地
  save () {
    fs.writeFileSync(state.storagePath, JSON.stringify(state.blocks), 'utf-8')
  },
  // 验证区块链是否合法
  verify () {
    if (!state.blocks.length) {
      console.log('区块链不能为空')
    }
    if (JSON.stringify(state.genesisBlock) !== JSON.stringify(state.blocks[0])) {
      throw new Error('初代区块链数据有误')
    }
    state.blocks.forEach((item, index) => {
      // 验证上一个区块
      if (index > 0 && item.prevBlock !== Block.computeSha256(state.blocks[index - 1])) {
        throw new Error('非法的上一级区块')
      }
      //
      if (!BlockChain.idPowValid(Block.computeSha256(item))) {
        throw new Error('无效的PoW')
      }
    })
  },
  // 获取state实例
  getIns () {
    return state
  },
  // 提交交易
  submitTransaction: (send, rec, val) => {
    state.transactionPool.push(Transaction.generate(send, rec, val))
  },
  // 清除交易
  clearTransactions () {
    state.transactionPool = 0
  },
  // 获取交易池
  getTransactions: () => {
    return state.transactionPool.slice()
  },
  // 获取所有区块
  getBlocks: () => {
    return state.blocks.slice()
  },
  // 获取单个区块
  getBlockById: (id) => {
    if (isNaN(Number(id))) {
      return {}
    } else {
      id = +id
    }
    if (+id < state.blocks.length) {
      return state.blocks[id]
    } else {
      return {}
    }
  },
  // 添加区块链
  append (block) {
    state.blocks.push(block)
    // fs.writeFileSync('stored.json', JSON.stringify(state.blocks), {
    //   flag: 'w'
    // })
  },
  // 验证工作量
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
  // 挖矿
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
    return newBlock
  }
}
