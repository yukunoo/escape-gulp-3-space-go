const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minimist = require('minimist'); // 用來讀取指令轉成變數
const gulpSequence = require('gulp-sequence').use(gulp);
const ejs = require("gulp-ejs");
const rename = require('gulp-rename');
// production || development
// # gulp --env production
const envOptions = {
  string: 'env',
  default: { env: 'development' }
};
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

gulp.task('clean', () => {
  return gulp.src(['./public', './.tmp'], { read: false }) // 選項讀取：false阻止gulp讀取文件的內容，使此任務更快。
    .pipe($.clean());
});

gulp.src("./source/**/!(_)*.ejs")
  
gulp.task('ejs', () => {
  return gulp.src(['./source/**/!(_)*.ejs'])
    .pipe(ejs({
      msg: "Hello Gulp!"
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest("./public"))
    .pipe(browserSync.reload({
      stream: true,
    }));
})

gulp.task('sass', function () {
  // PostCSS AutoPrefixer
  var processors = [
    autoprefixer({
      browsers: ['last 5 version'],
    })
  ];

  return gulp.src(['./source/stylesheets/**/*.sass', './source/stylesheets/**/*.scss'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({ 
      outputStyle: 'nested',
      includePaths: ['./node_modules/bootstrap/scss']
    })
      .on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.if(options.env === 'production', $.minifyCss())) // 假設開發環境則壓縮 CSS
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function () {
  browserSync.init({
    server: { baseDir: './public' },
    reloadDebounce: 2000
  })
});

gulp.task('watch', function () {
  gulp.watch(['./source/stylesheets/**/*.sass', './source/stylesheets/**/*.scss'], ['sass']);
  gulp.watch(['./source/**/*.ejs'], ['ejs']);
});

gulp.task('deploy', function () {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

gulp.task('sequence', gulpSequence('clean', 'ejs', 'sass', 'babel', 'vendorJs', 'imageMin'));

gulp.task('default', ['ejs', 'sass', 'browserSync', 'watch']);
gulp.task('build', ['sequence'])

/* --- SCSS 編譯 --- */
gulp.task('sass', () => {
  return gulp
    .src('./source/stylesheets/*.scss')
    .pipe(
      sass({
        outputStyle: 'compressed', // 執行壓縮
        includePaths: ['node_modules/bootstrap/scss/'], // 導入 sass 模塊可能路徑
      }).on('error', sass.logError)
    )
    .pipe(postcss([autoprefixer()])) // 加入 CSS Prefix
    .pipe(gulp.dest('./public/stylesheets'));
});

