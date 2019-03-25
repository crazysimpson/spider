const Downloader = require('./lib/Downloader');
const Crawler = require('./lib/Crawler');
const Scheduler = require('./lib/Scheduler');
const Pipline = require('./lib/Pipline');
const getLogger = require('./utils/log').getLogger;
const Cluster = require('cluster');


var logger = getLogger();

class Engine {
    constructor() {
        this.crawlers = null;
        this.downloasers = null;
        this.scheduler = null;
        this.pipline = null
    }

    addCrawler(crawler) {
        if (crawler instanceof Crawler) {
            this.crawlers = crawler;
        } else {
            logger.error('添加crawler失败');
            throw new Error('添加crawler失败')
        }
    }

    addDownloader(downloader) {
        if (downloader instanceof Downloader) {
            this.downloaders = downloader;
        } else {
            logger.error('添加downloader失败');
            throw new Error('添加downloader失败')
        }
    }

    addScheduler(scheduler) {
        if (scheduler instanceof Scheduler) {
            this.scheduler = scheduler;
        }
    }

    addPipline(pipline) {
        if (pipline instanceof Pipline) {
            this.pipline = pipline;
        }
    }

    run(url) {
        //this.crawlers.crawl(url);
        setInterval(() => {
            this.scheduler.schedule().then((nextUrl) => {
                logger.info('开始下载');
                if (nextUrl == null) {
                    logger.warn('没有待抓取url');
                    return;
                }
                this.downloaders.setUrl(nextUrl);
                return this.downloaders.sendRequest();
                //return this.crawlers.crawl()
            }).then((val) => {
                let data = this.crawlers.crawl(val);
                let urls = this.crawlers.getAllUrls(val);
                this.pipline.save(data);
                return this.scheduler.addUncrawlUrls(urls);

            }).then(() => {
                logger.info('添加urls');
            }).catch((err) => {
                logger.error('运行出现错误');
                logger.error(err.message);
            });
        }, 10);
        /*this.scheduler.schedule().then((nextUrl) => {
            logger.info('开始下载');
            if (nextUrl == null) {
                logger.warn('没有待抓取url');
                return;
            }
            this.downloaders.setUrl(nextUrl);
            return this.downloaders.sendRequest();
            //return this.crawlers.crawl()
        }).then((val) => {
            let data = this.crawlers.crawl(val);
            let urls = this.crawlers.getAllUrls(val);
            this.pipline.save(data);
            return this.scheduler.addUncrawlUrls(urls);

        }).then(() => {
            logger.info('添加urls');
        }).catch((err) => {
            logger.error('运行出现错误');
            logger.error(err.message);
        });*/

    }


}

console.log('test');
var cra = new Crawler();
var pip = new Pipline();
var dow = new Downloader();
var sch = new Scheduler();
var eng = new Engine();

eng.addCrawler(cra);
eng.addDownloader(dow);
eng.addPipline(pip);
eng.addScheduler(sch);

function crawler(data) {
    return data;
}
cra.setCrawler(crawler);
var url = "http://crazysimpson.cn/";
var urls = ['http://www.baidu.com/', 'http://www.ayqy.net//'];
//var scheduler = new Scheduler();

//单元测试代码
async function runa() {
    await eng.scheduler.addUncrawlUrls(urls);
    eng.run();
}
//eng.run(url);
runa();
