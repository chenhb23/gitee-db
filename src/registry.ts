export const auth = {} as {
  access_token: string
  owner: string
  repo: string
}

export function registry(info: typeof auth) {
  Object.assign(auth, info)
}
