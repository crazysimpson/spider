const getLogeer = require('./utils/log').getLogger
const config = require('./config');
const fs = require('fs');

var logger = getLogeer();

class Pipline {
    constructor() {
        this.saver = null;
    }

    setSaver(saver) {
        if (typeof saver != 'function') {
            logger.error('添加saver失败');
            return;
        }
        this.saver = saver;
    }

    //保存数据
    save(data) {
        if (this.saver != null) {
            this.saver(data);
        }
        if (fs.existsSync(config.pipline.filename)) {
            fs.appendFile(config.pipline.filename, data + '\n', (err) => {
                if (err) {
                    logger.error('pipline写入数据失败');
                } else {
                    logger.info('pipline写入数据成功');
                }
            })
        } else {
            fs.writeFile(config.pipline.filename, data + '\n', (err) => {
                if (err) {
                    logger.error('pipline写入数据失败');
                } else {
                    logger.info('pipline写入数据成功');
                }
            })
        }
    }


}

//单元测试代码
var data = 'this is test data';
var scheduler = new Pipline();
scheduler.save(data);

module.exports = Pipline;