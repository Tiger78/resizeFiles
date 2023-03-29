import express from 'express'
import bodyParser from 'body-parser'
import * as fs from "fs"
import sharp from 'sharp'

const app = express()

const PORT = 3000

const sizes = {
    large: [2048, 2048],
    medium: [1024, 1024],
    thumb: [300, 300]
}

const image_extentions = [
    'jpg'
]

const outputdir = './output/'

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
    const outputdir = body.outputdir
    const base64 = body.base64
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