'use strict';

const path     = require('path');
const execute  = require('child_process').exec;
const Readable = require('stream').Readable;
const Vinyl    = require('vinyl');
const T2       = require('through2');
const root     = require('njfs').root;
  
const exec = async (cmd, type, filename, encoding) => new Promise((res, rej) => {
        execute(cmd, (err, stdout, stderr) => {
            
            if (err || (type === 'vinyl' && !filename)) {
                return rej(err || 'no file name');
            }
            
            console.log(stderr);
            
            let output;

            encoding = encoding || 'utf8';
            
            switch (type) {                
                case 'string': output = stdout.toString().trim();      break;
                case 'buffer': output = Buffer.from(stdout, encoding); break;
                case 'stream':
                    
                    output = new Readable({ _read: () => {} });
                    output.push(Buffer.from(stdout, encoding));
                    output.push(null);
                    
                    break;
                case 'vinyl':

                    const buffer = Buffer.from(stdout, encoding);
                    const vPath = path.resolve(path.basename(filename));
                    const vFile = new Vinyl({ path: vPath, contents: buffer });
                    
                    output = T2.obj();
                    output.push(vFile);
                    output.push(null);
                    
                    break;
                default: 
                    output = stdout; 
                    break;
            }   
            
            return res(output);
        });
    });

const exel = async (cmd, type, filename, encoding)  => exec(`${root()}/node_modules/.bin/${cmd}`, type, filename, encoding);

module.exports = {
    exec,
    exel
};
