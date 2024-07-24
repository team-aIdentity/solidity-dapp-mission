var express = require("express");
var fs = require("fs");
const https = require('https');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();

let transactions = {}

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    console.log("/")
    res.status(200).send("hello world");
});
app.get("/:key", function(req, res) {
    let key = req.params.key
    console.log("/",key)
    res.status(200).send(transactions[key]);
});

// 트랜잭션 정보 저장
app.post('/', function(request, response){
    console.log("POOOOST!!!!",request.body); 
    response.send(request.body);
    const key = request.body.address+"_"+request.body.chainId
    console.log("key:",key)
    if(!transactions[key]){
        transactions[key] = {}
    }
    transactions[key][request.body.hash] = request.body
    console.log("transactions",transactions)
});

app.post('/txFinished', function(request, response){
  const hash = request.body.hash;

  // 모든 transactions 키를 순회하면서 해당 해시값을 찾고 삭제
  for (const key in transactions) {
    if (transactions[key][hash]) {
        delete transactions[key][hash];
        console.log(`Transaction with hash ${hash} deleted from ${key}`);
        
        // 해당 키의 모든 트랜잭션이 삭제되었는지 확인
        if (Object.keys(transactions[key]).length === 0) {
            delete transactions[key];
            console.log(`No more transactions under key ${key}. Key deleted.`);
        }
        break;
    }
  }
  response.send("done");
});


if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(49832, () => {
    console.log('HTTPS Listening: 49832')
  })
}else{
  var server = app.listen(49832, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}