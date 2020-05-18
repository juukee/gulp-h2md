const chalk = require('chalk');
const PluginError = require('plugin-error');
const replaceExtension = require('replace-ext');
const stripAnsi = require('strip-ansi');
const through = require('through2');
const clonedeep = require('lodash/cloneDeep');
const path = require('path');
const html2md = require('html-to-md');
const log = require('fancy-log');

const PLUGIN_NAME = 'gulp-h2md';

//////////////////////////////
// Main Gulp H2md function
//////////////////////////////
const gulpH2md = (options, sync) => through.obj((file, enc, cb) => { // eslint-disable-line consistent-return

    const validExtensions = ['.html', '.htm'];

    if (file.isNull()) {
        log(`${PLUGIN_NAME}: ${chalk.red('File length is null')} ${chalk.blue(file.relative)}`);
        return cb();
    }

    if (file.isStream()) {
        log(`${PLUGIN_NAME}: ${chalk.red('Steam file is unsupported ')} ${chalk.blue(file.relative)}`);
        return cb();
    }

    if (path.basename(file.path).indexOf('_') === 0) {
        log(`${PLUGIN_NAME}: ${chalk.red('File length is 0 bytes')} ${chalk.blue(file.relative)}`);
        return cb();
    }

    if (!file.contents.length) {
        file.path = replaceExtension(file.path, '.md'); // eslint-disable-line no-param-reassign
        log(`${PLUGIN_NAME}: ${chalk.red('File length is 0 bytes')} ${chalk.blue(file.relative)}`);
        return cb();
    }
    if (!validExtensions.includes(path.extname(file.path).toLowerCase())) {
        log(`${PLUGIN_NAME}: ${chalk.red('Skipping unsupported html file')} ${chalk.blue(file.relative)}`);
        return cb();
    }

    const opts = clonedeep(options || {});
    opts.data = file.contents.toString();

    // we set the file path here so that libhtml can correctly resolve import paths
    opts.file = file.path;

    
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
            return cb(null,obj);
          };

        (async () => {
            try {
                const data = await html2md(file.contents.toString(enc), opts);
                file.contents = Buffer.from(data);
                file.path = replaceExtension(file.path, '.md'); 
                log(`${PLUGIN_NAME}:`, chalk.green('✔ ') + file.relative + chalk.green(' Async Converted!'));
                callback(null, file);
            } catch (error) {
                callback(new PluginError(PLUGIN_NAME, error, { fileName: file.path }));
                log(`${PLUGIN_NAME}:`, chalk.yellow('X ') + file.relative + chalk.red(`Async Failed!`));
                return cb();
            }
        })();


    } else {
        //////////////////////////////
        // Sync H2md render
        //////////////////////////////
        try {
            const data = html2md(file.contents.toString(enc), opts);
            file.contents = Buffer.from(data);
            file.path = replaceExtension(file.path, '.md'); 
            callback(null, file);
            log(`${PLUGIN_NAME}:`, chalk.green('✔ ') + file.relative + chalk.gray(`Sync Converted!`));
        } catch (error) {
            callback(new PluginError(PLUGIN_NAME, error, { fileName: file.path }));
                log(`${PLUGIN_NAME}:`, chalk.yellow('X ') + file.relative + chalk.red(`Async Failed!`));
                return cb();
        }
    }
});


gulpH2md.sync = options => gulpH2md(options, true);

//////////////////////////////
// Log errors nicely
//////////////////////////////
gulpH2md.logError = function logError(error) {
    const message = new PluginError(PLUGIN_NAME, error.messageFormatted).toString();
    process.stderr.write(`${message}\n`);
    this.emit('end');
};



module.exports = gulpH2md;