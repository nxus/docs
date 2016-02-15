var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var child = require('child_process')
var ejs = require('ejs')

var index_only = process.env.INDEX_ONLY | false
var module_path = '../modules/'
var modules = fs.readdirSync(module_path)

Promise.map(modules, function(m) {
  console.log(m)
  var mod_doc_dir = './'+m
  var mod_package = JSON.parse(fs.readFileSync(module_path+m+'/package.json'))
  var name = mod_package.name
  if (!index_only) {
    var version = mod_package.version
    var cmd = "documentation build ../modules/"+m+"/src/*.js --github -f html -o "+mod_doc_dir+"/"+version+" --name '"+name+"' --project-version "+version
    console.log(cmd)
    child.execSync(cmd)
  }
  try {
    fs.unlinkSync(mod_doc_dir+"/latest")
  } catch(e) {}
  var versions = fs.readdirSync(mod_doc_dir).reverse()
  fs.symlinkSync(versions[0], mod_doc_dir+"/latest", 'dir')
  var versions = fs.readdirSync(mod_doc_dir).reverse()
  return {
    module: m,
    name: name,
    package: mod_package,
    versions: versions
  }
})
.then(function(modules) {
  var template_file = __dirname+'/index.ejs'
  fs.readFileAsync(template_file).then(function(content) {
    var rendered = ejs.render(content.toString(), {
      title: 'Nxus Documentation',
      modules: modules
    }, {filename: template_file})
    
    return fs.writeFileAsync('index.html', rendered)
  })
})



