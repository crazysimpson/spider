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

    //添加downloader运行前中间件
    addBeforeMiddleWare(mw) {
        if (typeof mw != 'function') {
            console.log('添加beforemiddleware失败');
            return;
        }
        this.beforeMiddleWare.push(mw);
    }

    //添加downloader运行后中间件
    addBeforeMiddleWare(mw) {
        if (typeof mw != 'function') {
            console.log('添加beforemiddleware失败');
            return;
        }
        this.afterMiddleWare.push(mw);
    }

    //运行downloader运行前中间件
    execBeforeMiddleWare() {
        console.log('running beforemiddleware');
        let currentMW = null;
        for (let i = 0; i < this.beforeMiddleWare.length; i++) {
            currentMW = this.beforeMiddleWare[i];
            currentMW(this.url, this.option);
        }
        console.log('running beforemiddleware end');
    }

    //运行downloader运行后中间件
    execAfterMiddleWare() {
        console.log('running aftermiddleware');
        let currentMW = null;
        for (let i = 0; i < this.afterMiddleWare.length; i++) {
            currentMW = this.afterMiddleWare[i];
            currentMW(this.data);
        }
        console.log('running afteremiddleware end');
    }

    //发送请求
    sendRequest() {

        execBeforeMiddleWare();
        //调用默认sender
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
            //调用定制sender
            return sender(this.url, this.option);
        }
        execAfterMiddleWare();
    }


}

module.exports = Downloader;


