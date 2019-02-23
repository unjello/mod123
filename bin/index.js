const fs = require('fs')
const speaker = require('speaker')
const player = require('../lib')

function render(mod) {
  process.stdout.moveCursor(0,-1)
  console.log(mod.position);
  setTimeout(render.bind(null, mod), 100);
}

fs.readFile(process.argv[2], function(err, data) {
  if(err != null) {
      console.log(err);
  } else {
      let mod = player(data, {
          channels: 2,      // 2 channels (stereo)
          sampleRate: 48000 // 48,000 Hz sample rate
      });
      console.log(mod.metadata.title)
      console.log('Press any key to exit\n');

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', process.exit.bind(process, 0));

//      render(mod);
      mod.pipe(new speaker())
  }
});