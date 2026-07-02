import * as bcrypt from 'bcryptjs';

describe('Auth Service', () => {
  describe('Password Hashing', () => {
    it('should correctly hash and verify a password', async () => {
      const password = 'SuperSecretPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      expect(hash).not.toBe(password);
      
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
      
      const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
      expect(isWrongMatch).toBe(false);
    });
  });
});
