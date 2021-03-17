import {AxiosPromise} from 'axios'
import {
  deleteReposOwnerRepoIssuesCommentsId,
  getReposOwnerRepoIssuesCommentsId,
  getReposOwnerRepoIssuesNumberComments,
  getSearchIssues,
  patchReposOwnerRepoIssuesCommentsId,
  postReposOwnerIssues,
  postReposOwnerRepoIssuesNumberComments,
} from './api'
import {auth} from './registry'

type ApiResponse<T extends (...args: any[]) => any> = ReturnType<T> extends AxiosPromise<infer P> ? P : T

interface DTO<T> {
  id: string // 相当于 row id
  body: T
  number?: string // 相当于 table id
  title?: string
  created_at: string
  updated_at: string
}

function generateDTO<T = any>(data: ApiResponse<typeof getReposOwnerRepoIssuesCommentsId>): DTO<T> {
  return {
    id: data.id,
    body: JSON.parse(data.body),
    number: (data.target as any)?.issue?.number,
    title: (data.target as any)?.issue?.title,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export class DB {
  private readonly tables: {[title: string]: string} = {}

  constructor(tables: DB['tables'] = {}) {
    this.tables = tables
  }

  private static async createTable(name: string) {
    const {data} = await postReposOwnerIssues({title: name})
    return data.number
  }

  /**
   * 自动缓存table
   */
  private async fetchTable(name: string) {
    const {data} = await getSearchIssues({repo: `${auth.owner}/${auth.repo}`, q: name})
    const tables = data.reduce((prev, item) => ({...prev, [item.title]: item.number}), {})
    Object.assign(this.tables, tables)

    return this.tables
  }

  /**
   * 如果没有 table 则自动创建
   * @param name
   */
  async table(name: string): Promise<Table> {
    if (!this.tables[name]) {
      await this.fetchTable(name)
      if (!this.tables[name]) {
        this.tables[name] = await DB.createTable(name)
      }
    }
    return new Table(this.tables[name])
  }
}

export class Table<TB = any> {
  readonly number: string
  private readonly filter: (value: DTO<TB>) => boolean

  constructor(number: string, where?: (value: DTO<TB>) => boolean) {
    this.number = number
    this.filter = where
  }

  /**
   * 插入一条数据
   */
  insert<T extends Record<string, any> = TB>(body: T): Promise<DTO<T>> {
    return postReposOwnerRepoIssuesNumberComments({
      body: JSON.stringify(body),
      number: this.number,
    }).then(value => generateDTO(value.data))
  }

  /**
   * 更新一条数据
   * replace 如果为 true，则替换整条数据
   */
  async update<T extends Record<string, any> = TB>(
    id: string,
    body: Partial<T>,
    options = {replace: false}
  ): Promise<DTO<T>> {
    let newBody = body
    if (!options.replace) {
      const {data} = await getReposOwnerRepoIssuesCommentsId({id: Number(id)})
      newBody = {...JSON.parse(data.body), ...newBody}
    }

    return patchReposOwnerRepoIssuesCommentsId({
      body: JSON.stringify(newBody),
      id: Number(id),
    }).then(({data}) => generateDTO(data))
  }

  /**
   * 删除一条数据
   */
  delete(id: string) {
    return deleteReposOwnerRepoIssuesCommentsId({id: Number(id)})
  }

  /**
   * 查询一套记录
   * 返回第一条数据，如果传入 id，则直接查详情
   */
  async findOne<T = TB>(id?: string): Promise<DTO<T>> {
    if (id) {
      return getReposOwnerRepoIssuesCommentsId({id: Number(id)}).then(value =>
        value.data ? generateDTO(value.data) : null
      )
    }

    return this.findMany<T>({limit: 1}).then(value => value.list?.[0])
  }

  /**
   * 查询多条数据
   * 如果想用 where 查询第二页，可以将第一页的 id 全部过滤掉
   ```ts
   const data = [...] // 已有数据
   const dto = await table
     .where(value => data.every(item => item.id !== value.id))
     .findMany({limit: 20})
   ```
   */
  async findMany<T = TB>(
    options: {limit?: number /*限制最多查询的条数*/; startPage?: number} = {}
  ): Promise<{cur_page: number; list: DTO<T>[]}> {
    // todo: 优化：返回结果带上当前页，可传入起始页接着查
    let page = (options.startPage || 1) - 1

    const hasFilter = typeof this.filter === 'function'
    // per_page 与 limit 相关，有 filter 则 per_page 翻倍，最小 20，最大 100，默认 30
    let per_page = Math.max(20, options.limit ?? 30)
    if (hasFilter) {
      per_page = Math.min(100, per_page * 2)
    }

    const list: DTO<T>[] = []
    while (true) {
      const {data} = await getReposOwnerRepoIssuesNumberComments({number: this.number, page: ++page, per_page})

      if (!data.length) break
      for (const item of data) {
        const dto = generateDTO(item)
        if (!hasFilter || this.filter(dto)) {
          list.push(dto)
          if (options.limit > 0 && list.length >= options.limit) return {cur_page: page, list}
        }
      }
      if (data.length < per_page) break
    }

    return {cur_page: page, list}
  }

  /**
   * 设置查询条件
   * @example
   ```ts
   const data = await table
     .where<{user: string}>(value => value.body.user === 'username')
     .findOne()
   ```
   */
  where<T = TB>(filter: (value: DTO<T>) => boolean) {
    return new Table<T>(this.number, filter) as Pick<Table<T>, 'findOne' | 'findMany'>
  }
}
