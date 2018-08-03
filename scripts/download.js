const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const axios = require('axios')
const unzip = require('node-unzip-2')

const URL = 'https://webslides.tv/webslides-latest.zip'

function exists(file) {
  try {
    fs.statSync(file);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
  }
}

function mkdir(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, err => {
      if (err) {
        reject(err)
      } else {
        resolve(path)
      }
    })
  })
}

function download(location) {
  return axios({
    url: URL,
    method: 'GET',
    responseType: 'stream',
  }).then(response => {
    const downloadPath = path.join(location, 'webslides.zip')
    response.data.pipe(fs.createWriteStream(downloadPath))
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve(downloadPath)
      })
      response.data.on('error', err => {
        reject(err)
      })
    })
  })
}

function extract(file) {
  const extractTo = path.dirname(file)
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(unzip.Extract({ path: extractTo }).on('close', err => {
        if (err) {
          reject(err)
        } else {
          resolve(extractTo)
        }
      }))
  })
}

if (exists('src/index.html')) {
  console.log('"src/index.html" already exists. Download process skipped.\nIf you want to download latest version of WebSlides again, delete src directory (make sure you backup the index.html to restore you work!).')
} else {
  mkdir('src')
    .then(p => download(p))
    .then(file => {
      console.log('download completed')
      return extract(file)
    })
    .then(p => {
      console.log('extract', p);
    })
    .catch(err => {
      console.log("ERROR!", err);
    })
}
