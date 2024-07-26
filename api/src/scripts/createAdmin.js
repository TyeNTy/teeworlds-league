require("../mongo");
const enumUserRole = require("../enums/enumUserRole");
const UserModel = require("../models/user");

const init = async () => {
  console.log("init");

  let admin = await UserModel.findOne({ email: "tnt@email.com" });
  if (!admin) {
    admin = await UserModel.create({
      email: "tnt@email.com",
      password: "tnt",
      role: enumUserRole.ADMIN,
      userName: "TNT",
    });
  }

  admin.userName = "TNT";
  admin.password = "tnt";
  admin;
  await admin.save();

  console.log(admin);
  process.exit();
};

init();
