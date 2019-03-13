const { getRecipes, git_clone, updateRecipe } = require(__dirname + '/Git');
const { recipeDir, baseDir, deleteFolderRecursive } = require(__dirname + '/Directory');
let path                            = require('path');
const express                       = require('express');
const bodyParser                    = require('body-parser');
const app                           = express();
const server_port                   = require(baseDir + '/package.json').config.serviceURL.split(":").pop();
// process.chdir(baseDir);

exports.start = () => {
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(baseDir + '/site'));

    app.get('/', (req, res) => res.sendFile(path.join(baseDir + '/site/index.html'))
    );

    app.get('/api/plugin/list', (req, res) => {
        res.json(getRecipes(recipeDir));
    });

    app.post('/api/plugin/add', (req, res) => {
        let cloneResult = git_clone(req.body.repository);
        getRecipes(true);
        res.json({type:'clone',result:cloneResult});
    });

    app.delete('/api/plugin/remove', (req, res) => {
        deleteFolderRecursive(recipeDir + '/' + req.body.recipe);
        getRecipes(true);
        res.json({type:'remove',result:'successfully removed!'})
    });

    app.put('/api/plugin/update', (req, res) => {
        updateRecipe(recipeDir + '/' + req.body.recipe);
        res.json({type:'update',result:'successfully updated the recipe!'})
    });

    app.listen(server_port, () => {console.info('Running recipe installer server on http://localhost:' + server_port)});
};