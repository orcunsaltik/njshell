# njshell

[![Build Status](https://travis-ci.com/orcunsaltik/njshell.svg?branch=master)](https://travis-ci.com/orcunsaltik/njshell)
[![devDependencies Status](https://david-dm.org/orcunsaltik/njshell/dev-status.svg)](https://david-dm.org/orcunsaltik/njshell?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/035ff3499e767eb6b552/maintainability)](https://codeclimate.com/github/orcunsaltik/njshell/maintainability)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/orcunsaltik/njshell)
![npm](https://img.shields.io/npm/dt/njshell)
[![NPM Version](https://badge.fury.io/js/njshell.svg?style=flat)](https://npmjs.org/package/njshell)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/orcunsaltik/njshell/issues)
![node-current](https://img.shields.io/node/v/njshell)

Runs shell, bash command or file and can get user defined multiple types of output.

## Install

``` bash
npm install --save-dev njshell
```

## Methods

exec(cmd, type, filename, encoding):

   cmd

    Command String (required)
   
   type 

    Type of output: stdout(default), string, buffer, stream, vinyl.
   
   filename

    Only required when type of output is "vinyl".
   
   encoding
 
    default utf-8.

execLocal(cmd, type, filename, encoding):

   Same as "exec" but uses npm package's local path "node_modules/.bin/..." as of executable directory. 

## Usage

``` js
const shell = require('njshell');

shell.exec('npm view njshell version')
     .then((v) => console.log(v));

// outputs 1.2.4...

shell.exec('dir')
     .then((dir) => console.log(dir));

/* 
outputs...
Directory of D:\projects\njshell                                                                                                                       
                                                                                                                                                        
17.10.2020  16:03    <DIR>          .                                                                                                                   
17.10.2020  16:03    <DIR>          ..                                                                                                                  
15.10.2020  12:15               279 .editorconfig                                                                                                       
15.10.2020  12:15               748 .eslintrc.js                                                                                                        
15.10.2020  12:15                51 .gitignore                                                                                                          
15.10.2020  12:15                29 .npmignore                                                                                                          
15.10.2020  12:15                47 .travis.yml...
*/
```

## Troubleshooting

When you encounter a problem, please open an issue. I would be glad to help you to find a solution if possible.

## Author

Github: [@orcunsaltik](https://github.com/orcunsaltik)


## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).