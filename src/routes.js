import { createCheerioRouter } from '@crawlee/cheerio';

import { BASE_URL, labels, OFFERS_URL } from './constants.js';

export const router = createCheerioRouter();

router.addHandler(labels.START, async ({ $, crawler, request }) => {
    const { keyword } = request.userData;

    // Skip sponsored results, they lead to ads instead of product pages
    const products = $('div[data-component-type="s-search-result"]:not(.AdHolder)');

    // Sometimes Amazon returns a page without any results,
    // so we throw an error to retry the request with a different proxy
    if (!products.length) {
        throw new Error('No products found, retrying');
    }

    const requests = [];
    for (const product of products) {
        const element = $(product);
        const asin = element.attr('data-asin');
        if (!asin) continue;

        const url = `${BASE_URL}/dp/${asin}`;

        requests.push({
            url,
            label: labels.PRODUCT,
            userData: {
                data: {
                    title: element.find('h2[aria-label]').text().trim(),
                    asin,
                    itemUrl: url,
                    keyword,
                },
            },
        });
    }
    await crawler.addRequests(requests);
});

router.addHandler(labels.PRODUCT, async ({ $, crawler, request }) => {
    const { data } = request.userData;

    // Sometimes Amazon returns an empty page instead of the product,
    // so we throw an error to retry the request with a different proxy
    if (!$('#productTitle').length) {
        throw new Error('Product page did not load, retrying');
    }

    const description =
        $('div#productDescription').text().trim() ||
        $('#feature-bullets li')
            .map((i, item) => $(item).text().trim())
            .get()
            .join(' ');

    await crawler.addRequests([
        {
            url: OFFERS_URL(data.asin),
            label: labels.OFFERS,
            userData: {
                data: {
                    ...data,
                    description,
                },
            },
        },
    ]);
});

router.addHandler(labels.OFFERS, async ({ $, request, pushData }) => {
    const { data } = request.userData;

    // Sometimes Amazon returns a page without the offers,
    // so we throw an error to retry the request with a different proxy
    if (!$('#aod-container').length) {
        throw new Error('Offers did not load, retrying');
    }

    // The pinned offer is the one in the "Add to Cart" box,
    // the others are listed below it
    for (const offer of $('#aod-pinned-offer, #aod-offer')) {
        const element = $(offer);
        const price = element.find('.apex-pricetopay-value').first().text().trim();

        // Products nobody sells have a placeholder offer without a price
        if (!price) continue;

        await pushData({
            ...data,
            sellerName: element.find('#aod-offer-soldBy [aria-label]').text().trim(),
            offer: price,
        });
    }
});
