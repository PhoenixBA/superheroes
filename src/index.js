import './sass/main.scss';
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import refs from './js/refs';
import createCollection from './js/createCollection';
import apiService from './js/apiService'; 
import { scroll } from './js/scroll'; 


let query = ''
let page = 1
let simpleLightBox
const perPage = 40

refs.searchForm.addEventListener('submit', onSearchForm)
refs.btnLoad.addEventListener('click', onBtnLoad)


function onSearchForm(event) {
  event.preventDefault()

  page = 1
  query = event.currentTarget.searchQuery.value.trim()
  refs.gallery.innerHTML = ''
  refs.btnLoad.classList.add('is-hidden')
  
  if (!query) {
    alertNoEmptySearch()
    return
  }

  apiService(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound()
      } else {
        createCollection(data.hits)
        simpleLightBox = new SimpleLightbox('.gallery').refresh()
        alertImagesFound(data)

        if (data.totalHits > perPage) {
          refs.btnLoad.classList.remove('is-hidden')
        }
      }
    })
    
    .catch(error => console.log(error))
  
}

function onBtnLoad() {
  page += 1
  simpleLightBox.destroy()

  apiService(query, page, perPage)
    .then(({ data }) => {
      createCollection(data.hits)
      simpleLightBox = new SimpleLightbox('.gallery').refresh()

      const totalPages = Math.ceil(data.totalHits / perPage)

      if (page > totalPages) {
        refs.btnLoad.classList.add('is-hidden')
        alertEndOfSearch()
      }
      scroll()
    })
    .catch(error => console.log(error))
}

function alertImagesFound(data) {
  Notify.success(`Hooray! We found ${data.totalHits} images.`)
}

function alertNoEmptySearch() {
  Notify.failure('The search string cannot be empty. Please specify your search query.')
}

function alertNoImagesFound() {
  Notify.failure('Sorry, there are no images matching your search query. Please try again.')
}

function alertEndOfSearch() {
  Notify.failure("We're sorry, but you've reached the end of search results.")
}

