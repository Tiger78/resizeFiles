import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import * as fs from "fs"
import sharp from 'sharp'

dotenv.config()

const app = express()

const PORT = process.env.PORT

const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE

const sizes = {
    large: [2048, 2048],
    medium: [1024, 1024],
    thumb: [300, 300]
}

const image_extentions = [
    'jpg','png','gif'
]

const OUTPUTDIR = './output/'

app.use(bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.listen(PORT, () => {
    console.log(`RUNNING ON PORT ${PORT}`)
})

/*app.get('/', (req, res) => {
    //console.log('CONNECTED')
    res.send('CONNECTED')
})

app.get('/filename', (req, res) => {
    //console.log('filename', req.rawHeaders)
    res.send('filename')
})

app.post('/base64decode', (req, res) => {
    //console.log('base64decode', req.rawHeaders, req.body)
    const body = req.body
    const base64 = body.base64
    const s = Buffer.from(base64, 'base64').toString('utf8')
    res.send({"result": s})
})*/

app.post('/filename', (req, res) => {
    const body = req.body
    //console.log(body)
    const filename = body.filename
    const outputdir = body.outputdir || OUTPUTDIR
    const base64 = body.base64
    const filesize = body.filesize
    if (filesize > MAX_FILE_SIZE){
        res.send({"error": "file is too big"})
        return
    }
    const b = Buffer.from(base64, 'base64')
    //fs.writeFileSync(outputdir+filename, b)

    reSize(b, sizes.large[0], sizes.large[1], outputdir, filename)
    reSize(b, sizes.medium[0], sizes.medium[1], outputdir, filename)
    reSize(b, sizes.thumb[0], sizes.thumb[1], outputdir, filename)

    res.send({"result": "ok"})
})

function reSize(input, width, height, outputdir, filename){

    const fileandext = filename.split('.')
    const fileext = fileandext.pop()
    const inputfilename = fileandext[0]

    const outputfilename = outputdir+inputfilename+'_'+width+'_'+height+'.'+fileext

    if (image_extentions.includes(fileext)) {
        sharp(input).resize({width, height}).toBuffer().then((data) => {
            fs.writeFileSync(outputfilename, data)
        })
    }
}