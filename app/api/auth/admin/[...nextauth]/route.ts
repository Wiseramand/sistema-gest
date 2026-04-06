import { getAuthOptions } from "../../../../../lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(getAuthOptions('admin'))

export { handler as GET, handler as POST }
