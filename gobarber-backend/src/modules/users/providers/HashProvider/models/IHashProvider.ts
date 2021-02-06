export default interface IHashProvider {
  // payload is the name used to mean "any information"
  generateHash(payload: string): Promise<string>;
  compareHash(payload: string, hashed: string): Promise<boolean>;
}
