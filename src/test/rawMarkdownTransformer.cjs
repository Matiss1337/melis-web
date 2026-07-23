const fs = require('fs')

module.exports = {
  process(_, filename) {
    const source = fs.readFileSync(filename, 'utf8')
    return { code: `module.exports = ${JSON.stringify(source)}` }
  },
}
