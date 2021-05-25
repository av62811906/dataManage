// 先npm install express -s * 注意在根目录下

const express = require('express')
var cookieParser = require('cookie-parser')
let app = express()
const port = 8000
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(cookieParser())

// 跨域
var cors=require('cors');
app.use(cors({
    origin:['http://localhost:8000'],  //指定接收的地址
    methods:['GET','POST'],  //指定接收的请求类型
    alloweHeaders:['Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild']  //指定header
}))

// 登录校验
app.post('/api/login/check', (req, res) => {
    console.log("req : " + JSON.stringify(req.body));
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.cookie("userName", 'myName', {maxAge: 3600, httpOnly: true});
    res.send(JSON.parse('{"code": 200, "errCount": 2, "msg": "登录成功", "isSuperuser": 1}'));
})

app.get('/api/data/all', (req, res) => {
    console.log('req : ' + JSON.stringify(req.body));
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.send(JSON.parse('{"data":[{"id":1,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":2,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":3,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":4,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":5,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":6,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":7,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":8,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":9,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":10,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":11,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1}], "code": 200}'));
})

app.post('/api/data/query', (req, res) => {
    console.log('req: ' + JSON.stringify(req.body));
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.send(JSON.parse('{"data":[{"id":1,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":2,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":3,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":4,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":5,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1},{"id":6,"phone":"15927541521", "department":"短信", "qualityLevel":1, "attribute": "学而思", "createTime": "2021-3-31 00:00:00", "lastUsedTime": "2021-3-31 00:00:00", "orderCount": 0, "status": 1, "active": 1}], "code": 200}'));
})

app.post('/api/data/apply', (req, res) => {
    console.log('req: ' + JSON.stringify(req.body));
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.send(JSON.parse('{"code": 200, "msg": "登录成功"}'))
})

app.get('/', (req, res) => {
    console.log('req: ' + JSON.stringify(req.body));
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})