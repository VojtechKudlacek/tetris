/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 * @param {'production' | 'development'} env
 * @returns {BuildOptions}
 */
const createConfig = (env = 'development') => {
	const isProd = env === 'production';
	// Base url is project, not this dir
	return {
		entryPoints: ['./src/index.tsx'],
		outfile: './build/script.js',
		tsconfig: './tsconfig.json',
		minify: isProd ? true : false,
		bundle: true,
		define: {
			'process.env.NODE_ENV': `"${env}"`, // Quotes because it will be replace with string
		}
	}
}

module.exports = createConfig;
