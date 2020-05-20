// import test from 'ava';
const test = require('ava');
const h2md =require('../index');

test('compiles Markdown to HTML', async t => {
	var stream = h2md("function (){}");

        stream.on('data', function (file) {
                is(file.relative, 'fixture.md');
                is(file.contents.toString(), '# Test');
                cb();
        });

        stream.write(new File({
                path: 'fixture.html',
                contents: new Buffer("<h1>Test</h1>")
        }));
});


