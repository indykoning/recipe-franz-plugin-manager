"use strict";

module.exports = Franz => Franz;

// Better get all & search franz issues: https://api.github.com/search/issues?q=repo:meetfranz/plugins+https://github.com/%20in:body&per_page=50&page=1
//my code

(function(){
    require(__dirname + '/lib/Server').start();
})();


