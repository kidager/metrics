//Runs every action test case (classic template, mocked data) and reports plugin errors, ignoring the Chrome step
const processes = require("child_process"), yaml = require("js-yaml"), fs = require("fs"), path = require("path")
const action = yaml.load(fs.readFileSync("action.yml", "utf8"))
const defaults = Object.fromEntries(Object.entries(action.inputs).map(([k, {default: v}]) => [k, v]))
const results = {}
const files = fs.readdirSync("tests/cases").filter(f => f.endsWith(".plugin.yml"))
const only = process.argv[2]
for (const file of files) {
  if (only && !file.startsWith(only)) continue
  for (const {name, with: inputs, modes = []} of yaml.load(fs.readFileSync(path.join("tests/cases", file), "utf8")) ?? []) {
    if (modes.length && !modes.includes("action")) continue
    const vars = {...defaults, template: "classic", base: "", query: "{}", plugins_errors_fatal: true, dryrun: true, use_mocked_data: true, verify: true, retries: 1, ...inputs}
    const env = {...process.env, ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [`INPUT_${k.toUpperCase()}`, v])), GITHUB_REPOSITORY: "lowlighter/metrics"}
    const r = processes.spawnSync("node", ["source/app/action/index.mjs"], {env, encoding: "utf8", timeout: 120000})
    const out = `${r.stdout}${r.stderr}`
    if (/errors !/.test(out)) {
      const i = out.indexOf("errors !")
      results[`${file} > ${name}`] = out.slice(i, i + 1200)
    }
  }
}
for (const [k, v] of Object.entries(results)) console.log(`=== ${k}\n${v}\n`)
console.log(`${Object.keys(results).length} failing cases`)
