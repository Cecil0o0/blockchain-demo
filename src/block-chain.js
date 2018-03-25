/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

import { Transaction } from './transaction'
import { Block } from './block'
import { NodeAction } from './node'
import BigNumber from 'bignumber.js'
import fs from 'fs'
import path from 'path'

const COINBASE_SENDER = '<COINBASE>'
const COINBASE_REWARD = 50

const difficulty = 2
const state = {
  nodeId: 0,
  blocks: [],
  nodes: [],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, '', true),
  target: (2 ** (256 - difficulty)).toExponential(15),
  storagePath: ''
}

export const BlockChain = {
  // 初始化结点
  init: (id) => {
    state.nodeId = id
    state.storagePath = path.resolve(__dirname, '../data/', `${state.nodeId}.blockchain`)
    state.blocks.push(state.genesisBlock)
    return state
  },
  // 注册节点
  register: (id, url) => {
    if (state.nodes.find(node => node.id === id)) {
      return false
    } else {
      state.nodes.push(NodeAction.generate(id, url))
      return true
    }
  },
  // 加载存储区块链或初始化一个区块链
  load: () => {
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
  save: () => {
    const dirname = path.dirname(state.storagePath)
    if (fs.existsSync(dirname)) {
      fs.writeFileSync(state.storagePath, JSON.stringify(state.blocks), 'utf-8')
    } else {
      fs.mkdirSync(dirname)
      fs.writeFileSync(state.storagePath, JSON.stringify(state.blocks), 'utf-8')
    }
  },
  // 验证区块链是否合法
  verify: (blocks) => {
    try {
      if (!blocks.length) {
        throw new Error('blocks can\'t be empty !')
      }
      if (JSON.stringify(state.genesisBlock) !== JSON.stringify(blocks[0])) {
        throw new Error('genesis block data error !')
      }
      blocks.forEach((item, index) => {
        if (index === 0) {
          // 跳过初代区块
        } else {
          // 验证上一个区块
          if (item.prevBlock !== Block.computeSha256(blocks[index - 1])) {
            throw new Error('invalid prev block sha256')
          }
          // 验证该区块工作量
          if (!BlockChain.isPowValid(Block.computeSha256(item))) {
            throw new Error('invalid PoW')
          }
        }
      })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },
  // 获取state实例
  getIns: () => {
    return state
  },
  // 提交交易
  submitTransaction: (send, rec, val) => {
    state.transactionPool.push(Transaction.generate(send, rec, val))
  },
  // 清除交易
  clearTransactions: () => {
    state.transactionPool = []
  },
  // 获取交易池
  getTransactions: () => {
    return state.transactionPool
  },
  // 获取所有区块
  getBlocks: () => {
    return state.blocks
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
  // 获取所有节点
  getNodes: () => {
    return state.nodes.slice()
  },
  // 验证工作量
  isPowValid: (pow) => {
    try {
      if (!pow.startsWith('0x')) {
        pow = '0x' + pow
      }
      pow = Number(pow).toExponential(15)
      return new BigNumber(pow).isLessThanOrEqualTo(state.target)
    } catch (e) {
      console.log(e)
      return false
    }
  },
  // 挖矿
  mine: (transactions = []) => {
    let prevBlock = state.blocks.slice(-1)[0] || {}

    transactions = [Transaction.generate(COINBASE_SENDER, state.nodeId, COINBASE_REWARD), ...transactions]

    const newBlock = Block.generate(prevBlock.blockNumber !== undefined ? prevBlock.blockNumber + 1 : 0, transactions.slice(), 0, Block.computeSha256(prevBlock))
    while (true) {
      let hash = Block.computeSha256(newBlock)
      console.log(`mine with nonce ${newBlock.nonce}`)
      if (BlockChain.isPowValid(hash)) {
        console.log('found valid pow', hash)
        break
      }
      newBlock.nonce ++
    }

    state.blocks.push(newBlock)
    state.transactionPool = []
    return newBlock
  },
  // 区块链共识
  consensus: (blockChains) => {
    let maxLength = 0,
      candidateIndex = -1
    blockChains.forEach((item, index) => {
      if (item.length > maxLength && BlockChain.verify(item)) {
        maxLength = item.length
        candidateIndex = index
      }
    })

    if (candidateIndex > -1 && (maxLength >= state.blocks.length || !BlockChain.verify(state.blocks))) {
      state.blocks = [...blockChains[candidateIndex]]
      BlockChain.save()
      return true
    }

    return false
  }
}
