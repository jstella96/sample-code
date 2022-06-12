const express = require('express')

/*
muter : form-data는 req.body로 못받음, 파일데이터 받게 해주는 미들웨어
1. 기본 
2. storage
- 두번째 인자 사용해서 이름 바꿔주기 
3. memory storage 
*/

const multer  = require('multer')
const app = express()
const cors = require('cors')
const port = 3000
app.use(express.json());
app.use(cors());


//1] 기본 uploads/에 파일 저장 후 파일정보 file에 반환  (이름 못바꿈)
const upload = multer({ dest: 'uploads/' })
app.post('/single-file', upload.single('photo'), function (req, res) {
  console.log(req.body)
  console.log(req.file)
  res.send({body: req.body, file: req.file})
})


app.post('/array-file', upload.array('photos', 12), function (req, res, next) {
  console.log(req.body)
  console.log(req.files)
  res.send({body: req.body, file: req.files})
})

app.post('/multi-file', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), function (req, res, next) {
  console.log(req.body)
  console.log(req.files) 

  res.send({body: req.body, files: req.files})
})

//2]디스크 스토리지 엔진은 파일을 디스크에 저장하기 위한 모든 제어 기능을 제공한다, 
//  주로 이름을 바꿔서 저장할때 사용
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/diskStorage-uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const diskStorageUpload = multer({ storage: diskStorage })

app.post('/single-file/diskstorage', diskStorageUpload.single('photo'), function (req, res, next) {
  console.log(req.body)
  console.log(req.files) 
  res.send({body: req.body, files: req.files})
})


app.post('/array-file/diskstorage', diskStorageUpload.array('photos', 12), function (req, res, next) {
  console.log(req.body) 
  console.log(req.files)
  res.send({body: req.body, file: req.files})
})

app.post('/multi-file/diskstorage', diskStorageUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), function (req, res, next) {
  console.log(req.body)
  console.log(req.files)
  res.send({body: req.body, files: req.files})
})

/*3] memory에 저장된다. 해당 함수가 끝나면 사라진다. 이 서버에 저장 용도가 아닌 분석 용도, 아니면
  또 다른 서버로 전송할 때 사용
*/
const memoryStorage = multer.memoryStorage()
const memoryStorageUpload = multer({ storage: memoryStorage })

app.post('/single-file/memorystorage', memoryStorageUpload.single('photo'), function (req, res, next) {
  console.log(req.body)
  console.log(req.file)
  res.send({body: req.body, files: req.files})
})


app.post('/array-file/memorystorage', memoryStorageUpload.array('photos', 12), function (req, res, next) {
  console.log(req.body) 
  console.log(req.files) 
  res.send({body: req.body, file: req.files})
})

app.post('/multi-file/memorystorage', memoryStorageUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), function (req, res, next) {
  console.log(req.body) 
  console.log(req.files)
  res.send({body: req.body, files: req.files})
})


const { pipeline } = require('stream');
const { promisify } = require('util');
const fs = require("fs");
const { Readable } = require('stream');

/*버퍼를  스트림으로 바꿔서 저장하는 로직 */
const saveBuffer = async (buffer, originalname) => {
  try{
    const baseDir = '/uploads'
    const localFilePath = `${baseDir}/${originalname}`

    const isDirectory = fs.existsSync(baseDir)
    if(!isDirectory) fs.mkdirSync(baseDir);

    const readableStream = Readable.from(buffer);
    const writeStream = fs.createWriteStream(localFilePath)

    const streamPipeline = promisify(pipeline);
    await streamPipeline(readableStream, fs.createWriteStream(writeStream));

  }catch(e){
    console.log(e);
  }
}

/* ex. './movie' 경로에 영상 저장 */
const movieDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* 디스크 로컬 파일해도 됨 */
    cb(null, './movie/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, Date.now()+file.originalname)
  }
})

const movieDiskStorageUpload = multer({ storage: movieDiskStorage })

app.post('/movie/diskstorage', movieDiskStorageUpload.single('movie'), function (req, res, next) {
  console.log(req.body) // text 필드 데이터
  console.log(req.files) // req.files 각 필드이름을 키로 가진 객체로 저장 된다.
  res.send({body: req.body, files: req.files})
})


app.listen(port)

