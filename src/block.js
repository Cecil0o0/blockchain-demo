/**
 * Block
 * @blockNumber: 区块id
 * @transaction: 交易记录列表
 */
import sha from 'js-sha256'

const state = {
  blockNumber: 0,
  transactions: [],
  timestamp: Date.now(),
  nonce: 0,
  prevBlock: ''
}

export const Block = {
  generate: (blockNumber, transactions, nonce, prevBLock) => {
    state.blockNumber = blockNumber
    state.transactions = transactions
    state.timestamp = Date.now()
    state.nonce = nonce
    state.prevBlock = prevBLock
    return Object.assign({}, state)
  },
  computeSha256: state => {
    return sha.sha256(JSON.stringify(state))
  }
}
