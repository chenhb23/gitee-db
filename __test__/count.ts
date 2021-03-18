import {api, DB, registry} from '../src'
import axios from 'axios'

registry({
  access_token: '21e8f219106aae2ad7d5ecde9f2dfecf',
  owner: 'leleleyu',
  repo: 'lanzou',
})
const db = new DB()

declare const returnCitySN
;(async () => {
  const table = await db.table('count')
  console.time('请求时间')
  console.log(await table.findMany({limit: 171}))
  console.timeEnd('请求时间')

  // 1: 请求时间: 1977.415771484375 ms
  // 2: 请求时间: 909.47314453125 ms
  // 3: 请求时间: 733.2802734375 ms
  // 4: 请求时间: 587.913818359375 ms
  // 5: 请求时间: 495.075927734375 ms
  // 6: 请求时间: 367.5419921875 ms

  // await table.insert(returnCitySN)
  // const count = await table.count()
  // document.getElementById('city').innerText = returnCitySN.cname
  // document.getElementById('count').innerText = `${count}`
  // document.querySelector('.count-container').setAttribute('style', 'visibility: visible;')
})()
