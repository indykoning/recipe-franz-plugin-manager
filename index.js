"use strict";

module.exports = Franz => Franz;

//my code

const express = require('express');
const app = express();
let path = require('path');
let { join } = require('path');
const { lstatSync, readdirSync } = require('fs');

const isDirectory = source => lstatSync(source).isDirectory();
// const dirContains = (source, folderName) => {console.log(source);readdirSync(source).map(name => {console.log(name);return name === folderName})};
const getDirectories = source =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory).map(name => {console.log(name, readdirSync(name));return true});

console.log('--------');
console.log(getDirectories(__dirname + '/../'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')));
app.get('/api/plugins', (req, res) => {

    res.json(getDirectories(__dirname + '/../'));
});
app.get('/api', (req, res) => {});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
