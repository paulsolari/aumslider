const gulp 				= require("gulp"),
	plumber 			= require("gulp-plumber"),
	notify				= require("gulp-notify"),
	sass 				= require("gulp-sass"),
	sourceMaps  		= require("gulp-sourcemaps"),
	cleanCss 			= require("gulp-clean-css"),
	rename 	 			= require("gulp-rename"),
	autoprefixer 		= require("gulp-autoprefixer"),
	concat 				= require("gulp-concat"),
	uglify 				= require("gulp-uglify"),
	browserSync 		= require("browser-sync").create();



const onError = (err) => {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
    })(err);
    this.emit("end");
};



gulp.task("serve", () => {
	browserSync.init({
		server: "./",
		watch: true,
		notify: false
	});
});



gulp.task("css", () => {
	return gulp.src("./scss/*.scss")
	.pipe(plumber({errorHandler: onError}))
	.pipe(sass({outputStyle: "expanded"}))
	.pipe(autoprefixer({browsers: ['last 5 versions']}))
	.pipe(gulp.dest("./css"))
});



gulp.task("mincss", () => {
	return gulp.src("./css/aum-slider.css")
	.pipe(plumber({errorHandler: onError}))
	.pipe(cleanCss())
	.pipe(rename("aum-slider.min.css"))
	.pipe(gulp.dest("./css"));
});



gulp.task("minjs", () => {
	return gulp.src("./js/aum-slider.js")
	.pipe(plumber({errorHandler: onError}))
	.pipe(uglify())
	.pipe(rename("aum-slider.min.js"))
	.pipe(gulp.dest("./js"));
});



gulp.watch("./scss/**/*.scss", gulp.series(["css"]));

gulp.task("min", gulp.series(["mincss", "minjs"]));

gulp.task("default", gulp.series(["serve", "css"]));