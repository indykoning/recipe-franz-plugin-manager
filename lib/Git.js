const fs                                  = require('fs');
const { execSync }                        = require('child_process');
const { readdirSync }                     = require('fs');
const { recipeDir, isDirectory, baseDir } = require(__dirname + '/Directory');
const { join }                            = require('path');

let gitRecipes                            = [];
let hasScannedRecipes                     = false;

// Return installed recipes (Prefers cache)
exports.getRecipes = function (force = false) {
    if (gitRecipes.length === 0 || !hasScannedRecipes || force) {
        if (!force) {
            try {
                gitRecipes = require(baseDir + '/recipeCache.json');
            } catch (e) {
                // Normal scanning
                gitRecipes = getGitDirectories(recipeDir);
                fs.writeFile(baseDir + '/recipeCache.json', JSON.stringify(gitRecipes), 'utf8', () => {});
            }
        } else {
            // Forced scanning
            gitRecipes = getGitDirectories(recipeDir);
            fs.writeFile(baseDir + '/recipeCache.json', JSON.stringify(gitRecipes), 'utf8', () => {});
        }
    }

    gitRecipes.forEach(recipe => {
        recipe.hasUpdate = hasUpdate(recipe.directory);
    });

    hasScannedRecipes = true;
    return gitRecipes;
};

exports.git_clone = url => {
    try {
        execSync('git clone ' + url, {cwd: recipeDir});
    }catch (e) {
        return {error: e.message};
    }
    return {};
};

exports.updateRecipe = recipePath => {
    execSync('git pull', {cwd: recipePath})
};

hasUpdate = directory => {
    try {
        execSync('git remote update', {cwd: directory});
        try {
            let result = execSync('git status -u no', {cwd: directory});

            return (result.indexOf('behind') !== -1);
        } catch (e) {
            console.log('err');
        }
    } catch (e) {
        console.log('err2', e.message);
    }
    return;
};

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

