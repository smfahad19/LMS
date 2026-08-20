import asyncHandler from 'express-async-handler';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendTokenResponse = (res, user, statusCode) => {
  const token = generateToken(user._id);

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'instructor' ? 'instructor' : 'student',
    authProvider: 'local',
  });

  sendTokenResponse(res, user, 201);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || user.authProvider !== 'local') {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendTokenResponse(res, user, 200);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential missing');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: 'google',
      avatar: picture || '',
    });
  }

  sendTokenResponse(res, user, 200);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json(user);
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});