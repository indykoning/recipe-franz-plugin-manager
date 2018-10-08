"use strict";

module.exports = Franz => Franz;

// Get all franz issues: https://api.github.com/repos/meetfranz/plugins/issues
// Better get all & search franz issues: https://api.github.com/search/issues?q=repo:meetfranz/plugins+https://github.com/%20in:body&per_page=50&page=1
//my code
const express                       = require('express');
const bodyParser                    = require('body-parser');
const app                           = express();
let path                            = require('path');
let { join }                        = require('path');
const { lstatSync, readdirSync }    = require('fs');
const fs                            = require('fs');
let gitRecipes                      = [];
let hasScannedRecipes               = false;
const { exec, execSync }            = require('child_process');
(function(){
    // Change directory to parent dir (assumed to be the dev directory with all other plugins)
    process.chdir(__dirname + '/../');
    let recipeDir = process.cwd();
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/', (req, res) =>
        res.sendFile(path.join(__dirname + '/site/index.html'))
    );

    app.get('/api/plugin/list', (req, res) => {
        res.json(getRecipes(recipeDir));
    });

    app.post('/api/plugin/add', (req, res) => {
        fs.unlinkSync(__dirname + '/recipeCache.json');
        res.json({type:'clone',result:git_clone(req.body.repository)});
    });

    app.delete('/api/plugin/remove', (req, res) => {
        deleteFolderRecursive(recipeDir + '/' + req.body.recipe);
        getRecipes(recipeDir, true);
        res.json({type:'remove',result:'successfully removed!'})
    });

    app.listen(require(__dirname + '/package.json').config.serviceURL.split(":").pop(), () => {});

    function getRecipes(directory, force = false) {
        if (gitRecipes.length === 0 || !hasScannedRecipes || force) {
            if (!force) {
                try {
                    gitRecipes = require(__dirname + '/recipeCache.json');
                } catch (e) {
                    console.info('scanning', e);
                    gitRecipes = getGitDirectories(directory);
                    fs.writeFile(__dirname + '/recipeCache.json', JSON.stringify(gitRecipes), 'utf8', () => {});

                }
            } else {
                console.info('scanning forced');
                gitRecipes = getGitDirectories(directory);
                fs.writeFile(__dirname + '/recipeCache.json', JSON.stringify(gitRecipes), 'utf8', () => {});
            }
        }
        hasScannedRecipes = true;
        return gitRecipes;
    }

    const isDirectory = source => lstatSync(source).isDirectory();
    const isGitRepo = source => readdirSync(source).includes('.git');
    const getGitDirectories = source => readdirSync(source)
        .map(name => join(source, name))
        .filter(isDirectory && isGitRepo)
        .map(directory =>
        {
            return {
                directory: directory,
                friendlyName: require(directory+'/package.json').name
            };
        });
    const deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index){
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    const git_clone = url => {
        try {
            execSync('git clone ' + url).toString();
        }catch (e) {
            return {error: e.message};
        }
        return {};
    }
})();


