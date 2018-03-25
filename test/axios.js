const axios = require('axios')

axios.all([
  axios.get('http://localhost:3001/blocks'),
  axios.get('http://www.sogou.com'),
  axios.get('http://localhost:3001/blocks')
]).then(res => {
  console.log(typeof res)
  console.log(res.map(val => val.data))
})
