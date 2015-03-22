var gulp = require('gulp'), //GULP !!!
    less = require('gulp-less'), //Convert less to css
    uglify = require('gulp-uglify'), //Uglify js
    stripDebug = require('gulp-strip-debug'), //Remove console.log for the prod scripts
    plumber = require('gulp-plumber'), //Avoid bugs during gulp watch
    minifycss = require('gulp-minify-css'), //minify css
    inject = require('gulp-inject'), //Inject css/js in page
    concat = require('gulp-concat'), //Concatenation of files
    rename = require('gulp-rename'), //Renaming
    args = require('yargs').argv, //gulp arguments to parameterize gul commands
    ngAnnotate = require('gulp-ng-annotate'), //automatic angular annotations
    bowerfiles = require('main-bower-files'), //Manage bower plugins files to inject
    gulpif = require('gulp-if'), //Gulp if logic
    jshint = require('gulp-jshint'), //JS quality tools
    htmlify = require('gulp-angular-htmlify'),
    ngHtml2Js = require("gulp-ng-html2js"),
    clean = require('gulp-clean'),
    replace = require('gulp-replace-task');//Delete files and folders


//Location
var indexLocation = "./index.html",
    scriptsLocation = ['./modules/**/*.js'],
    viewsLocation = ['./modules/**/*.html'],
    stylesLocation = ['./modules/**/*.less'];
//Destination
var backEndDir = "./../",
    indexDestination = backEndDir,
    scriptsBaseDestination = backEndDir + 'dist/js/',
    pluginsScriptsDestination = backEndDir + "dist/libs",
    stylesBaseDestination = backEndDir + 'dist/css',
    viewsDestination = backEndDir + 'dist/partials';
//Args
var env = args.env || 'dev';
var minify = true;
if(env === 'dev'){
    minify = false;
}

//Style : concat + less to css + minify
gulp.task('style', function () {
    return gulp.src(stylesLocation)
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('all.css'))
        .pipe(gulp.dest(stylesBaseDestination))
        .pipe(minifycss())
        .pipe(rename('all.min.css'))
        .pipe(gulp.dest(stylesBaseDestination));
});

//Files to copy like html templates
gulp.task('view', function () {
    return gulp.src(viewsLocation)
        .pipe(htmlify())
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest(viewsDestination));
});
gulp.task('generate-partial', function() {
    return gulp.src(viewsLocation)
        .pipe(rename({ dirname: '' }))
        .pipe(ngHtml2Js({moduleName: "hex7.partial"}))
        .pipe(concat("partials.js"))
        .pipe(gulp.dest(viewsDestination))
        .pipe(uglify())
        .pipe(rename('partials.min.js'))
        .pipe(gulp.dest(viewsDestination));
});

//Script
//Quality task will run before script task.
//If a quality error occured the script task will not be executed
gulp.task('script', ['quality','generate-partial'], function () {
    return gulp.src(scriptsLocation)
        .pipe(plumber())
        .pipe(concat('all.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(scriptsBaseDestination))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest(scriptsBaseDestination));
});

// Plugins injection
gulp.task('inject' ,function () {
    gulp.src(indexLocation)
        .pipe(gulpif(minify, replace({
          patterns: [
            {
              match: /@MINIFY@/g,
              replacement: '.min.'
            }
          ]
        })))
        .pipe(gulpif(!minify, replace({
          patterns: [
            {
              match: /@MINIFY@/g,
              replacement: '.'
            }
          ]
        })))
        .pipe(inject(gulp.src(bowerfiles({ read: false, debugging: false, env: env })), { ignorePath: "/bower_components/", addPrefix: "dist/libs/", addRootSlash: false }))
        .pipe(gulp.dest(indexDestination));

    gulp.src(bowerfiles({ checkExistence: true, read: true, debugging: false, env: env }), { base: 'bower_components' })
        .pipe(gulp.dest(pluginsScriptsDestination));
});

//Quality
gulp.task('quality', function () {
    return gulp.src(scriptsLocation)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

//Commands :
//Parameter : gulp (--env=prod or --debug=dev (default value)),
//Remark : task executed in parallel (no order defined here)
gulp.task('default', ['script', 'view', 'style']);
//Parameter : gulp plugins (--env=dev or --env=prod)
gulp.task('plugins', ['inject']);

//ALL
gulp.task('all', ['default', 'plugins']);

gulp.task('watch', ['default'], function() {
    gulp.watch(scriptsLocation, ['all']);
    gulp.watch(stylesLocation, ['style']);
    gulp.watch(viewsLocation, ['view']);
    gulp.watch(viewsLocation, ['script']);
    gulp.watch(viewsLocation, ['inject']);
});