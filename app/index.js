const Koa = require('koa')
const Router = require('koa-router')
const BodyParser = require('koa-body-parser')
const BlockChain = require('../dist/blockChain').BlockChain
const axios = require('axios')
const args = require('args')
args.option('port', 'The port on which the app will be running', 8999)
const flags = args.parse(process.argv)

const app = new Koa()
const router = new Router()

// 初始化blockChain
BlockChain.init(1000)

// 使用body-parser中间件
app.use(BodyParser())

// 获取所有节点
router.get('/nodes', async (ctx, next) => {
  ctx.response.body = JSON.stringify(BlockChain.getNodes())
})

// 区块链共识consensus
router.put('/nodes/consensus', async (ctx, next) => {
  let reqs = BlockChain.getNodes().map(node => axios.get(`${node.url}/blocks`))

  if (!reqs.length) {
    ctx.response.body = 'no node need to sync'
  } else {
    await axios.all(reqs).then((ress) => {
      const blockChains = ress.map(v => v.data)
      if (BlockChain.consensus(blockChains)) {
        ctx.response.body = 'get consensus'
      } else {
        ctx.response.body = 'no consensus get'
      }
    })
  }
})

// 注册节点
router.post('/node', async (ctx, next) => {
  const { id, url } = ctx.request.body
  if (!id || !url) {
    ctx.response.body = 'invalid parmeter'
  } else {
    console.log(`received data ${id} ${url}`)
    if (BlockChain.register(id, url)) {
      ctx.response.body = `register node ${id}`
    } else {
      ctx.response.body = `register node already exist`
    }
  }
})

// 获取所有区块
router.get('/blocks', async (ctx, next) => {
  ctx.response.body = JSON.stringify(BlockChain.getBlocks())
})

// 根据id获取区块
router.get('/block/:id', async (ctx, next) => {
  const { id } = ctx.params
  ctx.response.body = JSON.stringify(Number(BlockChain.getBlockById(id)))
})

// 获取所有交易
router.get('/transactions', async (ctx, next) => {
  ctx.response.body = JSON.stringify(BlockChain.getTransactions())
})

// 注册交易
router.post('/transaction', async (ctx, next) => {
  const { sendAddr, recAddr, value } = ctx.request.body
  if (!sendAddr || !recAddr || !value) {
    ctx.response.body = 'invalid parameter'
  } else {
    console.log(`receive data ${sendAddr} ${recAddr} ${value}`)
    BlockChain.submitTransaction(sendAddr, recAddr, value)
    ctx.response.body = `transactions from ${sendAddr} to ${recAddr} of ${value} successfully !`
  }
})

// 挖矿
router.get('/mine', async (ctx, next) => {
  ctx.response.body = `mine new block ${BlockChain.mine(BlockChain.getTransactions()).blockNumber}`
})


app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
  await next()
})

// add router middleware
app.use(router.routes())

app.listen(flags.port)
console.log(`app is running at port ${flags.port}`)
