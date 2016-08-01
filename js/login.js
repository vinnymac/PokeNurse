const ipc = require('electron').ipcRenderer

const googleRadio = document.getElementById('auth0')
const ptcRadio = document.getElementById('auth1')

const usernameTxt = document.getElementById('username-txt')
const passwordTxt = document.getElementById('password-txt')
const loginBtn = document.getElementById('login-btn')
const rememberCb = document.getElementById('remember-cb')

var credentials = ipc.sendSync('get-account-credentials')
if (credentials.success) {
  // Google is selected by default
  if (credentials.method === 'ptc') {
    googleRadio.checked = false
    ptcRadio.checked = true
  }

  usernameTxt.value = credentials.username
  passwordTxt.value = credentials.password
  rememberCb.checked = true
}

loginBtn.addEventListener('click', handleLogin)

usernameTxt.addEventListener('keypress', (e) => {
  if (e.keyCode == 13) handleLogin()
})

passwordTxt.addEventListener('keypress', (e) => {
  if (e.keyCode == 13) handleLogin()
})

function handleLogin () {
  var method = getAuthMethod()

  if (usernameTxt.value === '' || passwordTxt.value === '') {
    ipc.send('error-message', 'Missing username and/or password')
    return
  }

  if (rememberCb.checked) {
    ipc.send('save-account-credentials', method, usernameTxt.value, passwordTxt.value)
  } else {
    ipc.send('check-and-delete-credentials')
  }

  ipc.send('pokemon-login', method, usernameTxt.value, passwordTxt.value)
}

function getAuthMethod () {
  var authMethodRadio = document.getElementsByName('auth-radio')
  for (var i = 0; i < authMethodRadio.length; i++) {
    if (authMethodRadio[i].checked) {
      return authMethodRadio[i].value
    }
  }
  return undefined
}
