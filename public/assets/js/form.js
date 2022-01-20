// for value email
const emailInput = document.getElementById('to-send-email')
const subjectInput = document.getElementById('subject-send-email')
const messageInput = document.getElementById('message-send-email')
const fromInput = document.getElementById('from-send-email')


function submitData(){

    const name = document.getElementById('input-name').value
    const email = document.getElementById('input-email').value
    const phone = document.getElementById('input-phone').value
    const subject = document.getElementById('input-subject').value
    const message = document.getElementById('input-message').value

    // For checkbox
    const html = document.getElementById('html')
    const css = document.getElementById('css')


    let skills = ''
    if(html.checked || css.checked){
        if(html.checked) skills += html.value + " "
        if(css.checked) skills += css.value
    }

    if((name && email && phone && subject && message) === '' ){
        let error = ''

        if(name === '') error += "Name is Empty, "
        if(email === '') error += "email is Empty,"
        if(phone === '') error += "phone is Empty, "
        if(subject === '') error += "subject is Empty, "
        if(message === '') error += "messgae is Empty"

        alert(error)
    }else{
        const emailAdmin = 'ahmad.mughni1905@gmail.com'
        let a = document.createElement('a')

        a.href = `mailto:${emailAdmin}?subject=${subject}&body=Halo my name ${name}, ${message}, and my skill ${skills}`
        a.click()


        fromInput.innerHTML =`<p>${email}</p>`
        emailInput.innerHTML = `<p>${emailAdmin}</p>`
        subjectInput.innerHTML =  `<p>${subject}</p>`
        messageInput.innerHTML = `<p>Hallo my name ${name}, ${message}, and my skill ${skills}</p>`
    }
}

function deleteEmailCard(){
    document.getElementById('container-email').style.display = 'none'
}

function minimizeEmailCard(){
    let containerEmail = document.getElementById('container-email')
    let bodyEmail = document.getElementById('body-email') 
    let footerEmail = document.getElementById('footer-email')

    containerEmail.classList.toggle('minimize')
    bodyEmail.classList.toggle('minimize')
    footerEmail.classList.toggle('minimize')
    
}



// For Hamburger

const hamburger = document.getElementById('nav-hamburger')
const nav = document.querySelector('nav ul')

hamburger.addEventListener('click', function(){
    nav.classList.toggle('slide')
    // console.log(nav)
})