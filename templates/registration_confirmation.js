const subject_mail = "Login Credentials For the User"

const message = (User) =>{
     return `Dear User👤, \n\n` 
      + 'You are now added to the Database and can access the app with below credentials 😁: \n\n'
      + `Username : ${User.username}`
      + `Password : ${User.password}`
      + 'Please do not share the details and change the password ASAP⏲ in the app'
      + 'This is a auto-generated email. Please do not reply to this email.😉\n\n'
      + 'Regards\n'
      + 'Admin Team 🖥\n\n'
}

module.exports={subject_mail, message};