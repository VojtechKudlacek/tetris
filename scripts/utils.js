const fs = require('fs');
const path = require('path');

/**
 * @param {string} dir
 */
const mkdir = (dir) => {
	try {
		fs.mkdirSync(dir, 0755);
	} catch(e) {
		if(e.code !== 'EEXIST') {
			throw e;
		}
	}
};

/**
 * @param {string} src
 * @param {string} dest
 */
const copyFile = (src, dest) => {
	var oldFile = fs.createReadStream(src);
	var newFile = fs.createWriteStream(dest);
	oldFile.pipe(newFile)
};

/**
 * @param {string} src
 * @param {string} dest
 */
const copyDir = (src, dest) => {
	mkdir(dest);
	const files = fs.readdirSync(src);
	for(let i = 0; i < files.length; i++) {
		const current = fs.lstatSync(path.join(src, files[i]));
		if(current.isDirectory()) {
			copyDir(path.join(src, files[i]), path.join(dest, files[i]));
		} else if(current.isSymbolicLink()) {
			const symlink = fs.readlinkSync(path.join(src, files[i]));
			fs.symlinkSync(symlink, path.join(dest, files[i]));
		} else {
			copyFile(path.join(src, files[i]), path.join(dest, files[i]));
		}
	}
};

module.exports = { mkdir, copyFile, copyDir };
