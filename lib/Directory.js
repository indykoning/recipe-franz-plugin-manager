const fs = require('fs');
const path = require('path');

let recipeDir, baseDir;

recipeDir = path.resolve(__dirname + '/../..');
recipeDir = (/\/dev$/.test(recipeDir)) ? recipeDir : recipeDir + '/dev';
baseDir = path.resolve(__dirname + '/..');

exports.baseDir = baseDir;
exports.recipeDir = recipeDir;

exports.deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                exports.deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

exports.isDirectory = source => fs.lstatSync(source).isDirectory();