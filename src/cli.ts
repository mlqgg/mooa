#!/usr/bin/env node

const request = require('request')
const program = require('commander')

let version = require('../../package.json').version

program
  .version(version)
  .option('-c, --create [type]', 'Create [type] host || app')
  .option('-u, --update [host]', 'Update [type] host || app')
  .option('-g, --generate', 'Generate Mooa App Config')
  .parse(process.argv)

if (program.create) {
  if (program.create === 'host') {
    console.log('create host')
  } else if (program.create === 'app') {
    console.log('create app')
  }
}

if (program.update) {
  if (program.update === 'host') {
    console.log('update host')
  } else if (program.update === 'app') {
    console.log('update app')
  }
}

if (program.generate) {
  let appUrl = 'http://mooa.phodal.com/index.html'
  request(appUrl, (error: any, response: any, body: any) => {
    if (error) {
      return console.log('request app url', appUrl)
    }
    console.log(body)
  })
}

if (!process.argv.slice(2).length || !process.argv.length) {
  program.outputHelp()
}
