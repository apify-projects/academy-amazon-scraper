import { createCheerioRouter, Dataset } from 'crawlee';
import { BASE_URL, labels } from './constants.js';

export const router = createCheerioRouter();

router.addHandler(labels.START, async ({ $, crawler, request }) => {
    const { keyword } = request.userData;

    const products = $('div > div[data-asin]:not([data-asin=""])');

    for (const product of products) {
        const element = $(product);
        const titleElement = $(element.find('.a-text-normal[href]'));

        const href = titleElement.attr('href');
        if (!href) continue;

        const url = `${BASE_URL}${href}`;

        await crawler.addRequests([{
            url,
            label: labels.PRODUCT,
            userData: {
                data: {
                    title: titleElement.first().text().trim(),
                    asin: element.attr('data-asin'),
                    itemUrl: url,
                    keyword,
                },
            },
        }]);
    }
});

router.addHandler(labels.PRODUCT, async ({ $, crawler, request }) => {
    const { data } = request.userData;

    const description = $('div#productDescription').text().trim();

    await crawler.addRequests([{
        url: `${BASE_URL}/gp/offer-listing/${data.asin}`,
        label: labels.OFFERS,
        userData: {
            data: {
                ...data,
                description,
            },
        },
    }]);
});

router.addHandler(labels.OFFERS, async ({ $, request }) => {
    const { data } = request.userData;

    const offers = $('#olpOfferList .olpOffer');

    for (const offer of offers) {
        const el = $(offer);
        const price = el.find('.olpOfferPrice').text().trim();
        const sellerName = el.find('.olpSellerName a').first().text().trim()
            || el.find('.olpSellerName').text().trim();

        await Dataset.pushData({
            ...data,
            sellerName,
            offer: price,
        });
    }
});
