const request = require('request');

class Downloader {
    constructor(url, method, header, body, json) {
        this.url = url;
        this.option = {};
        this.option.method = method;
        this.option.json = header;
        this.option.header = json;
        this.option.body = body;
        this.sender = null;
        this.beforeMiddleWare = [];
        this.afterMiddleWare = [];
        this.data = null;
    }

    addBeforeMiddleWare(mw) {
        if (typeof mw != 'function') {
            console.log('添加beforemiddleware失败');
            return;
        }
        this.beforeMiddleWare.push(mw);
    }

    addBeforeMiddleWare(mw) {
        if (typeof mw != 'function') {
            console.log('添加beforemiddleware失败');
            return;
        }
        this.afterMiddleWare.push(mw);
    }

    execBeforeMiddleWare() {
        console.log('running beforemiddleware');
        let currentMW = null;
        for (i = 0; i < this.beforeMiddleWare.length; i++) {
            currentMW = this.beforeMiddleWare[i];
            currentMW(this.url, this.option);
        }
        console.log('running beforemiddleware end');
    }

    execAfterMiddleWare() {
        console.log('running aftermiddleware');
        let currentMW = null;
        for (i = 0; i < this.afterMiddleWare.length; i++) {
            currentMW = this.afterMiddleWare[i];
            currentMW(this.data);
        }
        console.log('running afteremiddleware end');
    }

    sendRequest() {
        if (typeof sender != 'function') {
            return new Promise(function (resolved, rejected) {
                request({
                    url: this.url,
                    method: this.option.method,
                    json: this.option.json,
                    header: this.option.header,
                    body: JSON.stringify(this.option.body)
                }, (error, response, data) => {
                    if (!error) {
                        //此处传送data给engine
                        console.log(data);
                        resolved(data)
                    }
                    else {
                        console.log('请求发送失败：' + error.message);
                        console.log('失败url: ' + this.url);
                        rejected(error);
                    }
                });
            });

        }
        else {
            return sender(this.url, this.option);
        }
    }


}

module.exports = Downloader;


