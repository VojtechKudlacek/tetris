const esbuild = require('esbuild');
const readline = require('readline');
const chalk = require('chalk');
const http = require('http');
const path = require('path');
const express = require('express');
const utils = require('./utils');
const buildOptions = require('./config')('development');

const app = express();
const server = http.Server(app);

(async () => {
	const build = async () => {
		try {
			const t = Date.now();
			console.log(chalk.green('Building...'));
			utils.copyDir('./public', './build');
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
			console.log(chalk.red('Build failed!'));
		}
	};

	const serve = async (port = 3000) => {
		app.use(express.static(path.join(__dirname, '..', 'build')));
		app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'build', 'index.html')));
		server.listen(port, () => console.log(`${chalk.cyan('Server is running on')} ${chalk.green(`http://localhost:${port.toString()}`)}`));
	};

	const terminal = readline.createInterface({ input: process.stdin });

	const hints = [
		`${chalk.cyan('c / clear')}: clear the console`,
		`${chalk.cyan('r / build')}: creates a new build`,
		`${chalk.cyan('q / exit')} : terminate the process`
	];

	const aliases = {
		c: 'clear',
		r: 'build',
		q: 'exit'
	};

	console.log(hints.join('\n'), '\n');

	terminal.on('line', (input) => {
		switch (aliases[input] || input) {
			case 'clear':
				return console.clear();
			case 'build':
				return build();
			case 'exit':
				return process.exit(0);
			default:
				break;
		}
	});

	terminal.on('close', () => process.exit(0));

	await build();
	await serve();
})();
