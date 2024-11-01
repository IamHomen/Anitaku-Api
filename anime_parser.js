import axios from 'axios';
import * as cheerio from 'cheerio';

import {
 generateEncryptAjaxParameters,
 decryptEncryptAjaxResponse,
} from './goload.js';

import { USER_AGENT, renameKey } from './utils.js';

const Referer = 'https://s3taku.com/';
const goload_stream_url = 'https://goload.pro/streaming.php';

const BASE_URL = 'https://anitaku.pe/';


export const scrapeNewRelease = async ({ page }) => {
    const list = [];
  try {
    const newReleasePage = await axios.get(`${BASE_URL}home.html?page=${page}`);
    const $ = cheerio.load(newReleasePage.data);

    $('div.last_episodes.loaddub > ul > li').each((i, el) => {
        const id = $(el).find('p.name > a').attr('href').split('/')[1].split('-episode-')[0];
        list.push({
            id: id,
            epId: $(el).find('p.name > a').attr('href').split('/')[1],
            title: $(el).find('p.name > a').attr('title'),
            img: $(el).find('div > a > img').attr('src'),
            released: $(el).find('p.episode').text().trim(),
            animeUrl: BASE_URL + "category/" + $(el).find('p.name > a').attr('href').split('/')[1].split('-episode-')[0]
        });
    });

    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapePopular = async ({ page }) => {
    const list = [];
  try {
    const popularPage = await axios.get(`${BASE_URL}popular.html?page=${page}`);
    const $ = cheerio.load(popularPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
        list.push({
            id: $(el).find('p.name > a').attr('href').split('/')[2],
            title: $(el).find('p.name > a').attr('title'),
            img: $(el).find('div > a > img').attr('src'),
            episode: $(el).find('p.released').text().trim(),
            animeUrl: BASE_URL + $(el).find('p.name > a').attr('href').split('/')[2]
        });
    });

    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeNewSeason = async ({ page }) => {
    const list = [];
  try {
    const newSeasonPage = await axios.get(`${BASE_URL}new-season.html?page=${page}`);
    const $ = cheerio.load(newSeasonPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
        list.push({
            id: $(el).find('p.name > a').attr('href').split('/')[2],
            title: $(el).find('p.name > a').attr('title'),
            img: $(el).find('div > a > img').attr('src'),
            episode: $(el).find('p.released').text().trim(),
            animeUrl: BASE_URL + $(el).find('p.name > a').attr('href').split('/')[2]
        });
    });

    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeMovie = async ({ aph, page }) => {
  const list = [];
try {
  const moviePage = await axios.get(`${BASE_URL}anime-movies.html?aph=${aph}&page=${page}`);
  const $ = cheerio.load(moviePage.data);

  $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
          id: $(el).find('p.name > a').attr('href').split('/')[2],
          title: $(el).find('p.name > a').attr('title'),
          img: $(el).find('div > a > img').attr('src'),
          episode: $(el).find('p.released').text().trim(),
          animeUrl: BASE_URL + $(el).find('p.name > a').attr('href').split('/')[2]
      });
  });

  return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeAnimeList = async ({ aph, page }) => {
    const list = [];
  try {
    const animeListPage = await axios.get(`${BASE_URL}anime-list-${aph}&page=${page}`);
    const $ = cheerio.load(animeListPage.data);
  
    $('div.anime_list_body > ul > li').each((i, el) => {
        list.push({
            id: $(el).find('a').attr('href').split('/')[2],
            title: $(el).find('a').attr('title'),
            animeUrl: BASE_URL + $(el).find('a').attr('href').split('/')[2]
        });
    });

  return list;
} catch (err) {
  console.log(err);
  return { error: err };
}
};

export const scrapeSearch = async ({ keyword, page = 1 }) => {
  const list = [];
try {
  const searchPage = await axios.get(`${BASE_URL}search.html?keyword=${keyword}&page=${page}`);
  const $ = cheerio.load(searchPage.data);

  $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
          id: $(el).find('div.img a').attr('href').split('/')[2],
          title: $(el).find('p.name a').attr('title'),
          img: $(el).find('div.img a img').attr('src'),
          released: $(el).find('p.released').text().trim(),
          animeUrl: BASE_URL + $(el).find('div.img a').attr('href').split('/')[2]
      });
  });

return list;
} catch (err) {
console.log(err);
return { error: err };
}
};

export const scrapeM3U8 = async ({ id }) => {
 let sources = [];
 let sources_bk = [];
 try {
  let epPage, server, $, serverUrl;

  if (id) {
   epPage = await axios.get(BASE_URL + id);
   $ = cheerio.load(epPage.data);

   server = $('#load_anime > div > div > iframe').attr('src');
   serverUrl = new URL(server);
  } else throw Error('Episode id not found');

  const goGoServerPage = await axios.get(serverUrl.href, {
   headers: { 'User-Agent': USER_AGENT },
  });
  const $$ = cheerio.load(goGoServerPage.data);

  const params = await generateEncryptAjaxParameters(
   $$,
   serverUrl.searchParams.get('id')
  );

  const fetchRes = await axios.get(
   `
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`,
   {
    headers: {
     'User-Agent': USER_AGENT,
     'X-Requested-With': 'XMLHttpRequest',
    },
   }
  );

  const res = decryptEncryptAjaxResponse(fetchRes.data);

  if (!res.source) return { error: 'No sources found!! Try different source.' };

  res.source.forEach((source) => sources.push(source));
  res.source_bk.forEach((source) => sources_bk.push(source));

  return {
   Referer: serverUrl.href,
   sources: sources,
   sources_bk: sources_bk,
  };
 } catch (err) {
  return { error: err };
 }
};