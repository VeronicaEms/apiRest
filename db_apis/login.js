const database = require("../services/database.js");
const bcrypt = require("bcryptjs");

async function find(context) {
  let query = `SELECT id_pessoa, password FROM rjs_pessoa`;
  const binds = {};

  console.log("\n>>> db_api/login.js (find) CONTEXT:\n", context);

  if (context.email && context.password) {
    binds.email = context.email;
    query += ` WHERE email = :email`;
  }

  console.log("\n>>> db_api/login.js (QUERY SQL):\n", query, binds);

  // realiza a consulta na tabela, procurando apenas o usuário pelo email
  const result = await database.simpleExecute(query, binds);

  console.log("\n>>> db_api/login.js (RESULT QUERY):\n", result);

  // Se o result retornar um objecto com o resultado do ID e PASSWORD ele será maior que 0
  // que dizer que a consulta pelo email encontrou um usuário cadastrado, nessa condição
  // o result retorna o ID e PASSWORD.
  //
  if (result.rows.length > 0) {
    // hashpasswd = ele é o campo da tabela PASSWORD criptografada que faz a comparação da variavel enviada pelo JSON,
    // o campo hashpassword esta criptografado... e o campo context.password text/string
    let hashpasswd = result.rows[0]["PASSWORD"];
    let id_pessoa = result.rows[0]["ID_PESSOA"];

    console.log(">>> id_pessoa", id_pessoa);
    console.log(">>> hashpasswd", hashpasswd);

    // compara a senha informada no front-end com a senha cadastrada no banco de dados,
    // se forem iguais o "compare" retornará TRUE e retornará o ID_PESSOA para o controllers.
    // se as senhas não forem iguais o "compare" retorna FALSE, nesse caso o find retornará -1
    // para o controllers indicando que a senha não confere
    if (await bcrypt.compare(context.password, hashpasswd)) {
      return { id_pessoa: id_pessoa };
    } else {
      // Senhas diferentes
      //
      return { id_pessoa: -1 };
    }
  } else {
    // Retorna 0 se o email informado não for encontrado na tabela de dados.
    return { id_pessoa: 0 };
  }
}

module.exports.find = find;

