const home = require('./home.route')
const about = require('./about.route')
const login = require('./login.route')
const register = require('./register.route')
const contact = require('./contact.route')
const cgPainel = require('./cg-painel.route')
const cgProduction = require('./cg-production.route')
const cgEnvironmental = require('./cg-environmental.route')
const irecePainel = require('./irece-painel.route')
const ireceProduction = require('./irece-production.route')
const ireceEnvironmental = require('./irece-environmental.route')
const ireceLosses = require('./irece-losses.route')

const router = [
    home,
    about,
    login,
    register,
    contact,
    cgPainel,
    cgProduction,
    cgEnvironmental,
    irecePainel,
    ireceProduction,
    ireceEnvironmental,
    ireceLosses
]

module.exports = { router }