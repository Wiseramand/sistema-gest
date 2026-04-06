import { getAuthOptions } from "../../../../../lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(getAuthOptions('student'))

export { handler as GET, handler as POST }
