# Academy Amazon Scraper

Starter project for the [Expert Scraping with Apify](https://docs.apify.com/academy/expert-scraping-with-apify) course.

The scraper takes a keyword as input, searches Amazon for matching products, visits each product page, then scrapes all available offers and pushes them to the default dataset.

## Output

Each dataset item represents a single offer:

```json
{
    "title": "Apple iPhone 15 128GB Black Unlocked",
    "asin": "B0CHX3QBCH",
    "itemUrl": "https://www.amazon.com/...",
    "description": "...",
    "keyword": "iphone",
    "sellerName": "Amazon.com",
    "offer": "$699.00"
}
```

## Running locally

Requires an [Apify account](https://console.apify.com) with access to RESIDENTIAL proxies (used to avoid Amazon blocking).

```bash
npm install
apify run
```

Input is read from `.actor/INPUT.json`. The default keyword is `iphone`.

## Running on Apify

```bash
apify push
apify call
```
