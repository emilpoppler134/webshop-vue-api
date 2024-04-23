import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UpdateResult } from "mongodb";
import { ACCESS_TOKEN_SECRET } from "../config.js";
import { User } from "../models/User.js";
import { VerificationToken } from "../models/VerificationToken.js";
import { ParamValue } from "../types/ParamValue.js";
import { ErrorCode, SuccessCode } from "../types/StatusCode.js";
import { TokenPayload } from "../types/TokenPayload.js";
import { hashPassword } from "../utils/hashPassword.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";
import { sendForgotPasswordVerificaitonMail } from "../utils/transmitMail.js";

type TokenResponse = { token: string };

async function validateToken(req: Request, res: Response) {
  const authorizationHeader = req.headers.authorization;
  const token =
    authorizationHeader && authorizationHeader.replace(/^Bearer\s/, "");

  // Check if token is defined in authorization headers
  if (token === undefined) {
    throw new ErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "No token in authorization header.",
    );
  }

  try {
    // Verify JWT token
    const tokenPayload = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    // If all good, return token payload
    return sendValidResponse<TokenPayload>(res, SuccessCode.OK, tokenPayload);
  } catch {
    throw new ErrorResponse(ErrorCode.UNAUTHORIZED, "Token is not valid.");
  }
}

async function signNewToken(req: Request, res: Response) {
  const user: TokenPayload = res.locals.user;

  // Look for the user in the database by id
  const findUser = await User.findOne({
    _id: user._id,
  });

  // If no result, return an error
  if (findUser === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "Couldn't find a user with that Id.",
    );
  }

  const payload = (({ _id, name, email }) => ({
    _id,
    name,
    email,
  }))(findUser);

  try {
    // Sign a JWT token with user information
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    // If all good, return JWT token
    return sendValidResponse<TokenResponse>(res, SuccessCode.OK, { token });
  } catch {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when signing the token.",
    );
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  const email: ParamValue = req.body.email;
  const password: ParamValue = req.body.password;

  // Check if all required values is defined
  if (email === undefined || password === undefined) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid parameters.");
  }

  // Hash the password
  const passwordHash = hashPassword(password);
  if (passwordHash === null) {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Couldn't hash the password you provided.",
    );
  }

  // Look for the user in the database by email and password
  const findUser = await User.findOne({
    email: email,
    password_hash: passwordHash,
  });

  // If no result, return an error
  if (findUser === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "The email or password are incorrect.",
    );
  }

  const payload = (({ _id, name, email }) => ({
    _id,
    name,
    email,
  }))(findUser);

  try {
    // Sign a JWT token with user information
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    // If all good, return JWT token
    return sendValidResponse<TokenResponse>(res, SuccessCode.OK, { token });
  } catch {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when signing the token.",
    );
  }
}

async function forgotPasswordRequest(req: Request, res: Response) {
  const email: ParamValue = req.body.email;

  // Check if all required values is defined
  if (email === undefined) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid parameters.");
  }

  // Look for the user in the database by email
  const findUser = await User.findOne({
    email: email,
  });
  // If there is no user with that email, return error
  if (findUser === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "A user with that email doesn't exist.",
    );
  }

  // Create a verification code
  const code = Math.floor(100000 + Math.random() * 900000);

  // Create a new verification token in the database
  const createVerificationToken = await VerificationToken.create({
    code: code,
    email: email,
    user: findUser._id,
  });
  // If something went wrong, return an error
  if (createVerificationToken === null) {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when creating the verification code.",
    );
  }

  // Send an email to the user with the verification code
  try {
    await sendForgotPasswordVerificaitonMail(
      findUser.name,
      findUser.email,
      code,
    );

    // If all good, return OK
    return sendValidResponse(res, SuccessCode.NO_CONTENT);
  } catch {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when sending the mail.",
    );
  }
}

async function forgotPasswordConfirmation(req: Request, res: Response) {
  const email: ParamValue = req.body.email;
  const code: ParamValue = req.body.code;

  const date = new Date();
  date.setHours(date.getHours() + 1);

  // Check if all required values is defined
  if (email === undefined || code === undefined) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid parameters.");
  }

  // Look for the user in the database by email
  const findUser = await User.findOne({
    email: email,
  });
  // If there is no user with that email, return error
  if (findUser === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "A user with that email doesn't exist.",
    );
  }

  // Look for a verification token in the database
  // By user id, verification code and if the token isn't already consumed
  const findVerificationToken = await VerificationToken.findOne({
    user: findUser._id,
    code: parseInt(code),
    consumed: false,
    expiry_date: {
      $gte: date,
    },
  });
  // If there is no result, return error
  if (findVerificationToken === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "The verification code is incorrect.",
    );
  }

  // If all good, return OK
  return sendValidResponse(res, SuccessCode.NO_CONTENT);
}

async function forgotPasswordSubmit(req: Request, res: Response) {
  const email: ParamValue = req.body.email;
  const code: ParamValue = req.body.code;
  const password: ParamValue = req.body.password;

  const date = new Date();
  date.setHours(date.getHours() + 1);

  // Check if all required values is defined
  if (email === undefined || code === undefined || password === undefined) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid parameters.");
  }

  // Look for the user in the database by email
  const findUser = await User.findOne({
    email: email,
  });
  // If there is no user with that email, return error
  if (findUser === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "A user with that email doesn't exist.",
    );
  }

  // Look for a verification token in the database
  // By user id, verification code and if the token isn't already consumed
  const findVerificationToken = await VerificationToken.findOne({
    user: findUser._id,
    code: parseInt(code),
    consumed: false,
    expiry_date: {
      $gte: date,
    },
  });
  // If there is no result, return error
  if (findVerificationToken === null) {
    throw new ErrorResponse(
      ErrorCode.NO_RESULT,
      "The verification code is incorrect.",
    );
  }

  // Hash the new password
  const passwordHash = hashPassword(password);
  if (passwordHash === null) {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Couldn't hash the password you provided.",
    );
  }

  // Update the user password in the database
  const updateUser: UpdateResult = await User.updateOne(
    { _id: findUser._id },
    { password_hash: passwordHash },
  );
  // If something went wrong, return an error
  if (updateUser.acknowledged === false) {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when updating the password.",
    );
  }

  // Update the verification token to consumed
  const updateVerificationToken: UpdateResult =
    await VerificationToken.updateOne(
      { _id: findVerificationToken._id },
      { consumed: true },
    );
  // If something went wrong, return an error
  if (updateVerificationToken.acknowledged === false) {
    throw new ErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Something went wrong when updating the verification token.",
    );
  }

  // If all good, return OK
  return sendValidResponse(res, SuccessCode.NO_CONTENT);
}

export default {
  validateToken,
  signNewToken,
  login,
  forgotPasswordRequest,
  forgotPasswordConfirmation,
  forgotPasswordSubmit,
};
