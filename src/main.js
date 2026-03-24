import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import { getImagesByQuery } from './js/pixabay-api';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let query = '';
let totalHits = 0;
let loadedImages = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();

  query = e.target.elements.searchQuery.value.trim();
  if (!query) return;

  page = 1;
  loadedImages = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, no images found.',
      });
      return;
    }

    totalHits = data.totalHits;
    loadedImages += data.hits.length;

    createGallery(data.hits);
    showLoadMoreButton();
  } catch (error) {
    iziToast.error({ message: 'Error loading images' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    createGallery(data.hits);
    loadedImages += data.hits.length;

    smoothScroll();

    if (loadedImages >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({ message: 'Error loading more images' });
  } finally {
    hideLoader();
  }
});

function smoothScroll() {
  const card = document.querySelector('.gallery-item');
  if (!card) return;

  const { height } = card.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
