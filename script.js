const http = require('http');
const https = require('https');

const url = 'https://time.com';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const latestStories = extractLatestStories(data);

        const server = http.createServer((req, res) => {
            if (req.url === '/getTimeStories' && req.method === 'GET') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(latestStories));
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Not found');
            }
        });

        const port = 3000;
        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/getTimeStories`);
        });
    });
}).on('error', (err) => {
    console.error('Error:', err);
});

function extractLatestStories(htmlContent) {
    const latestStories = [];

    let startIndex = htmlContent.indexOf('<li class="latest-stories__item">');
    let endIndex;

    for (let i = 0; i < 6; i++) {
        endIndex = htmlContent.indexOf('</li>', startIndex);
        const storyHtml = htmlContent.substring(startIndex, endIndex);

        // const titleStartIndex = storyHtml.indexOf('<h3 class="latest-stories_item-headline">') + '<h3 class="latest-stories_item-headline">'.length;
        const titleStartIndex = storyHtml.indexOf('>',storyHtml.indexOf('<h3'))+1
        const titleEndIndex = storyHtml.indexOf('</h3>', titleStartIndex);
        const title = storyHtml.substring(titleStartIndex, titleEndIndex).trim();

        const linkStartIndex = storyHtml.indexOf('<a href="') + '<a href="'.length;
        const linkEndIndex = storyHtml.indexOf('"', linkStartIndex);
        const link = 'https://time.com' + storyHtml.substring(linkStartIndex, linkEndIndex);

        latestStories.push({ title, link });

        startIndex = htmlContent.indexOf('<li class="latest-stories__item">', endIndex);
    }

    return latestStories;
}