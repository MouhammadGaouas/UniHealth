import bcrypt from "bcrypt";
import { promises } from "dns";

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
}

export const comparePassword = (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
}