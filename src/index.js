var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var path = require('path')
var child = require('child_process')
var ejs = require('ejs')
var _ = require('underscore')
var semver = require('semver')

const docBin = path.resolve('./node_modules/.bin')
const docBuild = "documentation build src/*.js --github --format html --output ${OUTPUT} --name ${NAME} --project-version ${VERSION} --external nxus-*"
const npmBuild = "npm run build-shared-docs"

// collect subdirectory names (exclude non-directories and names beginning with '.')
function collectNames(dir) {
  let names = []
  for (let file of fs.readdirSync(dir))
    if ((file[0] !== '.') && fs.statSync(path.resolve(dir, file)).isDirectory())
      names.push(file)
  return names
}

// prune and order version list, removing pre-release versions superseded by release
function pruneVersions(versions) {
  let ordered = versions.slice().sort(semver.compare),
      pruned = [], prev = ordered.shift()
  for (let curr of ordered) {
    if (semver.diff(prev, curr) !== 'prerelease') pruned.unshift(prev)
    prev = curr
  }
  pruned.unshift(prev)
  return pruned
}

function trace(str, prefix = "") {
    str = str.split('\n').map(line => prefix + line ).join('\n')
    console.log(str)
}

var index_only = process.env.INDEX_ONLY | false
var module_path = '../modules/'
var modules = collectNames(module_path)

Promise.map(modules, (module) => {
  trace(module)
  let modDir = path.resolve(module_path, module),
      mod_package = JSON.parse(fs.readFileSync(path.resolve(modDir, 'package.json'))),
      mod_doc_dir = path.resolve('.', module),
      mod_doc_latest = path.resolve(mod_doc_dir, 'latest')
  var name = mod_package.name
  if (!index_only) {
    let cmd = mod_package.scripts['build-shared-docs'] ? npmBuild : docBuild,
        cwd = path.resolve('../modules', module),
        env = Object.assign({}, process.env, {
          PATH: docBin + ':' + process.env.PATH,
          MODULE: module,
          NAME: name,
          VERSION:  mod_package.version,
          OUTPUT: path.resolve(mod_doc_dir,  mod_package.version) })
    trace(cmd, "    ")
    let rslt = child.execSync(cmd, { cwd, env })
    trace(rslt.toString(), "        ")
  }
  try {
    fs.unlinkSync(mod_doc_latest)
  } catch(e) {}
  var versions = pruneVersions(collectNames(mod_doc_dir))
  fs.symlinkSync(versions[0], mod_doc_latest, 'dir')
  versions.unshift('latest')
  return {
    module,
    name,
    versions,
    package: mod_package
  }
})
.then(function(modules) {
  modules = _.compact(modules)
  var template_file = __dirname+'/index.ejs'
  fs.readFileAsync(template_file).then(function(content) {
    var rendered = ejs.render(content.toString(), {
      title: 'Nxus Documentation',
      modules: modules
    }, {filename: template_file})
    
    return fs.writeFileAsync('index.html', rendered)
  })
})



