//Imports
const processes = require("child_process")
const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const url = require("url")
const axios = require("axios")
const ejs = require("ejs")

//GitHub action
const action = yaml.load(fs.readFileSync(path.join(__dirname, "../action.yml"), "utf8"))
action.defaults = Object.fromEntries(Object.entries(action.inputs).map(([key, {default: value}]) => [key, value]))
action.input = vars => Object.fromEntries([...Object.entries(action.defaults), ...Object.entries(vars)].map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, value]))
action.run = async vars =>
  await new Promise((solve, reject) => {
    let [stdout, stderr] = ["", ""]
    const env = {...process.env, ...action.input(vars), GITHUB_REPOSITORY: "lowlighter/metrics"}
    const child = processes.spawn("node", ["source/app/action/index.mjs"], {env})
    child.stdout.on("data", data => stdout += data)
    child.stderr.on("data", data => stderr += data)
    child.on("close", code => {
      if (code === 0)
        return solve(true)
      console.log(stdout, stderr)
      reject(stdout)
    })
  })

//Web instance
const web = {}
web.run = async vars => (await axios.get(`http://localhost:3000/lowlighter?${new url.URLSearchParams(Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value])))}`)).status === 200
web.start = async () =>
  new Promise(solve => {
    let stdout = ""
    web.instance = processes.spawn("node", ["source/app/web/index.mjs"], {env: {...process.env, SANDBOX: true}})
    web.instance.stdout.on("data", data => (stdout += data, /Server ready !/.test(stdout) ? solve() : null))
    web.instance.stderr.on("data", data => console.error(`${data}`))
  })
web.stop = async () => await web.instance.kill("SIGKILL")

//Web instance placeholder
require("./../source/app/web/statics/embed/app.placeholder.js")
const placeholder = globalThis.placeholder
delete globalThis.placeholder
placeholder.run = async vars => {
  const options = Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value]))
  const enabled = Object.fromEntries(Object.entries(vars).filter(([key]) => /^plugin_[a-z]+$/.test(key)))
  const config = Object.fromEntries(Object.entries(options).filter(([key]) => /^config[.]/.test(key)))
  const base = Object.fromEntries(Object.entries(options).filter(([key]) => /^base[.]/.test(key)))
  return typeof await placeholder({
    templates: {selected: vars.template},
    plugins: {enabled: {...enabled, base}, options},
    config,
    version: "TEST",
    user: "lowlighter",
    avatar: "https://github.com/lowlighter.png",
  }) === "string"
}

//Setup
beforeAll(async () => {
  //Faker is ESM only (requires --experimental-vm-modules)
  const {faker} = await import("@faker-js/faker")
  placeholder.init({
    faker,
    ejs,
    axios: {
      async get(url) {
        return axios.get(`http://localhost:3000${url}`)
      },
    },
  })
  //Clean community template
  await fs.promises.rm(path.join(__dirname, "../source/templates/@classic"), {recursive: true, force: true})
  //Start web instance
  if (process.env.METRICS_TEST_WEB)
    await web.start()
})
//Teardown
afterAll(async () => {
  //Stop web instance
  if (process.env.METRICS_TEST_WEB)
    await web.stop()
  //Clean community template
  await fs.promises.rm(path.join(__dirname, "../source/templates/@classic"), {recursive: true, force: true})
})

//Load metadata (as jest doesn't support ESM modules, we use this dirty hack)
const metadata = JSON.parse(`${
  processes.spawnSync("node", [
    "--input-type",
    "module",
    "--eval",
    'import metadata from "./source/app/metrics/metadata.mjs";console.log(JSON.stringify(await metadata({log:false})))',
  ]).stdout
}`)

//Cases that scrape live third-party pages, which now block or changed their markup
const live = new Set([
  "🎼 Music activity and suggestions - Spotify - Random track from playlist",
  "🧠 16personalities - MBTI Personality profile",
])

//Cases that still reach the network with mocked data, skipped when the tests run offline
const online = new Set([
  "🏆 Achievements - Compact display",
  "🏆 Achievements - Detailed display",
  "🎼 Music activity and suggestions - Apple Music - Random track from playlist",
  "🎼 Music activity and suggestions - Youtube Music - Random track from playlist",
  "✒️ Recent posts - Recent posts",
  "✒️ Recent posts - Recent posts with descriptions and cover images",
  "📜 Repository licenses - Licenses and permissions",
  "🗨️ Stack Overflow - Top answers from stackoverflow",
  "💫 Star lists - Featured star list",
  "💫 Star lists - Featured star list languages",
  "📌 Starred topics - Icons",
  "📌 Starred topics - Labels",
  "🕹️ Steam - Profile and detailed game history",
  "🕹️ Steam - Recently played games",
  "📸 Website screenshot - XKCD of the day",
])

//Build tests index
const tests = []
for (const type of ["plugins", "templates"]) {
  for (const name in metadata[type]) {
    const cases = yaml
      .load(fs.readFileSync(path.join(__dirname, "../tests/cases", `${name}.${type.replace(/s$/, "")}.yml`), "utf8"))
      ?.map(({name: test, with: inputs, modes = [], timeout}) => {
        const skip = new Set(Object.entries(metadata.templates).filter(([_, {readme: {compatibility}}]) => !compatibility[name]).map(([template]) => template))
        if (!(metadata[type][name].supports?.includes("repository")))
          skip.add("repository")
        if ((live.has(test)) || ((process.env.METRICS_TEST_OFFLINE) && (online.has(test))))
          return [test, inputs, {skip: ["classic", "terminal", "repository"], modes, timeout}]
        return [test, inputs, {skip: [...skip], modes, timeout}]
      }) ?? []
    tests.push(...cases)
  }
}

//Tests run
describe("GitHub Action", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
    ["repository", {repo: "metrics"}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("action"))))
        test.skip(name, () => null)
      else
        test.concurrent(name, async () => expect(await action.run({template, base: "", query: JSON.stringify(query), plugins_errors_fatal: true, dryrun: true, use_mocked_data: true, verify: true, retries: 1, ...input})).toBe(true), timeout)
    }
  }))

//The web instance is not used by the action, its suites only run with METRICS_TEST_WEB=1
const describeWeb = process.env.METRICS_TEST_WEB ? describe : describe.skip

describeWeb("Web instance", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
    ["repository", {repo: "metrics"}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("web"))))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await web.run({template, base: 0, ...query, plugins_errors_fatal: true, verify: true, ...input})).toBe(true), timeout)
    }
  }))

describeWeb("Web instance (placeholder)", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("placeholder"))))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await placeholder.run({template, base: 0, ...query, ...input})).toBe(true), timeout)
    }
  }))
