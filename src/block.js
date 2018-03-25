/**
 * Block
 * @blockNumber: 区块id
 * @transaction: 交易记录列表
 */
import sha from 'js-sha256'

const state = {
  blockNumber: 0,
  transactions: [],
  nonce: 0,
  prevBlock: '',
  timestamp: Date.now()
}

export const Block = {
  generate: (blockNumber, transactions, nonce, prevBLock, isGenisis = false) => {
    state.blockNumber = blockNumber
    state.transactions = JSON.stringify(transactions)
    state.nonce = nonce
    state.prevBlock = prevBLock
    state.timestamp = isGenisis ? new Date('2018-03-25 2:20').getTime() : Date.now()
    return Object.assign({}, state)
  },
  computeSha256: state => {
    return sha.sha256(JSON.stringify(state))
  }
}
