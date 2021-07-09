/*
 * Utilities used to clean/convert strings for Mongo
 */

const debug = require('debug')('cleaningUtilities')

let FORCE_STRING = ['WBS', 'OutlineNumber']

function clean(input, timestamp = new Date().getTime()) {
    input.forEach((t) => {
      Object.keys(t).forEach((k) => {
        t[k] = cleanField(k, t[k])
      })
      t.timestamp = timestamp
      if (t['GUID']) {
          t['_id'] = t['GUID'] + '@' + timestamp
      } // Else use default _id value
    })
  }
  
  function cleanObject(obj) {
    Object.keys(obj).forEach((k) => {
      obj[k] = cleanField(k, obj[k])
    })
    return(obj)
  }
  
  function cleanArray(val) {
    val.forEach((v) => {
      v = cleanField('unset', v)
    })
    return(val)
  }
  
  function cleanField(name, val) {
    if (typeof val === 'string') {
      if (!isNaN(val) && !FORCE_STRING.includes(name)) {
        val = +val
      } else if (
        val &&
        val.length == 19 &&
        val.substring(10, 11) == 'T'
      ) {
        // Convert to date
        val = new Date(val)
      }
    } else if (Array.isArray(val)) {
      val = cleanArray(val)
    } else if (typeof val === 'object') {
    //   debug(`cleaning object: ${name}`, val)
      val = cleanObject(val)
    //   debug(`...results: `, val)
    } else {
      console.log(`skipping ${name}: type = `, typeof val, val)
    }
    return(val)
  }
  
module.exports = {
    clean,
    cleanObject,
    cleanArray,
    cleanField
}  