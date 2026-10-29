# Academy Amazon Scraper

Starter project for the [Expert scraping with Apify](https://docs.apify.com/academy/expert-scraping-with-apify) course. Each lesson of the course builds on top of this scraper, so you don't need to write one from scratch before you start.

The scraper takes a keyword, searches Amazon for it, and saves every offer for each product it finds. One product can have many offers, because there are many sellers on Amazon selling the same thing for different prices.

## How it works

The scraper is built with [Crawlee](https://crawlee.dev/) and the [Apify SDK](https://docs.apify.com/sdk/js/). It uses `CheerioCrawler`, which downloads pages over plain HTTP and parses their HTML. Each request has a label, and the router in `src/routes.js` handles each label differently:

1. `START` - The search results page. The scraper finds all products on it, skipping sponsored results, and enqueues a request to each product's page.
2. `PRODUCT` - The product page. The scraper extracts the product's description and enqueues a request to the product's offers.
3. `OFFERS` - The list of offers, which Amazon loads from a separate URL when you click **Other sellers on Amazon** on the product page. The scraper saves each offer as one item in the default dataset.

Data scraped in earlier steps travels to the next ones in the request's `userData`.

The project files:

- `src/main.js` - Reads the input, sets up the proxies and the crawler, and starts the crawl.
- `src/routes.js` - The handlers for each label, which do the actual scraping.
- `src/constants.js` - The labels and URLs shared by the other files.
- `.actor/` - Configuration of the Actor for the Apify platform: name, and the schemas of the input and of the output.
- `Dockerfile` - How the Apify platform builds the Actor.

## Input

The only input is `keyword`, the text to search Amazon for. It defaults to `iphone`.

## Output

Each dataset item represents a single offer:

```json
{
    "title": "iPhone 17 Pro Max, US Version, 256GB, eSIM, Deep Blue- Unlocked (Renewed)",
    "asin": "B0FTCWXD9K",
    "itemUrl": "https://www.amazon.com/dp/B0FTCWXD9K",
    "keyword": "iphone",
    "description": "Apple iPhone 17 Pro Max, US Version, 256GB, eSIM, Deep Blue...",
    "sellerName": "MobiWise",
    "offer": "$1,080.59"
}
```

The `asin` is Amazon's ID of the product. Items for the same product share the `asin` and differ in `sellerName` and `offer`. The scraper only saves the first page of offers for each product, which is up to 11 offers.

## Proxies

Amazon blocks scrapers quickly, so the scraper uses [Apify Proxy](https://docs.apify.com/platform/proxy) with residential IP addresses from the US. US addresses also make Amazon show prices in US dollars.

Even with residential proxies, Amazon sometimes responds with errors or an empty page. The crawler retries such requests with a different IP address, so warnings about retries in the log are expected. Residential proxies are paid by traffic. A run with the default input costs a few cents.

## Running the scraper

You need [Node.js](https://nodejs.org/) 24 or newer, the [Apify CLI](https://docs.apify.com/cli), and an [Apify account](https://console.apify.com).

```bash
npm install
apify login
apify run
```

Connecting to Apify Proxy from your own computer [requires a paid Apify plan](https://docs.apify.com/platform/proxy#external-connection). On the free plan, the local run fails on proxy errors, so deploy the scraper to the Apify platform and run it there:

```bash
apify push
```

Then open the Actor in [Apify Console](https://console.apify.com/actors) and start it, or run `apify call`.

## Development

The code is checked by [ESLint](https://eslint.org/) and formatted by [Prettier](https://prettier.io/). Before you commit, run:

```bash
npm run lint
npm run format
apify validate-schema
```

GitHub Actions run the same checks on every pull request.

## When it breaks

Amazon changes its website from time to time, and the scraper can stop finding data. If you get empty items or no items at all, [open an issue](https://github.com/apify-projects/academy-amazon-scraper/issues).
