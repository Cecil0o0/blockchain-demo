const Axios = require('axios')

const server = `http://localhost:8999`

// 提交交易
const submitTransaction = ({ sendAddr = '', recAddr = '', value = ''} = {}) => {
  return Axios.post(`${server}/transaction`, {
    sendAddr,
    recAddr,
    value
  })
}
// 查询所有交易
const getTransactions = () => {
  return Axios.get(`${server}/transactions`)
}

// 查询所有区块
const getBlocks = () => {
  return Axios.get(`${server}/blocks`)
}
// 根据blockNumber查询区块
const getBlock = (blockNumber = 0) => {
  return Axios.get(`${server}/block/${blockNumber}`)
}

// 挖矿
const mine = () => {
  return Axios.get(`${server}/mine`)
}
