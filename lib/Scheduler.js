const redis = require('redis');
const getLogger = require('../utils/log').getLogger;
const config = require('../config');

var logger = getLogger();

class Scheduler {
    constructor() {
        this.scheduler = null;
        this.redisClient = null;
        this.initRedis();
    }

    initRedis() {
        this.redisClient = redis.createClient(config.redis.port, config.redis.host, { auth_pass: config.redis.password });
        this.redisClient.on('error', (err) => {
            logger.error("redis发生错误 " + err.message);
            throw new Error('redis发生错误');
        });
        this.redisClient.on('connect', () => {
            logger.info('redis连接成功');
            this.redisClient.auth('739863718Qq');
        });
    }


    //设置自定义调度方法
    setScheduler(scheduler) {
        if (typeof scheduler != 'function') {
            logger.console.error('设置scheduler失败');
            throw new Error('设置scheduler失败');
            return;
        }

        this.scheduler = scheduler;
    }

    addUrl(url) {
        let redisClient = this.redisClient
        return new Promise(function (resolved, rejected) {
            redisClient.SISMEMBER('crawledUrl', url, (err, value) => {
                if (err) {
                    logger.error('redis获取crawledUrl失败');
                }
                if (value == false) {
                    redisClient.sadd('uncrawlUrl', url, (err, value) => {
                        if (err) {
                            logger.error('添加URL失败：' + url);
                            logger.error(err.message);
                            rejected(err);
                        }
                        logger.info('添加' + url + '到uncrawlUrl');
                    });
                }
                else {
                    logger.info("url已存在:" + url);
                }
                resolved();
            });
        });
    }

    addUncrawlUrls(urls) {
        let addList = [];
        urls.forEach((value) => {
            addList.push(this.addUrl(value));
        });
        return Promise.all(addList);
    }

    //调度
    schedule() {
        if (this.scheduler != null) {
            return this.scheduler();
        }

        return new Promise((resolved, rejected) => {
            this.redisClient.spop('uncrawlUrl', (err, value) => {
                if (err) {
                    logger.error(err.message);
                    rejected(err);
                }
                logger.info('下一个要爬去的URL：' + value);
                resolved(value);

            });
        })
    }
}

var urls = ['www.baidu.com', 'www.google.com', 'www.facebook.com', 'www.linkedin.com']
var scheduler = new Scheduler();

//单元测试代码
async function run() {
    await scheduler.addUncrawlUrls(urls);
    scheduler.schedule().then((val) => {
        console.log(val);
    });
}
run();
module.exports = Scheduler;