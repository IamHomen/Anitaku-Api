import express from 'express';
import cors from 'cors';

import {
    scrapeNewRelease,
    scrapeNewSeason,
    scrapePopular,
    scrapeMovie,
    scrapeM3U8,
    scrapeSearch,
    scrapeAnimeList
} from './anime_parser.js';

const port = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    credentails: true,
    optionSuccessStatus: 200,
    port: port,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json('Welcome to Anitaku API by Homen!');
});

app.get('/new-release', async(req, res) => {
    try {
        const page = req.query.page;

        const data = await scrapeNewRelease({ page: page });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/popular', async(req, res) => {
    try {
        const page = req.query.page;

        const data = await scrapePopular({ page: page });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/new-season', async(req, res) => {
    try {
        const page = req.query.page;

        const data = await scrapeNewSeason({ page: page });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/movies', async(req, res) => {
    try {
        const page = req.query.page;
        const aph = req.query.aph;

        const data = await scrapeMovie({ aph: aph, page: page });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/anime-list', async(req, res) => {
    try {
        const page = req.query.page;
        const aph = req.query.aph;

        const data = await scrapeAnimeList({ aph: aph, page: page  });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/search', async(req, res) => {
    try {
        const page = req.query.page;
        const keyword = req.query.keyword;

        const data = await scrapeSearch({ keyword: keyword, page: page  });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/vidcdn/watch/:id', async(req, res) => {
    try {
        const id = req.params.id;

        const data = await scrapeM3U8({ id: id });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});


app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: 'Not Found',
    });
});

app.listen(port, () => {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});