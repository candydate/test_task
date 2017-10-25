var gulp = require('gulp'),
    newer = require('gulp-newer'),
    merge = require('merge-stream'),
    concat = require('gulp-concat');

var jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify');

var less = require('gulp-less'),
    path = require('path'),
    cleanCSS = require('gulp-clean-css');

// var prettify = require('gulp-prettify');

var optipng = require('imagemin-optipng'),
    imagemin = require('gulp-imagemin');

// Lint
gulp.task('lint', function () {
    return gulp.src(['./source/js/custom/*.js', '!./source/js/vendor/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// JS
gulp.task('scripts', function() {


    var thirdparty = gulp.src('./source/js/vendor/*.js')
        .pipe(concat('thirdparty.js'))
        .pipe(gulp.dest('./public/js'));

    var custom = gulp.src('./source/js/custom/*.js')
        .pipe(concat('custom.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));

	return merge(thirdparty, custom);

});

// LESS
gulp.task('less', function () {
    return gulp.src('./source/css/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(cleanCSS({compatibility: 'ie11'}))
        .pipe(gulp.dest('./public/css'));
});

//HTML
gulp.task('html', function () {
    return gulp.src('./source/*.html')
        .pipe(gulp.dest('./public'));
});

//IMAGES
gulp.task('images', function () {
    return gulp.src(['./source/img/*'])
        .pipe(newer('./public/img'))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [optipng()]
        }))
        .pipe(gulp.dest('./public/img'));
});

gulp.task('default', ['lint', 'scripts', 'less', 'html', 'images']);

gulp.task('watch', ['lint', 'scripts', 'less', 'html', 'images'], function() {

    gulp.watch('./source/css/**/*.less', ['less']);
    gulp.watch('./source/js/**/*.js', ['scripts']);
    gulp.watch('./source/*.html', ['html']);
    // gulp.watch('./source/img/*', ['images']);//TODO gulp-watch plugin

});