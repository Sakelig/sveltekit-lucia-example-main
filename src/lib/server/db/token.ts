import { db } from './db.js';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';

const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

export const generateEmailVerificationToken = async (userId: string) => {
    const storedUserTokens = await db
        .selectFrom('email_verification_token')
        .selectAll()
        .where('user_id', '=', userId)
        .execute();
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            // check if expiration is within 1 hour
            // and reuse the token if true
            return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(63);
    await db
        .insertInto('email_verification_token')
        .values({
            id: token,
            expires: new Date().getTime() + EXPIRES_IN,
            user_id: userId
        })
        .executeTakeFirst();
    return token;
};


export const validateEmailVerificationToken = async (token: string) => {
    const storedToken = await db.transaction(async (trx) => {
        const storedToken = await trx
            .table("email_verification_token")
            .where("id", "=", token)
            .get();
        if (!storedToken) throw new Error("Invalid token");
        await trx
            .table("email_verification_token")
            .where("user_id", "=", storedToken.user_id)
            .delete();
        return storedToken;
    });
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new Error("Expired token");
    }
    return storedToken.user_id;
};