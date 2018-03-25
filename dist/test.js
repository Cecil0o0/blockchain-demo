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
  nonce: 0,
  prevBlock: '',
  timestamp: Date.now()
};

var Block = {
  generate: function generate(blockNumber, transactions, nonce, prevBLock) {
    var isGenisis = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    state$1.blockNumber = blockNumber;
    state$1.transactions = JSON.stringify(transactions);
    state$1.nonce = nonce;
    state$1.prevBlock = prevBLock;
    state$1.timestamp = isGenisis ? new Date('2018-03-25 2:20').getTime() : Date.now();
    return Object.assign({}, state$1);
  },
  computeSha256: function computeSha256(state) {
    return sha.sha256(JSON.stringify(state));
  }
};

/**
 * 节点数据结构
 * @id：节点id
 * @url：节点url
 */
var state$2 = {
  id: 0,
  url: ''
};

var NodeAction = {
  generate: function generate(id, url) {
    state$2.id = id;
    state$2.url = url;
    return Object.assign({}, state$2);
  }
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

var COINBASE_SENDER = '<COINBASE>';
var COINBASE_REWARD = 50;

var difficulty = 2;
var state$3 = {
  nodeId: 0,
  blocks: [],
  nodes: [],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, '', true),
  target: Math.pow(2, 256 - difficulty).toExponential(15),
  storagePath: ''
};

var BlockChain = {
  // 初始化结点
  init: function init(id) {
    state$3.nodeId = id;
    state$3.storagePath = path.resolve(__dirname, '../data/', state$3.nodeId + '.blockchain');
    state$3.blocks.push(state$3.genesisBlock);
    return state$3;
  },
  // 注册节点
  register: function register(id, url) {
    if (state$3.nodes.find(function (node) {
      return node.id === id;
    })) {
      return false;
    } else {
      state$3.nodes.push(NodeAction.generate(id, url));
      return true;
    }
  },
  // 加载存储区块链或初始化一个区块链
  load: function load() {
    try {
      state$3.blocks = JSON.parse(fs.readFileSync(state$3.storagePath, 'utf-8'));
    } catch (e) {
      console.log('读取失败，初始化区块链');
      state$3.blocks = [state$3.genesisBlock];
    } finally {
      BlockChain.verify();
    }
  },
  // 存储区块链到本地
  save: function save() {
    var dirname = path.dirname(state$3.storagePath);
    if (fs.existsSync(dirname)) {
      fs.writeFileSync(state$3.storagePath, JSON.stringify(state$3.blocks), 'utf-8');
    } else {
      fs.mkdirSync(dirname);
      fs.writeFileSync(state$3.storagePath, JSON.stringify(state$3.blocks), 'utf-8');
    }
  },
  // 验证区块链是否合法
  verify: function verify(blocks) {
    try {
      if (!blocks.length) {
        throw new Error('blocks can\'t be empty !');
      }
      if (JSON.stringify(state$3.genesisBlock) !== JSON.stringify(blocks[0])) {
        throw new Error('genesis block data error !');
      }
      blocks.forEach(function (item, index) {
        if (index === 0) {
          // 跳过初代区块
        } else {
          // 验证上一个区块
          if (item.prevBlock !== Block.computeSha256(blocks[index - 1])) {
            throw new Error('invalid prev block sha256');
          }
          // 验证该区块工作量
          if (!BlockChain.isPowValid(Block.computeSha256(item))) {
            throw new Error('invalid PoW');
          }
        }
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  // 获取state实例
  getIns: function getIns() {
    return state$3;
  },
  // 提交交易
  submitTransaction: function submitTransaction(send, rec, val) {
    state$3.transactionPool.push(Transaction.generate(send, rec, val));
  },
  // 清除交易
  clearTransactions: function clearTransactions() {
    state$3.transactionPool = [];
  },
  // 获取交易池
  getTransactions: function getTransactions() {
    return state$3.transactionPool;
  },
  // 获取所有区块
  getBlocks: function getBlocks() {
    return state$3.blocks;
  },
  // 获取单个区块
  getBlockById: function getBlockById(id) {
    if (isNaN(Number(id))) {
      return {};
    } else {
      id = +id;
    }
    if (+id < state$3.blocks.length) {
      return state$3.blocks[id];
    } else {
      return {};
    }
  },
  // 获取所有节点
  getNodes: function getNodes() {
    return state$3.nodes.slice();
  },
  // 验证工作量
  isPowValid: function isPowValid(pow) {
    try {
      if (!pow.startsWith('0x')) {
        pow = '0x' + pow;
      }
      pow = Number(pow).toExponential(15);
      return new BigNumber(pow).isLessThanOrEqualTo(state$3.target);
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  // 挖矿
  mine: function mine() {
    var transactions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var prevBlock = state$3.blocks.slice(-1)[0] || {};

    transactions = [Transaction.generate(COINBASE_SENDER, state$3.nodeId, COINBASE_REWARD)].concat(toConsumableArray(transactions));

    var newBlock = Block.generate(prevBlock.blockNumber !== undefined ? prevBlock.blockNumber + 1 : 0, transactions.slice(), 0, Block.computeSha256(prevBlock));
    while (true) {
      var hash = Block.computeSha256(newBlock);
      console.log('mine with nonce ' + newBlock.nonce);
      if (BlockChain.isPowValid(hash)) {
        console.log('found valid pow', hash);
        break;
      }
      newBlock.nonce++;
    }

    state$3.blocks.push(newBlock);
    state$3.transactionPool = [];
    return newBlock;
  },
  // 区块链共识
  consensus: function consensus(blockChains) {
    var maxLength = 0,
        candidateIndex = -1;
    blockChains.forEach(function (item, index) {
      if (item.length > maxLength && BlockChain.verify(item)) {
        maxLength = item.length;
        candidateIndex = index;
      }
    });

    if (candidateIndex > -1 && (maxLength >= state$3.blocks.length || !BlockChain.verify(state$3.blocks))) {
      state$3.blocks = [].concat(toConsumableArray(blockChains[candidateIndex]));
      BlockChain.save();
      return true;
    }

    return false;
  }
};

// test pow
var testPow = function testPow() {
  console.log('验证工作量');
  var block = BlockChain.getIns().genesisBlock;
  var hash = Block.computeSha256(block);
  console.log('计算得到的哈希值（16进制） ：' + hash);
  console.log('工作量证明目标为（16进制） ：' + Number(BlockChain.getIns().target).toString(16));
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
