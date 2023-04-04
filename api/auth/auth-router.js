const router = require("express").Router();
const { usernameVarmi, rolAdiGecerlimi } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets"); // bu secret'ı kullanın!
const Users = require("../users/users-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", rolAdiGecerlimi, async (req, res, next) => {
  try {
    const { username, password,role_name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await Users.ekle({
      username: username,
      password: hashedPassword,
      role_name: role_name,
    });
    res.status(201).json({
      user_id: newUser.user_id,
      username: newUser.username,
      role_name: newUser.role_name,
    });
  } catch (error) {
    next(error);
  }

  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status: 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});

router.post("/login", usernameVarmi, async (req, res, next) => {
  try {
    const user = req.user;

    let token = jwt.sign(
      {
        username: user.username,
        subject: user.user_id,
        role_name: user.role_name,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: `${user.username} geri geldi!`,
      token: token,
    });
  } catch (error) {
    next(error);
  }

  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status: 200
    {
      "message": "sue geri geldi!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    Token 1 gün sonra timeout olmalıdır ve aşağıdaki bilgiyi payloadında içermelidir:

    {
      "subject"  : 1       // giriş yapan kullanıcının user_id'si
      "username" : "bob"   // giriş yapan kullanıcının username'i
      "role_name": "admin" // giriş yapan kulanıcının role adı
    }
   */
});

module.exports = router;
