const stream = require('stream')
const libopenmpt = require('../vendor/libopenmpt-0.3.15+release/libopenmpt')

module.exports = function(buffer, options) {
  const readable = stream.Readable()

  const samplerate = options['sampleRate'] || 48000
  const channels = options['channels'] || 2
  const maxFramesPerChunk = options['readSize'] || 1024

  const bytesPerFrame = 2 * channels

  const mod = createModuleFromMemory(buffer)
  const buf = createBuffer(maxFramesPerChunk, bytesPerFrame)

  readable._read = () => {
    const data = readModule(mod, buf, samplerate, channels, maxFramesPerChunk, bytesPerFrame)
    if (buf == null) {
      destroyModule(mod, buf)
    }
    readable.push(data)
  }

  createProperties(readable, mod)

  return readable;
}


function createModuleFromMemory(buffer) {
  let array = new Int8Array(buffer);
  let mem = libopenmpt._malloc(array.byteLength);
  libopenmpt.HEAPU8.set(array, mem);

  return libopenmpt._openmpt_module_create_from_memory(mem, array.byteLength, 0, 0, 0);
}

function createBuffer(bytesPerFrame, maxFramesPerChunk) {
  return libopenmpt._malloc(bytesPerFrame * maxFramesPerChunk);
}

function destroyModule(buffer, mod) {
  libopenmpt._free(buffer)
  libopenmpt._openmpt_module_destroy(mod)
}

function createProperties(obj, mod_ptr) {
  Object.defineProperties(obj, {
    'duration': {
      get: function() {
          return libopenmpt._openmpt_module_get_duration_seconds(mod_ptr);
      }
    },
    'metadata': {
      get: function() {
          const metadata = {};
          const keys = libopenmpt.Pointer_stringify(libopenmpt._openmpt_module_get_metadata_keys(mod_ptr)).split(';');
          for(var i = 0; i < keys.length; i++) {
              var buf = libopenmpt._malloc(keys[i].length + 1);
              libopenmpt.writeStringToMemory(keys[i], buf);
              metadata[keys[i]] = libopenmpt.Pointer_stringify(libopenmpt._openmpt_module_get_metadata(mod_ptr, buf));
              libopenmpt._free(buf);
          }
          return metadata;
      }
    }
  })
}