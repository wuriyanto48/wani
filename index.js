const http = require('http');
const https = require('https');
const fs = require('fs');

const COLORS = {
    reset : "\x1b[0m",
    bright : "\x1b[1m",
    dim : "\x1b[2m",
    underscore : "\x1b[4m",
    blink : "\x1b[5m",
    reverse : "\x1b[7m",
    hidden : "\x1b[8m",
    black : "\x1b[30m",
    red : "\x1b[31m",
    green : "\x1b[32m",
    yellow : "\x1b[33m",
    blue : "\x1b[34m",
    magenta : "\x1b[35m",
    cyan : "\x1b[36m",
    white : "\x1b[37m",
    bBlack : "\x1b[40m",
    bRed : "\x1b[41m",
    bGreen : "\x1b[42m",
    bYellow : "\x1b[43m",
    bBlue : "\x1b[44m",
    bMagenta : "\x1b[45m",
    bCyan : "\x1b[46m",
    bWhite : "\x1b[47m"
};

const setColor = (text, color) => {
    return `${COLORS[color]}${text}${COLORS.reset}`;
};

const callback = (response) => {
	const statusCode = response.statusCode;
	let fileName = 'file.out';
	if (response.headers['content-disposition']) {
		let contentDisposition = response.headers['content-disposition'];
		let arr = contentDisposition.split('=');
		if (arr.length >= 2) {
			fileName = arr[1];
		}
	}

	if (statusCode !== 200) {
		process.stdout.write('cannot get data\n');
		response.resume();
		return;
	}
	
	const outStream = fs.createWriteStream(fileName, {flags: 'w'});
	response.on('data', (chunk) => {
		process.stdout.write(Buffer.from([46, 32]));
		outStream.write(chunk);
	});

	response.on('end', () => {
		process.stdout.write('\n');
		process.stdout.write(`download ${fileName} finish\n`);
	});
}

const exec = (host, cb) => {
	const url = new URL(host);
	let httpClient = http;

	httpClient = (url.protocol === 'https:') ? https : httpClient;

	httpClient.get(url, (response) => {
		if (response.headers.location) {
			let location = response.headers.location;
			if (location.match(/^http/)) {
				location = new URL(location);
				host = location.href;
			}

			get(host, cb);
		} else {
			cb(response);
		}
	}).on('error', (error) => {
		process.stdout.write(`${error.message}\n`);
	});
}

module.exports = {setColor, exec, callback};
