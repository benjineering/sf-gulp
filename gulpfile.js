var gulp = require('gulp');

var del = require('del');
var exec = require('child_process').exec;
var fs = require('fs');
var map = require('map-stream');
var mime = require('mime');
var mkdirp = require('mkdirp');
var path = require('path');
var seq = require('run-sequence');
var xml = require('xmlbuilder');
var zip = require('gulp-zip');

const SFDX_OPTS = { cwd: 'src' };
const STATIC_FILES = 'src/force-app/main/default/staticresources/app/**/*';
const RELEASE_DIR = 'release';
const META_XML_PATH = RELEASE_DIR + '/app.resource-meta.xml';

/*
  TODO: 
    - create resource meta Gulp plugin
    - allow mime override by extension or filename
*/

gulp.task('clean:static', function() {
  return del(RELEASE_DIR + '/**/*');
});

gulp.task('build:metafiles', function() {
  // TODO:
  //   - zip and rename to app.resource?

  var writeXml = function(file, cb) {
    if (file.isDirectory()) return;

    var resourceName = path.basename(file.path);
    resourceName = resourceName.substr(0, resourceName.lastIndexOf('.'));
    var metaPath = path.dirname(file.path) + '/' + resourceName + '-meta.xml';

    if (!fs.existsSync(metaPath)) {
      var meta = xml.create('StaticResource',
        {'xmlns': 'http://soap.sforce.com/2006/04/metadata'});
      meta.ele('contentType', mime.getType(file.relative));
      meta.ele('cacheControl', 'Private');

      fs.writeFileSync(metaPath, meta.end({ pretty: true}));
      console.log('Created ' + metaPath);
    }

    cb(null, file);
  };

  return gulp.src(['./' + STATIC_FILES]).pipe(map(writeXml));
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
