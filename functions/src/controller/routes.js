const express = require('express')
const routes = express.Router()
const ireceProduction = require('../model/readIreceProduction')
const ireceEnvironmental = require('../model/readIreceEnvironmental') 
const ireceLosses = require('../model/readIreceLosses')
const campograndeProduction = require('../model/readCGProduction')
const campograndeEnvironmental = require('../model/readCGEnvironmental')

// Home and utils

routes.get('/', (req, res) => {
	console.log('header', res.getHeader('access-control-allow-origin'))
	res.json('Home')
})

routes.get('/login', (req, res) => {
	res.json('login')
})

routes.get('/cadastro', (req, res) => {
	res.json('cadastro')
})

routes.get('/sobre', (req, res) => {
	res.json('sobre')
})

routes.get('/contato', (req, res) => {
	res.json('contato')
})

// Campo Grande

routes.get('/campo-grande/painel', (req, res) => {
	res.json('painel')
})

routes.get('/campo-grande/producao', campograndeProduction.readCGProduction)

routes.get('/campo-grande/ambientais', campograndeEnvironmental.readCGEnvironmental)

routes.get('/campo-grande/perdas', (req, res) => {
	res.json('perdas cg')
})

routes.get('/campo-grande', (req, res) => {
	res.redirect('/campo-grande/painel')
})

// Irece

routes.get('/irece/painel', (req, res) => {
	res.json('painel irece')
})

routes.get('/irece/producao', ireceProduction.readIreceProduction)

routes.get('/irece/ambientais', ireceEnvironmental.readIreceEnvironmental)

routes.get('/irece/perdas', (req, res) => {
	res.json('perdas irece')
})

routes.get('/irece/perdas/1', ireceLosses.readIreceLossesTable1)

routes.get('/irece/perdas/2', ireceLosses.readIreceLossesTable2)

routes.get('/irece/perdas/3', ireceLosses.readIreceLossesTable3)

routes.get('/irece/perdas/4', ireceLosses.readIreceLossesTable4)

routes.get('/irece/perdas/5', ireceLosses.readIreceLossesTable5)

routes.get('/irece', (req, res) => {
	res.redirect('/irece/painel')
})
module.exports = routes