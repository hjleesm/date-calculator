var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

var root = path.resolve(__dirname, '..');
var source = fs.readFileSync(path.join(root, 'date-calculator.js'), 'utf8');
var result = uglify.minify(source);

if (result.error) {
    throw result.error;
}

var dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'date-calculator.js'), result.code + '\n');
