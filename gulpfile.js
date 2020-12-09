const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}
exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", { delay: 500 }, gulp.series("styles"));
  gulp.watch("source/*.html", { delay: 500 }, gulp.series("copyHtml"));
  gulp.watch("build/*.html").on("change", sync.reload);
}

// Clean

const del = require("del");
const clean = () => {
  return del("build");
};
exports.clean = clean;

// Copy

const copyFonts = () => {
  return gulp.src("source/fonts/**/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"));
};
exports.copyFonts = copyFonts;

const copyHtml = () => {
  return gulp.src([
    "source/*.html"
  ])
    .pipe(gulp.dest("build"));
};
exports.copyHtml = copyHtml;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ quality: 75, optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
};
exports.images = images;

// Sprite

const sprite = () => {
  return gulp.src([
    "build/img/**/icon-*.svg"
  ])
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}
exports.sprite = sprite;

// Build

const build = gulp.series(
  clean,
  styles,
  images,
  sprite,
  copyFonts,
  copyHtml
);
exports.build = build

exports.default = gulp.series(
  build, server, watcher
);
