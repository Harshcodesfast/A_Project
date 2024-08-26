import * as model from './model.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeview.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addrecipeView from './views/addrecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// https://forkify-api.herokuapp.com/v2

if (module.hot) {
  module.hot.accept();
}

// loading screen
recipeView.renderSpinner();
// Fetch a recipe from the API
const showRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    //loading screen
    if (!id) recipeView.renderSpinner();
    resultsView.update(model.getSearchResults());
    bookmarksView.update(model.state.bookmarks);
    //loading recipe
    await model.loadRecipe(id);
    //rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    console.error(`${error}`);
    recipeView.renderError(error);
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResults());
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(`${error}`);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResults(goToPage));
  paginationView.render(model.state.search);
};
const controlSurvings = function (newServings) {
  model.updateSurvings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    console.log(newRecipe);
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    setTimeout(function () {
      addrecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    addrecipeView.renderMessage();
  } catch (error) {
    console.error(`${error}`);
    addrecipeView.renderError(error);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRenderer(showRecipe);
  recipeView.addHandlerUpdateServings(controlSurvings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addrecipeView.addhandlerUpload(controlAddRecipe);
};
init();
