const esbuild = require('esbuild');
const chalk = require('chalk');

/**
 * ! EDIT THIS CONFIG
 * @type {esbuild.BuildOptions}
 */
const buildOptions = {
	entryPoints: ['./src/index.tsx'],
	outfile: './build/script.js',
	minify: true,
	bundle: true,
};

(async () => {
	try {
		const t = Date.now();
		console.log(chalk.green('Building...'));
		const { warnings } = await esbuild.build(buildOptions);
		if (warnings.length) {
			for (const warning of warnings) {
				console.warn(warning);
			}
			console.log(chalk.yellow(`Build finished in ${Date.now() - t} ms with ${warnings.length} warnings`));
		} else {
			console.log(chalk.cyan(`Build successfully finished in ${Date.now() - t} ms`));
		}
	} catch (e) {
		console.error(e);
		console.log(chalk.red('Build failed!'));
	}
})()
