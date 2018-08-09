var gulp = require('gulp');
var uglify = require('gulp-uglify');
var qunit = require('gulp-qunit');

var dist = 'dist';
var test = 'test';

var paths = ['./date-calculator.js'];

gulp.task('combine-js', function() {
    return gulp.src(paths)
        .pipe(uglify())
        .pipe(gulp.dest(dist))
});

gulp.task('test', function() {
    return gulp.src(test + '/index.html')
        .pipe(qunit());
});

gulp.task('default', ['combine-js', 'test']);