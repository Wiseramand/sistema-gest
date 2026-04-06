import { getAuthOptions } from "../../../../../lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(getAuthOptions('professor'))

export { handler as GET, handler as POST }
