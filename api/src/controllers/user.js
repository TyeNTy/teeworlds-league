const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user");
const ClanModel = require("../models/clan");
const StatModel = require("../models/stat");
const config = require("../config");
const enumUserRole = require("../enums/enumUserRole");
const enumErrorCode = require("../enums/enumErrorCode");
const { catchErrors } = require("../utils");

// 1 day
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;
const JWT_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

router.post(
  "/signin",
  catchErrors(async (req, res) => {
    let { password, email } = req.body;
    email = (email || "").trim().toLowerCase();

    if (!email || !password)
      return res.status(400).send({ ok: false, code: enumErrorCode.EMAIL_AND_PASSWORD_REQUIRED, message: "Password or email invalid" });

    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(401).send({ ok: false, code: enumErrorCode.USER_NOT_EXISTS, message: "Password or email invalid" });

      const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
      // const match = await user.comparePassword(password);
      if (!match) return res.status(401).send({ ok: false, code: enumErrorCode.PASSWORDS_NOT_MATCH, message: "Password or email invalid" });

      if (user.blocked)
        return res.status(401).send({ ok: false, code: enumErrorCode.UNAUTHORIZED, message: "Account is blocked ! Please contact us." });

      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const cookieOptions = {
        maxAge: COOKIE_MAX_AGE,
        secure: config.ENVIRONMENT !== "development",
        httpOnly: true,
        sameSite: config.ENVIRONMENT === "development" ? "Lax" : "None",
        domain: config.ENVIRONMENT === "development" ? undefined : ".gctfleague.org",
      };

      const token = jwt.sign({ _id: user._id }, config.SECRET, {
        expiresIn: JWT_MAX_AGE,
      });
      res.cookie("jwt", token, cookieOptions);

      return res.status(200).send({ ok: true, token, user: user.responseModel() });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ ok: false, code: enumErrorCode.SERVER_ERROR });
    }
  }),
);

router.post(
  "",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { body } = req;
    const user = new UserModel(body);
    await user.save();

    return res.status(201).send({ ok: true, data: user.responseModel() });
  }),
);

router.get(
  "/signin_token",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    try {
      const { user } = req;
      user.set({ lastLoginAt: Date.now() });
      await user.save();
      return res.status(200).send({ user: user.responseModel(), token: req.cookies.jwt, ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: enumErrorCode.SERVER_ERROR });
    }
  }),
);

router.post(
  "/search",
  passport.authenticate([enumUserRole.ADMIN, enumUserRole.GUEST], { session: false }),
  catchErrors(async (req, res) => {
    const { body, user } = req;

    const obj = {};

    if (body.clanId) obj.clanId = body.clanId;
    if (body._id) obj._id = body._id;

    const users = await UserModel.find(obj);
    if (user.role === enumUserRole.ADMIN) return res.status(200).send({ ok: true, data: users.map((user) => user.responseModel()) });

    return res.status(200).send({ ok: true, data: users.map((user) => user.responseMinimalModel()) });
  }),
);

router.post(
  "/logout",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    res.clearCookie("jwt", {
      domain: config.ENVIRONMENT === "development" ? undefined : ".gctfleague.org",
      secure: config.ENVIRONMENT !== "development",
      httpOnly: true,
      sameSite: config.ENVIRONMENT === "development" ? "Lax" : "None",
    });
    return res.status(200).send({ ok: true, message: "Logged out" });
  }),
);

router.post(
  "/change-password",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { body } = req;
    const { _id, password } = body;

    const user = await UserModel.findById(_id);
    if (!user) return res.status(404).send({ ok: false, code: enumErrorCode.USER_NOT_EXISTS, message: "User not found" });

    user.set({ password });
    await user.save();

    return res.status(200).send({ ok: true, data: user.responseModel() });
  }),
);

router.put(
  "/",
  passport.authenticate(enumUserRole.USER, { session: false }),
  catchErrors(async (req, res) => {
    const { user, body } = req;
    const obj = {};

    if (body.email) obj.email = body.email;
    if (body.password && body.password !== "") obj.password = body.password;
    if (body.avatar) obj.avatar = body.avatar;

    user.set(obj);
    await user.save();

    return res.status(200).send({ ok: true, data: user.responseModel() });
  }),
);

router.put(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) return res.status(404).send({ ok: false, code: enumErrorCode.USER_NOT_EXISTS, message: "User not found" });

    const body = req.body;
    user.set(body);
    await user.save();

    return res.status(200).send({ ok: true, data: user.responseModel() });
  }),
);

router.delete(
  "/:id",
  passport.authenticate(enumUserRole.ADMIN, { session: false }),
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).send({ ok: false, code: enumErrorCode.USER_NOT_EXISTS, message: "User not found" });

    if (currentUser._id.toString() === user._id.toString())
      return res.status(400).send({ ok: false, code: enumErrorCode.UNAUTHORIZED, message: "You can't delete yourself" });

    const clan = await ClanModel.findById(user.clanId);
    if (clan) {
      clan.players = clan.players.filter((player) => player.userId.toString() !== user._id.toString());
      await clan.save();
    }

    const stats = await StatModel.find({ userId: user._id });
    for (const stat of stats) await stat.deleteOne();

    await user.deleteOne();
    return res.status(200).send({ ok: true, data: user.responseModel() });
  }),
);

module.exports = router;
