import {DB, registry} from '../src'

registry({
  access_token: '21e8f219106aae2ad7d5ecde9f2dfecf',
  owner: 'leleleyu',
  repo: 'lanzou',
})
const db = new DB()

;(async () => {
  const table = await db.table('table')
  // const data = await table.where(value => value.body.user === 'username').findOne()
  // const data = await table.findOne('4485166')
  const data = await table.findOne()

  console.log('before', data)

  const info = {
    user: 'username',
    array: [1, 2, 3, 4],
    object: {name: 'this is name'},
  }
  if (data) {
    const dto = await table.update(data.id, info)
    console.log('after update', dto)
  } else {
    const dto = await table.insert(info)
    console.log('after insert', dto)
  }
})()
