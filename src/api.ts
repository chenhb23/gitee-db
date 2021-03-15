import axios, {AxiosPromise, Method} from 'axios'
import {auth} from './registry'

const http = axios.create({
  baseURL: 'https://gitee.com/api/v5',
  headers: {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    'content-type': 'application/json;charset=UTF-8',
    pragma: 'no-cache',
  },
})

const formatUrl = (url: string, params: Record<string, any>) => {
  Object.keys(params).forEach(key => {
    url = url.replace(new RegExp('{' + key + '}'), params[key])
  })
  return url
}

const f = (url: string, data: any, method: Method = 'get') => {
  data.access_token = data.access_token ?? auth.access_token
  data.owner = data.owner ?? auth.owner
  data.repo = data.repo ?? auth.repo
  return http({
    method,
    url: formatUrl(url, data),
    ...(method.toLowerCase() !== 'get' ? {data} : {}),
    ...(method.toLowerCase() !== 'post' ? {params: data} : {}),
  })
}

// 获取所有分支
interface Branch {
  name: string
  commit: string
  protected: string
  protection_url: string
}

// 创建分支
interface CompleteBranch {
  name: string
  commit: string
  _links: string
  protected: string
  protection_url: string
}

// 删除仓库保护分支策略
interface ProtectionRule {
  id: string
  project_id: string
  wildcard: string
  pushers: string[]
  mergers: string[]
}

// 仓库的某个提交
interface RepoCommit {
  url: string
  sha: string
  html_url: string
  comments_url: string
  commit: string
  author: string
  committer: string
  parents: string
  stats: string
}

// 两个Commits之间对比的版本差异
interface Compare {
  base_commit: string
  merge_base_commit: string
  commits: string
  files: string
}

// 获取一个公钥
interface SSHKey {
  id: string
  key: string
  url: string
  title: string
  created_at: string
}

// 列出指定用户的所有公钥
interface SSHKeyBasic {
  id: string
  key: string
}

// 获取仓库具体路径下的内容
interface Content {
  type: string
  encoding: string
  size: string
  name: string
  path: string
  content: string
  sha: string
  url: string
  html_url: string
  download_url: string
  _links: string
}

// 删除文件
interface CommitContent {
  content: ContentBasic
  commit: Commit
}

interface ContentBasic {
  name: string
  path: string
  size: string
  sha: string
  type: string
  url: string
  html_url: string
  download_url: string
  _links: string
}

interface Commit {
  sha: string
  author: string
  committer: string
  message: string
  tree: string
  parents: string
}

// 获取文件Blob
interface Blob {
  sha: string
  size: string
  url: string
  content: string
  encoding: string
}

// 获取目录Tree
interface Tree {
  sha: string
  url: string
  tree: string
  truncated: string
}

// 获取 Gitee 指数
interface GiteeMetrics {
  data: string
  total_score: string
  created_at: string
  repo: ProjectBasic
}

interface ProjectBasic {
  id: number
  full_name: string
  human_name: string
  url: string
  namespace: Record<string, any>
  path: string
  name: string
  owner: string
  description: string
  private: string
  public: string
  internal: string
  fork: string
  html_url: string
  ssh_url: string
}

// 搜索 Issues
interface Issue {
  id: number
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  html_url: string
  parent_url: string
  number: string
  parent_id: number // 上级 id
  depth: number // 所在层级
  state: string
  title: string
  body: string
  body_html: string
  user: string
  labels: Label
  assignee: UserBasic
  collaborators: UserBasic
  repository: string
  milestone: Milestone
  created_at: string
  updated_at: string
  plan_started_at: string
  deadline: string
  finished_at: string
  scheduled_time: string
  comments: number
  priority: number // 优先级(0: 不指定 1: 不重要 2: 次要 3: 主要 4: 严重)
  issue_type: string
  program: ProgramBasic
  security_hole: string
  issue_state: string
  branch: string // 关联分支
}

// 获取企业某个标签
interface Label {
  id: number
  name: string
  color: string
  repository_id: number
  url: string
  created_at: string
  updated_at: string
}

// 列出一个组织的所有成员
interface UserBasic {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
}

// 更新仓库里程碑
interface Milestone {
  url: string
  html_url: string
  number: number
  repository_id: number
  state: string
  title: string
  description: string
  updated_at: string
  created_at: string
  open_issues: number
  closed_issues: number
  due_on: string
}

interface ProgramBasic {
  id: string
  name: string
  description: string
  assignee: string
  author: string
}

// 企业Pull Reuqest 列表
interface PullRequest {
  id: string
  url: string
  html_url: string
  diff_url: string
  patch_url: string
  issue_url: string
  commits_url: string
  review_comments_url: string
  review_comment_url: string
  comments_url: string
  statuses_url: string
  number: string
  state: string
  title: string
  body: string
  body_html: string
  assignees_number: string
  testers_number: string
  assignees: string[]
  testers: string[]
  milestone: Milestone
  labels: Label
  locked: string
  created_at: string
  updated_at: string
  closed_at: string
  merged_at: string
  mergeable: string
  can_merge_check: string
  head: string
  base: string
  _links: string
  user: string
}

// 获取某个Pull Request的操作日志
interface OperateLog {
  id: string
  icon: string
  user: string
  content: string
  created_at: string
}

// 获取企业某个Issue所有评论
interface Note {
  id: string
  body: string
  body_html: string
  user: string
  source: string
  target: string
  created_at: string
  updated_at: string
}

// 搜索仓库
interface Project {
  id: number
  full_name: string
  human_name: string
  url: string
  namespace: Record<string, any>
  path: string
  name: string
  owner: string
  description: string
  private: string
  public: string
  internal: string
  fork: string
  html_url: string
  ssh_url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  hooks_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  stargazers_url: string
  contributors_url: string
  commits_url: string
  comments_url: string
  issue_comment_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  recommend: string
  homepage: string
  language: string
  forks_count: string
  stargazers_count: string
  watchers_count: string
  default_branch: string
  open_issues_count: number
  has_issues: string
  has_wiki: string
  issue_comment: string
  can_comment: string
  pull_requests_enabled: string
  has_page: string
  license: string
  outsourced: string
  project_creator: string
  members: string
  pushed_at: string
  created_at: string
  updated_at: string
  parent: Project
  paas: string
  stared: string
  watched: string
  permission: string
  relation: string
  assignees_number: string
  testers_number: string
  assignees: string[]
  testers: string[]
}

// 获取仓库贡献者
interface Contributor {
  email: string
  name: string
  contributions: string
}

// 创建一个仓库的 Tag
interface Tag {
  name: string
  message: string
  commit: string
}

// 添加仓库成员
interface ProjectMember {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  permissions: string
}

// 查看仓库成员的权限
interface ProjectMemberPermission {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  permission: string
}

// 编辑评论
interface PullRequestComments {
  url: string
  id: string
  path: string
  position: string
  original_position: string
  commit_id: string
  original_commit_id: string
  user: string
  created_at: string
  updated_at: string
  body: string
  html_url: string
  pull_request_url: string
  _links: string
}

// 获取某Pull Request的所有Commit信息。最多显示250条Commit
interface PullRequestCommits {
  url: string
  sha: string
  html_url: string
  comments_url: string
  commit: string
  author: string
  committer: string
  parents: string
}

// Pull Request Commit文件列表。最多显示300条diff
interface PullRequestFiles {
  sha: string
  filename: string
  status: string
  additions: string
  deletions: string
  blob_url: string
  raw_url: string
  patch: string
}

// 更新仓库Release
interface Release {
  id: number
  tag_name: string
  target_commitish: string
  prerelease: string
  name: string
  body: string
  author: string
  created_at: string
  assets: string
}

// 更新一个仓库WebHook
interface Hook {
  id: string
  url: string
  created_at: string
  password: string
  project_id: string
  result: string
  result_code: string
  push_events: string
  tag_push_events: string
  issues_events: string
  note_events: string
  merge_requests_events: string
}

// 列出 star 了仓库的用户
interface ProjectStargazers {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  star_at: string
}

// 列出 watch 了仓库的用户
interface ProjectWatchers {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  watch_at: string
}

// 列出仓库的所有公开动态
interface Event {
  id: number
  type: string
  actor: string
  repo: string
  org: string
  public: string
  created_at: string
  payload: Record<string, any> // 不同类型动态的内容
}

// 列出授权用户的所有通知
interface UserNotificationList {
  total_count: number
  list: UserNotification[] // 通知列表
}

// 获取一条通知
interface UserNotification {
  id: number
  content: string
  type: string
  unread: string
  mute: string
  updated_at: string
  url: string
  html_url: string
  actor: UserBasic // 通知发送者
  repository: ProjectBasic
  subject: UserNotificationSubject // 通知直接关联对象
  namespaces: UserNotificationNamespace[] // 通知次级关联对象
}

interface UserNotificationSubject {
  title: string
  url: string
  latest_comment_url: string
  type: string
}

interface UserNotificationNamespace {
  name: string
  html_url: string
  type: string
}

// 获取一个组织
interface Group {
  id: number
  login: string
  name: string
  url: string
  avatar_url: string
  repos_url: string
  events_url: string
  members_url: string
  description: string
  follow_count: string
}

// 获取授权用户的资料
interface UserDetail {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  blog: string
  weibo: string
  bio: string
  public_repos: string
  public_gists: string
  followers: string
  following: string
  stared: string
  watched: string
  created_at: string
  updated_at: string
  email: string
}

// 搜索用户
interface User {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  blog: string
  weibo: string
  bio: string
  public_repos: string
  public_gists: string
  followers: string
  following: string
  stared: string
  watched: string
  created_at: string
  updated_at: string
}

// 获取授权用户的一个 Namespace
interface Namespace {
  id: number
  type: string
  name: string
  path: string
  html_url: string
  parent: NamespaceMini
}

interface NamespaceMini {
  id: number
  type: string
  name: string
  path: string
  html_url: string
}

// 获取一个企业
interface EnterpriseBasic {
  id: number
  path: string
  name: string
  url: string
  avatar_url: string
}

// 增加或更新授权用户所管理组织的成员
interface GroupMember {
  url: string
  active: string
  remark: string
  role: string
  organization_url: string
  organization: Group
  user: string
}

// 获取用户Star的代码片段
interface Code {
  url: string
  forks_url: string
  commits_url: string
  id: string
  description: string
  public: string
  owner: string
  user: string
  files: string
  truncated: string
  html_url: string
  comments: string
  comments_url: string
  git_pull_url: string
  git_push_url: string
  created_at: string
  updated_at: string
}

// 获取代码片段的commit
interface CodeForksHistory {
  url: string
  forks_url: string
  commits_url: string
  id: string
  description: string
  public: string
  owner: string
  user: string
  files: string
  truncated: string
  html_url: string
  comments: string
  comments_url: string
  git_pull_url: string
  git_push_url: string
  created_at: string
  updated_at: string
  forks: string
  history: string
}

// 修改代码片段的评论
interface CodeComment {
  id: string
  body: string
  created_at: string
  updated_at: string
}

// 获取 Fork 了指定代码片段的列表
interface CodeForks {
  user: string
  url: string
  id: string
  created_at: string
  updated_at: string
}

// 获取一个用户
interface UserInfo {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  blog: string
  weibo: string
  bio: string
  public_repos: string
  public_gists: string
  followers: string
  following: string
  stared: string
  watched: string
  created_at: string
  updated_at: string
  company: string
  profession: string
  wechat: string
  qq: string
  linkedin: string
  email: string
}

// 更新授权用户所管理的组织资料
interface GroupDetail {
  id: number
  login: string
  name: string
  url: string
  avatar_url: string
  repos_url: string
  events_url: string
  members_url: string
  description: string
  follow_count: string
  created_at: string
  type: string
  location: string
  email: string
  html_url: string
  public: string
  enterprise: string
  members: string
  public_repos: string
  private_repos: string
  owner: string
}

// 列出指定组织的所有关注者
interface GroupFollowers {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  member_role: string
  followed_at: string
}

// 修改企业成员权限或备注
interface EnterpriseMember {
  url: string
  active: string
  remark: string
  role: string
  outsourced: string
  enterprise: EnterpriseBasic
  user: string
}

// 新建周报
interface WeekReport {
  id: number
  content: string
  content_html: string
  year: string
  month: string
  week_index: string
  week_begin: string
  week_end: string
  created_at: string
  updated_at: string
  user: UserMini
}

interface UserMini {
  id: number
  login: string
  name: string
  avatar_url: string
  url: string
  html_url: string
}

// 获取授权用户的通知数
interface UserNotificationCount {
  total_count: number // 通知总数
  notification_count: number // 通知数量
  message_count: number // 私信数量
}

// 列出授权用户的所有私信
interface UserMessageList {
  total_count: number
  list: UserMessage[] // 私信列表
}

// 获取一条私信
interface UserMessage {
  id: number
  sender: UserBasic // 发送者
  unread: string
  content: string
  updated_at: string
  url: string
  html_url: string
}

// 获取授权用户的全部邮箱
interface UserEmail {
  email: string
  state: string
  scope: string[]
}

interface GetReposOwnerRepoBranches {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PostReposOwnerRepoBranches {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  refs: string // 起点名称, 默认：master
  branch_name: string // 新创建的分支名称
}

interface GetReposOwnerRepoBranchesBranch {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  branch: string // 分支名称
}

interface PutReposOwnerRepoBranchesBranchProtection {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  branch: string // 分支名称
}

interface DeleteReposOwnerRepoBranchesBranchProtection {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  branch: string // 分支名称
}

interface PutReposOwnerRepoBranchesWildcardSetting {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  wildcard: string // 分支/通配符
  new_wildcard?: string // 新分支/通配符(为空不修改)
  pusher: string // admin: 仓库管理员, none: 禁止任何人合并; 用户: 个人的地址path(多个用户用 ';' 隔开)
  merger: string // admin: 仓库管理员, none: 禁止任何人合并; 用户: 个人的地址path(多个用户用 ';' 隔开)
}

interface DeleteReposOwnerRepoBranchesWildcardSetting {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  wildcard: string // 分支/通配符
}

interface PutReposOwnerRepoBranchesSettingNew {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  wildcard: string // 分支/通配符
  pusher: string // admin: 仓库管理员, none: 禁止任何人合并; 用户: 个人的地址path(多个用户用 ';' 隔开)
  merger: string // admin: 仓库管理员, none: 禁止任何人合并; 用户: 个人的地址path(多个用户用 ';' 隔开)
}

interface GetReposOwnerRepoCommits {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sha?: string // 提交起始的SHA值或者分支名. 默认: 仓库的默认分支
  path?: string // 包含该文件的提交
  author?: string // 提交作者的邮箱或个人空间地址(username/login)
  since?: string // 提交的起始时间，时间格式为 ISO 8601
  until?: string // 提交的最后时间，时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoCommitsSha {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sha: string // 提交的SHA值或者分支名
}

interface GetReposOwnerRepoCompareBaseHead {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  base: string // Commit提交的SHA值或者分支名作为对比起点
  head: string // Commit提交的SHA值或者分支名作为对比终点
}

interface GetReposOwnerRepoKeys {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoKeys {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  key: string // 公钥内容
  title: string // 公钥名称
}

interface GetReposOwnerRepoKeysAvailable {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PutReposOwnerRepoKeysEnableId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 公钥 ID
}

interface DeleteReposOwnerRepoKeysEnableId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 公钥 ID
}

interface GetReposOwnerRepoKeysId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 公钥 ID
}

interface DeleteReposOwnerRepoKeysId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 公钥 ID
}

interface GetReposOwnerRepoReadme {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  ref?: string // 分支、tag或commit。默认: 仓库的默认分支(通常是master)
}

interface GetReposOwnerRepoContents {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  path: string // 文件的路径
  ref?: string // 分支、tag或commit。默认: 仓库的默认分支(通常是master)
}

interface PostReposOwnerRepoContentsPath {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  path: string // 文件的路径
  content: string // 文件内容, 要用 base64 编码
  message: string // 提交信息
  branch?: string // 分支名称。默认为仓库对默认分支
}

interface PutReposOwnerRepoContentsPath {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  path: string // 文件的路径
  content: string // 文件内容, 要用 base64 编码
  sha: string // 文件的 Blob SHA，可通过 [获取仓库具体路径下的内容] API 获取
  message: string // 提交信息
  branch?: string // 分支名称。默认为仓库对默认分支
}

interface DeleteReposOwnerRepoContentsPath {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  path: string // 文件的路径
  sha: string // 文件的 Blob SHA，可通过 [获取仓库具体路径下的内容] API 获取
  message: string // 提交信息
  branch?: string // 分支名称。默认为仓库对默认分支
}

interface GetReposOwnerRepoGitBlobsSha {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sha: string // 文件的 Blob SHA，可通过 [获取仓库具体路径下的内容] API 获取
}

interface GetReposOwnerRepoGitTreesSha {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sha: string // 可以是分支名(如master)、Commit或者目录Tree的SHA值
  recursive?: number // 赋值为1递归获取目录
}

interface GetReposOwnerRepoGitGiteeMetrics {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepoIssues {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  state?: string // Issue的状态: open（开启的）, progressing(进行中), closed（关闭的）, rejected（拒绝的）。 默认: open
  labels?: string // 用逗号分开的标签。如: bug,performance
  sort?: string // 排序依据: 创建时间(created)，更新时间(updated_at)。默认: created_at
  direction?: string // 排序方式: 升序(asc)，降序(desc)。默认: desc
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  schedule?: string // 计划开始日期，格式：20181006T173008+80-20181007T173008+80（区间），或者 -20181007T173008+80（小于20181007T173008+80），或者 20181006T173008+80-（大于20181006T173008+80），要求时间格式为20181006T173008+80
  deadline?: string // 计划截止日期，格式同上
  created_at?: string // 任务创建时间，格式同上
  finished_at?: string // 任务完成时间，即任务最后一次转为已完成状态的时间点。格式同上
  milestone?: string // 根据里程碑标题。none为没里程碑的，*为所有带里程碑的
  assignee?: string // 用户的username。 none为没指派者, *为所有带有指派者的
  creator?: string // 创建Issues的用户username
  program?: string // 所属项目名称。none为没有所属项目，*为所有带所属项目的
}

interface GetReposOwnerRepoIssuesNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface PostReposOwnerIssues {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  title: string // Issue标题
  issue_type?: string // 企业自定义任务类型，非企业默认任务类型为“任务”
  body?: string // Issue描述
  assignee?: string // Issue负责人的个人空间地址
  collaborators?: string // Issue协助者的个人空间地址, 以 , 分隔
  milestone?: number // 里程碑序号
  labels?: string // 用逗号分开的标签，名称要求长度在 2-20 之间且非特殊字符。如: bug,performance
  program?: string // 项目ID
  security_hole?: boolean // 是否是私有issue(默认为false)
}

interface PatchReposOwnerIssuesNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  title?: string // Issue标题
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  state?: string // Issue 状态，open（开启的）、progressing（进行中）、closed（关闭的）
  body?: string // Issue描述
  assignee?: string // Issue负责人的个人空间地址
  collaborators?: string // Issue协助者的个人空间地址, 以 , 分隔
  milestone?: number // 里程碑序号
  labels?: string // 用逗号分开的标签，名称要求长度在 2-20 之间且非特殊字符。如: bug,performance
  program?: string // 项目ID
  security_hole?: boolean // 是否是私有issue(默认为false)
}

interface GetReposOwnerIssuesNumberPullRequests {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface GetReposOwnerIssuesNumberOperateLogs {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  sort?: string // 按递增(asc)或递减(desc)排序，默认：递减
}

interface GetReposOwnerRepoLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PostReposOwnerRepoLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  name: string // 标签名称
  color: string // 标签颜色。为6位的数字，如: 000000
}

interface GetReposOwnerRepoLabelsName {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  name: string // 标签名称
}

interface DeleteReposOwnerRepoLabelsName {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  name: string // 标签名称
}

interface PatchReposOwnerRepoLabelsOriginalName {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  original_name: string // 标签原有名称
  name?: string // 标签新名称
  color?: string // 标签新颜色
}

interface GetReposOwnerRepoIssuesNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface PostReposOwnerRepoIssuesNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  body: string[] // 标签名数组，如: ["feat", "bug"]
}

interface PutReposOwnerRepoIssuesNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  body: string[] // 标签名数组，如: ["feat", "bug"]
}

interface DeleteReposOwnerRepoIssuesNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface DeleteReposOwnerRepoIssuesNumberLabelsName {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  name: string // 标签名称
}

interface GetReposOwnerRepoMilestones {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  state?: string // 里程碑状态: open, closed, all。默认: open
  sort?: string // 排序方式: due_on
  direction?: string // 升序(asc)或是降序(desc)。默认: asc
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoMilestones {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  title: string // 里程碑标题
  state?: string // 里程碑状态: open, closed, all。默认: open
  description?: string // 里程碑具体描述
  due_on: string // 里程碑的截止日期
}

interface GetReposOwnerRepoMilestonesNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 里程碑序号(id)
}

interface PatchReposOwnerRepoMilestonesNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 里程碑序号(id)
  title: string // 里程碑标题
  state?: string // 里程碑状态: open, closed, all。默认: open
  description?: string // 里程碑具体描述
  due_on: string // 里程碑的截止日期
}

interface DeleteReposOwnerRepoMilestonesNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 里程碑序号(id)
}

interface GetReposOwnerRepoLicense {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepoComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  order?: string // 排序顺序: asc(default),desc
}

interface GetReposOwnerRepoCommitsRefComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  ref: string // Commit的Reference
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
}

interface PatchReposOwnerRepoCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
  body: string // 评论的内容
}

interface DeleteReposOwnerRepoCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
}

interface PostReposOwnerRepoCommitsShaComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sha: string // 评论的sha值
  body: string // 评论的内容
  path?: string // 文件的相对路径
  position?: number // Diff的相对行数
}

interface GetReposOwnerRepoIssuesComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sort?: string // Either created or updated. Default: created
  direction?: string // Either asc or desc. Ignored without the sort parameter.
  since?: string // Only comments updated at or after this time are returned.                                              This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoIssuesNumberComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  since?: string // Only comments updated at or after this time are returned.                                              This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  order?: string // 排序顺序: asc(default),desc
}

interface PostReposOwnerRepoIssuesNumberComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  body: string // The contents of the comment.
}

interface GetReposOwnerRepoIssuesCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
}

interface PatchReposOwnerRepoIssuesCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
  body: string // The contents of the comment.
}

interface DeleteReposOwnerRepoIssuesCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
}

interface GetReposOwnerRepoPages {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PostReposOwnerRepoPagesBuilds {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PatchReposOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  name: string // 仓库名称
  description?: string // 仓库描述
  homepage?: string // 主页(eg: https://gitee.com)
  has_issues?: boolean // 允许提Issue与否。默认: 允许(true)
  has_wiki?: boolean // 提供Wiki与否。默认: 提供(true)
  can_comment?: boolean // 允许用户对仓库进行评论。默认： 允许(true)
  issue_comment?: boolean // 允许对“关闭”状态的 Issue 进行评论。默认: 不允许(false)
  security_hole_enabled?: boolean // 允许用户创建涉及敏感信息的 Issue。默认: 不允许(false)
  private?: boolean // 仓库公开或私有。
  path?: string // 更新仓库路径
  default_branch?: string // 更新默认分支
  pull_requests_enabled?: boolean // 接受 pull request，协作开发
  online_edit_enabled?: boolean // 是否允许仓库文件在线编辑
  lightweight_pr_enabled?: boolean // 是否接受轻量级 pull request
}

interface DeleteReposOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PutReposOwnerRepoReviewer {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  assignees: string // 审查人员username，可多个，半角逗号分隔，如：(username1,username2)
  testers: string // 测试人员username，可多个，半角逗号分隔，如：(username1,username2)
  assignees_number: number // 最少审查人数
  testers_number: number // 最少测试人数
}

interface GetReposOwnerRepoContributors {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepoTags {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PostReposOwnerRepoTags {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  refs: string // 起点名称, 默认：master
  tag_name: string // 新创建的标签名称
  tag_message?: string // Tag 描述, 默认为空
}

interface PutReposOwnerRepoClear {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepoCollaborators {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoCollaboratorsUsername {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  username: string // 用户名(username/login)
}

interface PutReposOwnerRepoCollaboratorsUsername {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  username: string // 用户名(username/login)
  permission: string // 成员权限: 拉代码(pull)，推代码(push)，管理员(admin)。默认: push
}

interface DeleteReposOwnerRepoCollaboratorsUsername {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  username: string // 用户名(username/login)
}

interface GetReposOwnerRepoCollaboratorsUsernamePermission {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  username: string // 用户名(username/login)
}

interface GetReposOwnerRepoForks {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sort?: string // 排序方式: fork的时间(newest, oldest)，star的人数(stargazers)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoForks {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  organization?: string // 组织空间地址，不填写默认Fork到用户个人空间地址
}

interface GetReposOwnerRepoPulls {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  state?: string // 可选。Pull Request 状态
  head?: string // 可选。Pull Request 提交的源分支。格式：branch 或者：username:branch
  base?: string // 可选。Pull Request 提交目标分支的名称。
  sort?: string // 可选。排序字段，默认按创建时间
  direction?: string // 可选。升序/降序
  milestone_number?: number // 可选。里程碑序号(id)
  labels?: string // 用逗号分开的标签。如: bug,performance
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoPulls {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  title: string // 必填。Pull Request 标题
  head: string // 必填。Pull Request 提交的源分支。格式：branch 或者：username:branch
  base: string // 必填。Pull Request 提交目标分支的名称
  body?: string // 可选。Pull Request 内容
  milestone_number?: number // 可选。里程碑序号(id)
  labels?: string // 用逗号分开的标签，名称要求长度在 2-20 之间且非特殊字符。如: bug,performance
  issue?: string // 可选。Pull Request的标题和内容可以根据指定的Issue Id自动填充
  assignees?: string // 可选。审查人员username，可多个，半角逗号分隔，如：(username1,username2), 注意: 当仓库代码审查设置中已设置【指派审查人员】则此选项无效
  testers?: string // 可选。测试人员username，可多个，半角逗号分隔，如：(username1,username2), 注意: 当仓库代码审查设置中已设置【指派测试人员】则此选项无效
  prune_source_branch?: boolean // 可选。合并PR后是否删除源分支，默认false（不删除）
}

interface GetReposOwnerRepoPullsComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  sort?: string // 可选。按创建时间/更新时间排序
  direction?: string // 可选。升序/降序
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoPullsNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
}

interface PatchReposOwnerRepoPullsNumber {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  title?: string // 可选。Pull Request 标题
  body?: string // 可选。Pull Request 内容
  state?: string // 可选。Pull Request 状态
  milestone_number?: number // 可选。里程碑序号(id)
  labels?: string // 用逗号分开的标签，名称要求长度在 2-20 之间且非特殊字符。如: bug,performance
  assignees_number?: number // 可选。最少审查人数
  testers_number?: number // 可选。最少测试人数
}

interface GetReposOwnerRepoPullsNumberOperateLogs {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  sort?: string // 按递增(asc)或递减(desc)排序，默认：递减
}

interface GetReposOwnerRepoPullsNumberCommits {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
}

interface GetReposOwnerRepoPullsNumberFiles {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
}

interface GetReposOwnerRepoPullsNumberMerge {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
}

interface PutReposOwnerRepoPullsNumberMerge {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  merge_method?: string // 可选。合并PR的方法，merge（合并所有提交）和 squash（扁平化分支合并）。默认为merge。
  prune_source_branch?: boolean // 可选。合并PR后是否删除源分支，默认false（不删除）
  title?: string // 可选。合并标题，默认为PR的标题
  description?: string // 可选。合并描述，默认为 "Merge pull request !{pr_id} from {author}/{source_branch}"，与页面显示的默认一致。
}

interface PostReposOwnerRepoPullsNumberReview {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  force?: boolean // 是否强制审查通过（默认否），只对管理员生效
}

interface PostReposOwnerRepoPullsNumberTest {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  force?: boolean // 是否强制测试通过（默认否），只对管理员生效
}

interface PostReposOwnerRepoPullsNumberAssignees {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  assignees: string // 用户的个人空间地址, 以 , 分隔
}

interface DeleteReposOwnerRepoPullsNumberAssignees {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  assignees: string // 用户的个人空间地址, 以 , 分隔
}

interface PatchReposOwnerRepoPullsNumberAssignees {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  reset_all?: boolean // 是否重置所有审查人，默认：false，只对管理员生效
}

interface PostReposOwnerRepoPullsNumberTesters {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  testers: string // 用户的个人空间地址, 以 , 分隔
}

interface DeleteReposOwnerRepoPullsNumberTesters {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  testers: string // 用户的个人空间地址, 以 , 分隔
}

interface PatchReposOwnerRepoPullsNumberTesters {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  reset_all?: boolean // 是否重置所有测试人，默认：false，只对管理员生效
}

interface GetReposOwnerRepoPullsNumberIssues {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  number: number
}

interface GetReposOwnerRepoPullsNumberComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoPullsNumberComments {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  body: string // 必填。评论内容
  commit_id?: string // 可选。PR代码评论的commit id
  path?: string // 可选。PR代码评论的文件名
  position?: number // 可选。PR代码评论diff中的行数
}

interface GetReposOwnerRepoPullsNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoPullsNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  body: string[] // 标签名数组，如: ["feat", "bug"]
}

interface PutReposOwnerRepoPullsNumberLabels {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  body: string[] // 标签名数组，如: ["feat", "bug"]
}

interface DeleteReposOwnerRepoPullsNumberLabelsName {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  number: number // 第几个PR，即本仓库PR的序数
  name: string // 标签名称
}

interface GetReposOwnerRepoPullsCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number
}

interface PatchReposOwnerRepoPullsCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
  body: string // 必填。评论内容
}

interface DeleteReposOwnerRepoPullsCommentsId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 评论的ID
}

interface GetReposOwnerRepoReleases {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoReleases {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  tag_name: string // Tag 名称, 提倡以v字母为前缀做为Release名称，例如v1.0或者v2.3.4
  name: string // Release 名称
  body: string // Release 描述
  prerelease?: boolean // 是否为预览版本。默认: false（非预览版本）
  target_commitish: string // 分支名称或者commit SHA, 默认是当前默认分支
}

interface GetReposOwnerRepoReleasesId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // 发行版本的ID
}

interface PatchReposOwnerRepoReleasesId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  tag_name: string // Tag 名称, 提倡以v字母为前缀做为Release名称，例如v1.0或者v2.3.4
  name: string // Release 名称
  body: string // Release 描述
  prerelease?: boolean // 是否为预览版本。默认: false（非预览版本）
  id: number
}

interface DeleteReposOwnerRepoReleasesId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number
}

interface GetReposOwnerRepoReleasesLatest {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetReposOwnerRepoReleasesTagsTag {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  tag: string // Tag 名称
}

interface GetReposOwnerRepoHooks {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostReposOwnerRepoHooks {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  url: string // 远程HTTP URL
  encryption_type?: number // 加密类型: 0: 密码, 1: 签名密钥
  password?: string // 请求URL时会带上该密码，防止URL被恶意请求
  push_events?: boolean // Push代码到仓库
  tag_push_events?: boolean // 提交Tag到仓库
  issues_events?: boolean // 创建/关闭Issue
  note_events?: boolean // 评论了Issue/代码等等
  merge_requests_events?: boolean // 合并请求和合并后
}

interface GetReposOwnerRepoHooksId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // Webhook的ID
}

interface PatchReposOwnerRepoHooksId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // Webhook的ID
  url: string // 远程HTTP URL
  encryption_type?: number // 加密类型: 0: 密码, 1: 签名密钥
  password?: string // 请求URL时会带上该密码，防止URL被恶意请求
  push_events?: boolean // Push代码到仓库
  tag_push_events?: boolean // 提交Tag到仓库
  issues_events?: boolean // 创建/关闭Issue
  note_events?: boolean // 评论了Issue/代码等等
  merge_requests_events?: boolean // 合并请求和合并后
}

interface DeleteReposOwnerRepoHooksId {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // Webhook的ID
}

interface PostReposOwnerRepoHooksIdTests {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  id: number // Webhook的ID
}

interface GetReposOwnerRepoStargazers {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoSubscribers {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetReposOwnerRepoEvents {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetReposOwnerRepoNotifications {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  unread?: boolean // 是否只获取未读消息，默认：否
  participating?: boolean // 是否只获取自己直接参与的消息，默认：否
  type?: string // 筛选指定类型的通知，all：所有，event：事件通知，referer：@ 通知
  since?: string // 只获取在给定时间后更新的消息，要求时间格式为 ISO 8601
  before?: string // 只获取在给定时间前更新的消息，要求时间格式为 ISO 8601
  ids?: string // 指定一组通知 ID，以 , 分隔
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PutReposOwnerRepoNotifications {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  ids?: string // 指定一组通知 ID，以 , 分隔
}

interface PostReposOwnerRepoOpen {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库path
}

interface GetUserKeys {
  access_token?: string // 用户授权码
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostUserKeys {
  access_token?: string // 用户授权码
  key: string // 公钥内容
  title: string // 公钥名称
}

interface GetUserKeysId {
  access_token?: string // 用户授权码
  id: number // 公钥 ID
}

interface DeleteUserKeysId {
  access_token?: string // 用户授权码
  id: number // 公钥 ID
}

interface GetUserOrgs {
  access_token?: string // 用户授权码
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  admin?: boolean // 只列出授权用户管理的组织
}

interface GetUserIssues {
  access_token?: string // 用户授权码
  filter?: string // 筛选参数: 授权用户负责的(assigned)，授权用户创建的(created)，包含前两者的(all)。默认: assigned
  state?: string // Issue的状态: open（开启的）, progressing(进行中), closed（关闭的）, rejected（拒绝的）。 默认: open
  labels?: string // 用逗号分开的标签。如: bug,performance
  sort?: string // 排序依据: 创建时间(created)，更新时间(updated_at)。默认: created_at
  direction?: string // 排序方式: 升序(asc)，降序(desc)。默认: desc
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  schedule?: string // 计划开始日期，格式：20181006T173008+80-20181007T173008+80（区间），或者 -20181007T173008+80（小于20181007T173008+80），或者 20181006T173008+80-（大于20181006T173008+80），要求时间格式为20181006T173008+80
  deadline?: string // 计划截止日期，格式同上
  created_at?: string // 任务创建时间，格式同上
  finished_at?: string // 任务完成时间，即任务最后一次转为已完成状态的时间点。格式同上
}

interface GetUserRepos {
  access_token?: string // 用户授权码
  visibility?: string // 公开(public)、私有(private)或者所有(all)，默认: 所有(all)
  affiliation?: string // owner(授权用户拥有的仓库)、collaborator(授权用户为仓库成员)、organization_member(授权用户为仓库所在组织并有访问仓库权限)、enterprise_member(授权用户所在企业并有访问仓库权限)、admin(所有有权限的，包括所管理的组织中所有仓库、所管理的企业的所有仓库)。                   可以用逗号分隔符组合。如: owner, organization_member 或 owner, collaborator, organization_member
  type?: string // 筛选用户仓库: 其创建(owner)、个人(personal)、其为成员(member)、公开(public)、私有(private)，不能与 visibility 或 affiliation 参数一并使用，否则会报 422 错误
  sort?: string // 排序方式: 创建时间(created)，更新时间(updated)，最后推送时间(pushed)，仓库所属与名称(full_name)。默认: full_name
  direction?: string // 如果sort参数为full_name，用升序(asc)。否则降序(desc)
  q?: string // 搜索关键字
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostUserRepos {
  access_token?: string // 用户授权码
  name: string // 仓库名称
  description?: string // 仓库描述
  homepage?: string // 主页(eg: https://gitee.com)
  has_issues?: boolean // 允许提Issue与否。默认: 允许(true)
  has_wiki?: boolean // 提供Wiki与否。默认: 提供(true)
  can_comment?: boolean // 允许用户对仓库进行评论。默认： 允许(true)
  auto_init?: boolean // 值为true时则会用README初始化仓库。默认: 不初始化(false)
  gitignore_template?: string // Git Ignore模版
  license_template?: string // License模版
  path?: string // 仓库路径
  private?: boolean // 仓库公开或私有。默认: 公开(false)
}

interface GetUser {
  access_token?: string // 用户授权码
}

interface PatchUser {
  access_token?: string // 用户授权码
  name?: string // 昵称
  blog?: string // 微博链接
  weibo?: string // 博客站点
  bio?: string // 自我介绍
}

interface GetUserFollowers {
  access_token?: string // 用户授权码
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUserFollowing {
  access_token?: string // 用户授权码
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUserNamespaces {
  access_token?: string // 用户授权码
  mode?: string // 参与方式: project(所有参与仓库的namepsce)、intrant(所加入的namespace)、all(包含前两者)，默认(intrant)
}

interface GetUserNamespace {
  access_token?: string // 用户授权码
  path: string // Namespace path
}

interface GetUserStarred {
  access_token?: string // 用户授权码
  sort?: string // 根据仓库创建时间(created)或最后推送时间(updated)进行排序，默认：创建时间
  direction?: string // 按递增(asc)或递减(desc)排序，默认：递减
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUserSubscriptions {
  access_token?: string // 用户授权码
  sort?: string // 根据仓库创建时间(created)或最后推送时间(updated)进行排序，默认：创建时间
  direction?: string // 按递增(asc)或递减(desc)排序，默认：递减
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUserEnterprises {
  access_token?: string // 用户授权码
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  admin?: boolean // 只列出授权用户管理的企业
}

interface GetUserMembershipsOrgs {
  access_token?: string // 用户授权码
  active?: boolean // 根据成员是否已激活进行筛选资料，缺省返回所有资料
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUserMembershipsOrgsOrg {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
}

interface PatchUserMembershipsOrgsOrg {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  remark?: string // 在组织中的备注信息
}

interface DeleteUserMembershipsOrgsOrg {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
}

interface GetUserFollowingUsername {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
}

interface PutUserFollowingUsername {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
}

interface DeleteUserFollowingUsername {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
}

interface GetUserStarredOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PutUserStarredOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface DeleteUserStarredOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetUserSubscriptionsOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface PutUserSubscriptionsOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  watch_type: string // watch策略, watching: 关注所有动态, ignoring: 关注但不提醒动态
}

interface DeleteUserSubscriptionsOwnerRepo {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
}

interface GetGists {
  access_token?: string // 用户授权码
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostGists {
  access_token?: string // 用户授权码
  files: Record<string, any> // Hash形式的代码片段文件名以及文件内容。如: { "file1.txt": { "content": "String file contents" } }
  description: string // 代码片段描述，1~30个字符
  public?: boolean // 公开/私有，默认: 私有
}

interface GetGistsStarred {
  access_token?: string // 用户授权码
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetGistsGistIdComments {
  access_token?: string // 用户授权码
  gist_id: string // 代码片段的ID
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostGistsGistIdComments {
  access_token?: string // 用户授权码
  gist_id: string // 代码片段的ID
  body: string // 评论内容
}

interface GetGistsGistIdCommentsId {
  access_token?: string // 用户授权码
  gist_id: string // 代码片段的ID
  id: number // 评论的ID
}

interface PatchGistsGistIdCommentsId {
  access_token?: string // 用户授权码
  gist_id: string // 代码片段的ID
  id: number // 评论的ID
  body: string // 评论内容
}

interface DeleteGistsGistIdCommentsId {
  access_token?: string // 用户授权码
  gist_id: string // 代码片段的ID
  id: number // 评论的ID
}

interface GetGistsId {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface PatchGistsId {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
  files?: Record<string, any> // Hash形式的代码片段文件名以及文件内容。如: { "file1.txt": { "content": "String file contents" } }
  description?: string // 代码片段描述，1~30个字符
  public?: boolean // 公开/私有，默认: 私有
}

interface DeleteGistsId {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface GetGistsIdCommits {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface PutGistsIdStar {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface DeleteGistsIdStar {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface GetGistsIdStar {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface PostGistsIdForks {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
}

interface GetGistsIdForks {
  access_token?: string // 用户授权码
  id: string // 代码片段的ID
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUsersUsernameOrgs {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostUsersOrganization {
  access_token?: string // 用户授权码
  name: string // 组织名称
  org: string // 组织的路径(path/login)
  description?: string // 组织描述
}

interface GetUsersUsernameRepos {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  type?: string // 用户创建的仓库(owner)，用户个人仓库(personal)，用户为仓库成员(member)，所有(all)。默认: 所有(all)
  sort?: string // 排序方式: 创建时间(created)，更新时间(updated)，最后推送时间(pushed)，仓库所属与名称(full_name)。默认: full_name
  direction?: string // 如果sort参数为full_name，用升序(asc)。否则降序(desc)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUsersUsername {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
}

interface GetUsersUsernameFollowers {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUsersUsernameFollowing {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUsersUsernameFollowingTargetUser {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  target_user: string // 目标用户的用户名(username/login)
}

interface GetUsersUsernameKeys {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetUsersUsernameStarred {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
  sort?: string // 根据仓库创建时间(created)或最后推送时间(updated)进行排序，默认：创建时间
  direction?: string // 按递增(asc)或递减(desc)排序，默认：递减
}

interface GetUsersUsernameSubscriptions {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
  sort?: string // 根据仓库创建时间(created)或最后推送时间(updated)进行排序，默认：创建时间
  direction?: string // 按递增(asc)或递减(desc)排序，默认：递减
}

interface GetUsersUsernameReceivedEvents {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetUsersUsernameReceivedEventsPublic {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetUsersUsernameEvents {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetUsersUsernameEventsPublic {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetUsersUsernameEventsOrgsOrg {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
  org: string // 组织的路径(path/login)
}

interface GetOrgsOrg {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
}

interface PatchOrgsOrg {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  email?: string // 组织公开的邮箱地址
  location?: string // 组织所在地
  name?: string // 组织名称
  description?: string // 组织简介
  html_url?: string // 组织站点
}

interface GetOrgsOrgMembers {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  role?: string // 根据角色筛选成员
}

interface GetOrgsOrgFollowers {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetOrgsOrgIssues {
  access_token?: string // 用户授权码
  filter?: string // 筛选参数: 授权用户负责的(assigned)，授权用户创建的(created)，包含前两者的(all)。默认: assigned
  state?: string // Issue的状态: open（开启的）, progressing(进行中), closed（关闭的）, rejected（拒绝的）。 默认: open
  labels?: string // 用逗号分开的标签。如: bug,performance
  sort?: string // 排序依据: 创建时间(created)，更新时间(updated_at)。默认: created_at
  direction?: string // 排序方式: 升序(asc)，降序(desc)。默认: desc
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  schedule?: string // 计划开始日期，格式：20181006T173008+80-20181007T173008+80（区间），或者 -20181007T173008+80（小于20181007T173008+80），或者 20181006T173008+80-（大于20181006T173008+80），要求时间格式为20181006T173008+80
  deadline?: string // 计划截止日期，格式同上
  created_at?: string // 任务创建时间，格式同上
  finished_at?: string // 任务完成时间，即任务最后一次转为已完成状态的时间点。格式同上
  org: string // 组织的路径(path/login)
}

interface GetOrgsOrgRepos {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  type?: string // 筛选仓库的类型，可以是 all, public, private。默认: all
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostOrgsOrgRepos {
  access_token?: string // 用户授权码
  name: string // 仓库名称
  description?: string // 仓库描述
  homepage?: string // 主页(eg: https://gitee.com)
  has_issues?: boolean // 允许提Issue与否。默认: 允许(true)
  has_wiki?: boolean // 提供Wiki与否。默认: 提供(true)
  can_comment?: boolean // 允许用户对仓库进行评论。默认： 允许(true)
  org: string // 组织的路径(path/login)
  public?: number // 仓库开源类型。0(私有), 1(外部开源), 2(内部开源)，注：与private互斥，以public为主。
  private?: boolean // 仓库公开或私有。默认: 公开(false)，注：与public互斥，以public为主。
  auto_init?: boolean // 值为true时则会用README初始化仓库。默认: 不初始化(false)
  gitignore_template?: string // Git Ignore模版
  license_template?: string // License模版
  path?: string // 仓库路径
}

interface DeleteOrgsOrgMembershipsUsername {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  username: string // 用户名(username/login)
}

interface GetOrgsOrgMembershipsUsername {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  username: string // 用户名(username/login)
}

interface PutOrgsOrgMembershipsUsername {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  username: string // 用户名(username/login)
  role?: string // 设置用户在组织的角色
}

interface GetOrgsOrgEvents {
  access_token?: string // 用户授权码
  org: string // 组织的路径(path/login)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetIssues {
  access_token?: string // 用户授权码
  filter?: string // 筛选参数: 授权用户负责的(assigned)，授权用户创建的(created)，包含前两者的(all)。默认: assigned
  state?: string // Issue的状态: open（开启的）, progressing(进行中), closed（关闭的）, rejected（拒绝的）。 默认: open
  labels?: string // 用逗号分开的标签。如: bug,performance
  sort?: string // 排序依据: 创建时间(created)，更新时间(updated_at)。默认: created_at
  direction?: string // 排序方式: 升序(asc)，降序(desc)。默认: desc
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  schedule?: string // 计划开始日期，格式：20181006T173008+80-20181007T173008+80（区间），或者 -20181007T173008+80（小于20181007T173008+80），或者 20181006T173008+80-（大于20181006T173008+80），要求时间格式为20181006T173008+80
  deadline?: string // 计划截止日期，格式同上
  created_at?: string // 任务创建时间，格式同上
  finished_at?: string // 任务完成时间，即任务最后一次转为已完成状态的时间点。格式同上
}

interface GetEnterprisesEnterpriseIssues {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  state?: string // Issue的状态: open（开启的）, progressing(进行中), closed（关闭的）, rejected（拒绝的）。 默认: open
  labels?: string // 用逗号分开的标签。如: bug,performance
  sort?: string // 排序依据: 创建时间(created)，更新时间(updated_at)。默认: created_at
  direction?: string // 排序方式: 升序(asc)，降序(desc)。默认: desc
  since?: string // 起始的更新时间，要求时间格式为 ISO 8601
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  schedule?: string // 计划开始日期，格式：20181006T173008+80-20181007T173008+80（区间），或者 -20181007T173008+80（小于20181007T173008+80），或者 20181006T173008+80-（大于20181006T173008+80），要求时间格式为20181006T173008+80
  deadline?: string // 计划截止日期，格式同上
  created_at?: string // 任务创建时间，格式同上
  finished_at?: string // 任务完成时间，即任务最后一次转为已完成状态的时间点。格式同上
  milestone?: string // 根据里程碑标题。none为没里程碑的，*为所有带里程碑的
  assignee?: string // 用户的username。 none为没指派者, *为所有带有指派者的
  creator?: string // 创建Issues的用户username
  program?: string // 所属项目名称。none为没所属有项目的，*为所有带所属项目的
}

interface GetEnterprisesEnterprise {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
}

interface GetEnterprisesEnterpriseMembers {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  role?: string // 根据角色筛选成员
}

interface PostEnterprisesEnterpriseMembers {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  username?: string // 需要邀请的用户名(username/login)，username,email至少填写一个
  email?: string // 要添加邮箱地址，若该邮箱未注册则自动创建帐号。username,email至少填写一个
  role?: string // 企业角色：member => 普通成员, outsourced => 外包成员, admin => 管理员
  name?: string // 企业成员真实姓名（备注）
}

interface GetEnterprisesEnterpriseMembersSearch {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  query_type: string // 查询类型：username/email
  query_value: string // 查询值
}

interface GetEnterprisesEnterpriseWeekReportsIdComments {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  id: number // 周报ID
}

interface PostEnterprisesEnterpriseWeekReportsIdComment {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  id: number // 周报ID
  body: string // 评论的内容
}

interface DeleteEnterprisesEnterpriseWeekReportsReportIdCommentsId {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  report_id: number // 周报ID
  id: number // 评论ID
}

interface GetEnterprisesEnterpriseUsersUsernameWeekReports {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  username: string // 用户名(username/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetEnterprisesEnterpriseWeekReports {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  username?: string // 用户名(username/login)
  year?: number // 周报所属年
  week_index?: number // 周报所属周
  date?: string // 周报日期(格式：2019-03-25)
}

interface GetEnterprisesEnterpriseWeekReportsId {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  id: number // 周报ID
}

interface PatchEnterprisesEnterpriseWeekReportId {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  id: number // 周报ID
  content: string // 周报内容
}

interface PostEnterprisesEnterpriseWeekReport {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  year: number // 周报所属年
  content: string // 周报内容
  week_index: number // 周报所属周
  date?: string // 周报日期(格式：2019-03-25)
}

interface GetEnterprisesEnterpriseIssuesNumber {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface PatchEnterprisesEnterpriseIssuesNumber {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  title?: string // Issue标题
  state?: string // Issue 状态，open（开启的）、progressing（进行中）、closed（关闭的）
  body?: string // Issue描述
  assignee?: string // Issue负责人的个人空间地址
  collaborators?: string // Issue协助者的个人空间地址, 以 , 分隔
  milestone?: number // 里程碑序号
  labels?: string // 用逗号分开的标签，名称要求长度在 2-20 之间且非特殊字符。如: bug,performance
  program?: string // 项目ID
  security_hole?: boolean // 是否是私有issue(默认为false)
  branch?: string // 分支名称，传空串表示取消关联分支
}

interface GetEnterprisesEnterpriseIssuesNumberPullRequests {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
}

interface GetEnterprisesEnterpriseIssuesNumberComments {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetEnterprisesEnterpriseIssuesNumberLabels {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  number: string // Issue 编号(区分大小写，无需添加 # 号)
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetEnterprisesEnterpriseLabels {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
}

interface GetEnterprisesEnterpriseLabelsName {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  name: string // 标签名称
}

interface GetEnterprisesEnterpriseRepos {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  type?: string // 筛选仓库的类型，可以是 all, public, internal, private。默认: all
  direct?: boolean // 只获取直属仓库，默认: false
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PostEnterprisesEnterpriseRepos {
  access_token?: string // 用户授权码
  name: string // 仓库名称
  description?: string // 仓库描述
  homepage?: string // 主页(eg: https://gitee.com)
  has_issues?: boolean // 允许提Issue与否。默认: 允许(true)
  has_wiki?: boolean // 提供Wiki与否。默认: 提供(true)
  can_comment?: boolean // 允许用户对仓库进行评论。默认： 允许(true)
  enterprise: string // 企业的路径(path/login)
  auto_init?: boolean // 值为true时则会用README初始化仓库。默认: 不初始化(false)
  gitignore_template?: string // Git Ignore模版
  license_template?: string // License模版
  path?: string // 仓库路径
  private?: number // 仓库开源类型。0(私有), 1(外部开源), 2(内部开源)。默认: 0
  outsourced?: boolean // 值为true值为外包仓库, false值为内部仓库。默认: 内部仓库(false)
  project_creator?: string // 负责人的username
  members?: string // 用逗号分开的仓库成员。如: member1,member2
}

interface GetEnterprisesEnterpriseMembersUsername {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  username: string // 用户名(username/login)
}

interface DeleteEnterprisesEnterpriseMembersUsername {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  username: string // 用户名(username/login)
}

interface PutEnterprisesEnterpriseMembersUsername {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  username: string // 用户名(username/login)
  role?: string // 企业角色：member => 普通成员, outsourced => 外包成员, admin => 管理员
  active?: boolean // 是否可访问企业资源，默认:是。（若选否则禁止该用户访问企业资源）
  name?: string // 企业成员真实姓名（备注）
}

interface GetGitignoreTemplates {
  access_token?: string // 用户授权码
}

interface GetGitignoreTemplatesName {
  access_token?: string // 用户授权码
  name: string // .gitignore 模板名
}

interface GetGitignoreTemplatesNameRaw {
  access_token?: string // 用户授权码
  name: string // .gitignore 模板名
}

interface GetLicenses {
  access_token?: string // 用户授权码
}

interface GetLicensesLicense {
  access_token?: string // 用户授权码
  license: string // 协议名称
}

interface GetLicensesLicenseRaw {
  access_token?: string // 用户授权码
  license: string // 协议名称
}

interface PostMarkdown {
  access_token?: string // 用户授权码
  text: string // Markdown 文本
}

interface GetEnterpriseEnterprisePullRequests {
  access_token?: string // 用户授权码
  enterprise: string // 企业的路径(path/login)
  issue_number?: string // 可选。Issue 编号(区分大小写，无需添加 # 号)
  repo?: string // 可选。仓库路径(path)
  program_id?: number // 可选。项目ID
  state?: string // 可选。Pull Request 状态
  head?: string // 可选。Pull Request 提交的源分支。格式：branch 或者：username:branch
  base?: string // 可选。Pull Request 提交目标分支的名称。
  sort?: string // 可选。排序字段，默认按创建时间
  direction?: string // 可选。升序/降序
  milestone_number?: number // 可选。里程碑序号(id)
  labels?: string // 用逗号分开的标签。如: bug,performance
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface GetNetworksOwnerRepoEvents {
  access_token?: string // 用户授权码
  owner?: string // 仓库所属空间地址(企业、组织或个人的地址path)
  repo?: string // 仓库路径(path)
  prev_id?: number // 滚动列表的最后一条记录的id
  limit?: number // 滚动列表每页的数量，最大为 100
  page?: number // 当前的页码(待废弃，建议使用滚动列表参数)
  per_page?: number // 每页的数量，最大为 100(待废弃，建议使用滚动列表参数)
}

interface GetSearchRepositories {
  access_token?: string // 用户授权码
  q: string // 搜索关键字
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  owner?: string // 筛选指定空间地址(企业、组织或个人的地址 path) 的仓库
  fork?: boolean // 是否搜索含 fork 的仓库，默认：否
  language?: string // 筛选指定语言的仓库
  sort?: string // 排序字段，last_push_at(更新时间)、stars_count(收藏数)、forks_count(Fork 数)、watches_count(关注数)，默认为最佳匹配
  order?: string // 排序顺序: desc(default)、asc
}

interface GetSearchIssues {
  access_token?: string // 用户授权码
  q: string // 搜索关键字
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  repo?: string // 筛选指定仓库 (path, e.g. oschina/git-osc) 的 issues
  language?: string // 筛选指定语言的 issues
  label?: string // 筛选指定标签的 issues
  state?: string // 筛选指定状态的 issues, open(开启)、closed(完成)、rejected(拒绝)
  author?: string // 筛选指定创建者 (username/login) 的 issues
  assignee?: string // 筛选指定负责人 (username/login) 的 issues
  sort?: string // 排序字段，created_at(创建时间)、last_push_at(更新时间)、notes_count(评论数)，默认为最佳匹配
  order?: string // 排序顺序: desc(default)、asc
}

interface GetSearchUsers {
  access_token?: string // 用户授权码
  q: string // 搜索关键字
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
  sort?: string // 排序字段，joined_at(注册时间)，默认为最佳匹配
  order?: string // 排序顺序: desc(default)、asc
}

interface GetNotificationsCount {
  access_token?: string // 用户授权码
  unread?: boolean // 是否只获取未读消息，默认：否
}

interface GetNotificationsThreads {
  access_token?: string // 用户授权码
  unread?: boolean // 是否只获取未读消息，默认：否
  participating?: boolean // 是否只获取自己直接参与的消息，默认：否
  type?: string // 筛选指定类型的通知，all：所有，event：事件通知，referer：@ 通知
  since?: string // 只获取在给定时间后更新的消息，要求时间格式为 ISO 8601
  before?: string // 只获取在给定时间前更新的消息，要求时间格式为 ISO 8601
  ids?: string // 指定一组通知 ID，以 , 分隔
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PutNotificationsThreads {
  access_token?: string // 用户授权码
  ids?: string // 指定一组通知 ID，以 , 分隔
}

interface GetNotificationsThreadsId {
  access_token?: string // 用户授权码
  id: string // 通知的 ID
}

interface PatchNotificationsThreadsId {
  access_token?: string // 用户授权码
  id: string // 通知的 ID
}

interface GetNotificationsMessages {
  access_token?: string // 用户授权码
  unread?: boolean // 是否只显示未读私信，默认：否
  since?: string // 只获取在给定时间后更新的私信，要求时间格式为 ISO 8601
  before?: string // 只获取在给定时间前更新的私信，要求时间格式为 ISO 8601
  ids?: string // 指定一组私信 ID，以 , 分隔
  page?: number // 当前的页码
  per_page?: number // 每页的数量，最大为 100
}

interface PutNotificationsMessages {
  access_token?: string // 用户授权码
  ids?: string // 指定一组私信 ID，以 , 分隔
}

interface PostNotificationsMessages {
  access_token?: string // 用户授权码
  username: string // 用户名(username/login)
  content: string // 私信内容
}

interface GetNotificationsMessagesId {
  access_token?: string // 用户授权码
  id: string // 私信的 ID
}

interface PatchNotificationsMessagesId {
  access_token?: string // 用户授权码
  id: string // 私信的 ID
}

interface GetEmails {
  access_token?: string // 用户授权码
}

interface GetEmojis {
  access_token?: string // 用户授权码
}

// 获取所有分支
export function getReposOwnerRepoBranches(params: GetReposOwnerRepoBranches): AxiosPromise<Branch[]> {
  return f('/repos/{owner}/{repo}/branches', params)
}

// 创建分支
export function postReposOwnerRepoBranches(params: PostReposOwnerRepoBranches): AxiosPromise<CompleteBranch> {
  return f('/repos/{owner}/{repo}/branches', params, 'post')
}

// 获取单个分支
export function getReposOwnerRepoBranchesBranch(params: GetReposOwnerRepoBranchesBranch): AxiosPromise<CompleteBranch> {
  return f('/repos/{owner}/{repo}/branches/{branch}', params)
}

// 设置分支保护
export function putReposOwnerRepoBranchesBranchProtection(
  params: PutReposOwnerRepoBranchesBranchProtection
): AxiosPromise<CompleteBranch> {
  return f('/repos/{owner}/{repo}/branches/{branch}/protection', params, 'put')
}

// 取消保护分支的设置
export function deleteReposOwnerRepoBranchesBranchProtection(params: DeleteReposOwnerRepoBranchesBranchProtection) {
  return f('/repos/{owner}/{repo}/branches/{branch}/protection', params, 'delete')
}

// 分支保护策略设置
export function putReposOwnerRepoBranchesWildcardSetting(
  params: PutReposOwnerRepoBranchesWildcardSetting
): AxiosPromise<ProtectionRule> {
  return f('/repos/{owner}/{repo}/branches/{wildcard}/setting', params, 'put')
}

// 删除仓库保护分支策略
export function deleteReposOwnerRepoBranchesWildcardSetting(
  params: DeleteReposOwnerRepoBranchesWildcardSetting
): AxiosPromise<ProtectionRule> {
  return f('/repos/{owner}/{repo}/branches/{wildcard}/setting', params, 'delete')
}

// 新建仓库保护分支策略
export function putReposOwnerRepoBranchesSettingNew(
  params: PutReposOwnerRepoBranchesSettingNew
): AxiosPromise<ProtectionRule> {
  return f('/repos/{owner}/{repo}/branches/setting/new', params, 'put')
}

// 仓库的所有提交
export function getReposOwnerRepoCommits(params: GetReposOwnerRepoCommits): AxiosPromise<RepoCommit[]> {
  return f('/repos/{owner}/{repo}/commits', params)
}

// 仓库的某个提交
export function getReposOwnerRepoCommitsSha(params: GetReposOwnerRepoCommitsSha): AxiosPromise<RepoCommit> {
  return f('/repos/{owner}/{repo}/commits/{sha}', params)
}

// 两个Commits之间对比的版本差异
export function getReposOwnerRepoCompareBaseHead(params: GetReposOwnerRepoCompareBaseHead): AxiosPromise<Compare> {
  return f('/repos/{owner}/{repo}/compare/{base}...{head}', params)
}

// 获取仓库已部署的公钥
export function getReposOwnerRepoKeys(params: GetReposOwnerRepoKeys): AxiosPromise<SSHKey[]> {
  return f('/repos/{owner}/{repo}/keys', params)
}

// 为仓库添加公钥
export function postReposOwnerRepoKeys(params: PostReposOwnerRepoKeys): AxiosPromise<SSHKey> {
  return f('/repos/{owner}/{repo}/keys', params, 'post')
}

// 获取仓库可部署的公钥
export function getReposOwnerRepoKeysAvailable(params: GetReposOwnerRepoKeysAvailable): AxiosPromise<SSHKeyBasic[]> {
  return f('/repos/{owner}/{repo}/keys/available', params)
}

// 启用仓库公钥
export function putReposOwnerRepoKeysEnableId(params: PutReposOwnerRepoKeysEnableId) {
  return f('/repos/{owner}/{repo}/keys/enable/{id}', params, 'put')
}

// 停用仓库公钥
export function deleteReposOwnerRepoKeysEnableId(params: DeleteReposOwnerRepoKeysEnableId) {
  return f('/repos/{owner}/{repo}/keys/enable/{id}', params, 'delete')
}

// 获取仓库的单个公钥
export function getReposOwnerRepoKeysId(params: GetReposOwnerRepoKeysId): AxiosPromise<SSHKey> {
  return f('/repos/{owner}/{repo}/keys/{id}', params)
}

// 删除一个仓库公钥
export function deleteReposOwnerRepoKeysId(params: DeleteReposOwnerRepoKeysId) {
  return f('/repos/{owner}/{repo}/keys/{id}', params, 'delete')
}

// 获取仓库README
export function getReposOwnerRepoReadme(params: GetReposOwnerRepoReadme): AxiosPromise<Content> {
  return f('/repos/{owner}/{repo}/readme', params)
}

// 获取仓库具体路径下的内容
export function getReposOwnerRepoContents(params: GetReposOwnerRepoContents): AxiosPromise<Content[]> {
  return f('/repos/{owner}/{repo}/contents(/{path})', params)
}

// 新建文件
export function postReposOwnerRepoContentsPath(params: PostReposOwnerRepoContentsPath): AxiosPromise<CommitContent> {
  return f('/repos/{owner}/{repo}/contents/{path}', params, 'post')
}

// 更新文件
export function putReposOwnerRepoContentsPath(params: PutReposOwnerRepoContentsPath): AxiosPromise<CommitContent> {
  return f('/repos/{owner}/{repo}/contents/{path}', params, 'put')
}

// 删除文件
export function deleteReposOwnerRepoContentsPath(
  params: DeleteReposOwnerRepoContentsPath
): AxiosPromise<CommitContent> {
  return f('/repos/{owner}/{repo}/contents/{path}', params, 'delete')
}

// 获取文件Blob
export function getReposOwnerRepoGitBlobsSha(params: GetReposOwnerRepoGitBlobsSha): AxiosPromise<Blob> {
  return f('/repos/{owner}/{repo}/git/blobs/{sha}', params)
}

// 获取目录Tree
export function getReposOwnerRepoGitTreesSha(params: GetReposOwnerRepoGitTreesSha): AxiosPromise<Tree> {
  return f('/repos/{owner}/{repo}/git/trees/{sha}', params)
}

// 获取 Gitee 指数
export function getReposOwnerRepoGitGiteeMetrics(params: GetReposOwnerRepoGitGiteeMetrics): AxiosPromise<GiteeMetrics> {
  return f('/repos/{owner}/{repo}/git/gitee_metrics', params)
}

// 仓库的所有Issues
export function getReposOwnerRepoIssues(params: GetReposOwnerRepoIssues): AxiosPromise<Issue[]> {
  return f('/repos/{owner}/{repo}/issues', params)
}

// 仓库的某个Issue
export function getReposOwnerRepoIssuesNumber(params: GetReposOwnerRepoIssuesNumber): AxiosPromise<Issue> {
  return f('/repos/{owner}/{repo}/issues/{number}', params)
}

// 创建Issue
export function postReposOwnerIssues(params: PostReposOwnerIssues): AxiosPromise<Issue> {
  return f('/repos/{owner}/issues', params, 'post')
}

// 更新Issue
export function patchReposOwnerIssuesNumber(params: PatchReposOwnerIssuesNumber): AxiosPromise<Issue> {
  return f('/repos/{owner}/issues/{number}', params, 'patch')
}

// 获取 issue 关联的 Pull Requests
export function getReposOwnerIssuesNumberPullRequests(
  params: GetReposOwnerIssuesNumberPullRequests
): AxiosPromise<PullRequest[]> {
  return f('/repos/{owner}/issues/{number}/pull_requests', params)
}

// 获取某个Issue下的操作日志
export function getReposOwnerIssuesNumberOperateLogs(
  params: GetReposOwnerIssuesNumberOperateLogs
): AxiosPromise<OperateLog[]> {
  return f('/repos/{owner}/issues/{number}/operate_logs', params)
}

// 获取仓库所有任务标签
export function getReposOwnerRepoLabels(params: GetReposOwnerRepoLabels): AxiosPromise<Label[]> {
  return f('/repos/{owner}/{repo}/labels', params)
}

// 创建仓库任务标签
export function postReposOwnerRepoLabels(params: PostReposOwnerRepoLabels): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/labels', params, 'post')
}

// 根据标签名称获取单个标签
export function getReposOwnerRepoLabelsName(params: GetReposOwnerRepoLabelsName): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/labels/{name}', params)
}

// 删除一个仓库任务标签
export function deleteReposOwnerRepoLabelsName(params: DeleteReposOwnerRepoLabelsName) {
  return f('/repos/{owner}/{repo}/labels/{name}', params, 'delete')
}

// 更新一个仓库任务标签
export function patchReposOwnerRepoLabelsOriginalName(
  params: PatchReposOwnerRepoLabelsOriginalName
): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/labels/{original_name}', params, 'patch')
}

// 获取仓库任务的所有标签
export function getReposOwnerRepoIssuesNumberLabels(
  params: GetReposOwnerRepoIssuesNumberLabels
): AxiosPromise<Label[]> {
  return f('/repos/{owner}/{repo}/issues/{number}/labels', params)
}

// 创建Issue标签 需要在请求的body里填上数组，元素为标签的名字。如: ["performance", "bug"]
export function postReposOwnerRepoIssuesNumberLabels(
  params: PostReposOwnerRepoIssuesNumberLabels
): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/issues/{number}/labels', params, 'post')
}

// 替换Issue所有标签 需要在请求的body里填上数组，元素为标签的名字。如: ["performance", "bug"]
export function putReposOwnerRepoIssuesNumberLabels(params: PutReposOwnerRepoIssuesNumberLabels): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/issues/{number}/labels', params, 'put')
}

// 删除Issue所有标签
export function deleteReposOwnerRepoIssuesNumberLabels(params: DeleteReposOwnerRepoIssuesNumberLabels) {
  return f('/repos/{owner}/{repo}/issues/{number}/labels', params, 'delete')
}

// 删除Issue标签
export function deleteReposOwnerRepoIssuesNumberLabelsName(params: DeleteReposOwnerRepoIssuesNumberLabelsName) {
  return f('/repos/{owner}/{repo}/issues/{number}/labels/{name}', params, 'delete')
}

// 获取仓库所有里程碑
export function getReposOwnerRepoMilestones(params: GetReposOwnerRepoMilestones): AxiosPromise<Milestone[]> {
  return f('/repos/{owner}/{repo}/milestones', params)
}

// 创建仓库里程碑
export function postReposOwnerRepoMilestones(params: PostReposOwnerRepoMilestones): AxiosPromise<Milestone> {
  return f('/repos/{owner}/{repo}/milestones', params, 'post')
}

// 获取仓库单个里程碑
export function getReposOwnerRepoMilestonesNumber(params: GetReposOwnerRepoMilestonesNumber): AxiosPromise<Milestone> {
  return f('/repos/{owner}/{repo}/milestones/{number}', params)
}

// 更新仓库里程碑
export function patchReposOwnerRepoMilestonesNumber(
  params: PatchReposOwnerRepoMilestonesNumber
): AxiosPromise<Milestone> {
  return f('/repos/{owner}/{repo}/milestones/{number}', params, 'patch')
}

// 删除仓库单个里程碑
export function deleteReposOwnerRepoMilestonesNumber(params: DeleteReposOwnerRepoMilestonesNumber) {
  return f('/repos/{owner}/{repo}/milestones/{number}', params, 'delete')
}

// 获取一个仓库使用的开源许可协议
export function getReposOwnerRepoLicense(params: GetReposOwnerRepoLicense) {
  return f('/repos/{owner}/{repo}/license', params)
}

// 获取仓库的Commit评论
export function getReposOwnerRepoComments(params: GetReposOwnerRepoComments): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/comments', params)
}

// 获取单个Commit的评论
export function getReposOwnerRepoCommitsRefComments(params: GetReposOwnerRepoCommitsRefComments): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/commits/{ref}/comments', params)
}

// 获取仓库的某条Commit评论
export function getReposOwnerRepoCommentsId(params: GetReposOwnerRepoCommentsId): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/comments/{id}', params)
}

// 更新Commit评论
export function patchReposOwnerRepoCommentsId(params: PatchReposOwnerRepoCommentsId): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/comments/{id}', params, 'patch')
}

// 删除Commit评论
export function deleteReposOwnerRepoCommentsId(params: DeleteReposOwnerRepoCommentsId) {
  return f('/repos/{owner}/{repo}/comments/{id}', params, 'delete')
}

// 创建Commit评论
export function postReposOwnerRepoCommitsShaComments(params: PostReposOwnerRepoCommitsShaComments): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/commits/{sha}/comments', params, 'post')
}

// 获取仓库所有Issue的评论
export function getReposOwnerRepoIssuesComments(params: GetReposOwnerRepoIssuesComments): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/issues/comments', params)
}

// 获取仓库某个Issue所有的评论
export function getReposOwnerRepoIssuesNumberComments(
  params: GetReposOwnerRepoIssuesNumberComments
): AxiosPromise<Note[]> {
  return f('/repos/{owner}/{repo}/issues/{number}/comments', params)
}

// 创建某个Issue评论
export function postReposOwnerRepoIssuesNumberComments(
  params: PostReposOwnerRepoIssuesNumberComments
): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/issues/{number}/comments', params, 'post')
}

// 获取仓库Issue某条评论
export function getReposOwnerRepoIssuesCommentsId(params: GetReposOwnerRepoIssuesCommentsId): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/issues/comments/{id}', params)
}

// 更新Issue某条评论
export function patchReposOwnerRepoIssuesCommentsId(params: PatchReposOwnerRepoIssuesCommentsId): AxiosPromise<Note> {
  return f('/repos/{owner}/{repo}/issues/comments/{id}', params, 'patch')
}

// 删除Issue某条评论
export function deleteReposOwnerRepoIssuesCommentsId(params: DeleteReposOwnerRepoIssuesCommentsId) {
  return f('/repos/{owner}/{repo}/issues/comments/{id}', params, 'delete')
}

// 获取Pages信息
export function getReposOwnerRepoPages(params: GetReposOwnerRepoPages) {
  return f('/repos/{owner}/{repo}/pages', params)
}

// 请求建立Pages
export function postReposOwnerRepoPagesBuilds(params: PostReposOwnerRepoPagesBuilds) {
  return f('/repos/{owner}/{repo}/pages/builds', params, 'post')
}

// 获取用户的某个仓库
export function getReposOwnerRepo(params: GetReposOwnerRepo): AxiosPromise<Project> {
  return f('/repos/{owner}/{repo}', params)
}

// 更新仓库设置
export function patchReposOwnerRepo(params: PatchReposOwnerRepo): AxiosPromise<Project> {
  return f('/repos/{owner}/{repo}', params, 'patch')
}

// 删除一个仓库
export function deleteReposOwnerRepo(params: DeleteReposOwnerRepo) {
  return f('/repos/{owner}/{repo}', params, 'delete')
}

// 修改代码审查设置
export function putReposOwnerRepoReviewer(params: PutReposOwnerRepoReviewer): AxiosPromise<Contributor> {
  return f('/repos/{owner}/{repo}/reviewer', params, 'put')
}

// 获取仓库贡献者
export function getReposOwnerRepoContributors(params: GetReposOwnerRepoContributors): AxiosPromise<Contributor> {
  return f('/repos/{owner}/{repo}/contributors', params)
}

// 列出仓库所有的tags
export function getReposOwnerRepoTags(params: GetReposOwnerRepoTags): AxiosPromise<Tag> {
  return f('/repos/{owner}/{repo}/tags', params)
}

// 创建一个仓库的 Tag
export function postReposOwnerRepoTags(params: PostReposOwnerRepoTags): AxiosPromise<Tag> {
  return f('/repos/{owner}/{repo}/tags', params, 'post')
}

// 清空一个仓库
export function putReposOwnerRepoClear(params: PutReposOwnerRepoClear) {
  return f('/repos/{owner}/{repo}/clear', params, 'put')
}

// 获取仓库的所有成员
export function getReposOwnerRepoCollaborators(params: GetReposOwnerRepoCollaborators): AxiosPromise<ProjectMember> {
  return f('/repos/{owner}/{repo}/collaborators', params)
}

// 判断用户是否为仓库成员
export function getReposOwnerRepoCollaboratorsUsername(params: GetReposOwnerRepoCollaboratorsUsername) {
  return f('/repos/{owner}/{repo}/collaborators/{username}', params)
}

// 添加仓库成员
export function putReposOwnerRepoCollaboratorsUsername(
  params: PutReposOwnerRepoCollaboratorsUsername
): AxiosPromise<ProjectMember> {
  return f('/repos/{owner}/{repo}/collaborators/{username}', params, 'put')
}

// 移除仓库成员
export function deleteReposOwnerRepoCollaboratorsUsername(params: DeleteReposOwnerRepoCollaboratorsUsername) {
  return f('/repos/{owner}/{repo}/collaborators/{username}', params, 'delete')
}

// 查看仓库成员的权限
export function getReposOwnerRepoCollaboratorsUsernamePermission(
  params: GetReposOwnerRepoCollaboratorsUsernamePermission
): AxiosPromise<ProjectMemberPermission> {
  return f('/repos/{owner}/{repo}/collaborators/{username}/permission', params)
}

// 查看仓库的Forks
export function getReposOwnerRepoForks(params: GetReposOwnerRepoForks): AxiosPromise<Project> {
  return f('/repos/{owner}/{repo}/forks', params)
}

// Fork一个仓库
export function postReposOwnerRepoForks(params: PostReposOwnerRepoForks): AxiosPromise<Project> {
  return f('/repos/{owner}/{repo}/forks', params, 'post')
}

// 获取Pull Request列表
export function getReposOwnerRepoPulls(params: GetReposOwnerRepoPulls): AxiosPromise<PullRequest[]> {
  return f('/repos/{owner}/{repo}/pulls', params)
}

// 创建Pull Request
export function postReposOwnerRepoPulls(params: PostReposOwnerRepoPulls): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls', params, 'post')
}

// 获取该仓库下的所有Pull Request评论
export function getReposOwnerRepoPullsComments(
  params: GetReposOwnerRepoPullsComments
): AxiosPromise<PullRequestComments[]> {
  return f('/repos/{owner}/{repo}/pulls/comments', params)
}

// 获取单个Pull Request
export function getReposOwnerRepoPullsNumber(params: GetReposOwnerRepoPullsNumber): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}', params)
}

// 更新Pull Request信息
export function patchReposOwnerRepoPullsNumber(params: PatchReposOwnerRepoPullsNumber): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}', params, 'patch')
}

// 获取某个Pull Request的操作日志
export function getReposOwnerRepoPullsNumberOperateLogs(
  params: GetReposOwnerRepoPullsNumberOperateLogs
): AxiosPromise<OperateLog> {
  return f('/repos/{owner}/{repo}/pulls/{number}/operate_logs', params)
}

// 获取某Pull Request的所有Commit信息。最多显示250条Commit
export function getReposOwnerRepoPullsNumberCommits(
  params: GetReposOwnerRepoPullsNumberCommits
): AxiosPromise<PullRequestCommits[]> {
  return f('/repos/{owner}/{repo}/pulls/{number}/commits', params)
}

// Pull Request Commit文件列表。最多显示300条diff
export function getReposOwnerRepoPullsNumberFiles(
  params: GetReposOwnerRepoPullsNumberFiles
): AxiosPromise<PullRequestFiles[]> {
  return f('/repos/{owner}/{repo}/pulls/{number}/files', params)
}

// 判断Pull Request是否已经合并
export function getReposOwnerRepoPullsNumberMerge(params: GetReposOwnerRepoPullsNumberMerge) {
  return f('/repos/{owner}/{repo}/pulls/{number}/merge', params)
}

// 合并Pull Request
export function putReposOwnerRepoPullsNumberMerge(params: PutReposOwnerRepoPullsNumberMerge) {
  return f('/repos/{owner}/{repo}/pulls/{number}/merge', params, 'put')
}

// 处理 Pull Request 审查
export function postReposOwnerRepoPullsNumberReview(params: PostReposOwnerRepoPullsNumberReview) {
  return f('/repos/{owner}/{repo}/pulls/{number}/review', params, 'post')
}

// 处理 Pull Request 测试
export function postReposOwnerRepoPullsNumberTest(params: PostReposOwnerRepoPullsNumberTest) {
  return f('/repos/{owner}/{repo}/pulls/{number}/test', params, 'post')
}

// 指派用户审查 Pull Request
export function postReposOwnerRepoPullsNumberAssignees(
  params: PostReposOwnerRepoPullsNumberAssignees
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/assignees', params, 'post')
}

// 取消用户审查 Pull Request
export function deleteReposOwnerRepoPullsNumberAssignees(
  params: DeleteReposOwnerRepoPullsNumberAssignees
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/assignees', params, 'delete')
}

// 重置 Pull Request 审查 的状态
export function patchReposOwnerRepoPullsNumberAssignees(
  params: PatchReposOwnerRepoPullsNumberAssignees
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/assignees', params, 'patch')
}

// 指派用户测试 Pull Request
export function postReposOwnerRepoPullsNumberTesters(
  params: PostReposOwnerRepoPullsNumberTesters
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/testers', params, 'post')
}

// 取消用户测试 Pull Request
export function deleteReposOwnerRepoPullsNumberTesters(
  params: DeleteReposOwnerRepoPullsNumberTesters
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/testers', params, 'delete')
}

// 重置 Pull Request 测试 的状态
export function patchReposOwnerRepoPullsNumberTesters(
  params: PatchReposOwnerRepoPullsNumberTesters
): AxiosPromise<PullRequest> {
  return f('/repos/{owner}/{repo}/pulls/{number}/testers', params, 'patch')
}

// 获取 Pull Request 关联的 issues
export function getReposOwnerRepoPullsNumberIssues(params: GetReposOwnerRepoPullsNumberIssues): AxiosPromise<Issue[]> {
  return f('/repos/{owner}/{repo}/pulls/{number}/issues', params)
}

// 获取某个Pull Request的所有评论
export function getReposOwnerRepoPullsNumberComments(
  params: GetReposOwnerRepoPullsNumberComments
): AxiosPromise<PullRequestComments[]> {
  return f('/repos/{owner}/{repo}/pulls/{number}/comments', params)
}

// 提交Pull Request评论
export function postReposOwnerRepoPullsNumberComments(
  params: PostReposOwnerRepoPullsNumberComments
): AxiosPromise<PullRequestComments> {
  return f('/repos/{owner}/{repo}/pulls/{number}/comments', params, 'post')
}

// 获取某个 Pull Request 的所有标签
export function getReposOwnerRepoPullsNumberLabels(params: GetReposOwnerRepoPullsNumberLabels): AxiosPromise<Label[]> {
  return f('/repos/{owner}/{repo}/pulls/{number}/labels', params)
}

// 创建 Pull Request 标签 需要在请求的 body 里填上数组，元素为标签的名字。如: ["performance", "bug"]
export function postReposOwnerRepoPullsNumberLabels(params: PostReposOwnerRepoPullsNumberLabels): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/pulls/{number}/labels', params, 'post')
}

// 替换 Pull Request 所有标签 需要在请求的body里填上数组，元素为标签的名字。如: ["performance", "bug"]
export function putReposOwnerRepoPullsNumberLabels(params: PutReposOwnerRepoPullsNumberLabels): AxiosPromise<Label> {
  return f('/repos/{owner}/{repo}/pulls/{number}/labels', params, 'put')
}

// 删除 Pull Request 标签
export function deleteReposOwnerRepoPullsNumberLabelsName(params: DeleteReposOwnerRepoPullsNumberLabelsName) {
  return f('/repos/{owner}/{repo}/pulls/{number}/labels/{name}', params, 'delete')
}

// 获取Pull Request的某个评论
export function getReposOwnerRepoPullsCommentsId(
  params: GetReposOwnerRepoPullsCommentsId
): AxiosPromise<PullRequestComments> {
  return f('/repos/{owner}/{repo}/pulls/comments/{id}', params)
}

// 编辑评论
export function patchReposOwnerRepoPullsCommentsId(
  params: PatchReposOwnerRepoPullsCommentsId
): AxiosPromise<PullRequestComments> {
  return f('/repos/{owner}/{repo}/pulls/comments/{id}', params, 'patch')
}

// 删除评论
export function deleteReposOwnerRepoPullsCommentsId(params: DeleteReposOwnerRepoPullsCommentsId) {
  return f('/repos/{owner}/{repo}/pulls/comments/{id}', params, 'delete')
}

// 获取仓库的所有Releases
export function getReposOwnerRepoReleases(params: GetReposOwnerRepoReleases): AxiosPromise<Release[]> {
  return f('/repos/{owner}/{repo}/releases', params)
}

// 创建仓库Release
export function postReposOwnerRepoReleases(params: PostReposOwnerRepoReleases): AxiosPromise<Release> {
  return f('/repos/{owner}/{repo}/releases', params, 'post')
}

// 获取仓库的单个Releases
export function getReposOwnerRepoReleasesId(params: GetReposOwnerRepoReleasesId): AxiosPromise<Release> {
  return f('/repos/{owner}/{repo}/releases/{id}', params)
}

// 更新仓库Release
export function patchReposOwnerRepoReleasesId(params: PatchReposOwnerRepoReleasesId): AxiosPromise<Release> {
  return f('/repos/{owner}/{repo}/releases/{id}', params, 'patch')
}

// 删除仓库Release
export function deleteReposOwnerRepoReleasesId(params: DeleteReposOwnerRepoReleasesId) {
  return f('/repos/{owner}/{repo}/releases/{id}', params, 'delete')
}

// 获取仓库的最后更新的Release
export function getReposOwnerRepoReleasesLatest(params: GetReposOwnerRepoReleasesLatest): AxiosPromise<Release> {
  return f('/repos/{owner}/{repo}/releases/latest', params)
}

// 根据Tag名称获取仓库的Release
export function getReposOwnerRepoReleasesTagsTag(params: GetReposOwnerRepoReleasesTagsTag): AxiosPromise<Release> {
  return f('/repos/{owner}/{repo}/releases/tags/{tag}', params)
}

// 列出仓库的WebHooks
export function getReposOwnerRepoHooks(params: GetReposOwnerRepoHooks): AxiosPromise<Hook[]> {
  return f('/repos/{owner}/{repo}/hooks', params)
}

// 创建一个仓库WebHook
export function postReposOwnerRepoHooks(params: PostReposOwnerRepoHooks): AxiosPromise<Hook> {
  return f('/repos/{owner}/{repo}/hooks', params, 'post')
}

// 获取仓库单个WebHook
export function getReposOwnerRepoHooksId(params: GetReposOwnerRepoHooksId): AxiosPromise<Hook> {
  return f('/repos/{owner}/{repo}/hooks/{id}', params)
}

// 更新一个仓库WebHook
export function patchReposOwnerRepoHooksId(params: PatchReposOwnerRepoHooksId): AxiosPromise<Hook> {
  return f('/repos/{owner}/{repo}/hooks/{id}', params, 'patch')
}

// 删除一个仓库WebHook
export function deleteReposOwnerRepoHooksId(params: DeleteReposOwnerRepoHooksId) {
  return f('/repos/{owner}/{repo}/hooks/{id}', params, 'delete')
}

// 测试WebHook是否发送成功
export function postReposOwnerRepoHooksIdTests(params: PostReposOwnerRepoHooksIdTests) {
  return f('/repos/{owner}/{repo}/hooks/{id}/tests', params, 'post')
}

// 列出 star 了仓库的用户
export function getReposOwnerRepoStargazers(params: GetReposOwnerRepoStargazers): AxiosPromise<ProjectStargazers[]> {
  return f('/repos/{owner}/{repo}/stargazers', params)
}

// 列出 watch 了仓库的用户
export function getReposOwnerRepoSubscribers(params: GetReposOwnerRepoSubscribers): AxiosPromise<ProjectWatchers[]> {
  return f('/repos/{owner}/{repo}/subscribers', params)
}

// 列出仓库的所有动态
export function getReposOwnerRepoEvents(params: GetReposOwnerRepoEvents): AxiosPromise<Event[]> {
  return f('/repos/{owner}/{repo}/events', params)
}

// 列出一个仓库里的通知
export function getReposOwnerRepoNotifications(
  params: GetReposOwnerRepoNotifications
): AxiosPromise<UserNotificationList[]> {
  return f('/repos/{owner}/{repo}/notifications', params)
}

// 标记一个仓库里的通知为已读
export function putReposOwnerRepoNotifications(params: PutReposOwnerRepoNotifications) {
  return f('/repos/{owner}/{repo}/notifications', params, 'put')
}

// 开通Gitee Go
export function postReposOwnerRepoOpen(params: PostReposOwnerRepoOpen) {
  return f('/repos/{owner}/{repo}/open', params, 'post')
}

// 列出授权用户的所有公钥
export function getUserKeys(params: GetUserKeys): AxiosPromise<SSHKey[]> {
  return f('/user/keys', params)
}

// 添加一个公钥
export function postUserKeys(params: PostUserKeys): AxiosPromise<SSHKey> {
  return f('/user/keys', params, 'post')
}

// 获取一个公钥
export function getUserKeysId(params: GetUserKeysId): AxiosPromise<SSHKey> {
  return f('/user/keys/{id}', params)
}

// 删除一个公钥
export function deleteUserKeysId(params: DeleteUserKeysId) {
  return f('/user/keys/{id}', params, 'delete')
}

// 列出授权用户所属的组织
export function getUserOrgs(params: GetUserOrgs): AxiosPromise<Group[]> {
  return f('/user/orgs', params)
}

// 获取授权用户的所有Issues
export function getUserIssues(params: GetUserIssues): AxiosPromise<Issue[]> {
  return f('/user/issues', params)
}

// 列出授权用户的所有仓库
export function getUserRepos(params: GetUserRepos): AxiosPromise<Project> {
  return f('/user/repos', params)
}

// 创建一个仓库
export function postUserRepos(params: PostUserRepos): AxiosPromise<Project> {
  return f('/user/repos', params, 'post')
}

// 获取授权用户的资料
export function getUser(params: GetUser): AxiosPromise<UserDetail> {
  return f('/user', params)
}

// 更新授权用户的资料
export function patchUser(params: PatchUser): AxiosPromise<User> {
  return f('/user', params, 'patch')
}

// 列出授权用户的关注者
export function getUserFollowers(params: GetUserFollowers): AxiosPromise<UserBasic[]> {
  return f('/user/followers', params)
}

// 列出授权用户正关注的用户
export function getUserFollowing(params: GetUserFollowing): AxiosPromise<UserBasic[]> {
  return f('/user/following', params)
}

// 列出授权用户所有的 Namespace
export function getUserNamespaces(params: GetUserNamespaces): AxiosPromise<Namespace[]> {
  return f('/user/namespaces', params)
}

// 获取授权用户的一个 Namespace
export function getUserNamespace(params: GetUserNamespace): AxiosPromise<Namespace[]> {
  return f('/user/namespace', params)
}

// 列出授权用户 star 了的仓库
export function getUserStarred(params: GetUserStarred): AxiosPromise<Project[]> {
  return f('/user/starred', params)
}

// 列出授权用户 watch 了的仓库
export function getUserSubscriptions(params: GetUserSubscriptions): AxiosPromise<Project[]> {
  return f('/user/subscriptions', params)
}

// 列出授权用户所属的企业
export function getUserEnterprises(params: GetUserEnterprises): AxiosPromise<EnterpriseBasic[]> {
  return f('/user/enterprises', params)
}

// 列出授权用户在所属组织的成员资料
export function getUserMembershipsOrgs(params: GetUserMembershipsOrgs): AxiosPromise<GroupMember[]> {
  return f('/user/memberships/orgs', params)
}

// 获取授权用户在一个组织的成员资料
export function getUserMembershipsOrgsOrg(params: GetUserMembershipsOrgsOrg): AxiosPromise<GroupMember> {
  return f('/user/memberships/orgs/{org}', params)
}

// 更新授权用户在一个组织的成员资料
export function patchUserMembershipsOrgsOrg(params: PatchUserMembershipsOrgsOrg): AxiosPromise<GroupMember> {
  return f('/user/memberships/orgs/{org}', params, 'patch')
}

// 退出一个组织
export function deleteUserMembershipsOrgsOrg(params: DeleteUserMembershipsOrgsOrg) {
  return f('/user/memberships/orgs/{org}', params, 'delete')
}

// 检查授权用户是否关注了一个用户
export function getUserFollowingUsername(params: GetUserFollowingUsername) {
  return f('/user/following/{username}', params)
}

// 关注一个用户
export function putUserFollowingUsername(params: PutUserFollowingUsername) {
  return f('/user/following/{username}', params, 'put')
}

// 取消关注一个用户
export function deleteUserFollowingUsername(params: DeleteUserFollowingUsername) {
  return f('/user/following/{username}', params, 'delete')
}

// 检查授权用户是否 star 了一个仓库
export function getUserStarredOwnerRepo(params: GetUserStarredOwnerRepo) {
  return f('/user/starred/{owner}/{repo}', params)
}

// star 一个仓库
export function putUserStarredOwnerRepo(params: PutUserStarredOwnerRepo) {
  return f('/user/starred/{owner}/{repo}', params, 'put')
}

// 取消 star 一个仓库
export function deleteUserStarredOwnerRepo(params: DeleteUserStarredOwnerRepo) {
  return f('/user/starred/{owner}/{repo}', params, 'delete')
}

// 检查授权用户是否 watch 了一个仓库
export function getUserSubscriptionsOwnerRepo(params: GetUserSubscriptionsOwnerRepo) {
  return f('/user/subscriptions/{owner}/{repo}', params)
}

// watch 一个仓库
export function putUserSubscriptionsOwnerRepo(params: PutUserSubscriptionsOwnerRepo) {
  return f('/user/subscriptions/{owner}/{repo}', params, 'put')
}

// 取消 watch 一个仓库
export function deleteUserSubscriptionsOwnerRepo(params: DeleteUserSubscriptionsOwnerRepo) {
  return f('/user/subscriptions/{owner}/{repo}', params, 'delete')
}

// 获取代码片段
export function getGists(params: GetGists): AxiosPromise<Code[]> {
  return f('/gists', params)
}

// 创建代码片段
export function postGists(params: PostGists): AxiosPromise<CodeForksHistory[]> {
  return f('/gists', params, 'post')
}

// 获取用户Star的代码片段
export function getGistsStarred(params: GetGistsStarred): AxiosPromise<Code[]> {
  return f('/gists/starred', params)
}

// 获取代码片段的评论
export function getGistsGistIdComments(params: GetGistsGistIdComments): AxiosPromise<CodeComment[]> {
  return f('/gists/{gist_id}/comments', params)
}

// 增加代码片段的评论
export function postGistsGistIdComments(params: PostGistsGistIdComments): AxiosPromise<CodeComment> {
  return f('/gists/{gist_id}/comments', params, 'post')
}

// 获取单条代码片段的评论
export function getGistsGistIdCommentsId(params: GetGistsGistIdCommentsId): AxiosPromise<CodeComment> {
  return f('/gists/{gist_id}/comments/{id}', params)
}

// 修改代码片段的评论
export function patchGistsGistIdCommentsId(params: PatchGistsGistIdCommentsId): AxiosPromise<CodeComment> {
  return f('/gists/{gist_id}/comments/{id}', params, 'patch')
}

// 删除代码片段的评论
export function deleteGistsGistIdCommentsId(params: DeleteGistsGistIdCommentsId) {
  return f('/gists/{gist_id}/comments/{id}', params, 'delete')
}

// 获取单条代码片段
export function getGistsId(params: GetGistsId): AxiosPromise<CodeForksHistory> {
  return f('/gists/{id}', params)
}

// 修改代码片段
export function patchGistsId(params: PatchGistsId): AxiosPromise<CodeForksHistory> {
  return f('/gists/{id}', params, 'patch')
}

// 删除指定代码片段
export function deleteGistsId(params: DeleteGistsId) {
  return f('/gists/{id}', params, 'delete')
}

// 获取代码片段的commit
export function getGistsIdCommits(params: GetGistsIdCommits): AxiosPromise<CodeForksHistory> {
  return f('/gists/{id}/commits', params)
}

// Star代码片段
export function putGistsIdStar(params: PutGistsIdStar) {
  return f('/gists/{id}/star', params, 'put')
}

// 取消Star代码片段
export function deleteGistsIdStar(params: DeleteGistsIdStar) {
  return f('/gists/{id}/star', params, 'delete')
}

// 判断代码片段是否已Star
export function getGistsIdStar(params: GetGistsIdStar) {
  return f('/gists/{id}/star', params)
}

// Fork代码片段
export function postGistsIdForks(params: PostGistsIdForks) {
  return f('/gists/{id}/forks', params, 'post')
}

// 获取 Fork 了指定代码片段的列表
export function getGistsIdForks(params: GetGistsIdForks): AxiosPromise<CodeForks> {
  return f('/gists/{id}/forks', params)
}

// 列出用户所属的组织
export function getUsersUsernameOrgs(params: GetUsersUsernameOrgs): AxiosPromise<Group[]> {
  return f('/users/{username}/orgs', params)
}

// 创建组织
export function postUsersOrganization(params: PostUsersOrganization): AxiosPromise<Group> {
  return f('/users/organization', params, 'post')
}

// 获取某个用户的公开仓库
export function getUsersUsernameRepos(params: GetUsersUsernameRepos): AxiosPromise<Project> {
  return f('/users/{username}/repos', params)
}

// 获取一个用户
export function getUsersUsername(params: GetUsersUsername): AxiosPromise<UserInfo> {
  return f('/users/{username}', params)
}

// 列出指定用户的关注者
export function getUsersUsernameFollowers(params: GetUsersUsernameFollowers): AxiosPromise<UserBasic[]> {
  return f('/users/{username}/followers', params)
}

// 列出指定用户正在关注的用户
export function getUsersUsernameFollowing(params: GetUsersUsernameFollowing): AxiosPromise<UserBasic[]> {
  return f('/users/{username}/following', params)
}

// 检查指定用户是否关注目标用户
export function getUsersUsernameFollowingTargetUser(params: GetUsersUsernameFollowingTargetUser) {
  return f('/users/{username}/following/{target_user}', params)
}

// 列出指定用户的所有公钥
export function getUsersUsernameKeys(params: GetUsersUsernameKeys): AxiosPromise<SSHKeyBasic[]> {
  return f('/users/{username}/keys', params)
}

// 列出用户 star 了的仓库
export function getUsersUsernameStarred(params: GetUsersUsernameStarred): AxiosPromise<Project[]> {
  return f('/users/{username}/starred', params)
}

// 列出用户 watch 了的仓库
export function getUsersUsernameSubscriptions(params: GetUsersUsernameSubscriptions): AxiosPromise<Project[]> {
  return f('/users/{username}/subscriptions', params)
}

// 列出一个用户收到的动态
export function getUsersUsernameReceivedEvents(params: GetUsersUsernameReceivedEvents): AxiosPromise<Event[]> {
  return f('/users/{username}/received_events', params)
}

// 列出一个用户收到的公开动态
export function getUsersUsernameReceivedEventsPublic(
  params: GetUsersUsernameReceivedEventsPublic
): AxiosPromise<Event[]> {
  return f('/users/{username}/received_events/public', params)
}

// 列出用户的动态
export function getUsersUsernameEvents(params: GetUsersUsernameEvents): AxiosPromise<Event[]> {
  return f('/users/{username}/events', params)
}

// 列出用户的公开动态
export function getUsersUsernameEventsPublic(params: GetUsersUsernameEventsPublic): AxiosPromise<Event[]> {
  return f('/users/{username}/events/public', params)
}

// 列出用户所属组织的动态
export function getUsersUsernameEventsOrgsOrg(params: GetUsersUsernameEventsOrgsOrg): AxiosPromise<Event[]> {
  return f('/users/{username}/events/orgs/{org}', params)
}

// 获取一个组织
export function getOrgsOrg(params: GetOrgsOrg): AxiosPromise<Group> {
  return f('/orgs/{org}', params)
}

// 更新授权用户所管理的组织资料
export function patchOrgsOrg(params: PatchOrgsOrg): AxiosPromise<GroupDetail> {
  return f('/orgs/{org}', params, 'patch')
}

// 列出一个组织的所有成员
export function getOrgsOrgMembers(params: GetOrgsOrgMembers): AxiosPromise<UserBasic[]> {
  return f('/orgs/{org}/members', params)
}

// 列出指定组织的所有关注者
export function getOrgsOrgFollowers(params: GetOrgsOrgFollowers): AxiosPromise<GroupFollowers[]> {
  return f('/orgs/{org}/followers', params)
}

// 获取当前用户某个组织的Issues
export function getOrgsOrgIssues(params: GetOrgsOrgIssues): AxiosPromise<Issue[]> {
  return f('/orgs/{org}/issues', params)
}

// 获取一个组织的仓库
export function getOrgsOrgRepos(params: GetOrgsOrgRepos): AxiosPromise<Project> {
  return f('/orgs/{org}/repos', params)
}

// 创建组织仓库
export function postOrgsOrgRepos(params: PostOrgsOrgRepos): AxiosPromise<Project> {
  return f('/orgs/{org}/repos', params, 'post')
}

// 移除授权用户所管理组织中的成员
export function deleteOrgsOrgMembershipsUsername(params: DeleteOrgsOrgMembershipsUsername) {
  return f('/orgs/{org}/memberships/{username}', params, 'delete')
}

// 获取授权用户所属组织的一个成员
export function getOrgsOrgMembershipsUsername(params: GetOrgsOrgMembershipsUsername): AxiosPromise<GroupMember> {
  return f('/orgs/{org}/memberships/{username}', params)
}

// 增加或更新授权用户所管理组织的成员
export function putOrgsOrgMembershipsUsername(params: PutOrgsOrgMembershipsUsername): AxiosPromise<GroupMember> {
  return f('/orgs/{org}/memberships/{username}', params, 'put')
}

// 列出组织的公开动态
export function getOrgsOrgEvents(params: GetOrgsOrgEvents): AxiosPromise<Event[]> {
  return f('/orgs/{org}/events', params)
}

// 获取当前授权用户的所有Issues
export function getIssues(params: GetIssues): AxiosPromise<Issue[]> {
  return f('/issues', params)
}

// 获取某个企业的所有Issues
export function getEnterprisesEnterpriseIssues(params: GetEnterprisesEnterpriseIssues): AxiosPromise<Issue[]> {
  return f('/enterprises/{enterprise}/issues', params)
}

// 获取一个企业
export function getEnterprisesEnterprise(params: GetEnterprisesEnterprise): AxiosPromise<EnterpriseBasic> {
  return f('/enterprises/{enterprise}', params)
}

// 列出企业的所有成员
export function getEnterprisesEnterpriseMembers(
  params: GetEnterprisesEnterpriseMembers
): AxiosPromise<EnterpriseMember[]> {
  return f('/enterprises/{enterprise}/members', params)
}

// 添加或邀请企业成员
export function postEnterprisesEnterpriseMembers(params: PostEnterprisesEnterpriseMembers) {
  return f('/enterprises/{enterprise}/members', params, 'post')
}

// 获取企业成员信息(通过用户名/邮箱)
export function getEnterprisesEnterpriseMembersSearch(params: GetEnterprisesEnterpriseMembersSearch) {
  return f('/enterprises/{enterprise}/members/search', params)
}

// 某个周报评论列表
export function getEnterprisesEnterpriseWeekReportsIdComments(
  params: GetEnterprisesEnterpriseWeekReportsIdComments
): AxiosPromise<Note[]> {
  return f('/enterprises/{enterprise}/week_reports/{id}/comments', params)
}

// 评论周报
export function postEnterprisesEnterpriseWeekReportsIdComment(
  params: PostEnterprisesEnterpriseWeekReportsIdComment
): AxiosPromise<Note> {
  return f('/enterprises/{enterprise}/week_reports/{id}/comment', params, 'post')
}

// 删除周报某个评论
export function deleteEnterprisesEnterpriseWeekReportsReportIdCommentsId(
  params: DeleteEnterprisesEnterpriseWeekReportsReportIdCommentsId
) {
  return f('/enterprises/{enterprise}/week_reports/{report_id}/comments/{id}', params, 'delete')
}

// 个人周报列表
export function getEnterprisesEnterpriseUsersUsernameWeekReports(
  params: GetEnterprisesEnterpriseUsersUsernameWeekReports
): AxiosPromise<WeekReport[]> {
  return f('/enterprises/{enterprise}/users/{username}/week_reports', params)
}

// 企业成员周报列表
export function getEnterprisesEnterpriseWeekReports(
  params: GetEnterprisesEnterpriseWeekReports
): AxiosPromise<WeekReport[]> {
  return f('/enterprises/{enterprise}/week_reports', params)
}

// 周报详情
export function getEnterprisesEnterpriseWeekReportsId(
  params: GetEnterprisesEnterpriseWeekReportsId
): AxiosPromise<WeekReport> {
  return f('/enterprises/{enterprise}/week_reports/{id}', params)
}

// 编辑周报
export function patchEnterprisesEnterpriseWeekReportId(
  params: PatchEnterprisesEnterpriseWeekReportId
): AxiosPromise<WeekReport> {
  return f('/enterprises/{enterprise}/week_report/{id}', params, 'patch')
}

// 新建周报
export function postEnterprisesEnterpriseWeekReport(
  params: PostEnterprisesEnterpriseWeekReport
): AxiosPromise<WeekReport> {
  return f('/enterprises/{enterprise}/week_report', params, 'post')
}

// 获取企业的某个Issue
export function getEnterprisesEnterpriseIssuesNumber(
  params: GetEnterprisesEnterpriseIssuesNumber
): AxiosPromise<Issue> {
  return f('/enterprises/{enterprise}/issues/{number}', params)
}

// 更新企业的某个Issue
export function patchEnterprisesEnterpriseIssuesNumber(
  params: PatchEnterprisesEnterpriseIssuesNumber
): AxiosPromise<Issue> {
  return f('/enterprises/{enterprise}/issues/{number}', params, 'patch')
}

// 获取企业 issue 关联的 Pull Requests
export function getEnterprisesEnterpriseIssuesNumberPullRequests(
  params: GetEnterprisesEnterpriseIssuesNumberPullRequests
): AxiosPromise<PullRequest[]> {
  return f('/enterprises/{enterprise}/issues/{number}/pull_requests', params)
}

// 获取企业某个Issue所有评论
export function getEnterprisesEnterpriseIssuesNumberComments(
  params: GetEnterprisesEnterpriseIssuesNumberComments
): AxiosPromise<Note[]> {
  return f('/enterprises/{enterprise}/issues/{number}/comments', params)
}

// 获取企业某个Issue所有标签
export function getEnterprisesEnterpriseIssuesNumberLabels(
  params: GetEnterprisesEnterpriseIssuesNumberLabels
): AxiosPromise<Label[]> {
  return f('/enterprises/{enterprise}/issues/{number}/labels', params)
}

// 获取企业所有标签
export function getEnterprisesEnterpriseLabels(params: GetEnterprisesEnterpriseLabels): AxiosPromise<Label[]> {
  return f('/enterprises/{enterprise}/labels', params)
}

// 获取企业某个标签
export function getEnterprisesEnterpriseLabelsName(params: GetEnterprisesEnterpriseLabelsName): AxiosPromise<Label> {
  return f('/enterprises/{enterprise}/labels/{name}', params)
}

// 获取企业的所有仓库
export function getEnterprisesEnterpriseRepos(params: GetEnterprisesEnterpriseRepos): AxiosPromise<Project> {
  return f('/enterprises/{enterprise}/repos', params)
}

// 创建企业仓库
export function postEnterprisesEnterpriseRepos(params: PostEnterprisesEnterpriseRepos): AxiosPromise<Project> {
  return f('/enterprises/{enterprise}/repos', params, 'post')
}

// 获取企业的一个成员
export function getEnterprisesEnterpriseMembersUsername(
  params: GetEnterprisesEnterpriseMembersUsername
): AxiosPromise<EnterpriseMember> {
  return f('/enterprises/{enterprise}/members/{username}', params)
}

// 移除企业成员
export function deleteEnterprisesEnterpriseMembersUsername(params: DeleteEnterprisesEnterpriseMembersUsername) {
  return f('/enterprises/{enterprise}/members/{username}', params, 'delete')
}

// 修改企业成员权限或备注
export function putEnterprisesEnterpriseMembersUsername(
  params: PutEnterprisesEnterpriseMembersUsername
): AxiosPromise<EnterpriseMember> {
  return f('/enterprises/{enterprise}/members/{username}', params, 'put')
}

// 列出可使用的 .gitignore 模板
export function getGitignoreTemplates(params: GetGitignoreTemplates) {
  return f('/gitignore/templates', params)
}

// 获取一个 .gitignore 模板
export function getGitignoreTemplatesName(params: GetGitignoreTemplatesName) {
  return f('/gitignore/templates/{name}', params)
}

// 获取一个 .gitignore 模板原始文件
export function getGitignoreTemplatesNameRaw(params: GetGitignoreTemplatesNameRaw) {
  return f('/gitignore/templates/{name}/raw', params)
}

// 列出可使用的开源许可协议
export function getLicenses(params: GetLicenses) {
  return f('/licenses', params)
}

// 获取一个开源许可协议
export function getLicensesLicense(params: GetLicensesLicense) {
  return f('/licenses/{license}', params)
}

// 获取一个开源许可协议原始文件
export function getLicensesLicenseRaw(params: GetLicensesLicenseRaw) {
  return f('/licenses/{license}/raw', params)
}

// 渲染 Markdown 文本
export function postMarkdown(params: PostMarkdown) {
  return f('/markdown', params, 'post')
}

// 企业Pull Reuqest 列表
export function getEnterpriseEnterprisePullRequests(
  params: GetEnterpriseEnterprisePullRequests
): AxiosPromise<PullRequest[]> {
  return f('/enterprise/{enterprise}/pull_requests', params)
}

// 列出仓库的所有公开动态
export function getNetworksOwnerRepoEvents(params: GetNetworksOwnerRepoEvents): AxiosPromise<Event[]> {
  return f('/networks/{owner}/{repo}/events', params)
}

// 搜索仓库
export function getSearchRepositories(params: GetSearchRepositories): AxiosPromise<Project[]> {
  return f('/search/repositories', params)
}

// 搜索 Issues
export function getSearchIssues(params: GetSearchIssues): AxiosPromise<Issue[]> {
  return f('/search/issues', params)
}

// 搜索用户
export function getSearchUsers(params: GetSearchUsers): AxiosPromise<User[]> {
  return f('/search/users', params)
}

// 获取授权用户的通知数
export function getNotificationsCount(params: GetNotificationsCount): AxiosPromise<UserNotificationCount> {
  return f('/notifications/count', params)
}

// 列出授权用户的所有通知
export function getNotificationsThreads(params: GetNotificationsThreads): AxiosPromise<UserNotificationList[]> {
  return f('/notifications/threads', params)
}

// 标记所有通知为已读
export function putNotificationsThreads(params: PutNotificationsThreads) {
  return f('/notifications/threads', params, 'put')
}

// 获取一条通知
export function getNotificationsThreadsId(params: GetNotificationsThreadsId): AxiosPromise<UserNotification> {
  return f('/notifications/threads/{id}', params)
}

// 标记一条通知为已读
export function patchNotificationsThreadsId(params: PatchNotificationsThreadsId) {
  return f('/notifications/threads/{id}', params, 'patch')
}

// 列出授权用户的所有私信
export function getNotificationsMessages(params: GetNotificationsMessages): AxiosPromise<UserMessageList[]> {
  return f('/notifications/messages', params)
}

// 标记所有私信为已读
export function putNotificationsMessages(params: PutNotificationsMessages) {
  return f('/notifications/messages', params, 'put')
}

// 发送私信给指定用户
export function postNotificationsMessages(params: PostNotificationsMessages): AxiosPromise<UserMessage> {
  return f('/notifications/messages', params, 'post')
}

// 获取一条私信
export function getNotificationsMessagesId(params: GetNotificationsMessagesId): AxiosPromise<UserMessage> {
  return f('/notifications/messages/{id}', params)
}

// 标记一条私信为已读
export function patchNotificationsMessagesId(params: PatchNotificationsMessagesId) {
  return f('/notifications/messages/{id}', params, 'patch')
}

// 获取授权用户的全部邮箱
export function getEmails(params: GetEmails): AxiosPromise<UserEmail> {
  return f('/emails', params)
}

// 列出可使用的 Emoji
export function getEmojis(params: GetEmojis) {
  return f('/emojis', params)
}
