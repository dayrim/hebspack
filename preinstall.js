const fileSystem = require('fs');
const appRoot = require('app-root-path');

if(!fileSystem.existsSync(`${appRoot.path}/package.json`)){
   fileSystem.writeFileSync(`${appRoot.path}/package.json`,
   `{  "name": "",
       "description": "",
       "version": "0.1.0",
       "dependencies": {},
       "devDependencies": {}
     }` )
}