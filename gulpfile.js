var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var browserify = require("browserify");//我们将把所有模块捆绑成一个JavaScript文件。 所幸，这正是Browserify要做的事情
var source = require('vinyl-source-stream');// vinyl-source-stream会将Browserify的输出文件适配成gulp能够解析的格式，它叫做 vinyl。
var tsify = require("tsify");//tsify是Browserify的一个插件，就像gulp-typescript一样，它能够访问TypeScript编译器
var watchify = require("watchify");//Watchify启动Gulp并保持运行状态，当你保存文件时自动编译。 帮你进入到编辑-保存-刷新浏览器的循环中。
var gutil = require("gulp-util");

var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

var paths = {
  pages: ['src/*.html']
};

var watchedBrowserify = watchify(browserify({
  basedir: '.',
  debug: true,
  entries: ['src/main.ts'],
  cache: {},
  packageCache: {}
})
.plugin(tsify))
.transform('babelify', {
  presets: ['es2015'],
  extensions: ['.ts']
});

gulp.task("copy-html", function () {
  return gulp.src(paths.pages)
  .pipe(gulp.dest("dist"));
});

gulp.task('ts-to-js',function () {
  return tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest("dist"));
});



// gulp.task("default",["copy-html"], function () {
//   return browserify({
//     basedir: '.',
//     debug: true,
//     entries: ['src/main3.ts'],
//     cache: {},
//     packageCache: {}
//   })
//   .plugin(tsify)
//   .bundle()
//   .pipe(source('bundle.js'))
//   .pipe(gulp.dest("dist"));
// });

function bundle() {
  return watchedBrowserify
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest("dist"));
}
gulp.task("default", ["copy-html"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);