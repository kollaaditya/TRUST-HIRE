import jwt from 'jsonwebtoken';

const generateToken = (mobile) => {
  return jwt.sign(
    { mobile },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

export { generateToken };