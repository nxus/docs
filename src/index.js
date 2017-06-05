var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var child = require('child_process')
var ejs = require('ejs')
var _ = require('underscore')
var semver = require('semver')

var index_only = process.env.INDEX_ONLY | false
var module_path = '../modules/'
var modules = fs.readdirSync(module_path)

Promise.map(modules, function(m) {
  if(m && m[0] == ".") return
  console.log(m)
  var mod_doc_dir = './'+m
  var mod_package = JSON.parse(fs.readFileSync(module_path+m+'/package.json'))
  var name = mod_package.name
  if (!index_only) {
    var version = mod_package.version
    var cmd = "./node_modules/.bin/documentation build ../modules/"+m+"/src/*.js --github -f html -o "+mod_doc_dir+"/"+version+" --name '"+name+"' --project-version "+version+" --external nxus-*"
    console.log(cmd)
    child.execSync(cmd)
  }
  try {
    fs.unlinkSync(mod_doc_dir+"/latest")
  } catch(e) {}
  var versions = fs.readdirSync(mod_doc_dir).reverse()
  versions = versions.sort(function(a, b) {
    return semver.gt(a, b) ? -1 : 1
  })
  fs.symlinkSync(versions[0], mod_doc_dir+"/latest", 'dir')
  versions.unshift('latest')
  return {
    module: m,
    name: name,
    package: mod_package,
    versions: versions
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



