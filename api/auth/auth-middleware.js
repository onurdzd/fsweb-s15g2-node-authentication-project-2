const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const jwt = require("jsonwebtoken");
const Users = require("../users/users-model");
const bcrypt=require("bcryptjs")

const sinirli = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decodedJWT) => {
        if (err) {
          res.status(401).json({
            message: "Token gecersizdir",
          });
        } else {
          req.decodedJWT = decodedJWT;
          next();
        }
      });
    }else{
      res.status(401).json(  {
        "message": "Token gereklidir"
      })
    }
  } catch (error) {
    next(error);
  }

  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
};

const sadece = (role_name) => (req, res, next) => {
  try {
    if(req.decodedJWT && req.decodedJWT.role_name ===role_name){
      next()
    }else{
      res.status(403).json( {
        "message": "Bu, senin için değil"
      })
    }
  } catch (error) {
    next(error)
  }
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
};

const usernameVarmi = async (req, res, next) => {
  try {
    const existUsername = await Users.goreBul({ username: req.body.username });
    const isValidLogin=existUsername && existUsername.length>0 && bcrypt.compareSync(req.body.password, existUsername[0].password)
    if (!isValidLogin) {
      next({
        status:401,
        messsage: "Geçersiz kriter" 
      })
    } else {
      req.user = existUsername[0];
      next();
    }
  } catch (error) {next(error)}
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
};

const rolAdiGecerlimi = async (req, res, next) => {
  try {
    let role_name = req.body.role_name;
    if(!role_name || role_name.trim()===""){
      role_name = "student";
    }else if(role_name.trim().toLowerCase() === "admin"){
      next({
        status:422,
        message:"Rol adı admin olamaz"
      })
    }else if(role_name.length > 32) {
      next({
        status:422,
         messsage: "rol adı 32 karakterden fazla olamaz"
         })
    }
    req.body.role_name = role_name.trim();
    next();
  } catch (error) {
    next(error);
  }
  /*
    Bodydeki role_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.

    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.

    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }

    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */
};

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
};
