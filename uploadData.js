/**
 * Created by zhaoyadong 2018-12-18.
 */
var fs = require('fs');
var xlsx = require('node-xlsx');
var crpyto = require('crypto');
var axios = require('axios');

//平台地址
const host = "http://www.baidu.com"; 
//主机厂调用接口令牌
const vehicle_token="C3kNIVJWfOxLkRDydrJXsA4ff6oMaTOP";
//主机厂调用接口密钥
const vehicle_key="U2TohGfvuck0v5Xa";
//电池厂调用接口令牌
const factory_token="pOAJJSBmAThb8kPJh4VAX+zs/YAHFqxd";
//电池厂调用接口密钥
const factory_key="vAREamtPvwanVe2M";


//加密上传数据
function encrypt(data, key, iv){
    iv = iv || "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var cipher = crypto.createCipheriv('aes-128-ecb', key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}

//获取sign
function encryptHMAC(data, key){
    const hmac = crypto.createHmac('md5', key);
    const up = hmac.update(data);
    const result = up.digest('hex'); 
    //console.log(result); // 8c7498982f41b93eb0ce8216b48ba21d
    return result;
}


//上传
function uploadData(address, requestMsg, token, key){
    let data = JSON.stringify(requestMsg);
    let encryptedData = encrypt(data);
    let url = host+address;
    let sign = encryptHMAC(encryptedData, key);
    axios({
        method:'post',
        url:url,
        headers:{
            Authorization: "Bearer " + accessToken,
            "Content-Type":'application/json; charset=utf-8',
            "Accept-Encoding":"gzip"
        },
        data:{
            requestMsg: requestMsg,
            timestamp: new Date().getTime() ,
            sign:sign
        }
    }).then((res)=>{
        console.log("上传成功");
        console.log(res);
    }).catch((err)=>{
            console.log(err.message);
        }
        );
}

//读取电池生产信息文件
function readBatteryProduce(name){
    var file = xlsx.parse('./batteryproduce/'+name);
    console.log(file);
    let requestMsg = [];
    let cellListMap={};
    let moduleListMap={};

    for(let point=2; point<file[3]["data"].length; point++){
        let modelId = file[3]["data"][point][0].toString();
        if(cellListMap[modelId]==undefined){
            cellListMap[modelId]=[];
        }
        cellListMap[modelId].push(file[3]["data"][point][1].toString());

    }

    for(let point=2; point<file[2]["data"].length; point++){
        let code = file[2]["data"][point][0].toString();
        if(moduleListMap[code]==undefined){
            moduleListMap[code] = [];
        }
        let cellListParam = {};
        cellListParam.code = code;
        cellListParam.modelId = file[2]["data"][point][1].toString();
        cellListParam.cellModelId = "NCM18650-260";
        cellListParam.cellList = cellListMap[file[2]["data"][point][2].toString()];
        moduleListMap[code].push(cellListParam);
    }

    for(let point=2; point<file[1]["data"].length; point++){
        let requestMsgParam={};
        requestMsgParam.code = file[1]["data"][point][3].toString();
        requestMsgParam.serial = file[1]["data"][point][0].toString();
        requestMsgParam.modelId = file[1]["data"][point][2].toString();
        requestMsgParam.systemId = file[1]["data"][point][1].toString();
        requestMsgParam.systemModelId = file[1]["data"][point][0].toString();
        requestMsgParam.orderNo = file[0]["data"][2][0].toString(); 
        requestMsgParam.moduleList = moduleListMap[requestMsgParam.code];       
        requestMsg.push(requestMsgParam);
    }
    console.log(JSON.stringify(requestMsg));
    return JSON.stringify(requestMsg);
}


//读取售后电池入库信息
function readReplaceBattery(name){
    var file = xlsx.parse('./replacebattery/'+name);
    console.log(file);
    let requestMsg = [];
    let childCodeListMap_P = {};
    let childCodeListMap_C = {};

    for(let point=2; point<file[3]["data"].length; point++){
        let childCodeListParam={};
        let modelId = file[3]["data"][point][0].toString();
        if(childCodeListMap_C[modelId]==undefined){
            childCodeListMap_C[modelId]=[];
        }
        childCodeListParam.code = file[3]["data"][point][1].toString();
        childCodeListParam.type = "C";
        //childCodeListMap_C[modelId].push(file[3]["data"][point][1].toString());
        childCodeListMap_C[modelId].push(childCodeListParam);
    }

    for(let point=2; point<file[2]["data"].length; point++){
        let code = file[2]["data"][point][0].toString();
        if(childCodeListMap_P[code]==undefined){
            childCodeListMap_P[code] = [];
        }
        let cellListParam = {};
        cellListParam.code = code;
        cellListParam.type = "M";
        cellListParam.modelId = file[2]["data"][point][1].toString();
        cellListParam.childCodeList = childCodeListMap_C[file[2]["data"][point][2].toString()];
        childCodeListMap_P[code].push(cellListParam);
    }
    console.log(childCodeListMap_P);
    for(let point=2; point<file[1]["data"].length; point++){
        let requestMsgParam={};
        requestMsgParam.code = file[1]["data"][point][2].toString();
        //requestMsgParam.type = (file[1]["data"][point][0].toString() == "电池包")?'P':'M';
        if(file[1]["data"][point][0].toString() == "电池包"){
            requestMsgParam.type="P";
        }else{
            requestMsgParam.type="M";
        }
        console.log(requestMsgParam.type);
        requestMsgParam.modelId = file[1]["data"][point][1].toString();
        requestMsgParam.orderCode = file[0]["data"][2][0].toString();
        //requestMsgParam.childCodeList = requestMsgParam.type=="P"? childCodeListMap_P[requestMsgParam.code]:childCodeListMap_C[requestMsgParam.code];      
        if(requestMsgParam.type=="P"){
            console.log("runn");
            requestMsgParam.childCodeList = childCodeListMap_P[requestMsgParam.code];
        }else{
            requestMsgParam.childCodeList = childCodeListMap_C[requestMsgParam.code];
        }
        requestMsg.push(requestMsgParam);
    }
    console.log(JSON.stringify(requestMsg));
    return JSON.stringify(requestMsg);
}

function readFiles(address, readFunction){
    //let address="./batteryproduce";
    let api="/bitnei/v1.0/battery/vehicle/receiveBatteryProduce"
    fs.readdir(address, (err, files)=>{
        if(err){
            console.log("读取文件夹错误");
            console.log(err.message);
        }
        files.forEach((file)=>{
            console.log(file);
            let reqeustMsg = readFunction(file);
            uploadData(api, requestMsg, factory_token, factory_key);
        });
    });
}

const batterProduceAddress = "./batteryproduce"
const replaceBatteryAddress = "./replacebattery"
readFiles(replaceBatteryAddress, readReplaceBattery);
//readBatteryProduce("battery");
