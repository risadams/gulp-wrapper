// gulp-wrapper
const through2 = require('through2');
const PluginError = require('plugin-error');
const path = require('path');

module.exports = function (opt) {
  'use strict';

  if (typeof opt !== 'object') {
    opt = {};
  }

  return through2.obj(function (file, _encoding, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      return this.emit('error', new PluginError('gulp-wrapper', 'Streaming not supported'));
    }

    let fileName = path.relative(file.base, file.path);
    let newContentString = file.contents.toString();
    let header = '';
    let footer = '';

    if (process.platform.match(/^win/)) {
      fileName = fileName.replace(/\\/g, '/');
    }

    if (typeof opt.header === 'function') {
      header = opt.header(file);
    } else if (typeof opt.header === 'string') {
      header = opt.header.replace(/\${filename}/g, fileName);
    } else if (typeof opt.header !== 'string') {
      header = '';
    }

    if (typeof opt.footer === 'function') {
      footer = opt.footer(file);
    } else if (typeof opt.footer === 'string') {
      footer = opt.footer.replace(/\${filename}/g, fileName);
    } else if (typeof opt.footer !== 'string') {
      footer = '';
    }
    newContentString = header + newContentString + footer;
    file.contents = Buffer.from(newContentString);
    this.push(file);
    callback();
  });
};
