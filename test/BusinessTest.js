const axios = require('axios')

const node1 = 'A',
  node1_url = `http://127.0.0.1:3001`
  node2 = 'B',
  node2_url = `http://127.0.0.1:3002`

// 向节点1注册节点2
axios.post(node1_url + '/node', {
  id: node1,
  url: node1_url
})

// 向节点2注册节点1
axios.post(node2_url + '/node', {
  id: node1,
  url: node1_url
})


axios.get(node1_url + '/blocks').then(res => {
  console.log(res.data)
})

axios.get(node1_url + '/transactions').then(res => {
  console.log(res.data)
})

// 向节点1请求创建交易
axios.post(node1_url + '/transaction', {
  sendAddr: '小A',
  recAddr: '小B',
  value: 1
}).then(res => {
  console.log(res.data)
})

// 向节点1请求挖矿三次
axios.get(node1_url + '/mine').then(res => {
  console.log(res.data)
})

axios.get(node1_url + '/mine').then(res => {
  console.log(res.data)
})

axios.get(node1_url + '/mine').then(res => {
  console.log(res.data)
})

// 节点A同步区块链
axios.put(node1_url + '/nodes/consensus').then(res => {
  console.log(res.data)
  axios.get(node1_url + '/blocks').then(res => {
    console.log(res.data)
  })
})

// 节点B同步区块链
axios.put(node2_url + '/nodes/consensus').then(res => {
  console.log(res.data)
  axios.get(node2_url + '/blocks').then(res => {
    console.log(res.data)
  })
})
