var gulp = require('gulp');

var del = require('del');
var exec = require('child_process').exec;
var mime = require('mime');
var seq = require('run-sequence');
var xml = require('xmlbuilder');
var zip = require('gulp-zip');

const SFDX_OPTS = { cwd: 'src' };
const STATIC_FILES = 'src/main/default/staticresources/app/**/*';
const RELEASE_DIR = 'release';

/*
  TODO: 
    - create resource meta Gulp plugin
    - allow mime override by extension or filename
*/

gulp.task('clean:static', function() {
  return del(RELEASE_DIR + '/**/*');
});

gulp.task('build:static:xml', function() {
  
});

gulp.task('build:static', function() {
  // TODO:
  //   - create app.resource-meta.xml
  //   - zip and rename to app.resource



});

gulp.task('sfdx:push', function() {
  exec('sfdx force:source:push', SFDX_OPTS, function(error, stdout, stderr) {
    console.log(error, stdout, stderr);
  });
});

gulp.task('default', function(callback) {
  seq('clean:static', 'build:static', 'sfdx:push', function (error) {
    if (error) {
      console.log(error.message);
    } 
    else {
      console.log('PUSH FINISHED SUCCESSFULLY');
    }

    callback(error);
  });
});
