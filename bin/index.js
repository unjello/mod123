const fs = require('fs')
const player = require('../lib')

fs.readFile(process.argv[2], function(err, data) {
  if(err != null) {
      console.log(err);
  } else {
      let mod = player(data, {
          channels: 2,      // 2 channels (stereo)
          sampleRate: 48000 // 48,000 Hz sample rate
      });
      console.log(mod.metadata)
  }
});