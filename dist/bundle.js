'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sha = _interopDefault(require('js-sha256'));
var BigNumber = _interopDefault(require('bignumber.js'));
var fs = _interopDefault(require('fs'));

/**
 * Transaction
 * @receipientAddr: 收款人地址
 * @senderAddr: 付款人地址
 * @value: 交易金额
 */

const state = {
  receipientAddr: '',
  senderAddr: '',
  value: 0
};

const Transaction = {
  generate: (rec, sen, val) => {
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

const state$1 = {
  blockNumber: 0,
  transactions: [],
  timestamp: Date.now(),
  nonce: 0,
  prevBlock: ''
};

const Block = {
  generate: (blockNumber, transactions, nonce, prevBLock) => {
    state$1.blockNumber = blockNumber;
    state$1.transactions = transactions;
    state$1.timestamp = Date.now();
    state$1.nonce = nonce;
    state$1.prevBlock = prevBLock;
    return Object.assign({}, state$1);
  },
  computeSha256: state => {
    return sha.sha256(JSON.stringify(state));
  }
};

var stored = [];

/**
 * block-chain
 * @nodeId: 节点id
 * @blocks: 区块列表
 * @pool: 交易池
 */

const difficulty = 4;
const state$2 = {
  nodeId: 0,
  blocks: stored || [],
  transactionPool: [],
  genesisBlock: Block.generate(0, [], 0, ''),
  target: 2 ** (256 - difficulty)
};

const BlockChain = {
  init(id) {
    state$2.nodeId = id;
    return this.getIns();
  },
  submitTransaction: (send, rec, val) => {
    state$2.transactionPool.push(Transaction.generate(send, rec, val));
  },
  clearTransactions() {
    state$2.transactionPool = 0;
  },
  getIns() {
    return state$2;
  },
  append(block) {
    state$2.blocks.push(block);
    fs.writeFileSync('stored.json', JSON.stringify(state$2.blocks), {
      flag: 'w'
    });
  },
  isPowValid(pow) {
    try {
      if (!pow.startswitch('0x')) {
        pow = '0x' + pow;
      }
      return new BigNumber(pow).lessThanOrEqual(target);
    } catch (e) {
      return false;
    }
  },
  mine(transactions = []) {
    let prevBlock = state$2.blocks.slice(-1)[0] || {};
    const newBlock = Block.generate(prevBlock.blockNumber !== undefined ? prevBlock.blockNumber + 1 : 0, transactions.slice(), 0, Block.computeSha256(prevBlock));
    while (true) {
      let hash = Block.computeSha256(newBlock);
      console.log(`mine with nonce ${newBlock.nonce}`);
      if (this.isPowValid(hash) || newBlock.nonce > 4) {
        console.log('found valid pow', hash);
        break;
      }
      newBlock.nonce++;
    }

    this.append(newBlock);
    this.clearTransactions();
    console.log(this.getIns().blocks);
    return newBlock;
  }
};

// test pow
const testPow = () => {
  const block = BlockChain.getIns().genesisBlock;
  const hash = Block.computeSha256(block);
  console.log(hash);
  console.log(Number(BlockChain.getIns().target).toString(16));
  console.log(BlockChain.isPowValid(hash));
};

// test mine
const testMine = () => {
  const bc = BlockChain.init(1000);

  BlockChain.submitTransaction('甲', '乙', 1);
  BlockChain.submitTransaction('丙', '丁', .5);
  BlockChain.submitTransaction('甲', '丁', .5);

  BlockChain.mine(bc.transactionPool);
};

testPow();
testMine();

exports.testPow = testPow;
exports.testMine = testMine;
