var gulp = require('gulp');

var del = require('del');
var exec = require('child_process').exec;
var fs = require('fs');
var mime = require('mime');
var mkdirp = require('mkdirp');
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

gulp.task('build:static:xml', function() {
  
});

gulp.task('build:static', function() {
  // TODO:
  //   - create app.resource-meta.xml
  //   - zip and rename to app.resource

  /*
  <?xml version="1.0" encoding="UTF-8"?>
  <StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
      <contentType>text/plain</contentType>
      <description>Test Resource</description>
  </StaticResource>
  */

  mkdirp(RELEASE_DIR, function (err) {
    var meta = xml.create('StaticResource', {'xmlns': 'http://soap.sforce.com/2006/04/metadata'});    
    var files = fs.readdirSync('./' + STATIC_FILES);
    
    for (var i in files) {
      var currentFile = './' + STATIC_FILES + '/' + files[i];
      var stats = fs.statSync(currentFile);

      if (stats.isFile()) {
        console.log(currentFile);
      }
    }
    
    var xmlStr = meta.end({pretty: true, indent: '  '});

    fs.writeFile(META_XML_PATH, xmlStr); 
  });
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
