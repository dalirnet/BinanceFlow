const _ = require('lodash')
const path = require('path')
const cors = require('cors')
const express = require('express')
const superagent = require('superagent')
const { toUpper } = require('lodash')
const app = express()

// config
app.use(cors())
app.use(express.json())

// public path
app.use('/BinanceFlow/dist/css', express.static(path.resolve(__dirname, 'dist/css')))
app.use('/BinanceFlow/dist/fonts', express.static(path.resolve(__dirname, 'dist/fonts')))
app.use('/BinanceFlow/dist/img', express.static(path.resolve(__dirname, 'dist/img')))
app.use('/BinanceFlow/dist/js', express.static(path.resolve(__dirname, 'dist/js')))
app.get('/BinanceFlow/dist/favicon.ico', (req, res) => res.sendFile(path.resolve(__dirname, 'public/favicon.ico')))
app.get('/BinanceFlow/dist/icon.png', (req, res) => res.sendFile(path.resolve(__dirname, 'public/icon.png')))

// request bridge
app.post('/bridge', (req, res) => {
    let { method = 'GET', url = '', header = {}, query = '' } = req.body
    superagent(method.toUpperCase(), url)
        .set(header)
        .query(query)
        .then(({ status = 200, text = {} }) => {
            res.status(status).send(JSON.parse(text))
        })
        .catch(({ status = 400, response: { body = {} } = {} }) => {
            res.status(status).send(body)
        })
})

// start
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist/index.html')))
app.listen(9550, '0.0.0.0', () => {
    console.log('Start at http://127.0.0.1:9550/')
})
