const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
3
const register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ msg: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
};

module.exports = {
  register,
  login
};