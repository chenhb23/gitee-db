import doc_json from './doc_json.json'
import fs from 'fs'
import path from 'path'

const paths = doc_json.paths

// 以下转换为可选属性
const optionalProps = ['access_token', 'owner', 'repo']

const outputRequest = path.join(__dirname, '..', 'src', 'api.ts')

// 返回值类型修复
const responseArray = {
  '/repos/{owner}/{repo}/issues/{number}/comments': {get: true},
}

const interfaces = []
const methods = []

genDefinitions(doc_json.definitions)
Object.keys(paths).forEach(path => {
  const pathItem = paths[path]
  Object.keys(pathItem).forEach(method => {
    methods.push(parseMethod(pathItem[method], path, method))
  })
})

function trim(value: string) {
  return value?.trim()?.replace('\n', '')
}

function genDefinitions(definitions) {
  Object.keys(definitions).forEach(key => {
    const item = definitions[key]

    const lines = Object.keys(item.properties).map(propName => {
      const data = parseSchema(item.properties[propName])
      return `  ${propName}: ${data.type}${data.array ? '[]' : ''}${
        data.description ? ` // ${trim(data.description)}` : ''
      }`
    })

    interfaces.push(`${item.description ? `// ${trim(item.description)}\n` : ''}interface ${key} {
${lines.join('\n')}
}`)
  })
}

function firstUpperCase(name: string) {
  return name[0].toUpperCase() + name.slice(1)
}

function parseMethod(item, url: string, method: string) {
  const operationId = item.operationId
    .replace(/\(.*\)/, '')
    .replace('V5', '')
    .replace(/\./g, '')
  url = url.replace(/^\/v5/, '')

  const reqName = firstUpperCase(operationId)
  getParametersInterface(item.parameters, firstUpperCase(operationId))
  const res = parseSchema(item.responses?.['200']?.schema ?? item.responses?.['201']?.schema)

  return `// ${trim(item.description)}
export function ${operationId}(p: ${reqName})${
    res ? `: AxiosPromise<${res.type}${res.array || responseArray[url]?.[method] ? '[]' : ''}>` : ''
  } {
  return f('${url}', p${method.toLowerCase() !== 'get' ? `, '${method}'` : ''})
}`
}

function typeMap(type: string) {
  return (
    {
      integer: 'number',
      object: 'Record<string, any>',
    }[type] ?? type
  )
}

function getParametersInterface(parameters, name: string) {
  const lines = parameters
    .filter(item => /^\w+$/.test(item.name))
    .map(item => {
      const isOptional = !item.required || optionalProps.includes(item.name)
      return `  ${item.name}${isOptional ? '?' : ''}: ${
        item.type === 'array' ? `${typeMap(item.items.type)}[]` : typeMap(item.type)
      }${item.description ? ` // ${trim(item.description)}` : ''}`
    })
  interfaces.push(`interface ${name} {
${lines.join('\n')}
}`)
}

function getNameFromRef($ref: string) {
  return $ref.replace('#/definitions/', '')
}

function parseSchema(schema) {
  if (!schema) return null

  const isArray = schema.type === 'array'
  const getType = _schema => (_schema.$ref ? getNameFromRef(_schema.$ref) : _schema.type)

  return {
    array: isArray,
    type: typeMap(isArray ? parseSchema(schema.items)?.type : getType(schema)),
    description: trim(schema.description),
  }
}

fs.writeFileSync(
  outputRequest,
  `import axios, {AxiosPromise, Method} from 'axios'
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

${[...interfaces, ...methods].join('\n\n')}
`
)
