const express = require('express')
const routes = express.Router()
const ireceProduction = require('../model/readIreceProduction')
const ireceEnvironmental = require('../model/readIreceEnvironmental') 
const ireceLosses = require('../model/readIreceLosses')
const campograndeProduction = require('../model/readCGProduction')
const campograndeEnvironmental = require('../model/readCGEnvironmental')

// Home and utils

routes.get('/', (req, res) => {
	res.send('Home')
})

routes.get('/login', (req, res) => {
	res.send('login')
})

routes.get('/cadastro', (req, res) => {
	res.send('cadastro')
})

routes.get('/sobre', (req, res) => {
	res.send('sobre')
})

routes.get('/contato', (req, res) => {
	res.send('contato')
})

// Campo Grande

routes.get('/campo-grande/painel', (req, res) => {
	res.send('painel')
})

routes.get('/campo-grande/producao', campograndeProduction.readCGProduction)

routes.get('/campo-grande/ambientais', campograndeEnvironmental.readCGEnvironmental)

routes.get('/campo-grande/perdas', (req, res) => {
	res.send('perdas cg')
})

routes.get('/campo-grande', (req, res) => {
	res.redirect('/campo-grande/painel')
})

// Irece

routes.get('/irece/painel', (req, res) => {
	res.send('painel irece')
})

routes.get('/irece/producao', ireceProduction.readIreceProduction)

routes.get('/irece/ambientais', ireceEnvironmental.readIreceEnvironmental)

routes.get('/irece/perdas', (req, res) => {
	res.send('perdas irece')
})

routes.get('/irece/perdas/1', ireceLosses.readIreceLossesTable1)

routes.get('/irece/perdas/2', ireceLosses.readIreceLossesTable2)

routes.get('/irece/perdas/3', ireceLosses.readIreceLossesTable3)

routes.get('/irece/perdas/4', ireceLosses.readIreceLossesTable4)

routes.get('/irece/perdas/5', ireceLosses.readIreceLossesTable5)

routes.get('/irece', (req, res) => {
	res.redirect('/irece/painel')
})

// Candeias

routes.get('/candeias/painel', (req, res) => {
	res.send('painel candeias')
})

routes.get('/candeias/producao', (req, res) => {
	res.send('producao candeias')
})

routes.get('/candeias/ambientais', (req, res) => {
	res.send('ambientais candeias')
})

routes.get('/candeias/perdas', (req, res) => {
	res.send('perdas candeias')
})

routes.get('/candeias', (req, res) => {
	res.redirect('/candeias/painel')
})

module.exports = routes