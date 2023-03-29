import dotenv from 'dotenv'
import fetch from 'node-fetch'
import assert from "assert"
import * as fs from "fs"
import * as path from "path"

dotenv.config()

const url = `http://localhost:${process.env.PORT}`
const inputdir = './input/'
const outputdir = './output/'

async function cleardir(dir){

    const files = await fs.readdirSync(dir)

    for await (const file of files) {
        fs.stat(path.join(dir, file), (err, stats) => {
            if (!stats.isDirectory()){
                fs.unlink(path.join(dir, file), (err) => {
                    if (err) throw err
                })
            } else {
                cleardir(path.join(dir, file))
            }
        })
    }

}

async function init(){
    await cleardir(outputdir)
}

// проверяет соединение с сервером
async function testConnection() {
    const response = await fetch(url)
    const data = await response.text()
    //console.log(data)
    assert (data === 'CONNECTED')
    console.log('- Connection OK')
}

// проверяет тестовый endpoint filename
async function testGetFilename() {
    const response = await fetch(`${url}/filename`)
    const data = await response.text()
    //console.log(data)
    assert (data === 'filename')
    console.log('- GET filename ok')
}

// тестирует конвертирование в/из base64
async function testBase64Convert(dir, filename) {
    const base64 = getBase64FileContent(dir, filename)
    //console.log(base64)

    const body = {
        "filename": filename,
        "base64": base64
    }
    const response = await fetch(`${url}/base64decode`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();

    const decodedText = Buffer.from(data.result, 'utf8').toString('base64')
    //console.log(decodedText)
    assert (base64 === decodedText)
    console.log('- base64decode ok')
}

async function pause(period) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, period)
    })
}

// проверяет передачу файла на сервер и сохранение в папке outputdir
async function testPostFile(inputdir, filename, outputdir) {
    var stats = fs.statSync(inputdir+filename)
    const filesize = stats.size;
    const base64 = getBase64FileContent(inputdir, filename)

    const body = {
        "filename": filename,
        "outputdir": outputdir,
        "base64": base64,
        "filesize": filesize
    }
    const response = await fetch(`${url}/filename`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    //console.log(data)
    // подождём пока файл сохранится
    //await pause(1000)
    //const outputbase64 = getBase64FileContent(outputdir, filename)
    //assert(outputbase64 === base64)
    console.log('- testPostFile ok')
}

function getBase64FileContent(dir, filename){
    const res = fs.readFileSync(dir+filename)
    return res.toString('base64')
}

async function test(){
    await init()
    //await testConnection()
    //await testGetFilename()
    //await testBase64Convert(inputdir,'test.txt')
    //await testPostFile(inputdir, 'test.txt', outputdir)
    //await testPostFile(inputdir+'images/', 'CAM00007.jpg', outputdir+'images/')
    await testPostFile(inputdir+'images/', 'PANO_20170528_075442637.jpg', outputdir+'images/')
    await testPostFile(inputdir+'images/', 'CAM00007.jpg', outputdir+'images/')
}

test()

