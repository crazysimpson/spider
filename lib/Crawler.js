const cheerio = require('cheerio');
const getLogger = require('../utils/log').getLogger;

var logger = getLogger();


class Crawler {
    constructor() {
        this.beforeMiddleWare = [];
        this.afterMiddleWare = [];
        this.data = null;
        //this.urls = [];
        this.filter = null;
        this.crawler = null;
    }

    //增加crawler处理前中间件
    addBeforeMiddleWare(mw) {
        if (typeof mw != 'function') {
            logger.warn('添加beforemiddleware失败');
            throw new Error('添加beforemiddleware失败');
            return;
        }
        this.beforeMiddleWare.push(mw);
    }

    //添加cralwer处理后中间件
    addAfterMiddleWare(mw) {
        if (typeof mw != 'function') {
            logger.warn('添加aftermiddleware失败');
            throw new Error('添加aftermiddleware失败');
            return;
        }
        this.afterMiddleWare.push(mw);
    }

    //运行cralwer处理前中间件
    execBeforeMiddleWare() {
        logger.info('begin crawler running beforemiddleware');
        let currentMiddleWare = null;
        for (let i = 0; i < this.beforeMiddleWare.length; i++) {
            currentMiddleWare = this.beforeMiddleWare[i];
            this.data = currentMiddleWare(this.data);
        }
        logger.info('end crawler running beforemiddleware');
    }

    //运行cralwer处理后中间件
    execAfterMiddleWare() {
        logger.info('begin crawler running aftermiddleware');
        let currentMiddleWare = null;
        for (let i = 0; i < this.afterMiddleWare.length; i++) {
            currentMiddleWare = this.afterMiddleWare[i];
            this.data = currentMiddleWare(this.data);
        }
        logger.info('end crawler running aftermiddleware');
    }

    //获取页面链接
    getAllUrls() {
        let $ = cheerio.load(this.data);
        let filer = this.filter;
        let urls = [];
        $('a').each(function () {
            let url = $(this).attr('href');
            if (filter(url)) {
                urls.push(url);
            }
        });
        return urls;

    }

    //设置url过滤器
    setUrlFilter(filter) {
        if (typeof filter != 'function') {
            logger.warn('添加filter失败');
            throw new Error('添加filter失败');
            return;
        }
        this.filter = filter;
    }

    //设置爬虫
    setCrawler(crawler) {
        if (typeof crawler != 'function') {
            logger.error('添加crawler失败');
            throw new Error('添加crawler失败');
            return;
        }
        this.crawler = crawler;
    }

    //获取页面信息
    crawl(data) {
        this.data = data;
        this.execBeforeMiddleWare();
        this.crawler(this.data);
        this.execAfterMiddleWare();
    }



}

module.exports = Crawler;