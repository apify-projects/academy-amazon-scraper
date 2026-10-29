export const BASE_URL = 'https://www.amazon.com';

// Amazon loads the list of all offers for a product from this URL
export const OFFERS_URL = (asin) => `${BASE_URL}/gp/product/ajax/aodAjaxMain/?asin=${asin}&pc=dp`;

export const labels = {
    START: 'START',
    PRODUCT: 'PRODUCT',
    OFFERS: 'OFFERS',
};
