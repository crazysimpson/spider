const redis = require('redis');
const getLogger = require('./utils/log').getLogger;
const config = require('./config');

var logger = getLogger();

class Scheduler {
    constructor() {
        this.scheduler = null;
        this.redisClient = null;
        this.initRedis();
    }

    initRedis() {
        this.redisClient = redis.createClient(config.redis.port, config.redis.host, { auth_pass: config.redis.password });
        redis.on('error', (err) => {
            logger.error("redis发生错误 " + err.message);
            throw new Error('redis发生错误');
        });
        redis.on('connect', () => {
            logger.info('redis连接成功');
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
        redisClient.sget('crawledUrl', (err, value) => {
            if (err) {
                logger.error('redis获取crawledUrl失败');
            }
            if (val == null) {
                redisClient.sadd('uncrawlUrl', (err, value) => {
                    if (err) {
                        logger.error('添加URL失败：' + url);
                    }
                    logger.info('添加' + url + '到uncrawlUrl');
                });
            }
        });
    }

    addUncrawlUrls(urls) {
        urls.each((value) => {
            this.addUrl(value);
        });
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