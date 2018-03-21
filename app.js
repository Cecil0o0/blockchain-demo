const Koa = require('koa')
const Router = require('koa-router')
const BodyParser = require('koa-body-parser')
const BlockChain = require('./dist/blockChain').BlockChain

const app = new Koa()
const router = new Router()

// 初始化blockChain
BlockChain.init(1000)

app.use(BodyParser())

router.get('/blocks', async (ctx, next) => {
  ctx.response.body = JSON.stringify(BlockChain.getBlocks())
})

router.get('/block/:id', async (ctx, next) => {
  const { id } = ctx.params
  ctx.response.body = JSON.stringify(Number(BlockChain.getBlockById(id)))
})

router.get('/transactions', async (ctx, next) => {
  ctx.response.body = JSON.stringify(BlockChain.getTransactions())
})

router.get('/transaction', async (ctx, next) => {
  const { sendAddr, recAddr, value } = ctx.query
  if (!sendAddr || !recAddr || !value) {
    ctx.response.body = 'invalid parameter'
  } else {
    console.log(`receive data ${sendAddr} ${recAddr} ${value}`)
    BlockChain.submitTransaction(sendAddr, recAddr, value)
    ctx.response.body = `transactions from ${sendAddr} to ${recAddr} of ${value} successfully !`
  }
})

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

app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
  await next()
})

// add router middleware
app.use(router.routes())

app.listen(8999)
