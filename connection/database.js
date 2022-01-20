// import postgres pool
const { Pool } = require('pg')

// setup connection 
const dbPool = new Pool({
    database : 'Personal_web_B30',
    port : 5432,
    user : 'postgres',
    password : 'random'
})

// export dbPool untuk menggunakan query 
module.exports = dbPool