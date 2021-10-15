```
'use strict';
const {Logging} = require('@google-cloud/logging');

async function quickstart(){
    const logging = new Logging({projectId: "aaaaaaaaaaa"});

    // The name of the log, you can use it for filtering
    const logName = 'cloudbuild';
    // Selects the log name you want to use
    const log = logging.log(logName);

    const options = {
    filter: `
        resource.type="build"
        resource.labels.build_id="aaaa-aaa-aaa-aaa-aaaa"     
    `
    };

    log
    .getEntriesStream(options)
    .on('error', console.error)
    .on('data',entry => {
        console.log(entry, null, 2);
      })
    .on('end', function() {
        console.log('done');
    });;
    
}

quickstart();
```
