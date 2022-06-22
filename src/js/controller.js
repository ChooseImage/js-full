//Handle user input, incorp user end and model methods, load recipe

import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView';

//import icons from '../img/icons.svg';//pacel1
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}

const controlRecipe = async function() {
  try {
    const id = window.location.hash.slice(1);
    //console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update rsults ciew to mark selected search
    resultsView.update(model.getSearchResultsPage());

    // 0.5) updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //1) Loading res
    await model.loadRecipe(id);

    //2) Rendering res
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4) Rnder initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  //1) Render NEW results
  //console.log(model.state.search.results);

  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Rnder NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  //update recipe serbvinhgs
  model.updateServings(newServings);

  //update view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  //1) add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) update recipeview
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();
    //Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookamrk view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //CLOSE form
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('??', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function() {
  console.log('welcome');
};

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();
