const chalk = require('chalk');
const PluginError = require('plugin-error');
const replaceExtension = require('replace-ext');
const stripAnsi = require('strip-ansi');
const through = require('through2');
const clonedeep = require('lodash/cloneDeep');
const path = require('path');
const html2md = require('html-to-md');


const PLUGIN_NAME = 'gulp-h2md';

//////////////////////////////
// Main Gulp H2md function
//////////////////////////////
const gulpH2md = (options, sync) => through.obj((file, enc, cb) => { // eslint-disable-line consistent-return
    if (file.isNull()) {
        return cb(null, file);
    }

    if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    if (path.basename(file.path).indexOf('_') === 0) {
        return cb();
    }

    if (!file.contents.length) {
        file.path = replaceExtension(file.path, '.md'); // eslint-disable-line no-param-reassign
        return cb(null, file);
    }

    const opts = clonedeep(options || {});
    opts.data = file.contents.toString();

    // we set the file path here so that libhtml can correctly resolve import paths
    opts.file = file.path;

    // Ensure `indentedSyntax` is true if a `.html` file
    if (path.extname(file.path) === 'html') {
        opts.indentedSyntax = true;
    }

    // Ensure file's parent directory in the include path
    if (opts.includePaths) {
        if (typeof opts.includePaths === 'string') {
            opts.includePaths = [opts.includePaths];
        }
    } else {
        opts.includePaths = [];
    }

    opts.includePaths.unshift(path.dirname(file.path));

    //////////////////////////////
    // Handles error message
    //////////////////////////////
    const errorM = (error) => {
        const filePath = (error.file === 'stdin' ? file.path : error.file) || file.path;
        const relativePath = path.relative(process.cwd(), filePath);
        const message = [chalk.underline(relativePath), error.formatted].join('\n');

        error.messageFormatted = message; // eslint-disable-line no-param-reassign
        error.messageOriginal = error.message; // eslint-disable-line no-param-reassign
        error.message = stripAnsi(message); // eslint-disable-line no-param-reassign
        error.relativePath = relativePath; // eslint-disable-line no-param-reassign

        return cb(new PluginError(PLUGIN_NAME, error));
    };

    if (sync !== true) {
        //////////////////////////////
        // Async H2md render
        //////////////////////////////
        const callback = (error, obj) => { // eslint-disable-line consistent-return
            if (error) {
                return errorM(error);
            }
            filePush(obj);
        };

        gulpH2md.compiler.render(opts, callback);
    } else {
        //////////////////////////////
        // Sync H2md render
        //////////////////////////////
        try {
            filePush(gulpH2md.compiler.renderSync(opts));
        } catch (error) {
            return errorM(error);
        }
    }
});

//////////////////////////////
// Sync Sass render
//////////////////////////////
gulpH2md.sync = options => gulpH2md(options, true);

//////////////////////////////
// Log errors nicely
//////////////////////////////
gulpH2md.logError = function logError(error) {
    const message = new PluginError(PLUGIN_NAME, error.messageFormatted).toString();
    process.stderr.write(`${message}\n`);
    this.emit('end');
};

//////////////////////////////
// Store compiler in a prop
//////////////////////////////
gulpH2md.compiler = require('html-to-md');

module.exports = gulpH2md;