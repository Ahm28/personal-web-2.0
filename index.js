const express = require('express')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const hbs = require('hbs')



const app = express()
const port = 3000

// import database connection
const db = require('./connection/database')
const upload = require('./middlewares/fileUpload')


app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.urlencoded({extended : false}))
hbs.registerPartials(__dirname + '/views/partials')

app.use(
    session({
        cookie: {
            maxAge : 2 * 60 * 60 * 1000,
            secure : false,
            httpOnly : true
        },
        store : new session.MemoryStore(),
        saveUninitialized : true,
        secret : 'secretvalue'
    })
)

app.use(flash())


let isLogin = true

let blogs = [{
    title : 'Pasar Coding di Indonesia Dinilai Masih Menjanjikan',
    content : 'Ketimpangan sumber daya manusia (SDM) di sektor digital masih menjadi isu yang belum terpecahkan. Berdasarkan penelitian ManpowerGroup, ketimpangan SDM global, termasuk Indonesia, meningkat dua kali lipat dalam satu dekade terakhir. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quam, molestiae numquam! Deleniti maiores expedita eaque deserunt quaerat! Dicta, eligendi debitis?',
    author : 'Ichsan Emrald Alamsyah',
    postAt : new Date()
}]

// console.log(blogs)



function getFullTime(time) {
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept','Oct', 'Nov','Dec']

  let date = time.getDate() // mendapatkan tanggal
  let monthIndex = time.getMonth()  // mendapatkan bulan
  let year = time.getFullYear() // mendpatkan tahun

  let hours = time.getHours() // mendapatkan jam
  let minutes = time.getMinutes() // mendapatkan menit


  let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
  return fullTime
}

let id = ''

let getDistanceTime = (time) => {

    let timePost = time
    let timeNow = new Date()
  
    let distance = timeNow - timePost 
  
    //  convert milisecond
    let milisecond = 1000 // seribu dalam 1 detik
    let secondsInHours = 3600 // dalam 1 jam 3600 detik
    let hoursInDay = 23 // dalam 1 hari 23 jam
  
    let seconds = 60 // detik
    let minutes = 60 // menit
  
    let distanceDay = Math.floor(distance / (milisecond * secondsInHours * hoursInDay)) // perhitungan untuk mendapatkan hari
    let distanceHours = Math.floor(distance / (milisecond * seconds * minutes)) // perhitungan untuk mendapatkan jam
    let distanceMinutes = Math.floor(distance / (milisecond * seconds)) // perhitungan untuk mendapatkan menit
    let distanceSecond = Math.floor(distance / milisecond) // perhitungan untuk mendapatkan detik
  
  
    // kondisi menampilkan hari
    if (distanceDay >= 1) {
        return `${distanceDay} day ago`;
  
    } else if(distanceHours >= 1) {
        // kondisi menampilkan jam
        return `${distanceHours} hours ago`;
  
    } else if(distanceMinutes >= 1) {
      // kondisi menampilkan menit
        return `${distanceMinutes} minutes ago`;
  
    } else {
        return `${distanceSecond} seconds ago`;
    }
}


app.get('/', (req,res) => {

    db.connect((err, client, done) => {
        if (err) throw err

        client.query('SELECT * FROM tb_experiences', (err, result) => {
            if(err) throw err

            let data = result.rows
            res.render('index', {
                experience : data,
                title : 'Personal Web'
            })

        })
    })

})


app.get('/add-blog', (req,res) => {

    if(!req.session.isLogin){
        req.flash('danger', 'Login First!')
        return res.redirect('login')
    }


    res.render('add-blog', {
        isLogin : req.session.isLogin, 
        user : req.session.user , 
        title : 'Add Blog'
    })
})


app.get('/blog', (req,res) => {

    let query = 'SELECT tb_blog.id , tb_blog.title, tb_user.name, tb_blog.content, tb_blog.image, tb_blog.author_id, tb_blog.post_at FROM tb_blog LEFT JOIN tb_user ON tb_blog.author_id = tb_user.id'


    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err

            // console.log(result.rows)
            let data = result.rows

            data = data.map((blog) => {
                return {
                    ...blog,
                    isLogin : req.session.isLogin,
                    fullTime : getFullTime(blog.post_at),
                    distance : getDistanceTime(blog.post_at)
                }
            })

            res.render('blog', { 
                isLogin : req.session.isLogin, 
                user : req.session.user , 
                blogs : data,
                title : 'Blog'
            })

        })
    })

})

app.get('/blog-detail/:id', (req, res) => {
    // console.log(req.params)
    let id = req.params.id
    
    db.connect((err, client, done) => {
        if (err) throw err

        client.query(`SELECT * FROM tb_blog WHERE id = ${id}`, (err, result) => {
            if(err) throw err

            let data = result.rows[0]
            console.log(data);
            res.render('blog-detail', { id, blog : data})

        })
    })
})

app.get('/delete-blog/:id', (req,res) => {

    let id = req.params.id
    let query = `DELETE from tb_blog WHERE id = ${id}`

    if(!req.session.isLogin){
        req.flash('danger', 'Login First!')
        return res.redirect('/login')
    }


    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err

            req.flash('danger', 'Blog Dihapus!')


            res.redirect('/blog')
        })
    })

})

app.get('/edit-blog/:id', (req,res) => {

    if(!req.session.isLogin){
        req.flash('danger', 'Login First!')
        return res.redirect('/login')
    }

    id = req.params.id
    let query = `SELECT * FROM tb_blog WHERE id = ${id} `

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err

            let data = result.rows[0]
            console.log(data)

            res.render('edit-blog', {
                id, 
                blog : data,
                isLogin : req.session.isLogin, 
                user : req.session.user,
                title : 'Edit Post'
            })
        })
    })
})

app.post('/update-blog', (req,res) => {

    let title = req.body.updateTitle
    let content = req.body.updateContent

    let query = `UPDATE tb_blog SET title= '${title}', content='${content}'
                WHERE id = ${id}`

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err
            req.flash('success', 'Update berhasil')

            res.redirect('/blog')
        })
    })
})

app.post('/blog', upload.single('inputImage'), (req, res) => {

    let data = req.body
    let authorId = req.session.user.id
    let image = req.file.filename
    // return console.log(authorId);


    let query = `INSERT INTO public.tb_blog(title, image, content, author_id)
        VALUES ( '${data.inputTitle}',  '${image}', '${data.inputContent}',  '${authorId}' );`

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err

            res.redirect('/blog')
        })
    })

})


app.get('/contact-me', (req, res) => {
    res.render('form')
})

app.get('/login', (req, res)=> {
    res.render('login', {title : 'login'})
})

app.post('/login', (req,res) => {
    const { inputEmail, inputPassword} = req.body

    let query = `SELECT * FROM tb_user WHERE email = '${inputEmail}'` 

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if(err) throw err

            if(result.rows.length == 0){
                req.flash('danger', 'Email dan Password tidak cocok')
                return res.redirect('/login')
            }

            const isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)
            
            if(isMatch){
                req.session.isLogin = true
                req.session.user = {
                    id : result.rows[0].id,
                    name : result.rows[0].name,
                    email : result.rows[0].email
                }

                req.flash('success', 'Login Success!')
                res.redirect('/blog')
            }else{
                req.flash('danger', 'Email dan Password tidak cocok')
                res.redirect('/login')
            }

        })
    })

})


app.get('/register', (req, res)=> {
    res.render('register', { title : 'Register'})
})

app.post('/register', (req,res) => {
    const {inputName, inputEmail, inputPassword} = req.body
    const hashedPassword = bcrypt.hashSync(inputPassword, 10)
    

    if((inputName && inputEmail && inputPassword) === ''){
        req.flash('danger', 'Isi Semua Form!')

        res.redirect('register')
    }else{

        let query = `INSERT INTO tb_user (name, email, password) 
        values ('${inputName}', '${inputEmail}', '${hashedPassword}')` 
    
    
        db.connect((err, client, done) => {
            if (err) throw err
    
            client.query(query, (err, result) => {
                if(err) throw err
    
    
                req.flash('success', 'Register Berhasil!')
                
                res.redirect('login')
            })
        })
    }

})

app.get('/logout', (req, res) => {
    req.session.destroy()

    res.redirect('/blog')
})

app.use('/', (req, res) => {
    res.status(404)
    res.render('404')
})

app.listen(port, function(){
    console.log(`server starting on http://localhost:${port}`)
})