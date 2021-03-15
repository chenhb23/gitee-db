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
  id: string
  body: T
  number?: string
  title?: string
  created_at: string
  updated_at: string
}

interface QueryParams {
  id?: string
  per_page?: number // 每页的数量, 最大为 100
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
  async findOne<T = TB>(id?: string, options?: QueryParams): Promise<DTO<T>>
  async findOne<T = TB>(options?: QueryParams, options2?: QueryParams): Promise<DTO<T>>
  async findOne<T = TB>(id?: any, options: QueryParams = {}): Promise<DTO<T>> {
    if (typeof id === 'object') {
      options = Object.assign({}, options, id)
    } else if (typeof id === 'string') {
      options = Object.assign({}, options, {id})
    }
    if (options.id) {
      return getReposOwnerRepoIssuesCommentsId({id: Number(options.id)}).then(value =>
        value.data ? generateDTO(value.data) : null
      )
    } else {
      let page = 1
      while (true) {
        const {data} = await getReposOwnerRepoIssuesNumberComments({
          number: this.number,
          page: page++,
          per_page: options.per_page,
        })

        if (!data.length) return null

        const dtos = data.map(generateDTO)
        if (!this.filter) return dtos[0]

        for (const dto of dtos) {
          if (this.filter(dto)) {
            return dto
          }
        }

        if (data.length < options.per_page) break
      }
    }
  }

  /**
   * 查询多条数据
   */
  async findMany<T = TB>({
    page = 1,
    per_page = 20,
    ...rest
  }: {
    page?: number // 当前的页码
    per_page?: number // 每页的数量, 默认20，最大为 100
    maxPage?: number
  } = {}): Promise<DTO<T>[]> {
    const list: DTO<T>[] = []
    while (true) {
      const {data} = await getReposOwnerRepoIssuesNumberComments({number: this.number, page: page++, per_page})

      if (!data.length) break
      const dtos = data.map(generateDTO)
      list.push(...(this.filter ? dtos.filter(this.filter) : dtos))

      if (data.length < per_page || (rest.maxPage > 0 && page > rest.maxPage)) break
    }

    return list
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
