const express = require('express')
const app = express()
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const path = require('path')
const bodyParser = require('body-parser')
const history = require('connect-history-api-fallback')
const trans = require('./transliter')
const PORT = process.env.PORT || 3000
const conns =  mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'sultik0098',
    password : 'Taktak12',
    database : 'sultik0098'
});
const conn = conns.promise()
app.use(history())
app.use(bodyParser.json())
app.listen(PORT, ()=>{
    console.log('started')
})
app.get('/allorders', async (res) =>{
    let tables = []
    try {
        const [rews] = await conn.query("SELECT * FROM masters")
        rews.forEach(element => {
            tables.push(trans(element.name + element.secondname))
        })
        let rows
        let orders = []
            for await(const elem of rews.filter(a => trans(a.name + a.secondname) != 'sultansultanmagomedov')){
                try {
                    [rows] = await conn.query("SELECT * FROM "+trans(elem.name + elem.secondname) +"")
                    rows.forEach(el => {
                        el.name = elem.name
                        el.secondname = elem.secondname
                    })
                    orders.unshift(rows)

                } catch (error) {
                    console.log(error)
                }

            }
            res.res.send(orders.flat(2))


    } catch (error) {
        console.log(error)
    }  
})
app.get('/', (res) => {
    res.res.render(path.join(__dirname + '/index.html'))
})
app.post('/token', async (res, req) => {
    let tiken
    try {
      tiken = jwt.verify(req.req.body.token,'shhhh')
    } catch (error) {
    res.res.send(null)
        
    }
    try {
        const [rows] = await conn.query("SELECT * FROM " + trans(tiken.name+tiken.secondname) + "")
        const data = [{
            name: tiken.name,
            secondname: tiken.secondname
        },
        rows
        ]

        res.res.send(data)
    } catch (error) {
        console.log(error)
    }
    
})
app.post('/authtification', async (res, req) => {
    try {
        const [rows] = await conn.query("SELECT * FROM masters WHERE name = '"+ req.req.body.name +"' AND secondname = '" + req.req.body.secondname +"' AND tablename = '" + req.req.body.password + "'")
        if(rows.length != 0){
            const token = jwt.sign({
                name: req.req.body.name,
                secondname: req.req.body.secondname
            },'shhhh',{expiresIn:60 * 60})
            if(req.req.body.secondname == 'Султанмагомедов' && req.req.body.name == "Султан")
            {
                res.res.status(200).json({
                    token: token,
                    admin: true
                })
            }
            else{
                res.res.status(200).json({
                    token: token
                })
            }
            
        }
        else{
            res.res.send(null)
        }
    } catch (error) {
        console.log(error)
    }
     
})
app.post('/setstatus', async (res, req) => {
    try {
        if(req.req.body.zapprice && req.req.body.rabprice && req.req.body.druprice && req.req.body.service){
            await conn.query("UPDATE " + trans(req.req.body.name + req.req.body.secondname) + " SET status = '" + req.req.body.status + "', zapprice = " + req.req.body.zapprice + ", rabprice = " + req.req.body.rabprice + ", druprice = " + req.req.body.druprice + ", service = '" + req.req.body.service + "'  WHERE id = "+req.req.body.id+"")
        }
        else if(req.req.body.reason){
            await conn.query("UPDATE " + trans(req.req.body.name + req.req.body.secondname) + " SET status = '" + req.req.body.status + "', reason = '" + req.req.body.reason + "'  WHERE id = "+req.req.body.id+"")
        }
        else{
            await conn.query("UPDATE " + trans(req.req.body.name + req.req.body.secondname) + " SET status = '" + req.req.body.status + "' WHERE id = "+req.req.body.id+"")
        }
    } catch (error) {
        console.log(error)
    }
    
    res.res.send('lol')
   
})
app.post('/order',async (res, req)=>{
    await conn.query( "INSERT INTO " + trans(req.req.body.selmaster) + " (technic, number, adress, clientname, defect, comment, status ,orderdate) VALUES ('" + req.req.body.technic + "', '" + req.req.body.number + "', '"+ req.req.body.adress + "', '" + req.req.body.clientname  + "', '"+ req.req.body.defect +"', '"+ req.req.body.comment +"', 'new', '"+req.req.body.date +"')")
    res.res.send('lol')
})
app.post('/register',async (res, req)=>{
    try {
        await conn.query( "INSERT INTO masters (name, secondname, tablename) VALUES ('" + req.req.body.name + "', '" + req.req.body.secondname + "', '"+ req.req.body.password +"')")
        await conn.query( "create table if not exists "+ trans(req.req.body.name + req.req.body.secondname) +"(  id int not null primary key auto_increment , technic varchar(25) not null, number varchar(15) not null, adress varchar(255) not null, clientname varchar(20) not null, defect varchar(255) not null, comment varchar(255) not null, status varchar(20) not null , zapprice int, rabprice int, druprice int, reason varchar(255),service varchar(255) , orderdate varchar(20) not null, UNIQUE(id)) ENGINE = MyISAM ")
    } catch (error) {
        console.log(error)
    }
    res.res.send('lol')
    
})
app.get('/register',async (res)=> {
    try {
        const [rows] = await conn.query("SELECT * FROM masters")
    res.res.send(rows)
    } catch (error){
        console.log(error)
    }
})