// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var path = require('path');
var license = require('gulp-header-license');
var licenseText = "/* \r\n" +
    "    Copyright (c) 2014-2020 The Virie Project \r\n" +
    "    Distributed under  MIT/X11 software license, see the accompanying \r\n" +
    "    file COPYING or http://www.opensource.org/licenses/mit-license.php. \r\n" +
    " */";

var DevelopPath = __dirname;
var ProgramPath = 'C:/Program Files/Virie/html';

function getFilesArray(base) {
    var Files = [
        'app.js',
        'index.html',
        'controllers/*',
        'services/*',
        'views/*',
        'assets/*',
        'assets/countries/*',
        'assets/languages/*',
        'assets/js/*',
        'assets/css/*'
    ];

    if(base) {for(var i in Files){Files[i] = base + Files[i];}}
    return Files;
}

gulp.task('copy',function(){
    gulp.src([DevelopPath + '/**/*']).pipe(gulp.dest(ProgramPath));
});

gulp.task('watch-copy',function(){
    gulp.watch(getFilesArray(DevelopPath +'/')).on('change',function(file){
        var FilePath = file.path;
        console.log('Changed:',FilePath);
        gulp.src(FilePath,{base:DevelopPath}).pipe(gulp.dest(ProgramPath));
    });
});

var config = {
    less: {
        source: './less/css/source/*.less',
        dist: './less/css/computed',
        main: {
            folder: './assets/css',
            file: 'styles.css'
        }
    }
};

gulp.task('less', function () {
    return gulp.src(config.less.source)
        .pipe(less({paths: [path.join(__dirname, 'less', 'includes')]}))
        .pipe(gulp.dest(config.less.dist))
        .pipe(concat(config.less.main.file))
        .pipe(license(licenseText))
        .pipe(gulp.dest(config.less.main.folder))
});

gulp.task('watch-less', function () {
    gulp.watch([config.less.main.folder + 'variables.less', config.less.source], ['less']);
});
