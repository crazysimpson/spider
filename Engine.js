const Crawler = require('./Crawler');
const Downloader = require('./Downloader');
const getLogger = require('./utils/log');

var logger = getLogger();

class Engine {
    constructor() {
        this.crawlers = [];
        this.downloasers = [];
    }

    addCrawler(crawler) {
        if (crawler instanceof Crawler) {
            this.crawlers.push(crawler);
        } else {
            console.log('添加crawler失败');
        }
    }

    addDownloader(downloader) {
        if (crawler instanceof Crawler) {
            this.crawlers.push(crawler);
        } else {
            console.log('添加crawler失败');
        }
    }

}