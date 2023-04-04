const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const jwt=require("jsonwebtoken")
const Users=require("../users/users-model")

const sinirli = (req, res, next) => {
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
}

const sadece = role_name => (req, res, next) => {
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
}


const usernameVarmi =async (req, res, next) => {
  try {
    const existUsername=await Users.goreBul({username:req.body.username})
    if(!existUsername){
      res.status(401).json({messsage:"Geçersiz kriter"})
    }else{
      next()
    }
  } catch (error) {
    
  }
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
}


const rolAdiGecerlimi = async (req, res, next) => {
  try {
    const existRole=await Users.goreBul({role_name:req.body.role_name})
    if(!existRole || existRole.trim()===""){
      req.role_name="student"
      next()
    }else if(existRole.trim().toLowerCase()==="admin"){
      res.status(422).json({messsage:"Rol adı admin olamaz"})
    }else if(existRole.trim().length>32){
      res.status(422).json({messsage:"rol adı 32 karakterden fazla olamaz"})
    }else{
      req.role_name=existRole.trim()
      next()
    }
  } catch (error) {
    next(error)
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
}

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
}
