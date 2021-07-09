/** @format
 * Convert an XML export from MS Project and save to JSON and/or Mongo database
 */

const fs = require('fs')
const XML = require('pixl-xml')
let debug = require('debug')('simpleParser')
const config = require('config')

const {
  clean,
  cleanObject,
  cleanArray,
  cleanField,
} = require('./cleaningUtilities')

const { program } = require('commander')
program.version('0.0.1')
program
  .option('-i, --input <filename>', 'Input filename')
  .option('-j, --save-json <filename>', 'Save JSON output')
  .option('-w, --wipe', 'Wipe database before saving')

program.parse(process.argv)
const options = program.opts()

debug(`Wipe? ${options.wipe}`)

let jsonFilename = false
if (options.saveJson) {
  jsonFilename = options.saveJson
  console.log(`Saving to JSON file (${jsonFilename}) per param`)
} else if (config.has('json') && config.json.has('output')) {
  jsonFilename = config.json.output
  console.log(`Saving to JSON file (${jsonFilename}) per config`)
}

let mppxml = {}

function parseScheduleXml(filename) {
  mppxml = XML.parse(fs.readFileSync(filename))
}

async function save() {
  debug(`Saving...`)
  if (jsonFilename) {
    debug(`Saving to JSON file (${jsonFilename})...`)
    fs.writeFileSync(jsonFilename, JSON.stringify(mppxml))
    debug(`Done saving mppxml to JSON: ${jsonFilename}`)
  }

  if (config.has('mongo')) {
    let client
    try {
      const mongoConnStr = `mongodb://${config.mongo.user}:${
        config.mongo.password
      }@${config.mongo.host}:${config.mongo.port}/?${
        config.mongo.has('options') ? config.mongo.options : ''
      }`
      
      const { MongoClient } = require('mongodb')
      
      client = await MongoClient.connect(mongoConnStr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })      
      const connect = client.db(config.mongo.database)
      debug(`...connected to Mongo`)
      
      if (options.wipe) {
        const colls = await connect.listCollections().toArray()
        const collNames = colls.map((x) => x.name).join(', ')
        debug(`Wiping collections before saving: `, collNames)
        await wipeMongoCollections(connect, collNames)
      }
      
      debug(`Saving to Mongo...`)
      await connect.collection(config.mongo.collection + '-tasks').insertMany(mppxml.Tasks.Task, { ordered: true })
      await connect.collection(config.mongo.collection + '-views').insertMany(mppxml.Views.View, { ordered: true })

      await connect.collection(config.mongo.collection + '-filters').insertMany(mppxml.Filters.Filter, { ordered: true })
      await connect.collection(config.mongo.collection + '-groups').insertMany(mppxml.Groups.Group, { ordered: true })
      await connect.collection(config.mongo.collection + '-tables').insertMany(mppxml.Tables.Table, { ordered: true })
      await connect.collection(config.mongo.collection + '-extended-attributes').insertMany(mppxml.ExtendedAttributes.ExtendedAttribute, {
        ordered: true,
      })
      await connect.collection(config.mongo.collection + '-calendars').insertMany(mppxml.Calendars.Calendar, { ordered: true })
      await connect.collection(config.mongo.collection + '-resources').insertMany(mppxml.Resources.Resource, { ordered: true })
      await connect.collection(config.mongo.collection + '-assignments').insertMany(mppxml.Assignments.Assignment, { ordered: true })
    } finally {
      await client.close()
    }
    debug(`...done saving to Mongo`)
  }
}

function buildMongoCollectionName(suffix) { 
  return(`${config.mongo.collection}-${suffix}`)
}

async function wipeMongoCollections(connect, collNames) {
  try {
    [ 'tasks', 'views', 'filters', 'groups', 'tables', 'extended-attributes', 'calendars', 'resources', 'assignments' ].forEach(async (x) => {
      if (collNames.includes(buildMongoCollectionName(x))) {
        await connect.collection(buildMongoCollectionName(x)).drop()
      }
    })
  } catch (err) {
    console.error(`Error J1: `, err)
  }
}
// Get input file
let inputFilename

// On command line? (Overrides config file)
if (options.input) {
  inputFilename = options.input
} else {
  // In config file?
  inputFilename = config.has(`input`) ? config.input : false
}
if (!inputFilename) {
  throw new Error(`Missing input file`)
} else if (!fs.existsSync(inputFilename)) {
  throw new Error(`Can't find/read input file ${inputFilename}`)
}

const ts = new Date().getTime()
debug(`Timestamp: ${ts}`)

debug(`1. Parsing...`)
parseScheduleXml(inputFilename)

debug(`2. Cleaning...`)
clean(mppxml.Tasks.Task, ts)
clean(mppxml.Views.View, ts)
clean(mppxml.Filters.Filter, ts)
clean(mppxml.Groups.Group, ts)
clean(mppxml.Tables.Table, ts)
clean(mppxml.ExtendedAttributes.ExtendedAttribute, ts)
clean(mppxml.Calendars.Calendar, ts)
clean(mppxml.Resources.Resource, ts)
clean(mppxml.Assignments.Assignment, ts)

debug(`3. Saving...`)
save()

console.log(`Done`)
