'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sha = _interopDefault(require('js-sha256'));
var BigNumber = _interopDefault(require('bignumber.js'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

/**
 * Transaction
 * @receipientAddr: 收款人地址
 * @senderAddr: 付款人地址
 * @value: 交易金额
 */

var state = {
  receipientAddr: '',
  senderAddr: '',
  value: 0
};

var Transaction = {
  generate: function generate(rec, sen, val) {
    state.receipientAddr = rec;
    state.senderAddr = sen;
    state.value = val;
    return Object.assign({}, state);
  }
};

/**
 * Block
 * @blockNumber: 区块id
 * @transaction: 交易记录列表
 */

var state$1 = {
  blockNumber: 0,
  transactions: [],
  timestamp: Date.now(),
  nonce: 0,
  prevBlock: ''
};

var Block = {
  generate: function generate(blockNumber, transactions, nonce, prevBLock) {
    state$1.blockNumber = blockNumber;
    state$1.transactions = transactions;
    state$1.timestamp = Date.now();
    state$1.nonce = nonce;
    state$1.prevBlock = prevBLock;
    return Object.assign({}, state$1);
  },
  computeSha256: function computeSha256(state) {
    return sha.sha256(JSON.stringify(state));
  }
};

/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

var difficulty = 4;
var state$2 = {
  nodeId: 0,
  blocks: [Block.generate(100, [], 0, '')],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, ''),
  target: Math.pow(2, 256 - difficulty),
  storagePath: ''
};

var BlockChain = {
  // 初始化结点
  init: function init(id) {
    state$2.nodeId = id;
    state$2.storagePath = path.resolve(__dirname, '../data/', state$2.nodeId + '.blockchain');
    return state$2;
  },

  // 加载存储区块链或初始化一个区块链
  load: function load() {
    try {
      state$2.blocks = JSON.parse(fs.readFileSync(state$2.storagePath, 'utf-8'));
    } catch (e) {
      console.log('读取失败，初始化区块链');
      state$2.blocks = [state$2.genesisBlock];
    } finally {
      BlockChain.verify();
    }
  },

  // 存储区块链到本地
  save: function save() {
    fs.writeFileSync(state$2.storagePath, JSON.stringify(state$2.blocks), 'utf-8');
  },

  // 验证区块链是否合法
  verify: function verify() {
    if (!state$2.blocks.length) {
      console.log('区块链不能为空');
    }
    if (JSON.stringify(state$2.genesisBlock) !== JSON.stringify(state$2.blocks[0])) {
      throw new Error('初代区块链数据有误');
    }
    state$2.blocks.forEach(function (item, index) {
      // 验证上一个区块
      if (index > 0 && item.prevBlock !== Block.computeSha256(state$2.blocks[index - 1])) {
        throw new Error('非法的上一级区块');
      }
      //
      if (!BlockChain.idPowValid(Block.computeSha256(item))) {
        throw new Error('无效的PoW');
      }
    });
  },

  // 获取state实例
  getIns: function getIns() {
    return state$2;
  },

  // 提交交易
  submitTransaction: function submitTransaction(send, rec, val) {
    state$2.transactionPool.push(Transaction.generate(send, rec, val));
  },
  // 清除交易
  clearTransactions: function clearTransactions() {
    state$2.transactionPool = 0;
  },

  // 获取交易池
  getTransactions: function getTransactions() {
    return state$2.transactionPool.slice();
  },
  // 获取所有区块
  getBlocks: function getBlocks() {
    return state$2.blocks.slice();
  },
  // 获取单个区块
  getBlockById: function getBlockById(id) {
    if (isNaN(Number(id))) {
      return {};
    } else {
      id = +id;
    }
    if (+id < state$2.blocks.length) {
      return state$2.blocks[id];
    } else {
      return {};
    }
  },
  // 添加区块链
  append: function append(block) {
    state$2.blocks.push(block);
    // fs.writeFileSync('stored.json', JSON.stringify(state.blocks), {
    //   flag: 'w'
    // })
  },

  // 验证工作量
  isPowValid: function isPowValid(pow) {
    try {
      if (!pow.startswitch('0x')) {
        pow = '0x' + pow;
      }
      return new BigNumber(pow).lessThanOrEqual(target);
    } catch (e) {
      return false;
    }
  },

  // 挖矿
  mine: function mine() {
    var transactions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var prevBlock = state$2.blocks.slice(-1)[0] || {};
    var newBlock = Block.generate(prevBlock.blockNumber !== undefined ? prevBlock.blockNumber + 1 : 0, transactions.slice(), 0, Block.computeSha256(prevBlock));
    while (true) {
      var hash = Block.computeSha256(newBlock);
      console.log('mine with nonce ' + newBlock.nonce);
      if (this.isPowValid(hash) || newBlock.nonce > 4) {
        console.log('found valid pow', hash);
        break;
      }
      newBlock.nonce++;
    }

    this.append(newBlock);
    this.clearTransactions();
    return newBlock;
  }
};

// test pow
var testPow = function testPow() {
  console.log('验证工作量');
  var block = BlockChain.getIns().genesisBlock;
  var hash = Block.computeSha256(block);
  console.log('计算得到的hash值（16进制）：' + hash);
  console.log('工作量证明标准（16进制）：' + Number(BlockChain.getIns().target).toString(16));
  console.log('工作量是否有效：' + BlockChain.isPowValid(hash));
};

// test mine
var testMine = function testMine() {
  console.log('挖矿');
  var bc = BlockChain.init(1000);

  BlockChain.submitTransaction('甲', '乙', 1);
  BlockChain.submitTransaction('丙', '丁', .5);
  BlockChain.submitTransaction('甲', '丁', .5);

  BlockChain.mine(bc.transactionPool);
};

testPow();
testMine();

exports.testPow = testPow;
exports.testMine = testMine;
