const password = document.querySelector("#password");
const passwordCheck = document.querySelector("#passwordCheck");
const validatePasswordCheck = document.querySelector("#validarSenha");
const btnGeneratePass = document.querySelector("#btn-generate");
const modalGeneatePass = document.querySelector("dialog");
const btnOpenModal = document.querySelector("#btn-open-modal");
const btnCadastrar = document.querySelector("#btn-cadastrar");
const forms = document.querySelectorAll('form')

password.addEventListener("input", checkPass);
password.addEventListener("input", checkPassMatch);
passwordCheck.addEventListener("input", checkPassMatch);
btnGeneratePass.addEventListener("click", generatePass);
btnCadastrar.addEventListener("click", cadastrar);
btnOpenModal.addEventListener("click", () => {
  modalGeneatePass.showModal();
});
for(let form of forms){
  form.addEventListener('submit', e => {
      e.preventDefault()
      adicionarAtividade()
  })
}

async function cadastrar() {

  if(passwordCheck.value != ""){
    const hasPwned = await checkPassPwned(passwordCheck.value)
    if (hasPwned.pwnd) {
      modalGeneatePass.close();
      fireSweetAlert(
        "A senha informada não é segura.",
        `Senha está entre os dados vazados por cybercriminosos. \n Foram encontradas ${hasPwned.n} ocorrências`,
        "error"
      );
    } else {
      fireSweetAlert(
        "Sua senha é segura!!",
        "Não há nenhuma informação de vazamento da sua senha",
        "success"
      );
      checkPass();
      checkPassMatch();
    }
  }
}

async function generatePass() {
  const l = document.querySelector("#pwLength").value;
  const sym =
    document.querySelector("#pwSymbols").value == "y" ? "true" : "false";

  const options = {
    method: "GET",
  };
  const url = `https://makemeapassword.ligos.net/api/v1/alphanumeric/json?c=1&l=${l}&sym=${sym}`;

  let newPass = await fetch(url, options)
    .then((res) => res.json())
    .then((data) => {
      return data.pws[0];
    })
    .catch((err) => console.error(err));

  const hasPwned = await checkPassPwned(newPass)

  if (hasPwned.pwnd) {
    modalGeneatePass.close();
    fireSweetAlert(
      "A senha gerada não é segura.",
      `Senha gerada está entre os dados vazados por cybercriminosos. Foram encontradas ${hasPwned.n} ocorrências`,
      "error"
    );
  } else {
    password.value = newPass;
    passwordCheck.value = newPass;
    modalGeneatePass.close();
    fireSweetAlert("Sua senha é:", newPass, "success");
    checkPass();
    checkPassMatch();
  }
}

function fireSweetAlert(title, pass, icon) {
  Swal.fire({ title: title, text: pass, icon: icon });
}

async function checkPassPwned(pass) {
  const fullHash = await convertToSha1(pass);
  let semiHash = fullHash.slice(0, 5).toUpperCase();
  let lastHash = fullHash.slice(5).toUpperCase();

  const options = {
    method: "GET",
  };
  const url = `https://api.pwnedpasswords.com/range/${semiHash}`;
  const foundPwnd = await fetch(url, options)
    .then((res) => res.text())
    .then((res) => res.split("\r\n"))
    .then((res) => res.find((n) => n.includes(lastHash)));

  if (foundPwnd) {
    return {
      pwnd: true,
      n: foundPwnd.split(":")[1]
    };
  }
  return {
    pwnd: false
  };
}

async function convertToSha1(str) {
  const buffer = new TextEncoder("utf-8").encode(str);
  const digest = await crypto.subtle.digest("SHA-1", buffer);

  const result = Array.from(new Uint8Array(digest))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

  return result;
}

function checkPass() {
  if (password.value.length == 0) {
    password.setAttribute("class", "form-control");
  } else if (password.value.length < 8) {
    password.setAttribute("class", "form-control is-invalid");
  } else if (password.value.length >= 8) {
    password.setAttribute("class", "form-control is-valid");
  }
}

function checkPassMatch() {
  if (passwordCheck.value.length == 0) {
    passwordCheck.setAttribute("class", "form-control");
  } else if (password.value != passwordCheck.value) {
    passwordCheck.setAttribute("class", "form-control is-invalid");
  } else {
    passwordCheck.setAttribute("class", "form-control is-valid");
  }
}

const groups = document.getElementsByClassName("input-group-text");
for (let item of groups) {
  item.onclick = function (event) {
    let input = item.parentElement.parentElement.firstChild.nextSibling;
    let inputType = input.type;

    if (inputType == "text") {
      input.setAttribute("type", "password");
      item.innerHTML = "🥸";
    } else if (inputType == "password") {
      input.setAttribute("type", "text");
      item.innerHTML = "🫣";
    }
  };
}
