const fs = require('fs')
const path = require('path')

const { version } = require('../package.json')
const appName = 'Video Coaching Feedback - Coach'
const distDir = path.join(__dirname, '..', 'dist-installers')

const renames = [
  {
    from: path.join(distDir, 'mac', `${appName}.app`),
    to: path.join(distDir, 'mac', `${appName}-${version}.app`)
  },
  {
    from: path.join(distDir, 'mac-arm64', `${appName}.app`),
    to: path.join(distDir, 'mac-arm64', `${appName}-${version}-arm64.app`)
  }
]

for (const { from, to } of renames) {
  if (fs.existsSync(from)) {
    fs.renameSync(from, to)
    console.log(`Renamed: ${path.basename(from)} → ${path.basename(to)}`)
  }
}
