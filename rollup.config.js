import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default [
  {
    input: 'src/test.js',
    output: {
      file: 'dist/test.js',
      format: 'cjs'
    },
    plugins: [
      commonjs(),
      resolve(),
      json(),
      babel()
    ],
    external: ['bignumber.js', 'js-sha256']
  },
  {
    input: 'src/block-chain.js',
    output: {
      file: 'dist/blockChain.js',
      format: 'cjs'
    },
    plugins: [
      commonjs(),
      resolve(),
      json(),
      babel()
    ]
  }
]
