let recipeList = [];
let xhr = new XMLHttpRequest();

function getPlugins() {
    // Load installed plugins.
    xhr.open("GET", "http://localhost:" + window.location.port + "/api/plugin/list");
    xhr.onload = (e) => {
        $('#pluginList').empty();
        recipeList = JSON.parse(e.target.responseText);

        recipeList.forEach(recipe => {
            let title = '', updateForm = '', deleteForm = '';
            title = '<div title="' + recipe.directory + '" class="col">' + recipe.friendlyName + '</div>';
            if (recipe.hasUpdate) {
                updateForm = '<form method="put" onsubmit="submitForm(event)" class="float-right updateform" action="/api/plugin/update"><input type="hidden" name="recipe" value="' + recipe.directory.substring(recipe.directory.lastIndexOf("/") + 1) + '"><input type="submit" class="btn btn-success pull-left" value="Update"></form>';
            }
            deleteForm = '<form onsubmit="if(confirm(\'Are you sure you want to uninstall this plugin?\')){submitForm(event)}" class="deleteform float-right" method="delete" action="/api/plugin/remove"><input type="hidden" name="recipe" value="' + recipe.directory.substring(recipe.directory.lastIndexOf("/") + 1) + '"><input type="submit" class="btn btn-danger pull-right" value="delete"></form>';
            $('<div class="row">' + title +'<div class="col">' + deleteForm + updateForm +'</div></div>').appendTo('#pluginList');
        });
    };
    xhr.send();
}

// Get anything containing https://github.com to a newline (A standard people are encouraged to folow)
const gitRegex = /https:\/\/github\.com\/[^\r\n]+/;
const items_per_page = 50;
let page = 1;
let searchTimeout = null;

document.getElementById('searchfield').addEventListener('input', event => search(event.target.value));
function search (query) {
    clearTimeout(searchTimeout);
    // Show loading animation while waiting for github to respond
    document.getElementsByClassName('search-results')[0].innerHTML = '<div><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;display: block; margin: auto;" xml:space="preserve"> <rect x="0" y="5.0462" width="4" height="19.9076" fill="#333" opacity="0.2"> <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate> </rect> <rect x="8" y="7.5462" width="4" height="14.9076" fill="#333" opacity="0.2"> <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate> </rect> <rect x="16" y="9.9538" width="4" height="10.0924" fill="#333" opacity="0.2"> <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate> <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate> </rect> </svg></div>';
    searchTimeout = setTimeout(() => {
        // Get all issues in meetfranz/plugins repo containing github.com in the body and containing the search query.
        xhr.open("GET", "https://api.github.com/search/issues?q=repo:meetfranz/plugins+https://github.com/%20in:body+" + query + "%20in:body,title&per_page=" + items_per_page + "&page=" + page);
        xhr.onload = (e) => {
            document.getElementsByClassName('search-results')[0].innerHTML = "";
            githubList = JSON.parse(e.target.responseText);

            if (githubList.message != undefined && githubList.items == undefined) {
                document.getElementsByClassName('search-results')[0].innerText = githubList.message;
            }
            if (githubList.items.length == 0) {
                document.getElementsByClassName('search-results')[0].innerText = "Nothing has been found!";
            }
            githubList.items.forEach(post => {
                let repository = gitRegex.exec(post.body)[0] + ".git";

                $('<div class="row my-1"> <a href="' + post.html_url + '" target="_blank" class="col">' + post.title + '</a> <button onclick="document.getElementById(\'repository\').value = `' + repository + '`; document.getElementById(\'addbutton\').click()" class="col btn btn-primary">Install</button></div>').appendTo('.search-results');
            });
        };
        xhr.send();
    },500);
};

let responseDOM = document.getElementById('response');
// General REST form submit.
function submitForm (e) {
    e.preventDefault();
    let formData = new FormData(e.target);
    let body = [...formData.entries()] // expand the elements from the .entries() iterator into an actual array
        .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))  // transform the elements into encoded key-value-pair

    xhr.open(e.target.getAttribute('method') ? e.target.getAttribute('method') : e.target.method, e.target.action, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = (e) => {
        let json = JSON.parse(e.target.responseText);
        switch (json.type){
            case 'clone':
                if(json.result.error !== undefined ) {
                    responseDOM.className = "alert alert-danger";
                    responseDOM.innerText = json.result.error;
                } else {
                    responseDOM.className = "alert alert-success";
                    responseDOM.innerText = 'Successfully added! To complete installation you\'ll have to restart Franz.'
                }
                break;
            case 'remove':
                responseDOM.className = "alert alert-success";
                responseDOM.innerText = json.result;
                break;
            case 'update':
                responseDOM.className = "alert alert-success";
                responseDOM.innerText = json.result;

                getPlugins();
                break;
            default:
                responseDOM.className = "alert alert-info";
                responseDOM.innerText = e.target.responseText;
        }
    };
    xhr.send(body);
}
getPlugins();