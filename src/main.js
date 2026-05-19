import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';
import { router } from './routes.js';
import { BASE_URL, labels } from './constants.js';

await Actor.init();

const { keyword = 'iphone' } = (await Actor.getInput()) ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestRetries: 10,
    requestHandler: router,
});

log.info('Starting the crawl.');
await crawler.run([{
    url: `${BASE_URL}/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
    label: labels.START,
    userData: { keyword },
}]);
log.info('Crawl finished.');

await Actor.exit();
