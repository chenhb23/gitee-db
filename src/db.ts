import {AxiosPromise} from 'axios'
import {
  deleteReposOwnerRepoIssuesCommentsId,
  getReposOwnerRepoIssuesCommentsId,
  getReposOwnerRepoIssuesNumber,
  getReposOwnerRepoIssuesNumberComments,
  getSearchIssues,
  patchReposOwnerRepoIssuesCommentsId,
  postReposOwnerIssues,
  postReposOwnerRepoIssuesNumberComments,
} from './api'
import {auth} from './registry'

type ApiResponse<T extends (...args: any[]) => any> = ReturnType<T> extends AxiosPromise<infer P> ? P : T

type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type Issue = ApiResponse<typeof postReposOwnerIssues>

type TableProps = OptionalProps<Pick<Issue, 'number' | 'comments'>, 'comments'> & {expire?: number}

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
  private readonly tables: {[title: string]: TableProps} = {}

  constructor(tables: DB['tables'] = {}) {
    this.tables = tables
  }

  private static createTable(name: string) {
    return postReposOwnerIssues({title: name}).then(value => value.data)
  }

  /**
   * 自动缓存table
   */
  private async fetchTables(name: string) {
    const {data} = await getSearchIssues({repo: `${auth.owner}/${auth.repo}`, q: name})
    const tables = data.reduce<{[title: string]: TableProps}>((prev, item) => ({...prev, [item.title]: item}), {})
    Object.assign(this.tables, tables)

    return this.tables
  }

  /**
   * 如果没有 table 则自动创建
   * @param name
   */
  async table(name: string): Promise<Table> {
    if (!this.tables[name]) {
      await this.fetchTables(name)
      if (!this.tables[name]) {
        this.tables[name] = await DB.createTable(name)
      }
    }
    return new Table(this.tables[name])
  }
}

export class Table<TB = any> {
  private readonly DEFAULT_PER_PAGE = 50 // 默认查询数量（无 limit 的时候起作用）
  private readonly MAX_PER_PAGE = 100 // 每页最大查询数量（gitee限制）
  public MAX_THREAD = 10 // 最大并发数

  readonly props: TableProps
  private readonly filter: (value: DTO<TB>) => boolean
  // private comments: number // todo

  constructor(props: TableProps, where?: (value: DTO<TB>) => boolean) {
    this.props = props
    this.filter = where
  }

  /**
   * 返回 table 数据的总数
   */
  count() {
    return getReposOwnerRepoIssuesNumber({number: this.props.number}).then(({data}) => data.comments)
  }

  /**
   * 插入一条数据
   */
  insert<T extends Record<string, any> = TB>(body: T): Promise<DTO<T>> {
    return postReposOwnerRepoIssuesNumberComments({
      body: JSON.stringify(body),
      number: this.props.number,
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
    options: {
      limit?: number // 限制最多查询的条数
      maxThread?: number // 同时查询请求数量, 具体根据 comments 来定
      startPage?: number
    } = {}
  ): Promise<{cur_page: number; list: DTO<T>[]}> {
    const hasFilter = typeof this.filter === 'function'

    // 返回结果带上当前页，可传入起始页接着查
    let page = options.startPage || 1

    // per_page 与 limit 相关，有 filter 则 直接拉满，最大 100，默认 50 条
    const per_page = hasFilter ? this.MAX_PER_PAGE : Math.min(this.MAX_PER_PAGE, options.limit || this.DEFAULT_PER_PAGE)

    // total(0,1) limit(0,1)
    // 0,0(更新 table 的 comments 数据，再判断)  0,1(count = limit)
    // 1,0(查全部, count = total)  1,1(count = hasFilter ? total : Math.min(total, limit))
    let count // 查询总数
    if (!this.props.comments && !options.limit) {
      // 更新 table 的 comments 数据
      this.props.comments = await this.count()
    }
    if (!this.props.comments) {
      count = options.limit
    } else if (!options.limit) {
      count = this.props.comments
    } else {
      count = hasFilter ? this.props.comments : Math.min(this.props.comments, options.limit)
    }
    const thread = Math.min(this.MAX_THREAD, Math.ceil(count / per_page))

    // console.log(`this.props.comments:${this.props.comments}, limit:${count}, thread:${thread}, per_page:${per_page}`)

    const list: DTO<T>[] = []
    while (true) {
      const responses = await Promise.all(
        Array.from({length: thread}).map((_, i) =>
          getReposOwnerRepoIssuesNumberComments({number: this.props.number, page: page + i, per_page})
        )
      )
      for (const {data} of responses) {
        for (const item of data) {
          const dto = generateDTO(item)
          if (!hasFilter || this.filter(dto)) {
            list.push(dto)
            if (options.limit > 0 && list.length >= options.limit) return {cur_page: page, list}
          }
        }
        if (data.length < per_page) return {cur_page: page, list}

        page++
      }
    }

    // return {cur_page: page, list}
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
    return new Table<T>(this.props, filter) as Pick<Table<T>, 'findOne' | 'findMany'>
  }
}
