const packager = require('electron-packager')
const electronInstaller = require('electron-winstaller')

const execSync = require('child_process').execSync

const gulp = require('gulp')
const minify = require('gulp-uglify/composer')(require('uglify-es'),console)

;[/*'ia32',*/'x64'].forEach(arch=>{
	execSync(`export PHANTOMJS_PLATFORM=win32;export PHANTOMJS_ARCH=${arch};npm rebuild`)
	packager({
		dir:'./',
		arch: arch,
		platform:'win32',
		icon:'icon.ico',
		packageManager:'npm',
		ignore:[/\/c:/,/\.directory/,/\/installer\//,/\/app\/.*\.js/,/^((?!node_modules\/).)*\/builder.js/,/^((?!node_modules\/).)*\/gulp.js/,/\/satellitare\//,/\/stradale\//],
		afterCopy:[(buildPath,electronVersion,platform,arch,callback)=>{
			console.log(buildPath)
			gulp.src(buildPath+'/*.js').pipe(minify()).on('error', e=>{console.log(e);throw e}).pipe(gulp.dest(buildPath))
			console.log('minified')
			callback()
		}]
	}).then(appPaths=>
		electronInstaller.createWindowsInstaller({
			appDirectory: appPaths[0],
			//outputDirectory: '../installer/',
			setupExe: `gepc_installer_${arch}.exe`,
			iconUrl:'c:/icon.ico', //WINDOWS al nol supuarte li iconis cun path relatîvs
			//setupIcon:'c:/icon.ico' //No sai parçeche a no va
		}).then(() => console.log("It worked!"), e => console.log(`No dice: ${e.message}`))
)})
