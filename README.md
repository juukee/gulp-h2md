# gulp-h2md
Gulp plugin for html to md
---

[![Build Status](https://travis-ci.org/juukee/gulp-h2md.svg?branch=master)](https://travis-ci.org/juukee/gulp-h2md)
[![npm](https://img.shields.io/npm/v/gulp-h2md.svg)](https://www.npmjs.com/package/gulp-h2md)
[![codecov](https://codecov.io/gh/juukee/gulp-h2md/branch/master/graph/badge.svg)](https://codecov.io/gh/juukee/gulp-h2md)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/gulp-h2md)
![David](https://img.shields.io/david/juukee/gulp-h2md)
![Publish Package](https://github.com/juukee/gulp-h2md/workflows/Publish/badge.svg)

# Install

```
npm install gulp-h2md --save-dev
```

# Basic Usage
```javascript
'use strict';

var gulp = require('gulp');
var gH2md = require('gulp-h2md');

gulp.task('h2md', function () {
  return gulp.src('./html/**/*.html')
    .pipe(gH2md())
    .pipe(gulp.dest('./md'));
});

```




```javascript
'use strict';

var gulp = require('gulp');
var gH2md = require('gulp-h2md');

gulp.task('h2md', function () {
  return gulp.src('./html/**/*.html')
    .pipe(gH2md().on('error', gH2md.logError))
    .pipe(gulp.dest('./md'));
});

```

You can also compile synchronously, doing something like this:

```javascript

'use strict';

var gulp = require('gulp');
var gH2md = require('gulp-h2md');

gulp.task('h2md', function () {
  return gulp.src('./html/**/*.html')
    .pipe(gH2md.sync().on('error', gH2md.logError))
    .pipe(gulp.dest('./md'));
});

```

