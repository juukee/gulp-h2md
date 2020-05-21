const chalk = require('chalk');
const PluginError = require('plugin-error');
const replaceExtension = require('replace-ext');
const through = require('through2');
const path = require('path');
const log = require('fancy-log');
const TurndownService = require('turndown');
const PLUGIN_NAME = 'gulp-h2md';

const gulpH2md = (options, sync) => through.obj(async (file, enc, cb) => { // eslint-disable-line consistent-return
    let opts = Object.assign({}, options || {});
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
        log(`${PLUGIN_NAME}: ${chalk.red('File length is 0 bytes')} ${chalk.blue(file.relative)}`);
        return cb();
    }
    if (!validExtensions.includes(path.extname(file.path).toLowerCase())) {
        log(`${PLUGIN_NAME}: ${chalk.red('Skipping unsupported html file')} ${chalk.blue(file.relative)}`);
        return cb();
    }


    if (sync !== true) {
        (async () => {
            try {
                const data = await new TurndownService().turndown(file.contents.toString(), opts);
                file.contents = Buffer.allocUnsafe && Buffer.from(data) ? Buffer.from(data) : new Buffer(data);
                file.path = replaceExtension(file.path, '.md');

                log(`${PLUGIN_NAME}:`, chalk.green('✔ ') + file.relative + chalk.blue(` Async Converted!`));
            } catch (error) {
                cb(new PluginError(PLUGIN_NAME, error, { fileName: file.path }));
                log(`${PLUGIN_NAME}:`, chalk.yellow('X ') + file.relative + chalk.red(`Async Failed!`));
                return cb();
            }
        })();


    } else {
        try {
            const data = new TurndownService().turndown(file.contents.toString(), opts);
            file.contents = Buffer.allocUnsafe && Buffer.from(data) ? Buffer.from(data) : new Buffer(data);
            file.path = replaceExtension(file.path, '.md');
            cb(null, file);
            log(`${PLUGIN_NAME}:`, chalk.green('✔ ') + file.relative + chalk.blue(` Sync Converted!`));
        } catch (error) {
            cb(new PluginError(PLUGIN_NAME, error, { fileName: file.path }));
            log(`${PLUGIN_NAME}:`, chalk.yellow('X ') + file.relative + chalk.red(` Sync Failed!`));
            return cb();
        }
    }
});


gulpH2md.sync = options => gulpH2md(options, true);

gulpH2md.logError = function logError(error) {
    const message = new PluginError(PLUGIN_NAME, error.messageFormatted).toString();
    process.stderr.write(`${message}\n`);
    this.emit('end');
};



module.exports = gulpH2md;