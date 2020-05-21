// 'use strict';
// var assert = require('assert');
// var h2md = require('../index');
// var Vinyl = require('vinyl');
// it('should convert html to md', function (cb) {
//         var stream =  h2md.sync();

//         stream.on('data', function (file) {
//                 assert.equal(file.relative, 'fixture.md');
//                 assert.equal(file.contents.toString(), '# Test');
//                 // cb(null,file); 
//         });

//         stream.write(new Vinyl({
//                 path: 'fixture.html',
//                 contents: Buffer.from("<h1>Test</h1>")
//         }));
// });