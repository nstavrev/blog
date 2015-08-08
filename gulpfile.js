var gulp = require('gulp');

var inject = require('gulp-inject');

var runSequence = require('run-sequence');

var uglify = require('gulp-uglify');

var concat = require('gulp-concat');

var del = require('del');

var minifyCSS = require('gulp-minify-css');

var template = require('gulp-template');

var watch = require('gulp-watch');

var rename = require("gulp-rename");

var less = require('gulp-less');

var watchLess = require('gulp-watch-less');

var fs = require('fs');


var PORT = 3000;

var randomString = function(extension) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text + extension;
}

var PATHS = {
	src : {
		js : {
			lib : [
				'./bower_components/jquery/dist/jquery.min.js',
				'./bower_components/bootstrap/dist/js/bootstrap.min.js',
				'./bower_components/angular/angular.js',
				'./bower_components/angular-route/angular-route.js',
				'./external_components/require.js',
				'./main/main.js'
			],
			mainJs : "./main/main.js"
		},
		css : {
			lib : [
				'./bower_components/bootstrap/dist/css/bootstrap.min.css',
				'./stylesheets/**/*.css'
			],
			less : [
				'./stylesheets/less/**/*.less'
			]
		}
	},
	dest : {
		js : {
			lib : 'public/javascripts/lib',
			mainJs : 'public/javascripts/lib',
			concatJsFileName : randomString(".js")
		},
		css : {
			lib : 'public/stylesheets',
			concatCssFileName : randomString(".css")
		},
		less : "stylesheets",
		ngApp : "./public/javascripts/app"
	},
	ngApp : {
		src : "./ng-app/**/*.js",
		appSrc : "./ng-app/app.js",
		routeResolverSrc : "./ng-app/services/routeResolver.js",
		controllers : "./ng-app/controllers",
		services : "./ng-app/services",
		views : "./public/views"
	}
}

var getFilesToInject = function(paths, startPath) {
	var filesToInject = [];
	paths.forEach(function(path){
		var splitted = path.split('/');
		filesToInject.push(startPath + "/" + splitted[splitted.length - 1]);
	});
	return filesToInject;
}

// PATHS.jsToInject = getFilesToInject(PATHS.src.js.lib, './public/javascripts/lib');

PATHS.jsToInject = {
	dev : getFilesToInject(PATHS.src.js.lib, './public/javascripts/lib'),
	prod : getFilesToInject(['./public/javascripts/' + PATHS.dest.js.concatJsFileName], './public/javascripts/lib')
}

// PATHS.cssToInject = getFilesToInject(PATHS.src.css.lib, './public/stylesheets');

PATHS.cssToInject = {
	dev : getFilesToInject(PATHS.src.css.lib, './public/stylesheets'),
	prod : getFilesToInject(['./public/stylesheets/' + PATHS.dest.css.concatCssFileName], './public/stylesheets')
}

console.log(PATHS.cssToInject.prod)

var transformTag = function(js, filepath, async) {
	var pathSplited = filepath.split('/');
  	var path = "/";
  	for(var i=2; i < pathSplited.length; i++){
  		path += pathSplited[i] + ( i < pathSplited.length - 1 ? "/" : "");
  	}

  	if(js) {
  		return '<script ' + (async ? "async" : "") + ' type="text/javascript" src="' + path + '"></script>';
  	}

  	return '<link rel="stylesheet" href="' + path + '"/>';
}

//Cleaning tasks
gulp.task('clean.lib', function(done){
	del([PATHS.dest.js.lib, PATHS.dest.css.lib],done);
});

gulp.task('clean.ngApp', function(done){
	del([PATHS.dest.ngApp], done);
});

//End cleaning tasks

gulp.task('build.lib.dev.js', function() {
	return gulp.src(PATHS.src.js.lib)
		.pipe(gulp.dest(PATHS.dest.js.lib));
});


gulp.task('build.lib.dev.css', function() {
	return gulp.src(PATHS.src.css.lib)
		.pipe(gulp.dest(PATHS.dest.css.lib));
});

gulp.task('inject.dev', function(){
	var target = gulp.src('./public/index.html');
	var cssSources = gulp.src(PATHS.cssToInject.dev, {read: false});
	var jsSources = gulp.src(PATHS.jsToInject.dev, {read: false});
 
	return target.pipe(inject(cssSources, {
		transform : function(filepath, file, i , length){
			return transformTag(false, filepath);
		}
	}))
	.pipe(inject(jsSources, {
  		transform : function(filepath, file, i, length){
  			return transformTag(true, filepath);
  		}
  	}))
  	.pipe(gulp.dest('./public'));


});

gulp.task('copy-ng-app',['clean.ngApp'], function() {

	return gulp.src(PATHS.ngApp.src)
		.pipe(gulp.dest(PATHS.dest.ngApp));
});

gulp.task('build.dev', function(done){
	//Doing all tasks
	return runSequence('clean.lib', 'build.lib.dev.js', 'build.lib.dev.css', 'inject.dev','copy-ng-app', done);
});

gulp.task('uglify-lib-js', function(){
	return gulp.src(PATHS.src.js.lib)
		.pipe(uglify({mangle : false}))
  		.pipe(concat(PATHS.dest.js.concatJsFileName))
  		.pipe(gulp.dest(PATHS.dest.js.lib))
});

gulp.task('uglify-ng-app', function(){
	return gulp.src(PATHS.ngApp.src)
	.pipe(uglify({mangle : false}))
	.pipe(gulp.dest(PATHS.dest.ngApp));
});

gulp.task('minify-css', function() {
 return gulp.src(PATHS.src.css.lib)
    .pipe(minifyCSS({ keepSpecialComments: false }))
  	.pipe(concat(PATHS.dest.css.concatCssFileName))
  	.pipe(gulp.dest(PATHS.dest.css.lib))
});

gulp.task('inject.prod', function(){
	var target = gulp.src('./public/index.html');
	var cssSources = gulp.src(PATHS.cssToInject.prod, {read: false});
	var jsSources = gulp.src(PATHS.jsToInject.prod, {read: false});

	return target.pipe(inject(cssSources, {
		transform : function(filepath, file, i , length){
			return transformTag(false, filepath);
		}
	}))
	.pipe(inject(jsSources, {
  	transform : function(filepath, file, i, length){
  		return transformTag(true, filepath, true);
  	}
  }))
	.pipe(gulp.dest('./public'));

});

gulp.task('build.prod', function(done){
	return runSequence('clean.lib', 'uglify-lib-js', 'minify-css', 'inject.prod', 'uglify-ng-app', done);
});

gulp.task('listen', function() {
	var app = require('./app');
	app.listen(PORT, function(){
		console.log("LISTENING ON PORT " + PORT);
	});
});


//watching tasks

gulp.task('watch.ngApp', function(){
	return gulp.watch("ng-app/**", ['copy-ng-app']);
	// return gulp.src("ng-app/**/*")
	// 	.pipe(watch("ng-app/**/*"))
	// 	.pipe(gulp.dest(PATHS.dest.ngApp))
});

gulp.task('watch.css', function(){
	console.log(PATHS.dest.css.lib);
	return gulp.src(PATHS.src.css.lib)
		.pipe(watch(PATHS.src.css.lib))
		.pipe(gulp.dest(PATHS.dest.css.lib))
});

gulp.task('less.dev', function(){
	console.log(PATHS.dest.css.lib);

	return gulp.src(PATHS.src.css.less[0])
	.pipe(watchLess(PATHS.src.css.less[0]))
	.pipe(watch(PATHS.src.css.less))
    .pipe(less())
    .pipe(gulp.dest(PATHS.dest.less));
});

gulp.task('watch', ['watch.ngApp', 'watch.css', 'less.dev']);

//end watching tasks

function ngGenerate(fileName, path, src) {

	try{
		fs.readFileSync(path + "/" + fileName + ".js");
		console.error("ERROR : " + path + "/" + fileName + " ALREADY EXISTS");
		return;
	} catch(e){}

	return gulp.src(src)
        .pipe(template({name : fileName }))
        .pipe(rename(fileName + ".js"))
        .pipe(gulp.dest(path));
}

// ng-app utils tasks
gulp.task('ng-generate-controller', function(){
	var controllerName = process.argv[3];
	controllerName = controllerName.replace("-", "") + "Controller";

	return ngGenerate(controllerName, PATHS.ngApp.controllers, './gulp_utils/newController.js');
	
});

gulp.task('ng-generate-service', function(){
	var serviceName = process.argv[3];
	serviceName = serviceName.replace("-", "") + "Service";

	return ngGenerate(serviceName, PATHS.ngApp.services, './gulp_utils/newService.js');
	
});

gulp.task('generate-view', function(){
	var viewName = process.argv[3];
	viewName = viewName.replace("-", "") + ".html";

	fs.writeFile(PATHS.ngApp.views + "/" + viewName, "", function(err){
		if(err) throw err;
		console.log("View " + viewName + " was created in " + PATHS.ngApp.views);
	})

});

// end ng-app utils tasks

gulp.task('serve.dev', function(done){
	return runSequence('build.dev', 'listen', 'watch', done);
});

gulp.task('serve.prod', function(done){
	return runSequence('build.prod', 'listen', done);
});