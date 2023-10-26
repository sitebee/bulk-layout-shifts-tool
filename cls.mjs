import puppeteer from 'puppeteer';
import fs from 'fs';
import lighthouse from 'lighthouse';

const urls = [
    // add your URLs to this array
    'https://shopping.rspb.org.uk/christmas-shop/charity-christmas-cards/rspb-fab-40-bumper-pack-charity-christmas-cards.html',
    'https://shopping.rspb.org.uk/books-stationery',
    'https://shopping.rspb.org.uk/books-stationery/wetland-birds-identifier-chart-rspb-id-spotlight-series.html',
    'https://shopping.rspb.org.uk/binoculars-scopes/birdwatching-binoculars/rspb-binoculars/rspb-harrier-x-8x32.html',
];

async function extractLayoutShiftsAndCaptureScreenshot(browser, url) {
    const { lhr } = await lighthouse(url, {
        port: new URL(browser.wsEndpoint()).port,
        logLevel: 'info',
        emulatedFormFactor: 'mobile'
    });

    const layoutShifts = lhr.audits['layout-shift-elements'].details.items;

    // Save layout shift elements in a separate CSV
    let layoutShiftsCSVData = "URL,Selector,Score\n";
    for (const shift of layoutShifts) {
        layoutShiftsCSVData += `${url},${shift.node.selector.replace(',', ';')},${shift.score}\n`; 
    }
    fs.appendFileSync('layoutshift-elements-data.csv', layoutShiftsCSVData);

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 375, height: 667 });

    const shiftsInfo = await page.evaluate((shifts) => {
        function sanitizeSelector(selector) {
            return selector.replace(/#(\d)/g, '#id-$1');
        }
        
        const elements = [];
        for (const shift of shifts) {
            const sanitizedSelector = sanitizeSelector(shift.node.selector);
            const el = document.querySelector(sanitizedSelector);
            if (el) {
                const rect = el.getBoundingClientRect();
                elements.push({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                el.style.border = '3px dashed red';
            }
        }
        return elements;
    }, layoutShifts);

    const clsSpan = await page.$('span#cls-display');
    if (!clsSpan) {
        await page.evaluate((totalCLS) => {
            const clsSpan = document.createElement('span');
            clsSpan.id = 'cls-display';
            clsSpan.style.position = 'fixed';
            clsSpan.style.top = '10px';
            clsSpan.style.left = '10px';
            clsSpan.style.backgroundColor = 'red';
            clsSpan.style.color = 'white';
            clsSpan.style.padding = '5px';
            clsSpan.style.fontSize = '20px';
            clsSpan.style.zIndex = '999999';
            clsSpan.innerText = `Total CLS: ${totalCLS.toFixed(2)}`;
            document.body.appendChild(clsSpan);
        }, lhr.audits['cumulative-layout-shift'].numericValue);
    }

    const sanitizedURL = new URL(url).hostname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[^a-z0-9]/gi, '_');
    await page.screenshot({ path: `layoutshift-${sanitizedURL}-${timestamp}.png` });

    await page.close();
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    // For the first URL, await user interaction to dismiss cookie banner
    const pageForManualInteraction = await browser.newPage();
    await pageForManualInteraction.goto(urls[0]);
    console.log("Please dismiss any pop-ups/cookie banners on the first URL. Press any key in the terminal to continue...");
    await process.stdin.once('data', () => {
        pageForManualInteraction.close();
    });

    for (const url of urls) {
        await extractLayoutShiftsAndCaptureScreenshot(browser, url);
    }

    console.log("Layout shift elements data written to layoutshift-elements-data.csv and screenshots saved.");

    await browser.close();
})();
