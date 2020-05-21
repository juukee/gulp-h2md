const test = require('ava');
const Vinyl = require('vinyl');
const pEvent = require('p-event');
const gulpH2md = require('../index')

test('compiles HTML to Markdown', async t => {
	const stream = gulpH2md();
	const dataPromise = pEvent(stream, 'data');

	stream.end(new Vinyl({
		path: 'fixture.html',
		contents: Buffer.from('<h1>Test</h1>')
	}));

	const file = await dataPromise;

	t.is(file.relative, 'fixture.md');
	t.is(file.contents.toString(), '# Test');
});

// test('exposes the marked object', t => {
// 	t.truthy(markdown.marked);
// 	t.truthy(markdown.marked.Renderer);
// 	t.truthy(markdown.marked.lexer);
// 	t.truthy(markdown.marked.parser);
// });